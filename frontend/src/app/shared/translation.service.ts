import { Injectable, signal, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type Language = 'es' | 'en' | 'it' | 'de';

export interface LangOption {
  code: Language;
  label: string;
  flag: string;
}

const IDIOMAS: Language[] = ['es', 'en', 'it', 'de'];
const URL_WIDGET = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';

declare global {
  interface Window {
    google?: { translate?: { TranslateElement?: new (config: object, el: string) => void } };
    googleTranslateElementInit?: () => void;
  }
}

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  currentLang = signal<Language>('es');
  isTranslating = signal<boolean>(false);
  private isBrowser: boolean;
  private widgetSolicitado = false;

  readonly availableLanguages: LangOption[] = [
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'it', label: 'Italiano', flag: '🇮🇹' },
    { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  ];

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);

    if (!this.isBrowser) return;

    const cookieLang = this.getCookie('googtrans');
    const savedLang = localStorage.getItem('yona_lang') as Language | null;

    if (cookieLang) {
      const langCode = cookieLang.split('/').pop() as Language;
      if (IDIOMAS.includes(langCode)) {
        this.currentLang.set(langCode);
      }
    } else if (savedLang && IDIOMAS.includes(savedLang)) {
      this.currentLang.set(savedLang);
      if (savedLang !== 'es') {
        this.applyTranslationCookie(savedLang);
      }
    }

    // El widget solo se carga si de verdad hace falta traducir. Antes el
    // script de Google iba en el <head> y se descargaba en toda visita,
    // bloqueando el render y fijando cookies de terceros de entrada.
    if (this.currentLang() !== 'es') {
      this.cargarWidget();
    }
  }

  get currentFlag(): string {
    const lang = this.availableLanguages.find(l => l.code === this.currentLang());
    return lang?.flag || '🇪🇸';
  }

  setLanguage(lang: Language): void {
    if (this.currentLang() === lang) return;
    this.currentLang.set(lang);
    if (!this.isBrowser) return;

    this.isTranslating.set(true);
    localStorage.setItem('yona_lang', lang);

    if (lang === 'es') {
      this.clearTranslationCookie();
      this.triggerTranslateWidget('es');
    } else {
      this.applyTranslationCookie(lang);
      this.cargarWidget();
      this.triggerTranslateWidget(lang);
    }

    setTimeout(() => {
      this.isTranslating.set(false);
    }, 450);
  }

  /**
   * Inyecta el script de Google Translate una sola vez, bajo demanda.
   * Elegir un idioma distinto del castellano es la accion explicita que
   * justifica cargarlo.
   */
  private cargarWidget(): void {
    if (!this.isBrowser || this.widgetSolicitado) return;
    if (window.google?.translate?.TranslateElement) return;

    this.widgetSolicitado = true;

    window.googleTranslateElementInit = () => {
      const TranslateElement = window.google?.translate?.TranslateElement;
      if (!TranslateElement) return;

      new TranslateElement(
        { pageLanguage: 'es', includedLanguages: IDIOMAS.join(','), autoDisplay: false },
        'google_translate_element'
      );
    };

    // Contenedor oculto que el widget necesita para montarse.
    if (!document.getElementById('google_translate_element')) {
      const contenedor = document.createElement('div');
      contenedor.id = 'google_translate_element';
      contenedor.style.display = 'none';
      document.body.appendChild(contenedor);
    }

    const script = document.createElement('script');
    script.src = URL_WIDGET;
    script.async = true;
    document.body.appendChild(script);
  }

  private applyTranslationCookie(lang: string): void {
    const domain = window.location.hostname;
    document.cookie = `googtrans=/es/${lang}; path=/;`;
    document.cookie = `googtrans=/es/${lang}; path=/; domain=${domain};`;
  }

  private clearTranslationCookie(): void {
    const domain = window.location.hostname;
    document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain};`;
  }

  private triggerTranslateWidget(targetLang: string): void {
    const select = document.querySelector<HTMLSelectElement>('.goog-te-combo');
    if (select) {
      select.value = targetLang;
      select.dispatchEvent(new Event('change'));
      return;
    }

    // El widget aun no ha terminado de montarse: le damos un margen antes
    // de recargar, que es el ultimo recurso.
    setTimeout(() => {
      const reintento = document.querySelector<HTMLSelectElement>('.goog-te-combo');
      if (reintento) {
        reintento.value = targetLang;
        reintento.dispatchEvent(new Event('change'));
      } else {
        window.location.reload();
      }
    }, 1200);
  }

  private getCookie(name: string): string | null {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
  }
}
