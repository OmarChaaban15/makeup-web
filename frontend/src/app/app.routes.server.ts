import { RenderMode, ServerRoute } from '@angular/ssr';
import { articulosDe } from './blog/blog';

/**
 * Que se prerenderiza en el build (outputMode "static") y que no.
 *
 * Se prerenderiza lo publico y estable: el buscador recibe el HTML con el
 * contenido sin ejecutar JavaScript. /oferta tambien: sale con su
 * contenido fijo y el precio y el contador, que dependen de la API, se rellenan
 * en el navegador (los componentes no llaman a la API al prerenderizar).
 *
 * Renderizado en cliente:
 *  - Zona privada y pagos: no se indexan y dependen de la sesion.
 *  - Redirecciones (/inicio, /reservar-cita): las resuelve Nginx con 301.
 */
export const serverRoutes: ServerRoute[] = [
  { path: 'login', renderMode: RenderMode.Client },
  { path: 'registro', renderMode: RenderMode.Client },
  { path: 'mis-cursos', renderMode: RenderMode.Client },
  { path: 'restablecer-password', renderMode: RenderMode.Client },
  { path: 'pago-exitoso', renderMode: RenderMode.Client },
  { path: 'pago-cancelado', renderMode: RenderMode.Client },
  { path: 'inicio', renderMode: RenderMode.Client },
  { path: 'reservar-cita', renderMode: RenderMode.Client },
  // Un articulo por slug: salen de blog/articulos.json.
  {
    path: 'blog/:slug',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => articulosDe('es').map(articulo => ({ slug: articulo.slug }))
  },
  {
    path: 'en/blog/:slug',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => articulosDe('en').map(articulo => ({ slug: articulo.slug }))
  },
  { path: '**', renderMode: RenderMode.Prerender }
];
