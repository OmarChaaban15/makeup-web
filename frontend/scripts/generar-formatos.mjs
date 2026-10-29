// Genera copias AVIF y WebP de las fotos de public/images.
//
//   npm run formatos
//
// Las originales no se tocan ni se recomprimen: las copias van al lado con
// el nombre completo mas la extension (IMG_1.PNG -> IMG_1.PNG.avif) y Nginx
// las sirve en la misma URL cuando el navegador las acepta (cabecera Accept),
// con la original como respaldo. Ver deploy/nginx/makeupbyyona.es.conf y la
// politica de medios de CLAUDE.md.
//
// Los ficheros generados se versionan: el servidor no necesita sharp.
// Hay que volver a lanzarlo al añadir o cambiar una foto.

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'images');

// Calidad alta: se busca una copia visualmente indistinguible, no la maxima
// reduccion de peso.
const AVIF = { quality: 80, effort: 6 };
const WEBP = { quality: 90, effort: 6 };

// Estas dos se rastrean como imagen social (Open Graph) y deben seguir
// siendo JPEG; las copias no aportan nada.
const OMITIR = new Set(['og-makeup-by-yona.jpg']);

// Solo se convierten las fotos que el codigo usa: en public/ hay originales
// de varios MB que ninguna pagina referencia.
const CODIGO = join(DIR, '..', '..', 'src');

function textoDelCodigo(dir) {
  return readdirSync(dir, { withFileTypes: true })
    .map((e) => {
      const ruta = join(dir, e.name);
      if (e.isDirectory()) return textoDelCodigo(ruta);
      return /\.(html|ts|css)$/.test(e.name) ? readFileSync(ruta, 'utf8') : '';
    })
    .join('\n');
}

const USADAS = textoDelCodigo(CODIGO);

const esFoto = (nombre) => /\.(png|jpe?g)$/i.test(extname(nombre));
const kb = (bytes) => `${Math.round(bytes / 1024)} KiB`;

let antes = 0;
let despues = 0;

for (const nombre of readdirSync(DIR).filter(esFoto)) {
  if (OMITIR.has(nombre) || !USADAS.includes(nombre)) {
    console.log(`${nombre.padEnd(34)} omitida (no se usa)`);
    continue;
  }

  const origen = join(DIR, nombre);
  const peso = statSync(origen).size;
  const imagen = sharp(origen, { failOn: 'none' }).rotate();

  const [avif, webp] = await Promise.all([
    imagen.clone().avif(AVIF).toFile(`${origen}.avif`),
    imagen.clone().webp(WEBP).toFile(`${origen}.webp`)
  ]);

  antes += peso;
  despues += Math.min(avif.size, webp.size);
  console.log(`${nombre.padEnd(34)} ${kb(peso).padStart(10)}  avif ${kb(avif.size).padStart(9)}  webp ${kb(webp.size).padStart(9)}`);
}

console.log(`\nOriginales ${kb(antes)} -> mejor copia ${kb(despues)}`);
