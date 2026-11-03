import { ARTICULOS, CATEGORIAS, anclaDe, minutosDeLectura, segmentos } from './blog';
import { RUTAS } from '../shared/idioma';

describe('articulos del blog', () => {
  it('los slugs no se repiten', () => {
    const slugs = ARTICULOS.map(articulo => `${articulo.idioma}/${articulo.slug}`);

    expect(new Set(slugs).size).toBe(slugs.length);
  });

  for (const articulo of ARTICULOS) {
    describe(articulo.slug, () => {
      it('tiene meta description de longitud razonable', () => {
        expect(articulo.descripcion.length).toBeGreaterThan(60);
        expect(articulo.descripcion.length).toBeLessThanOrEqual(160);
      });

      it('el titulo cabe en una pestana (maximo 70 caracteres)', () => {
        expect(articulo.titulo.length).toBeLessThanOrEqual(70);
      });

      it('los encabezados del cuerpo empiezan en h2 y no saltan de h2 a h4', () => {
        const niveles = articulo.contenido.filter(b => b.t === 'h2' || b.t === 'h3').map(b => (b.t === 'h2' ? 2 : 3));

        if (niveles.length > 0) expect(niveles[0]).toBe(2);
      });

      it('los enlaces internos apuntan a paginas que existen', () => {
        // Parrafos, listas, notas y respuestas de las preguntas frecuentes.
        const textos = [
          ...articulo.contenido.flatMap(b => (typeof b.x === 'string' ? (b.t === 'h2' || b.t === 'h3' ? [] : [b.x]) : b.x)),
          ...(articulo.faq ?? []).map(f => f.r)
        ];
        const enlaces = textos.flatMap(texto => segmentos(texto)).flatMap(s => (s.enlace ? [s.enlace] : []));
        const validos = new Set([
          // Todas las paginas de la tabla de idiomas, incluidas las de cada servicio.
          ...Object.values(RUTAS).flatMap(rutas => Object.values(rutas)),
          '/cursos', '/oferta', '/blog',
          ...ARTICULOS.map(a => (a.idioma === 'en' ? `/en/blog/${a.slug}` : `/blog/${a.slug}`))
        ]);

        for (const enlace of enlaces) expect(validos.has(enlace), `enlace roto: ${enlace}`).toBe(true);
      });

      it('tiene categoria valida y un resumen de dos a cuatro claves', () => {
        expect(CATEGORIAS).toContain(articulo.categoria);
        expect(articulo.claves.length).toBeGreaterThanOrEqual(2);
        expect(articulo.claves.length).toBeLessThanOrEqual(4);
      });

      it('los h2 tienen anclas distintas (el indice del articulo enlaza a ellas)', () => {
        const anclas = articulo.contenido.filter(b => b.t === 'h2').map(b => anclaDe(b.x as string));

        expect(new Set(anclas).size).toBe(anclas.length);
      });

      it('no salta de fecha: la revision no es anterior a la publicacion', () => {
        if (articulo.actualizado) expect(articulo.actualizado >= articulo.fecha).toBe(true);
      });

      it('tiene una lectura de al menos 3 minutos (no es un articulo de relleno)', () => {
        expect(minutosDeLectura(articulo)).toBeGreaterThanOrEqual(3);
      });

      it('los relacionados existen y son del mismo idioma', () => {
        for (const slug of articulo.relacionados) {
          const otro = ARTICULOS.find(a => a.slug === slug);

          expect(otro, `relacionado inexistente: ${slug}`).toBeDefined();
          expect(otro?.idioma).toBe(articulo.idioma);
        }
      });
    });
  }
});

describe('anclaDe', () => {
  it('quita tildes, signos y espacios', () => {
    expect(anclaDe('¿Qué llevar a la prueba?')).toBe('que-llevar-a-la-prueba');
  });
});

describe('segmentos', () => {
  it('separa el texto de los enlaces', () => {
    expect(segmentos('a [b](/c) d')).toEqual([{ texto: 'a ' }, { texto: 'b', enlace: '/c' }, { texto: ' d' }]);
  });

  it('devuelve el texto tal cual si no hay enlaces', () => {
    expect(segmentos('sin enlaces')).toEqual([{ texto: 'sin enlaces' }]);
  });
});
