// Genera sitemap.xml en la salida del build (npm "postbuild").
//
// Solo lista URLs canonicas e indexables: las rutas con noindex (login,
// registro, mis-cursos, pagos...) no deben estar. <lastmod> es la fecha del
// ultimo commit que toco los archivos de cada pagina, no la de hoy: un
// lastmod que cambia siempre hace que Google deje de fiarse de el.
//
// Las cuatro paginas que existen en español, ingles, italiano y aleman
// llevan xhtml:link hreflang en todas sus URLs, apuntandose entre si
// (igual que el <head>, ver SeoService). x-default es la version en español.
//
// Al añadir una pagina indexable, añadirla tambien aqui. Las rutas de
// RUTAS deben coincidir con RUTAS de src/app/shared/idioma.ts (hay un test).

import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ORIGEN = 'https://makeupbyyona.es';
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const SALIDA = join(RAIZ, 'dist', 'frontend', 'browser', 'sitemap.xml');

const IDIOMAS = ['es', 'en', 'it', 'de'];

const RUTAS = {
  es: { inicio: '/', sobre: '/sobre-mi', servicios: '/servicios', contacto: '/contacto' },
  en: { inicio: '/en', sobre: '/en/about', servicios: '/en/services', contacto: '/en/contact' },
  it: { inicio: '/it', sobre: '/it/chi-sono', servicios: '/it/servizi', contacto: '/it/contatti' },
  de: { inicio: '/de', sobre: '/de/ueber-mich', servicios: '/de/leistungen', contacto: '/de/kontakt' }
};

const pagina = (carpeta) => {
  const nombre = carpeta.split('/').pop();

  return [`src/app/pages/${carpeta}/${nombre}.html`, `src/app/pages/${carpeta}/${nombre}.ts`];
};

// Archivos de los que depende cada pagina, para el lastmod.
const ARCHIVOS = {
  es: {
    inicio: [...pagina('inicio'), 'src/app/shared/seo-schemas.ts'],
    sobre: pagina('sobre-mi'),
    servicios: pagina('servicios'),
    contacto: pagina('contacto')
  },
  otros: {
    inicio: [...pagina('multi/inicio'), 'src/app/pages/multi/contenido.ts'],
    sobre: [...pagina('multi/sobre-mi'), 'src/app/pages/multi/contenido.ts'],
    servicios: [...pagina('multi/servicios'), 'src/app/pages/multi/contenido.ts'],
    contacto: [...pagina('multi/contacto'), 'src/app/pages/multi/contenido.ts']
  }
};

// Paginas solo en español.
const SOLO_ESPANOL = [
  { ruta: '/cursos', archivos: pagina('cursos') },
  { ruta: '/oferta', archivos: pagina('oferta') },
  { ruta: '/politica-privacidad', archivos: pagina('politica-privacidad') }
];

// Articulos del blog: la fecha de publicacion es el lastmod. Los de /en/blog no
// tienen pareja en español, asi que van sin hreflang.
const ARTICULOS = JSON.parse(readFileSync(join(RAIZ, 'src', 'app', 'blog', 'articulos.json'), 'utf8'));

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

function alternativas(pag) {
  const enlace = (hreflang, ruta) =>
    `    <xhtml:link rel="alternate" hreflang="${hreflang}" href="${loc(ruta)}"/>`;

  return [
    ...IDIOMAS.map((idioma) => enlace(idioma, RUTAS[idioma][pag])),
    enlace('x-default', RUTAS.es[pag])
  ];
}

function entrada(ruta, archivos, { pag, fecha } = {}) {
  const lastmod = fecha ?? ultimaModificacion(archivos);

  return [
    '  <url>',
    `    <loc>${loc(ruta)}</loc>`,
    ...(lastmod ? [`    <lastmod>${lastmod}</lastmod>`] : []),
    ...(pag ? alternativas(pag) : []),
    '  </url>'
  ].join('\n');
}

const ultimaFechaBlog = ARTICULOS.map((articulo) => articulo.fecha).sort().at(-1);

const urls = [
  // Las cuatro paginas en los cuatro idiomas, agrupadas por pagina.
  ...Object.keys(RUTAS.es).flatMap((pag) =>
    IDIOMAS.map((idioma) =>
      entrada(RUTAS[idioma][pag], idioma === 'es' ? ARCHIVOS.es[pag] : ARCHIVOS.otros[pag], { pag })
    )
  ),
  ...SOLO_ESPANOL.map(({ ruta, archivos }) => entrada(ruta, archivos)),
  entrada('/blog', [], { fecha: ultimaFechaBlog }),
  ...ARTICULOS.map((articulo) =>
    entrada(articulo.idioma === 'en' ? `/en/blog/${articulo.slug}` : `/blog/${articulo.slug}`, [], { fecha: articulo.fecha })
  )
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>
`;

mkdirSync(dirname(SALIDA), { recursive: true });
writeFileSync(SALIDA, xml);
console.log(`sitemap.xml generado con ${urls.length} URLs en ${SALIDA}`);
