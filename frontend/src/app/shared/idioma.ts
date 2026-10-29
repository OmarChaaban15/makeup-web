import { Injectable, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

/**
 * Idiomas del sitio. Español es el original; ingles, italiano y aleman son
 * paginas escritas en ese idioma (no una traduccion automatica) bajo /en,
 * /it y /de, por lo que Google puede indexarlas con hreflang.
 *
 * Solo cuatro paginas existen en los cuatro idiomas. El resto (cursos, blog,
 * zona privada, privacidad) esta unicamente en español.
 */
export type Idioma = 'es' | 'en' | 'it' | 'de';

export const IDIOMAS: readonly Idioma[] = ['es', 'en', 'it', 'de'];

export type Pagina = 'inicio' | 'sobre' | 'servicios' | 'contacto';

export const RUTAS: Record<Idioma, Record<Pagina, string>> = {
  es: { inicio: '/', sobre: '/sobre-mi', servicios: '/servicios', contacto: '/contacto' },
  en: { inicio: '/en', sobre: '/en/about', servicios: '/en/services', contacto: '/en/contact' },
  it: { inicio: '/it', sobre: '/it/chi-sono', servicios: '/it/servizi', contacto: '/it/contatti' },
  de: { inicio: '/de', sobre: '/de/ueber-mich', servicios: '/de/leistungen', contacto: '/de/kontakt' }
};

/** Prefijo de URL de cada idioma que no es el original. */
const PREFIJOS: ReadonlyArray<Exclude<Idioma, 'es'>> = ['en', 'it', 'de'];

export function idiomaDeRuta(ruta: string): Idioma {
  return PREFIJOS.find(idioma => ruta === `/${idioma}` || ruta.startsWith(`/${idioma}/`)) ?? 'es';
}

export const esRutaIngles = (ruta: string): boolean => idiomaDeRuta(ruta) === 'en';

/** A que pagina "de pareja" corresponde una ruta, si es una de las cuatro. */
export function paginaDeRuta(ruta: string): Pagina | null {
  const idioma = idiomaDeRuta(ruta);

  return (Object.keys(RUTAS[idioma]) as Pagina[]).find(pagina => RUTAS[idioma][pagina] === ruta) ?? null;
}

/** La ruta equivalente en otro idioma, o null si la pagina no tiene version. */
export function aIdioma(ruta: string, idioma: Idioma): string | null {
  const pagina = paginaDeRuta(ruta);

  return pagina ? RUTAS[idioma][pagina] : null;
}

/** Todas las versiones de una pagina, por idioma. Null si no tiene pareja. */
export function versiones(ruta: string): Partial<Record<Idioma, string>> | null {
  const pagina = paginaDeRuta(ruta);

  if (!pagina) return null;

  return Object.fromEntries(IDIOMAS.map(idioma => [idioma, RUTAS[idioma][pagina]]));
}

/** Ruta sin parametros, fragmento ni barra final. "/inicio" es la portada. */
export function normalizarRuta(url: string): string {
  const ruta = url.split(/[?#]/)[0].replace(/\/+$/, '');

  return ruta === '' || ruta === '/inicio' ? '/' : ruta;
}

/**
 * Idioma de la pagina visible segun la URL. Lo usan la barra de navegacion,
 * el pie y el banner de cookies para mostrar sus textos y enlaces en el
 * idioma de la pagina.
 */
@Injectable({ providedIn: 'root' })
export class IdiomaRuta {
  private router = inject(Router);

  private ruta = signal(normalizarRuta(this.router.url));

  readonly idioma = computed<Idioma>(() => idiomaDeRuta(this.ruta()));

  constructor() {
    this.router.events
      .pipe(filter((evento): evento is NavigationEnd => evento instanceof NavigationEnd))
      .subscribe(evento => this.ruta.set(normalizarRuta(evento.urlAfterRedirects)));
  }

  /**
   * Destino de "cambiar de idioma" desde la pagina actual, si lo hay. Desde
   * una pagina que no tiene pareja pero ya esta en otro idioma (el articulo
   * en ingles del blog), se lleva a la portada del idioma pedido.
   */
  equivalente(idioma: Idioma): string | null {
    const ruta = this.ruta();
    const pareja = aIdioma(ruta, idioma);

    if (pareja) return pareja;
    if (idiomaDeRuta(ruta) === 'es') return null;

    return idioma === 'es' && ruta.startsWith('/en/blog/') ? '/blog' : RUTAS[idioma].inicio;
  }
}
