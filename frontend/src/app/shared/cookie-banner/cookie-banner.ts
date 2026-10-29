import { Component, OnInit, PLATFORM_ID, computed, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IdiomaRuta } from '../idioma';

const TEXTOS = {
  es: {
    aviso: 'Utilizamos cookies propias y de terceros para mejorar tu experiencia y analizar el uso de nuestra web. Puedes aceptarlas todas o configurar tus preferencias.',
    mas: 'Más información', tituloConfig: 'Configurar cookies', configurar: 'Configurar', rechazar: 'Rechazar',
    aceptar: 'Aceptar', nec: 'Cookies necesarias',
    necDesc: 'Imprescindibles para el funcionamiento básico de la web. No pueden desactivarse.',
    siempre: 'Siempre activas', ana: 'Cookies analíticas',
    anaDesc: 'Nos ayudan a entender cómo interactúas con la web para mejorar nuestros servicios.',
    mkt: 'Cookies de marketing',
    mktDesc: 'Permiten mostrarte contenido y anuncios personalizados según tus intereses.',
    cancelar: 'Cancelar', guardar: 'Guardar preferencias'
  },
  en: {
    aviso: 'We use our own and third-party cookies to improve your experience and analyse how our website is used. You can accept them all or set your preferences.',
    mas: 'More information', tituloConfig: 'Cookie settings', configurar: 'Settings', rechazar: 'Reject',
    aceptar: 'Accept', nec: 'Necessary cookies',
    necDesc: 'Essential for the basic operation of the website. They cannot be turned off.',
    siempre: 'Always on', ana: 'Analytics cookies',
    anaDesc: 'They help us understand how you use the website so we can improve our services.',
    mkt: 'Marketing cookies',
    mktDesc: 'They let us show you personalised content and ads based on your interests.',
    cancelar: 'Cancel', guardar: 'Save preferences'
  }
};

@Component({
  selector: 'app-cookie-banner',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cookie-banner.html',
  styleUrl: './cookie-banner.css'
})
export class CookieBanner implements OnInit {
  private esNavegador = isPlatformBrowser(inject(PLATFORM_ID));
  private idioma = inject(IdiomaRuta);

  readonly t = computed(() => (this.idioma.ingles() ? TEXTOS.en : TEXTOS.es));

  isVisible = false;
  isHiding = false;
  showConfig = false;
  analyticsEnabled = false;
  marketingEnabled = false;

  ngOnInit() {
    // En el prerender no hay localStorage ni consentimiento que leer.
    if (!this.esNavegador) return;

    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      // Pequeño delay para que no aparezca de golpe al cargar
      setTimeout(() => { this.isVisible = true; }, 800);
    }
  }

  accept() {
    localStorage.setItem('cookie-consent', JSON.stringify({
      necessary: true,
      analytics: true,
      marketing: true,
      date: new Date().toISOString()
    }));
    this.hide();
  }

  rejectAll() {
    localStorage.setItem('cookie-consent', JSON.stringify({
      necessary: true,
      analytics: false,
      marketing: false,
      date: new Date().toISOString()
    }));
    this.hide();
  }

  configure() {
    this.showConfig = !this.showConfig;
  }

  saveConfig() {
    localStorage.setItem('cookie-consent', JSON.stringify({
      necessary: true,
      analytics: this.analyticsEnabled,
      marketing: this.marketingEnabled,
      date: new Date().toISOString()
    }));
    this.hide();
  }

  private hide() {
    this.isHiding = true;
    setTimeout(() => { this.isVisible = false; }, 400);
  }
}
