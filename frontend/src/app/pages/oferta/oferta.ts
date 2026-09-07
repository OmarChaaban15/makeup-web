import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../shared/auth.service';
import { ContadorOferta } from '../../shared/contador-oferta/contador-oferta';
import { Curso, CursosService } from '../../shared/cursos.service';
import { mensajeDeError } from '../../shared/errores-api';

/**
 * Landing de campaña (destino del anuncio de Instagram).
 *
 * Se sirve sin navbar ni footer (data.sinLayout en app.routes.ts): quien
 * llega de un anuncio no debe tener enlaces que lo saquen del embudo.
 *
 * Se puede comprar sin cuenta: solo se piden nombre y correo, y la cuenta
 * se crea al confirmarse el pago. El correo de compra incluye un enlace
 * para elegir contraseña.
 */
@Component({
  selector: 'app-oferta',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ContadorOferta],
  templateUrl: './oferta.html',
  styleUrl: './oferta.css'
})
export class Oferta implements OnInit {
  private cursos = inject(CursosService);
  private auth = inject(AuthService);
  private router = inject(Router);

  curso = signal<Curso | null>(null);
  cargando = signal(true);
  errorCarga = signal('');

  comprando = signal(false);
  errorCompra = signal('');
  yaLoTiene = signal(false);

  /** Formulario de invitado. Solo se muestra si no hay sesión iniciada. */
  formVisible = signal(false);
  nombre = '';
  email = '';
  aceptaCondiciones = false;
  errorForm = signal('');

  readonly estaAutenticado = this.auth.estaAutenticado;

  readonly precio = computed(() => {
    const curso = this.curso();
    return curso ? this.cursos.formatearPrecio(curso.precio_efectivo) : '';
  });

  readonly precioBase = computed(() => {
    const curso = this.curso();
    if (!curso || !curso.oferta_activa) return '';
    return this.cursos.formatearPrecio(curso.precio);
  });

  readonly mesesAcceso = computed(() => this.curso()?.duracion_acceso_meses ?? null);

  ngOnInit(): void {
    this.cargar();
  }

  private cargar(): void {
    this.cursos
      .masterclass()
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({
        next: curso => {
          this.curso.set(curso);
          if (!curso) {
            this.errorCarga.set('El curso no está disponible en este momento.');
          }
        },
        error: error =>
          this.errorCarga.set(
            mensajeDeError(error, 'No se pudo cargar el curso. Recarga la página.')
          )
      });
  }

  /**
   * Cuando el contador llega a cero se vuelve a pedir el curso: el precio
   * lo decide el servidor, así que basta con releerlo para que la página
   * pase a mostrar la tarifa base.
   */
  alTerminarOferta(): void {
    this.cargar();
  }

  /** Botón principal. Con sesión va directo a Stripe; sin ella pide los datos. */
  empezarCompra(): void {
    this.errorCompra.set('');

    if (this.estaAutenticado()) {
      this.enviarCompra();
      return;
    }

    this.formVisible.set(true);
  }

  comprarComoInvitado(): void {
    this.errorForm.set('');

    if (!this.nombre.trim()) {
      this.errorForm.set('Dinos tu nombre para personalizar tu acceso.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(this.email.trim())) {
      this.errorForm.set('Introduce un correo electrónico válido: es donde recibirás el acceso.');
      return;
    }

    if (!this.aceptaCondiciones) {
      this.errorForm.set('Necesitamos que aceptes la política de privacidad.');
      return;
    }

    this.enviarCompra({ nombre: this.nombre.trim(), email: this.email.trim() });
  }

  private enviarCompra(invitado?: { nombre: string; email: string }): void {
    const curso = this.curso();
    if (!curso) return;

    this.comprando.set(true);
    this.errorCompra.set('');

    this.cursos
      .comprar(curso.id, invitado)
      .pipe(finalize(() => this.comprando.set(false)))
      .subscribe({
        next: respuesta => {
          window.location.href = respuesta.checkout_url;
        },
        error: error => {
          // 409: ya tiene acceso. No es un fallo, es que no hay nada que pagar.
          if (error?.status === 409) {
            this.yaLoTiene.set(true);
            this.formVisible.set(false);
            return;
          }

          const mensaje = mensajeDeError(
            error,
            'No se pudo iniciar el pago seguro. Inténtalo de nuevo en unos minutos.'
          );

          if (invitado) {
            this.errorForm.set(mensaje);
          } else {
            this.errorCompra.set(mensaje);
          }
        }
      });
  }

  irAMisCursos(): void {
    this.router.navigate(['/mis-cursos']);
  }
}
