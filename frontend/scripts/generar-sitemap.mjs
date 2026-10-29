// Genera sitemap.xml en la salida del build (npm "postbuild").
//
// Solo lista URLs canonicas e indexables: las rutas con noindex (login,
// registro, mis-cursos, pagos...) no deben estar. <lastmod> es la fecha del
// ultimo commit que toco los archivos de cada pagina, no la de hoy: un
// lastmod que cambia siempre hace que Google deje de fiarse de el.
//
// Las paginas con version en ingles llevan xhtml:link hreflang en las dos
// URLs, apuntandose entre si (igual que el <head>, ver SeoService).
//
// Al añadir una pagina indexable, añadirla tambien a PAGINAS.

import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ORIGEN = 'https://makeupbyyona.es';
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const SALIDA = join(RAIZ, 'dist', 'frontend', 'browser', 'sitemap.xml');

const pagina = (carpeta) => {
  const nombre = carpeta.split('/').pop();

  return [`src/app/pages/${carpeta}/${nombre}.html`, `src/app/pages/${carpeta}/${nombre}.ts`];
};

// `en`: ruta de la version inglesa, si existe (debe coincidir con
// PARES_IDIOMA en src/app/shared/idioma.ts).
const PAGINAS = [
  { ruta: '/', en: '/en', archivos: [...pagina('inicio'), 'src/app/shared/seo-schemas.ts'] },
  { ruta: '/sobre-mi', en: '/en/about', archivos: pagina('sobre-mi') },
  { ruta: '/servicios', en: '/en/services', archivos: pagina('servicios') },
  { ruta: '/cursos', archivos: pagina('cursos') },
  { ruta: '/oferta', archivos: pagina('oferta') },
  { ruta: '/contacto', en: '/en/contact', archivos: pagina('contacto') },
  { ruta: '/politica-privacidad', archivos: pagina('politica-privacidad') }
];

const INGLES = [
  { ruta: '/en', es: '/', archivos: pagina('en/home') },
  { ruta: '/en/about', es: '/sobre-mi', archivos: pagina('en/about') },
  { ruta: '/en/services', es: '/servicios', archivos: pagina('en/services') },
  { ruta: '/en/contact', es: '/contacto', archivos: pagina('en/contact') }
];

const loc = (ruta) => (ruta === '/' ? `${ORIGEN}/` : `${ORIGEN}${ruta}`);

function ultimaModificacion(archivos) {
  try {
    const fecha = execFileSync('git', ['log', '-1', '--format=%cs', '--', ...archivos], {
      cwd: RAIZ,
      encoding: 'utf8'
    }).trim();

    if (/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return fecha;
  } catch {
    // Sin git (o sin historial): se omite lastmod en vez de inventarlo.
  }

  return null;
}

function alternativas(es, en) {
  const enlace = (hreflang, ruta) =>
    `    <xhtml:link rel="alternate" hreflang="${hreflang}" href="${loc(ruta)}"/>`;

  return [enlace('es', es), enlace('en', en), enlace('x-default', es)];
}

function entrada(ruta, archivos, es, en) {
  const lastmod = ultimaModificacion(archivos);

  return [
    '  <url>',
    `    <loc>${loc(ruta)}</loc>`,
    ...(lastmod ? [`    <lastmod>${lastmod}</lastmod>`] : []),
    ...(es && en ? alternativas(es, en) : []),
    '  </url>'
  ].join('\n');
}

const urls = [
  ...PAGINAS.map(({ ruta, en, archivos }) => entrada(ruta, archivos, ruta, en)),
  ...INGLES.map(({ ruta, es, archivos }) => entrada(ruta, archivos, es, ruta))
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>
`;

mkdirSync(dirname(SALIDA), { recursive: true });
writeFileSync(SALIDA, xml);
console.log(`sitemap.xml generado con ${urls.length} URLs en ${SALIDA}`);
