import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Idioma, RUTAS } from '../../shared/idioma';
import { COMUNES, SERVICIOS, SERVICIOS_DETALLE, ServicioDetalle } from './contenido-servicios';

/**
 * Pagina de un servicio (novias, eventos, editorial o cine) en cualquiera de
 * los cuatro idiomas. Idioma y servicio llegan en data de la ruta; el texto,
 * de contenido-servicios.ts.
 */
@Component({
  selector: 'app-servicio',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './servicio.html'
})
export class Servicio {
  private readonly data = inject(ActivatedRoute).snapshot.data;
  private readonly idioma = this.data['idioma'] as Idioma;
  private readonly servicio = this.data['servicio'] as ServicioDetalle;

  readonly t = SERVICIOS[this.idioma][this.servicio];
  readonly c = COMUNES[this.idioma];
  readonly r = RUTAS[this.idioma];

  readonly otros = SERVICIOS_DETALLE.filter(s => s !== this.servicio).map(s => ({
    ruta: this.r[s],
    nombre: SERVICIOS[this.idioma][s].nombre,
    imagen: SERVICIOS[this.idioma][s].imagen,
    alt: SERVICIOS[this.idioma][s].alt
  }));
}
