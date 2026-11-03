import { inject } from '@angular/core';
import { RedirectCommand, ResolveFn, Router } from '@angular/router';
import { schemaArticulo } from '../shared/seo-schemas';
import type { SeoRuta } from '../shared/seo.service';
import type { Articulo } from './blog';

type Idioma = 'es' | 'en';

// blog.ts arrastra articulos.json. Se importa bajo demanda para que el texto
// de los articulos no engorde el bundle inicial del resto del sitio.
const cargarBlog = () => import('./blog');

async function articuloDe(idioma: Idioma, slug: string | null): Promise<Articulo | undefined> {
  const { buscarArticulo } = await cargarBlog();

  return buscarArticulo(idioma, slug ?? '');
}

/**
 * Entrega el articulo a la plantilla. Si el slug no existe se envia a la
 * pagina de error (la ruta comodin), en vez de pintar una pagina vacia.
 */
export const articuloResolver =
  (idioma: Idioma): ResolveFn<Articulo> =>
  async route => {
    const router = inject(Router);
    const articulo = await articuloDe(idioma, route.paramMap.get('slug'));

    return articulo ?? new RedirectCommand(router.parseUrl('/pagina-no-encontrada'), { skipLocationChange: true });
  };

/**
 * Titulo de la pestana: el del articulo y, si cabe, la marca. Google recorta
 * hacia los 60 caracteres, asi que un titulo largo no lleva el sufijo.
 */
export const tituloResolver =
  (idioma: Idioma): ResolveFn<string> =>
  async route => {
    const articulo = await articuloDe(idioma, route.paramMap.get('slug'));

    if (!articulo) return 'Makeup by Yona';

    return articulo.titulo.length <= 40 ? `${articulo.titulo} · Makeup by Yona` : articulo.titulo;
  };

/** Metadatos SEO del articulo: lo que el SeoService lee de data.seo. */
export const seoResolver =
  (idioma: Idioma): ResolveFn<SeoRuta> =>
  async route => {
    const articulo = await articuloDe(idioma, route.paramMap.get('slug'));

    if (!articulo) return { descripcion: '', noindex: true };

    const { rutaDe } = await cargarBlog();
    const ruta = rutaDe(articulo);
    const raiz = idioma === 'en' ? { nombre: 'Home', ruta: '/en' } : { nombre: 'Inicio', ruta: '/' };

    return {
      descripcion: articulo.descripcion,
      imagen: `/${articulo.imagen}`,
      jsonLd: schemaArticulo(articulo, ruta),
      // El blog es solo en español; el articulo en ingles cuelga de la portada inglesa.
      migas:
        idioma === 'en'
          ? [raiz, { nombre: articulo.titulo, ruta }]
          : [raiz, { nombre: 'Blog', ruta: '/blog' }, { nombre: articulo.titulo, ruta }]
    };
  };
