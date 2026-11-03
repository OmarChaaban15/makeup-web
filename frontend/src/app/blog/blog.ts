import articulosJson from './articulos.json';

/**
 * Los articulos viven en articulos.json (texto plano, sin base de datos ni
 * CMS): el build los prerenderiza y el sitemap los lee del mismo fichero.
 *
 * Enlaces dentro del texto: [texto](/ruta). Los encabezados del cuerpo son
 * h2 y h3; el h1 es el titulo del articulo y lo pone la plantilla.
 *
 * Tipos de bloque:
 * - p, h2, h3: parrafo y encabezados.
 * - ul: lista sin orden. ol: pasos en orden (se numeran solos).
 * - nota: consejo de Yonaida, destacado en un recuadro.
 */
export type Bloque =
  | { t: 'p'; x: string }
  | { t: 'h2'; x: string }
  | { t: 'h3'; x: string }
  | { t: 'ul'; x: string[] }
  | { t: 'ol'; x: string[] }
  | { t: 'nota'; x: string };

export type Categoria = 'Novias' | 'Invitadas y eventos' | 'Piel' | 'Automaquillaje';

export const CATEGORIAS: Categoria[] = ['Novias', 'Invitadas y eventos', 'Piel', 'Automaquillaje'];

export interface PreguntaFrecuente {
  p: string;
  r: string;
}

export interface Articulo {
  slug: string;
  idioma: 'es' | 'en';
  titulo: string;
  /** Meta description, unos 150 caracteres. */
  descripcion: string;
  /** Fecha de publicacion, AAAA-MM-DD. */
  fecha: string;
  /** Ultima revision del contenido, AAAA-MM-DD (si la hubo). */
  actualizado?: string;
  categoria: Categoria;
  /** Ruta bajo public/, p. ej. images/maquillaje-novia-ibiza.png. */
  imagen: string;
  alt: string;
  /** Lo esencial en tres o cuatro frases: el recuadro "En 30 segundos". */
  claves: string[];
  contenido: Bloque[];
  /** Preguntas frecuentes al final del articulo (opcional). */
  faq?: PreguntaFrecuente[];
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

/** Todo el texto legible del articulo (sin la sintaxis de los enlaces). */
export function textoDe(articulo: Articulo): string {
  const trozos = [
    ...articulo.claves,
    ...articulo.contenido.flatMap(b => (typeof b.x === 'string' ? [b.x] : b.x)),
    ...(articulo.faq ?? []).flatMap(f => [f.p, f.r])
  ];

  return trozos.join(' ').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
}

/** Minutos de lectura a 200 palabras por minuto, calculados del texto real. */
export function minutosDeLectura(articulo: Articulo): number {
  const palabras = textoDe(articulo).split(/\s+/).filter(Boolean).length;

  return Math.max(1, Math.round(palabras / 200));
}

/**
 * Identificador de ancla para un encabezado: "Qué llevar a la prueba" ->
 * "que-llevar-a-la-prueba". Lo usan el indice del articulo y los h2.
 */
export function anclaDe(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

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
