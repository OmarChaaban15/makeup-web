import { Component, OnInit, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IdiomaRuta } from '../idioma';
import { COOKIES } from '../textos';

/**
 * Aviso informativo. La web solo guarda almacenamiento tecnico (sesion,
 * idioma, progreso), exento de consentimiento (art. 22.2 LSSI), asi que no
 * hay nada que aceptar o rechazar: ofrecer casillas de analitica o marketing
 * que no existen seria enganoso. Si algun dia se anade analitica, aqui ira
 * el consentimiento, con rechazar al mismo nivel que aceptar.
 */
@Component({
  selector: 'app-cookie-banner',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './cookie-banner.html'
})
export class CookieBanner implements OnInit {
  private esNavegador = isPlatformBrowser(inject(PLATFORM_ID));
  private idioma = inject(IdiomaRuta);

  readonly t = computed(() => COOKIES[this.idioma.idioma()]);

  readonly visible = signal(false);
  readonly ocultando = signal(false);

  ngOnInit() {
    // En el prerender no hay localStorage que leer.
    if (!this.esNavegador) return;

    let visto: string | null = null;
    try {
      visto = localStorage.getItem('cookie-consent');
    } catch {
      // Almacenamiento bloqueado: se muestra el aviso.
    }

    if (!visto) {
      // Pequeño retraso para que no aparezca de golpe al cargar.
      setTimeout(() => this.visible.set(true), 800);
    }
  }

  cerrar() {
    try {
      localStorage.setItem('cookie-consent', JSON.stringify({ informado: true, date: new Date().toISOString() }));
    } catch {
      // Sin almacenamiento el aviso volvera a salir; no es grave.
    }
    this.ocultando.set(true);
    setTimeout(() => this.visible.set(false), 400);
  }
}
