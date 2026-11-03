import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  ARTICULOS, Articulo, CATEGORIAS, Categoria, articulosDe, buscarArticulo, minutosDeLectura, rutaDe
} from '../../blog/blog';
import { ScrollRevealDirective } from '../../shared/scroll-reveal.directive';

/**
 * Portada del blog (/blog): un articulo destacado, la guia de lectura para
 * novias en orden, todos los articulos con filtro por tema y, aparte, los
 * que estan en ingles.
 *
 * El filtro es solo de presentacion: el HTML prerenderizado lleva todos los
 * articulos (los buscadores los ven todos) y ?categoria=Piel abre la pagina
 * ya filtrada (lo usan los enlaces de categoria de cada articulo).
 */
@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [RouterLink, ScrollRevealDirective],
  templateUrl: './blog.html',
  styleUrl: './blog.css'
})
export class Blog {
  readonly espanol: Articulo[] = articulosDe('es');
  readonly ingles: Articulo[] = articulosDe('en');
  readonly total = ARTICULOS.length;
  readonly rutaDe = rutaDe;
  readonly minutos = minutosDeLectura;

  /** El articulo que mas buscan las novias abre la pagina. */
  readonly destacado = buscarArticulo('es', 'cuanto-cuesta-maquilladora-novia-ibiza')!;

  /**
   * Guia para novias: los articulos en el orden en que conviene leerlos,
   * de elegir maquilladora al dia de la boda.
   */
  readonly guiaNovias = [
    { slug: 'como-elegir-maquilladora-boda-ibiza', cuando: 'Al empezar a organizar' },
    { slug: 'cuanto-cuesta-maquilladora-novia-ibiza', cuando: 'Al pedir presupuestos' },
    { slug: 'prueba-de-maquillaje-de-novia', cuando: 'De uno a tres meses antes' },
    { slug: 'preparar-la-piel-antes-de-un-evento', cuando: 'La semana de la boda' },
    { slug: 'maquillaje-novia-calor-que-dure', cuando: 'Para el gran día' },
    { slug: 'boda-de-destino-ibiza-checklist-belleza', cuando: 'Para tenerlo todo a mano' },
  ].map(paso => ({ ...paso, articulo: buscarArticulo('es', paso.slug)! }));

  readonly categorias = CATEGORIAS.map(nombre => ({
    nombre,
    total: this.espanol.filter(a => a.categoria === nombre).length
  })).filter(c => c.total > 0);

  readonly filtro = signal<Categoria | null>(null);

  readonly visibles = computed(() => {
    const filtro = this.filtro();
    return filtro ? this.espanol.filter(a => a.categoria === filtro) : this.espanol;
  });

  constructor() {
    const inicial = inject(ActivatedRoute).snapshot.queryParamMap.get('categoria');
    if (inicial && (CATEGORIAS as string[]).includes(inicial)) this.filtro.set(inicial as Categoria);
  }

  elegir(categoria: Categoria | null): void {
    this.filtro.set(categoria);
  }

  fecha(articulo: Articulo): string {
    return new Date(`${articulo.actualizado ?? articulo.fecha}T12:00:00`).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }
}
