import { Component, DestroyRef, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs/operators';
import { IdiomaRuta, RUTAS } from '../idioma';
import { ACCION, enlaceWhatsapp } from '../textos';
import { InterfazService } from '../interfaz.service';

/**
 * Barra fija de reserva en el movil: "Solicitar cita" y WhatsApp siempre a
 * mano del pulgar. Aparece cuando la visitante ya ha pasado la portada (el
 * hero tiene sus propios botones) y se aparta donde estorbaria: en contacto
 * (ya esta en el formulario), en cursos y en el pago (la accion alli es
 * comprar) y mientras el menu o el aviso de cookies estan abiertos.
 * En escritorio no se muestra: la cabecera ya lleva el boton de contacto.
 */
@Component({
  selector: 'app-barra-accion',
  imports: [RouterLink],
  templateUrl: './barra-accion.html',
  styleUrl: './barra-accion.css'
})
export class BarraAccion {
  private readonly esNavegador = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly router = inject(Router);
  private readonly idioma = inject(IdiomaRuta);
  private readonly interfaz = inject(InterfazService);

  readonly t = computed(() => ACCION[this.idioma.idioma()]);
  readonly rutaContacto = computed(() => RUTAS[this.idioma.idioma()].contacto);
  readonly whatsapp = computed(() => enlaceWhatsapp(this.idioma.idioma()));

  private readonly pasadoElHero = signal(false);
  private readonly rutaPermitida = signal(false);

  readonly visible = computed(() =>
    this.pasadoElHero() && this.rutaPermitida()
    && !this.interfaz.menuAbierto() && !this.interfaz.avisoCookiesVisible()
  );

  /** Rutas donde la barra competiria con la accion principal de la pagina. */
  private readonly rutasSinBarra = [
    ...Object.values(RUTAS).map(rutas => rutas.contacto),
    '/cursos', '/oferta', '/login', '/registro', '/mis-cursos',
    '/pago-exitoso', '/pago-cancelado', '/restablecer-password'
  ];

  constructor() {
    if (!this.esNavegador) return;

    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(e => {
        const ruta = (e.urlAfterRedirects || e.url).split(/[?#]/)[0];
        this.rutaPermitida.set(!this.rutasSinBarra.includes(ruta));
        this.medir();
      });

    // Un solo calculo por fotograma aunque el scroll dispare muchos eventos.
    let pendiente = false;
    const alHacerScroll = () => {
      if (pendiente) return;
      pendiente = true;
      requestAnimationFrame(() => {
        pendiente = false;
        this.medir();
      });
    };
    window.addEventListener('scroll', alHacerScroll, { passive: true });
    inject(DestroyRef).onDestroy(() => window.removeEventListener('scroll', alHacerScroll));
  }

  private medir(): void {
    this.pasadoElHero.set(window.scrollY > window.innerHeight * 0.6);
  }
}
