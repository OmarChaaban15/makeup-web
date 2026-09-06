import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ScrollRevealDirective } from '../../shared/scroll-reveal.directive';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../shared/auth.service';
import { mensajeDeError } from '../../shared/errores-api';

interface Tutorial {
  id: number;
  titulo: string;
  precio: string;
  activo: boolean;
}

@Component({
  selector: 'app-cursos',
  standalone: true,
  imports: [CommonModule, FormsModule, ScrollRevealDirective],
  templateUrl: './cursos.html',
  styleUrl: './cursos.css',
})
export class Cursos implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  private auth = inject(AuthService);

  comprando = false;
  errorMsg = '';

  // Modal de aviso de lanzamiento de la formacion profesional
  mostrarAviso = false;
  emailAviso = '';
  enviandoAviso = false;
  notificado = false;
  errorAviso = '';

  /** Masterclass que se vende en esta pagina, resuelta desde la API. */
  private masterclass = signal<Tutorial | null>(null);
  cargandoCatalogo = signal(true);

  ngOnInit(): void {
    this.cargarMasterclass();
  }

  /**
   * El ID del curso venia escrito a mano (`tutoriales: [2]`), un ID que ni
   * siquiera existia en una base de datos recien sembrada. Ahora se resuelve
   * por titulo contra el catalogo real.
   */
  private cargarMasterclass(): void {
    this.http.get<Tutorial[]>(`${environment.apiUrl}/tutoriales`).subscribe({
      next: tutoriales => {
        const masterclass =
          tutoriales.find(t => t.titulo.toLowerCase().includes('automaquillaje')) ??
          tutoriales.find(t => Number(t.precio) > 0) ??
          null;

        this.masterclass.set(masterclass);
        this.cargandoCatalogo.set(false);
      },
      error: () => {
        this.cargandoCatalogo.set(false);
        this.errorMsg = 'No se pudo cargar el catálogo de cursos. Recarga la página.';
      }
    });
  }

  get puedeComprar(): boolean {
    return this.masterclass() !== null && !this.comprando;
  }

  comprarMasterclass(): void {
    if (!this.auth.estaAutenticado()) {
      this.router.navigate(['/login'], { queryParams: { redirect: '/cursos' } });
      return;
    }

    const curso = this.masterclass();

    if (!curso) {
      this.errorMsg = 'El curso no está disponible en este momento. Inténtalo de nuevo en unos minutos.';
      return;
    }

    this.comprando = true;
    this.errorMsg = '';

    this.http.post<{ pedido: unknown; checkout_url: string }>(
      `${environment.apiUrl}/pedidos`,
      { tutoriales: [curso.id] }
    ).subscribe({
      next: respuesta => {
        window.location.href = respuesta.checkout_url;
      },
      error: error => {
        this.comprando = false;
        this.errorMsg = mensajeDeError(
          error,
          'No se pudo iniciar el pago seguro con Stripe. Inténtalo de nuevo o contáctame por WhatsApp.'
        );
      }
    });
  }

  abrirAvisoProximamente(): void {
    this.mostrarAviso = true;
    this.notificado = false;
    this.errorAviso = '';
  }

  cerrarAviso(): void {
    this.mostrarAviso = false;
  }

  /**
   * Antes esto era un prompt() del navegador y el email se descartaba sin
   * enviarse a ninguna parte. Ahora se registra como consulta de contacto.
   */
  enviarAviso(): void {
    const email = this.emailAviso.trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      this.errorAviso = 'Introduce un correo electrónico válido.';
      return;
    }

    this.enviandoAviso = true;
    this.errorAviso = '';

    this.http.post(`${environment.apiUrl}/contacto`, {
      nombre: 'Lista de espera',
      email,
      servicio: 'Formación Profesional (lista de espera)',
      mensaje: 'Solicita aviso preferente del lanzamiento de la Certificación Pro con descuento prioritario.'
    }).subscribe({
      next: () => {
        this.enviandoAviso = false;
        this.notificado = true;
        this.emailAviso = '';
      },
      error: error => {
        this.enviandoAviso = false;
        this.errorAviso = mensajeDeError(
          error,
          'No se pudo registrar tu correo. Inténtalo de nuevo más tarde.'
        );
      }
    });
  }
}
