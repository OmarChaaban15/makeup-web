// Añade una Content-Security-Policy a cada HTML del build (npm "postbuild").
//
// Por que aqui y no en Nginx: el prerender deja en cada pagina scripts en
// linea de Angular (el contrato de eventos y su arranque) que cambian con
// cada pagina y cada version de Angular. Se calcula el hash SHA-256 de los
// que hay en cada fichero y se escribe la politica como <meta> al principio
// del <head>. La opcion autoCsp de Angular no admite SSR/prerender.
//
// La meta no puede llevar frame-ancestors: eso lo cubre X-Frame-Options en
// Nginx.
//
// Si se añade un servicio externo (un reproductor, analitica...) hay que
// añadir su origen aqui; si no, el navegador lo bloqueara y lo dira en la
// consola.

import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist', 'frontend', 'browser');

// Traductor de Google (solo se carga si la visita elige otro idioma en una
// pagina sin version nativa).
const TRADUCTOR = ['https://translate.google.com', 'https://translate.googleapis.com', 'https://www.gstatic.com'];

function politica(hashes, manejadores) {
  return [
    "default-src 'self'",
    // 'unsafe-hashes' solo cubre los manejadores en linea cuyo hash se lista:
    // el onload con el que Angular activa la hoja de estilos diferida.
    `script-src 'self' ${hashes.map((h) => `'sha256-${h}'`).join(' ')}${manejadores.length ? ` 'unsafe-hashes' ${manejadores.map((h) => `'sha256-${h}'`).join(' ')}` : ''} ${TRADUCTOR.join(' ')}`,
    // Angular inyecta estilos en linea (CSS critico y de componentes).
    `style-src 'self' 'unsafe-inline' ${TRADUCTOR.join(' ')}`,
    // Miniaturas de cursos, teselas del mapa e iconos del traductor.
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    `connect-src 'self' ${TRADUCTOR.join(' ')}`,
    // Videos de la zona de alumnas.
    'frame-src https://www.youtube-nocookie.com https://player.vimeo.com',
    "media-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    'upgrade-insecure-requests'
  ].join('; ');
}

/** Scripts en linea que el navegador ejecuta (no los JSON ni los que tienen src). */
function scriptsEnLinea(html) {
  const hashes = [];

  for (const [, atributos, cuerpo] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    if (/\bsrc\s*=/.test(atributos)) continue;

    const tipo = /\btype\s*=\s*["']?([^"'\s>]+)/i.exec(atributos)?.[1]?.toLowerCase();
    if (tipo && !['text/javascript', 'module', 'application/javascript'].includes(tipo)) continue;

    hashes.push(createHash('sha256').update(cuerpo, 'utf8').digest('base64'));
  }

  return [...new Set(hashes)];
}

/** Atributos on* (onload...) con codigo en linea. */
function manejadoresEnLinea(html) {
  const hashes = [];

  for (const [, codigo] of html.matchAll(/<[a-z][^>]*?\son[a-z]+="([^"]*)"/gi)) {
    hashes.push(createHash('sha256').update(codigo.replace(/&#39;|&apos;/g, "'"), 'utf8').digest('base64'));
  }

  return [...new Set(hashes)];
}

function htmls(dir) {
  return readdirSync(dir).flatMap((nombre) => {
    const ruta = join(dir, nombre);
    if (statSync(ruta).isDirectory()) return htmls(ruta);
    return nombre.endsWith('.html') ? [ruta] : [];
  });
}

let total = 0;

for (const fichero of htmls(RAIZ)) {
  let html = readFileSync(fichero, 'utf8').replace(/<meta http-equiv="Content-Security-Policy"[^>]*>\s*/i, '');
  const meta = `<meta http-equiv="Content-Security-Policy" content="${politica(scriptsEnLinea(html), manejadoresEnLinea(html))}">`;

  // Justo despues del charset: tiene que ir antes de cualquier script.
  if (!/<meta charset="utf-8">/i.test(html)) throw new Error(`Sin <meta charset> en ${fichero}`);
  html = html.replace(/<meta charset="utf-8">/i, (charset) => `${charset}\n  ${meta}`);

  writeFileSync(fichero, html);
  total++;
}

console.log(`CSP añadida a ${total} ficheros HTML`);
