import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { ScrollRevealDirective } from '../../shared/scroll-reveal.directive';
import { ContadorOferta } from '../../shared/contador-oferta/contador-oferta';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../shared/auth.service';
import { Curso, CursosService } from '../../shared/cursos.service';
import { mensajeDeError } from '../../shared/errores-api';

@Component({
  selector: 'app-cursos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ScrollRevealDirective, ContadorOferta],
  templateUrl: './cursos.html',
  styleUrl: './cursos.css',
})
export class Cursos implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  private auth = inject(AuthService);
  private cursos = inject(CursosService);

  comprando = false;
  errorMsg = '';
  yaLoTiene = signal(false);

  /** Datos que se piden cuando se compra sin cuenta. */
  formInvitado = signal(false);
  nombreInvitado = '';
  emailInvitado = '';
  aceptaCondiciones = false;
  errorInvitado = '';

  // Modal de aviso de lanzamiento de la formacion profesional
  mostrarAviso = false;
  emailAviso = '';
  enviandoAviso = false;
  notificado = false;
  errorAviso = '';

  /** Masterclass que se vende en esta página, resuelta desde la API. */
  masterclass = signal<Curso | null>(null);
  cargandoCatalogo = signal(true);

  readonly precio = computed(() => {
    const curso = this.masterclass();
    return curso ? this.cursos.formatearPrecio(curso.precio_efectivo) : '';
  });

  readonly precioBase = computed(() => {
    const curso = this.masterclass();
    if (!curso || !curso.oferta_activa) return '';
    return this.cursos.formatearPrecio(curso.precio);
  });

  readonly mesesAcceso = computed(() => this.masterclass()?.duracion_acceso_meses ?? null);

  ngOnInit(): void {
    this.cargarMasterclass();
  }

  /**
   * El ID del curso venía escrito a mano (`tutoriales: [2]`), un ID que ni
   * siquiera existía en una base de datos recién sembrada. Ahora se resuelve
   * contra el catálogo real, igual que el precio vigente.
   */
  private cargarMasterclass(): void {
    this.cursos.masterclass().subscribe({
      next: curso => {
        this.masterclass.set(curso);
        this.cargandoCatalogo.set(false);
      },
      error: () => {
        this.cargandoCatalogo.set(false);
        this.errorMsg = 'No se pudo cargar el catálogo de cursos. Recarga la página.';
      }
    });
  }

  /** Al acabar la oferta se relee el curso: el precio lo decide el servidor. */
  alTerminarOferta(): void {
    this.cargarMasterclass();
  }

  get puedeComprar(): boolean {
    return this.masterclass() !== null && !this.comprando;
  }

  /** Con sesión va directo a Stripe; sin ella se piden nombre y correo. */
  comprarMasterclass(): void {
    this.errorMsg = '';

    if (!this.masterclass()) {
      this.errorMsg = 'El curso no está disponible en este momento. Inténtalo de nuevo en unos minutos.';
      return;
    }

    if (this.auth.estaAutenticado()) {
      this.enviarCompra();
      return;
    }

    this.formInvitado.set(true);
  }

  comprarComoInvitado(): void {
    this.errorInvitado = '';

    if (!this.nombreInvitado.trim()) {
      this.errorInvitado = 'Dinos tu nombre para personalizar tu acceso.';
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(this.emailInvitado.trim())) {
      this.errorInvitado = 'Introduce un correo electrónico válido: es donde recibirás el acceso.';
      return;
    }

    if (!this.aceptaCondiciones) {
      this.errorInvitado = 'Necesitamos que aceptes la política de privacidad.';
      return;
    }

    this.enviarCompra({
      nombre: this.nombreInvitado.trim(),
      email: this.emailInvitado.trim()
    });
  }

  cerrarFormInvitado(): void {
    this.formInvitado.set(false);
    this.errorInvitado = '';
  }

  private enviarCompra(invitado?: { nombre: string; email: string }): void {
    const curso = this.masterclass();
    if (!curso) return;

    this.comprando = true;

    this.cursos.comprar(curso.id, invitado).subscribe({
      next: respuesta => {
        window.location.href = respuesta.checkout_url;
      },
      error: error => {
        this.comprando = false;

        // 409: ya tiene acceso. No es un fallo, no hay nada que pagar.
        if (error?.status === 409) {
          this.yaLoTiene.set(true);
          this.formInvitado.set(false);
          return;
        }

        const mensaje = mensajeDeError(
          error,
          'No se pudo iniciar el pago seguro con Stripe. Inténtalo de nuevo o contáctame por WhatsApp.'
        );

        if (invitado) {
          this.errorInvitado = mensaje;
        } else {
          this.errorMsg = mensaje;
        }
      }
    });
  }

  irAMisCursos(): void {
    this.router.navigate(['/mis-cursos']);
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
