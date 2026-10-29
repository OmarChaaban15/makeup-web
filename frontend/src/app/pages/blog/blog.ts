import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ARTICULOS, Articulo, articulosDe, rutaDe } from '../../blog/blog';

/** Portada del blog (/blog): los articulos en español primero y, aparte, los que estan en ingles. */
@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './blog.html'
})
export class Blog {
  readonly espanol: Articulo[] = articulosDe('es');
  readonly ingles: Articulo[] = articulosDe('en');
  readonly total = ARTICULOS.length;
  readonly rutaDe = rutaDe;
}
