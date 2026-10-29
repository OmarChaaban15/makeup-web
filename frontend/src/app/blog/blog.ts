import articulosJson from './articulos.json';

/**
 * Los articulos viven en articulos.json (texto plano, sin base de datos ni
 * CMS): el build los prerenderiza y el sitemap los lee del mismo fichero.
 *
 * Enlaces dentro del texto: [texto](/ruta). Los encabezados del cuerpo son
 * h2 y h3; el h1 es el titulo del articulo y lo pone la plantilla.
 */
export type Bloque =
  | { t: 'p'; x: string }
  | { t: 'h2'; x: string }
  | { t: 'h3'; x: string }
  | { t: 'ul'; x: string[] };

export interface Articulo {
  slug: string;
  idioma: 'es' | 'en';
  titulo: string;
  /** Meta description, unos 150 caracteres. */
  descripcion: string;
  /** Fecha de publicacion, AAAA-MM-DD. */
  fecha: string;
  /** Ruta bajo public/, p. ej. images/IMG_1.PNG. */
  imagen: string;
  alt: string;
  /** Minutos de lectura. */
  lectura: number;
  contenido: Bloque[];
  /** Slugs de otros articulos del mismo idioma. */
  relacionados: string[];
}

export const ARTICULOS = articulosJson as unknown as Articulo[];

export const articulosDe = (idioma: 'es' | 'en'): Articulo[] =>
  ARTICULOS.filter(articulo => articulo.idioma === idioma);

export function buscarArticulo(idioma: 'es' | 'en', slug: string): Articulo | undefined {
  return ARTICULOS.find(articulo => articulo.idioma === idioma && articulo.slug === slug);
}

/** Ruta publica de un articulo. */
export const rutaDe = (articulo: Articulo): string =>
  articulo.idioma === 'en' ? `/en/blog/${articulo.slug}` : `/blog/${articulo.slug}`;

export interface Segmento {
  texto: string;
  enlace?: string;
}

/** Parte "texto [con](/enlace) dentro" en trozos para pintarlos con routerLink. */
export function segmentos(texto: string): Segmento[] {
  const partes: Segmento[] = [];
  const patron = /\[([^\]]+)\]\(([^)]+)\)/g;
  let desde = 0;

  for (const coincidencia of texto.matchAll(patron)) {
    const inicio = coincidencia.index ?? 0;

    if (inicio > desde) partes.push({ texto: texto.slice(desde, inicio) });
    partes.push({ texto: coincidencia[1], enlace: coincidencia[2] });
    desde = inicio + coincidencia[0].length;
  }

  if (desde < texto.length) partes.push({ texto: texto.slice(desde) });

  return partes;
}
