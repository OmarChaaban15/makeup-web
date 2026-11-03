// Genera los iconos de la web a partir de public/logo/my_logo.svg:
// favicon.ico (16, 32 y 48 px), el PNG del <link rel="icon">, el
// apple-touch-icon y los dos tamanos del manifest. Se ejecuta a mano
// (npm run iconos) cuando cambia el logo; los PNG se versionan.
import sharp from 'sharp';
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const publico = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');
const svg = join(publico, 'logo', 'my_logo.svg');

const png = (lado) => sharp(svg, { density: 600 }).resize(lado, lado).png().toBuffer();

const salidas = {
  'logo/my_logo.png': 192,
  'apple-touch-icon.png': 180,
  'icon-192.png': 192,
  'icon-512.png': 512
};

for (const [ruta, lado] of Object.entries(salidas)) {
  writeFileSync(join(publico, ruta), await png(lado));
}

// ICO con imagenes PNG dentro (admitido por todos los navegadores actuales).
const lados = [16, 32, 48];
const imagenes = await Promise.all(lados.map(png));
const cabecera = Buffer.alloc(6);
cabecera.writeUInt16LE(0, 0);
cabecera.writeUInt16LE(1, 2);
cabecera.writeUInt16LE(lados.length, 4);

let desplazamiento = 6 + 16 * lados.length;
const entradas = lados.map((lado, i) => {
  const e = Buffer.alloc(16);
  e.writeUInt8(lado, 0);
  e.writeUInt8(lado, 1);
  e.writeUInt16LE(1, 4);
  e.writeUInt16LE(32, 6);
  e.writeUInt32LE(imagenes[i].length, 8);
  e.writeUInt32LE(desplazamiento, 12);
  desplazamiento += imagenes[i].length;
  return e;
});

writeFileSync(join(publico, 'favicon.ico'), Buffer.concat([cabecera, ...entradas, ...imagenes]));
console.log('Iconos generados en', publico);
