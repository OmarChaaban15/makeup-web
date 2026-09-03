import { Injectable, signal, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type Language = 'es' | 'en' | 'it' | 'de';

export interface LangOption {
  code: Language;
  label: string;
  flag: string;
}

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  currentLang = signal<Language>('es');
  isTranslating = signal<boolean>(false);
  private isBrowser: boolean;

  readonly availableLanguages: LangOption[] = [
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'it', label: 'Italiano', flag: '🇮🇹' },
    { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  ];

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);

    if (this.isBrowser) {
      const cookieLang = this.getCookie('googtrans');
      const savedLang = localStorage.getItem('yona_lang') as Language;

      if (cookieLang) {
        const langCode = cookieLang.split('/').pop() as Language;
        if (['es', 'en', 'it', 'de'].includes(langCode)) {
          this.currentLang.set(langCode);
        }
      } else if (savedLang && ['es', 'en', 'it', 'de'].includes(savedLang)) {
        this.currentLang.set(savedLang);
        if (savedLang !== 'es') {
          this.applyTranslationCookie(savedLang);
        }
      }
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
      this.triggerTranslateWidget(lang);
    }

    // Terminar estado de transición sutil
    setTimeout(() => {
      this.isTranslating.set(false);
    }, 450);
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
    } else {
      window.location.reload();
    }
  }

  private getCookie(name: string): string | null {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
  }
}
