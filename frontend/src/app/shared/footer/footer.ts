import { Component, ElementRef, HostListener, PLATFORM_ID, Inject, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { IdiomaRuta } from '../idioma';
import { ScrollRevealDirective } from '../scroll-reveal.directive';

const TEXTOS = {
  es: {
    inicio: '/', lema: 'Estudio Profesional de Maquillaje y Estilismo', lugar: 'Ibiza, España', seguir: 'Sígueme en',
    igPro: 'Maquillaje profesional', igPers: 'Perfil personal', derechos: 'Todos los derechos reservados.',
    privacidad: 'Política de privacidad', cookies: 'Gestionar cookies'
  },
  en: {
    inicio: '/en', lema: 'Professional Makeup and Styling Studio', lugar: 'Ibiza, Spain', seguir: 'Follow me on',
    igPro: 'Professional makeup', igPers: 'Personal profile', derechos: 'All rights reserved.',
    privacidad: 'Privacy policy (Spanish)', cookies: 'Manage cookies'
  }
};

@Component({
  selector: 'app-footer',
  imports: [RouterLink, ScrollRevealDirective],
  templateUrl: './footer.html',
  styleUrl: './footer.css'
})
export class Footer {
  currentYear = new Date().getFullYear();

  private idioma = inject(IdiomaRuta);

  readonly t = computed(() => (this.idioma.ingles() ? TEXTOS.en : TEXTOS.es));
  private isBrowser: boolean;

  constructor(
    private elRef: ElementRef,
    @Inject(PLATFORM_ID) private platformId: object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  resetCookies() {
    localStorage.removeItem('cookie-consent');
    window.location.reload();
  }

  /** Magnetic button effect — buttons attract toward cursor */
  onMagneticMove(event: MouseEvent, btn: HTMLElement): void {
    if (!this.isBrowser || window.innerWidth < 768) return;
    const rect = btn.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    btn.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
  }

  onMagneticLeave(btn: HTMLElement): void {
    btn.style.transform = '';
  }
}