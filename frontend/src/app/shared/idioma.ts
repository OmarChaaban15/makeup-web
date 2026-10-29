import { Injectable, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

/**
 * Paginas que existen en español y en ingles. El resto del sitio (cursos,
 * zona privada, politica de privacidad) solo esta en español.
 *
 * El ingles vive bajo /en. Son paginas escritas en ingles, no una
 * traduccion automatica: por eso Google puede indexarlas con hreflang.
 */
export const PARES_IDIOMA: ReadonlyArray<{ es: string; en: string }> = [
  { es: '/', en: '/en' },
  { es: '/servicios', en: '/en/services' },
  { es: '/sobre-mi', en: '/en/about' },
  { es: '/contacto', en: '/en/contact' }
];

export function esRutaIngles(ruta: string): boolean {
  return ruta === '/en' || ruta.startsWith('/en/');
}

/** La ruta equivalente en ingles, o null si la pagina no tiene version. */
export function aIngles(ruta: string): string | null {
  return PARES_IDIOMA.find(par => par.es === ruta)?.en ?? null;
}

/** La ruta equivalente en español, o null si la pagina no tiene version. */
export function aEspanol(ruta: string): string | null {
  return PARES_IDIOMA.find(par => par.en === ruta)?.es ?? null;
}

/** Ruta sin parametros, fragmento ni barra final. "/inicio" es la portada. */
export function normalizarRuta(url: string): string {
  const ruta = url.split(/[?#]/)[0].replace(/\/+$/, '');

  return ruta === '' || ruta === '/inicio' ? '/' : ruta;
}

/**
 * Idioma de la pagina visible segun la URL. Lo usan la barra de navegacion
 * y el pie para mostrar sus textos y enlaces en el idioma de la pagina.
 */
@Injectable({ providedIn: 'root' })
export class IdiomaRuta {
  private router = inject(Router);

  private ruta = signal(normalizarRuta(this.router.url));

  readonly ingles = computed(() => esRutaIngles(this.ruta()));

  constructor() {
    this.router.events
      .pipe(filter((evento): evento is NavigationEnd => evento instanceof NavigationEnd))
      .subscribe(evento => this.ruta.set(normalizarRuta(evento.urlAfterRedirects)));
  }

  /** Destino de "cambiar de idioma" desde la pagina actual, si lo hay. */
  equivalente(idioma: 'es' | 'en'): string | null {
    const ruta = this.ruta();

    // El blog solo tiene un articulo en ingles: desde alli, "ES" lleva al blog.
    if (idioma === 'es' && ruta.startsWith('/en/blog/')) return '/blog';

    return idioma === 'en' ? aIngles(ruta) : aEspanol(ruta);
  }
}
