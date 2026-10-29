import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs/operators';
import { Articulo, buscarArticulo, rutaDe, segmentos } from '../../blog/blog';

/**
 * Un articulo del blog. Lo entrega el resolver de la ruta (ver
 * blog/blog-rutas.ts), que tambien da el titulo y los metadatos SEO.
 */
@Component({
  selector: 'app-blog-articulo',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './blog-articulo.html'
})
export class BlogArticulo {
  private route = inject(ActivatedRoute);

  /** Se lee del stream: al saltar de un articulo a otro Angular reutiliza el componente. */
  readonly articulo = toSignal(this.route.data.pipe(map(datos => datos['articulo'] as Articulo)));

  readonly ingles = computed(() => this.articulo()?.idioma === 'en');

  readonly relacionados = computed(() => {
    const actual = this.articulo();

    return (actual?.relacionados ?? [])
      .map(slug => buscarArticulo(actual!.idioma, slug))
      .filter((articulo): articulo is Articulo => articulo !== undefined);
  });

  readonly rutaDe = rutaDe;
  readonly segmentos = segmentos;

  fecha(articulo: Articulo): string {
    return new Date(`${articulo.fecha}T12:00:00`).toLocaleDateString(articulo.idioma === 'en' ? 'en-GB' : 'es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }
}
