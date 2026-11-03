import { Component, DestroyRef, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs/operators';
import { Articulo, anclaDe, buscarArticulo, minutosDeLectura, rutaDe, segmentos } from '../../blog/blog';
import { enlaceWhatsapp } from '../../shared/textos';

/**
 * Un articulo del blog. Lo entrega el resolver de la ruta (ver
 * blog/blog-rutas.ts), que tambien da el titulo y los metadatos SEO.
 */
@Component({
  selector: 'app-blog-articulo',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './blog-articulo.html',
  styleUrl: './blog-articulo.css'
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

  /** Indice del articulo: sus h2, con el ancla que lleva cada uno. */
  readonly indice = computed(() =>
    (this.articulo()?.contenido ?? [])
      .filter(b => b.t === 'h2')
      .map(b => ({ texto: b.x as string, ancla: anclaDe(b.x as string) }))
  );

  readonly minutos = computed(() => {
    const a = this.articulo();
    return a ? minutosDeLectura(a) : 0;
  });

  readonly whatsapp = computed(() => enlaceWhatsapp(this.ingles() ? 'en' : 'es'));

  /** Avance de lectura, de 0 a 1, para la barra fina de arriba. */
  readonly progreso = signal(0);

  readonly rutaDe = rutaDe;
  readonly segmentos = segmentos;
  readonly anclaDe = anclaDe;
  readonly minutosDe = minutosDeLectura;

  constructor() {
    if (!isPlatformBrowser(inject(PLATFORM_ID))) return;

    // Un calculo por fotograma como mucho, y solo con transform (scaleX).
    let pendiente = false;
    const medir = () => {
      pendiente = false;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      this.progreso.set(total > 0 ? Math.min(1, Math.max(0, window.scrollY / total)) : 0);
    };
    const alHacerScroll = () => {
      if (pendiente) return;
      pendiente = true;
      requestAnimationFrame(medir);
    };

    window.addEventListener('scroll', alHacerScroll, { passive: true });
    inject(DestroyRef).onDestroy(() => window.removeEventListener('scroll', alHacerScroll));
  }

  fecha(articulo: Articulo, cual: 'fecha' | 'actualizado' = 'fecha'): string {
    const valor = cual === 'actualizado' ? articulo.actualizado ?? articulo.fecha : articulo.fecha;

    return new Date(`${valor}T12:00:00`).toLocaleDateString(articulo.idioma === 'en' ? 'en-GB' : 'es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }
}
