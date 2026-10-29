import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Cada pagina lleva un unico <h1> y los encabezados no se saltan niveles
 * (h2 -> h4). Se lee la plantilla en disco para no depender de que la
 * pagina cargue datos de la API ni de la animacion de entrada.
 *
 * login y registro quedan fuera: son dos paneles (movil y escritorio) con
 * su propio h1 y no se indexan.
 */
const PAGINAS = [
  'inicio',
  'sobre-mi',
  'servicios',
  'cursos',
  'oferta',
  'contacto',
  'politica-privacidad',
  'mis-cursos',
  'pago-exitoso',
  'pago-cancelado',
  'restablecer-password',
  'no-encontrada',
  'en/home',
  'en/services',
  'en/about',
  'en/contact'
];

function niveles(pagina: string): number[] {
  const ruta = join(process.cwd(), 'src', 'app', 'pages', pagina, `${pagina.split('/').pop()}.html`);
  const html = readFileSync(ruta, 'utf8');

  // \b y no ">" : las etiquetas con atributos pueden partirse en varias lineas.
  return [...html.matchAll(/<h([1-6])\b/g)].map(coincidencia => Number(coincidencia[1]));
}

describe('encabezados de las paginas', () => {
  for (const pagina of PAGINAS) {
    describe(pagina, () => {
      it('tiene exactamente un h1', () => {
        expect(niveles(pagina).filter(nivel => nivel === 1)).toHaveLength(1);
      });

      it('empieza por el h1 y no salta niveles hacia abajo', () => {
        const lista = niveles(pagina);

        expect(lista[0]).toBe(1);

        lista.forEach((nivel, i) => {
          if (i > 0) {
            expect(nivel, `h${nivel} tras h${lista[i - 1]} (posicion ${i + 1})`).toBeLessThanOrEqual(lista[i - 1] + 1);
          }
        });
      });
    });
  }
});
