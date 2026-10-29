// Genera sitemap.xml en la salida del build (npm "postbuild").
//
// Solo lista URLs canonicas e indexables: las rutas con noindex (login,
// registro, mis-cursos, pagos...) no deben estar. <lastmod> es la fecha del
// ultimo commit que toco los archivos de cada pagina, no la de hoy: un
// lastmod que cambia siempre hace que Google deje de fiarse de el.
//
// Al añadir una pagina indexable, añadirla tambien a PAGINAS.

import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ORIGEN = 'https://makeupbyyona.es';
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const SALIDA = join(RAIZ, 'dist', 'frontend', 'browser', 'sitemap.xml');

const pagina = (carpeta) => [
  `src/app/pages/${carpeta}/${carpeta}.html`,
  `src/app/pages/${carpeta}/${carpeta}.ts`
];

const PAGINAS = [
  { ruta: '/', archivos: [...pagina('inicio'), 'src/app/shared/seo-schemas.ts'] },
  { ruta: '/sobre-mi', archivos: pagina('sobre-mi') },
  { ruta: '/servicios', archivos: pagina('servicios') },
  { ruta: '/cursos', archivos: pagina('cursos') },
  { ruta: '/oferta', archivos: pagina('oferta') },
  { ruta: '/contacto', archivos: pagina('contacto') },
  { ruta: '/politica-privacidad', archivos: pagina('politica-privacidad') }
];

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

const urls = PAGINAS.map(({ ruta, archivos }) => {
  const lastmod = ultimaModificacion(archivos);
  const loc = ruta === '/' ? `${ORIGEN}/` : `${ORIGEN}${ruta}`;

  return `  <url>\n    <loc>${loc}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ''}\n  </url>`;
});

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`;

mkdirSync(dirname(SALIDA), { recursive: true });
writeFileSync(SALIDA, xml);
console.log(`sitemap.xml generado con ${PAGINAS.length} URLs en ${SALIDA}`);
