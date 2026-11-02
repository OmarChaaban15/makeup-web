import { Component, OnInit, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { ScrollRevealDirective } from '../../shared/scroll-reveal.directive';
import { ContadorOferta } from '../../shared/contador-oferta/contador-oferta';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../shared/auth.service';
import { Curso, CursosService } from '../../shared/cursos.service';
import { SeoService } from '../../shared/seo.service';
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
  private seo = inject(SeoService);
  private esNavegador = isPlatformBrowser(inject(PLATFORM_ID));

  readonly comprando = signal(false);
  readonly errorMsg = signal('');
  yaLoTiene = signal(false);

  /**
   * Paso previo al pago. Sin cuenta pide nombre y correo; con cuenta o sin
   * ella pide aceptar las condiciones y el acceso inmediato, que es lo que
   * hace valida la renuncia al desistimiento (art. 103.m TRLGDCU).
   */
  formCompra = signal(false);
  nombreInvitado = '';
  emailInvitado = '';
  aceptaCondiciones = false;
  aceptaAccesoInmediato = false;
  readonly errorFormCompra = signal('');

  readonly estaAutenticado = this.auth.estaAutenticado;

  // Modal de aviso de lanzamiento de la formacion profesional
  mostrarAviso = false;
  emailAviso = '';
  readonly enviandoAviso = signal(false);
  readonly notificado = signal(false);
  readonly errorAviso = signal('');

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
    // Al prerenderizar no hay API: sin esta guarda la peticion fallaba y el
    // HTML estatico salia con el aviso de error del catalogo.
    if (this.esNavegador) {
      this.cargarMasterclass();
    }
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
        if (curso) this.seo.publicarCurso(curso);
        this.cargandoCatalogo.set(false);
      },
      error: () => {
        this.cargandoCatalogo.set(false);
        this.errorMsg.set('No se pudo cargar el catálogo de cursos. Recarga la página.');
      }
    });
  }

  /** Al acabar la oferta se relee el curso: el precio lo decide el servidor. */
  alTerminarOferta(): void {
    this.cargarMasterclass();
  }

  get puedeComprar(): boolean {
    return this.masterclass() !== null && !this.comprando();
  }

  /** Abre el paso previo al pago (ver formCompra). */
  comprarMasterclass(): void {
    this.errorMsg.set('');

    if (!this.masterclass()) {
      this.errorMsg.set('El curso no está disponible en este momento. Inténtalo de nuevo en unos minutos.');
      return;
    }

    this.formCompra.set(true);
  }

  confirmarCompra(): void {
    this.errorFormCompra.set('');
    const invitado = !this.auth.estaAutenticado();

    if (invitado && !this.nombreInvitado.trim()) {
      this.errorFormCompra.set('Dinos tu nombre para personalizar tu acceso.');
      return;
    }

    if (invitado && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(this.emailInvitado.trim())) {
      this.errorFormCompra.set('Introduce un correo electrónico válido: es donde recibirás el acceso.');
      return;
    }

    if (!this.aceptaCondiciones) {
      this.errorFormCompra.set('Necesitamos que aceptes las condiciones de venta y la política de privacidad.');
      return;
    }

    if (!this.aceptaAccesoInmediato) {
      this.errorFormCompra.set('Marca la casilla del acceso inmediato para poder empezar el curso en cuanto pagues.');
      return;
    }

    this.enviarCompra(
      invitado ? { nombre: this.nombreInvitado.trim(), email: this.emailInvitado.trim() } : undefined
    );
  }

  cerrarFormCompra(): void {
    this.formCompra.set(false);
    this.errorFormCompra.set('');
  }

  private enviarCompra(invitado?: { nombre: string; email: string }): void {
    const curso = this.masterclass();
    if (!curso) return;

    this.comprando.set(true);

    this.cursos.comprar(curso.id, invitado).subscribe({
      next: respuesta => {
        window.location.href = respuesta.checkout_url;
      },
      error: error => {
        this.comprando.set(false);

        // 409: ya tiene acceso. No es un fallo, no hay nada que pagar.
        if (error?.status === 409) {
          this.yaLoTiene.set(true);
          this.formCompra.set(false);
          return;
        }

        const mensaje = mensajeDeError(
          error,
          'No se pudo iniciar el pago seguro con Stripe. Inténtalo de nuevo o contáctame por WhatsApp.'
        );

        this.errorFormCompra.set(mensaje);
      }
    });
  }

  irAMisCursos(): void {
    this.router.navigate(['/mis-cursos']);
  }

  abrirAvisoProximamente(): void {
    this.mostrarAviso = true;
    this.notificado.set(false);
    this.errorAviso.set('');
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
      this.errorAviso.set('Introduce un correo electrónico válido.');
      return;
    }

    this.enviandoAviso.set(true);
    this.errorAviso.set('');

    this.http.post(`${environment.apiUrl}/contacto`, {
      nombre: 'Lista de espera',
      email,
      servicio: 'Formación Profesional (lista de espera)',
      mensaje: 'Solicita aviso preferente del lanzamiento de la Certificación Pro con descuento prioritario.'
    }).subscribe({
      next: () => {
        this.enviandoAviso.set(false);
        this.notificado.set(true);
        this.emailAviso = '';
      },
      error: error => {
        this.enviandoAviso.set(false);
        this.errorAviso.set(mensajeDeError(
          error,
          'No se pudo registrar tu correo. Inténtalo de nuevo más tarde.'
        ));
      }
    });
  }
}
