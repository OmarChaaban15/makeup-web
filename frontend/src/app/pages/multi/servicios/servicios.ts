import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { RUTAS } from '../../../shared/idioma';
import { CONTENIDO, IdiomaNativo } from '../contenido';

/** Servicios en ingles, italiano o aleman. El idioma lo da data.idioma de la ruta. */
@Component({
  selector: 'app-multi-servicios',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './servicios.html'
})
export class MultiServicios {
  private readonly idioma = inject(ActivatedRoute).snapshot.data['idioma'] as IdiomaNativo;

  readonly t = CONTENIDO[this.idioma].servicios;
  readonly r = RUTAS[this.idioma];

  /** Imagen de cada servicio, en el orden de `t.servicios`. */
  readonly imagenes = ['images/IMG_8.jpg', 'images/IMG_3.PNG', 'images/IMG_7.jpg', 'images/IMG_5.JPEG'];
}
