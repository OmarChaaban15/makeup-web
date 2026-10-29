import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { RUTAS } from '../../../shared/idioma';
import { CONTENIDO, IdiomaNativo } from '../contenido';

/** Portada en ingles, italiano o aleman (/en, /it, /de). El idioma lo da data.idioma de la ruta. */
@Component({
  selector: 'app-multi-inicio',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './inicio.html'
})
export class MultiInicio {
  private readonly idioma = inject(ActivatedRoute).snapshot.data['idioma'] as IdiomaNativo;

  readonly t = CONTENIDO[this.idioma].inicio;
  readonly r = RUTAS[this.idioma];

  /** Imagenes de las cuatro tarjetas de servicios, en el orden de `t.tarjetas`. */
  readonly imagenes = ['images/IMG_1.PNG', 'images/IMG_3.PNG', 'images/IMG_4.PNG', 'images/IMG_5.JPEG'];
}
