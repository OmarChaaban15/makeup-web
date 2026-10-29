import { ARTICULOS, segmentos } from './blog';

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
        const textos = articulo.contenido.flatMap(b => (b.t === 'ul' ? b.x : b.t === 'p' ? [b.x] : []));
        const enlaces = textos.flatMap(texto => segmentos(texto)).flatMap(s => (s.enlace ? [s.enlace] : []));
        const validos = new Set([
          '/', '/servicios', '/sobre-mi', '/contacto', '/cursos', '/oferta', '/blog',
          '/en', '/en/services', '/en/about', '/en/contact',
          ...ARTICULOS.map(a => (a.idioma === 'en' ? `/en/blog/${a.slug}` : `/blog/${a.slug}`))
        ]);

        for (const enlace of enlaces) expect(validos.has(enlace), `enlace roto: ${enlace}`).toBe(true);
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

describe('segmentos', () => {
  it('separa el texto de los enlaces', () => {
    expect(segmentos('a [b](/c) d')).toEqual([{ texto: 'a ' }, { texto: 'b', enlace: '/c' }, { texto: ' d' }]);
  });

  it('devuelve el texto tal cual si no hay enlaces', () => {
    expect(segmentos('sin enlaces')).toEqual([{ texto: 'sin enlaces' }]);
  });
});
