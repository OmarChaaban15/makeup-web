import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { IDIOMAS, RUTAS, aIdioma, idiomaDeRuta, normalizarRuta, paginaDeRuta, versiones } from './idioma';

describe('idioma', () => {
  it('reconoce el idioma por el prefijo de la URL', () => {
    expect(idiomaDeRuta('/')).toBe('es');
    expect(idiomaDeRuta('/servicios')).toBe('es');
    expect(idiomaDeRuta('/en')).toBe('en');
    expect(idiomaDeRuta('/en/services')).toBe('en');
    expect(idiomaDeRuta('/it/servizi')).toBe('it');
    expect(idiomaDeRuta('/de/leistungen')).toBe('de');
    // Un prefijo parecido no es un idioma.
    expect(idiomaDeRuta('/entrevista')).toBe('es');
    expect(idiomaDeRuta('/italia')).toBe('es');
  });

  it('traduce una pagina a las demas versiones', () => {
    expect(aIdioma('/servicios', 'de')).toBe('/de/leistungen');
    expect(aIdioma('/it/chi-sono', 'en')).toBe('/en/about');
    expect(aIdioma('/en/contact', 'es')).toBe('/contacto');
    expect(aIdioma('/cursos', 'en')).toBeNull();
    expect(paginaDeRuta('/de/kontakt')).toBe('contacto');
  });

  it('versiones() da las cuatro y ninguna para paginas sin pareja', () => {
    expect(versiones('/it')).toEqual({ es: '/', en: '/en', it: '/it', de: '/de' });
    expect(versiones('/blog')).toBeNull();
  });

  it('cada ruta es unica entre idiomas', () => {
    const todas = IDIOMAS.flatMap(idioma => Object.values(RUTAS[idioma]));

    expect(new Set(todas).size).toBe(todas.length);
  });

  it('normaliza parametros, barra final y /inicio', () => {
    expect(normalizarRuta('/en/about/?x=1#a')).toBe('/en/about');
    expect(normalizarRuta('/inicio')).toBe('/');
    expect(normalizarRuta('')).toBe('/');
  });

  it('el sitemap usa las mismas rutas que la aplicacion', () => {
    const script = readFileSync(join(process.cwd(), 'scripts', 'generar-sitemap.mjs'), 'utf8');

    for (const idioma of IDIOMAS) {
      for (const ruta of Object.values(RUTAS[idioma])) {
        expect(script, `falta ${ruta} en scripts/generar-sitemap.mjs`).toContain(`'${ruta}'`);
      }
    }
  });
});
