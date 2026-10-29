import { RenderMode, ServerRoute } from '@angular/ssr';

/**
 * Que se prerenderiza en el build (outputMode "static") y que no.
 *
 * Se prerenderiza lo publico y estable: el buscador recibe el HTML con el
 * contenido sin ejecutar JavaScript.
 *
 * Renderizado en cliente:
 *  - Zona privada y pagos: no se indexan y dependen de la sesion.
 *  - /oferta: todo su contenido depende del curso que devuelve la API, que
 *    no esta disponible al compilar. Prerenderla dejaria solo el spinner.
 *  - Redirecciones (/inicio, /reservar-cita): las resuelve Nginx con 301.
 */
export const serverRoutes: ServerRoute[] = [
  { path: 'oferta', renderMode: RenderMode.Client },
  { path: 'login', renderMode: RenderMode.Client },
  { path: 'registro', renderMode: RenderMode.Client },
  { path: 'mis-cursos', renderMode: RenderMode.Client },
  { path: 'restablecer-password', renderMode: RenderMode.Client },
  { path: 'pago-exitoso', renderMode: RenderMode.Client },
  { path: 'pago-cancelado', renderMode: RenderMode.Client },
  { path: 'inicio', renderMode: RenderMode.Client },
  { path: 'reservar-cita', renderMode: RenderMode.Client },
  { path: '**', renderMode: RenderMode.Prerender }
];
