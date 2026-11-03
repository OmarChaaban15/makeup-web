import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Idioma, RUTAS } from '../../shared/idioma';
import { ScrollRevealDirective } from '../../shared/scroll-reveal.directive';
import { enlaceWhatsapp } from '../../shared/textos';
import { COMUNES, SERVICIOS, SERVICIOS_DETALLE, ServicioDetalle } from './contenido-servicios';

/**
 * Pagina de un servicio (novias, eventos, editorial o cine) en cualquiera de
 * los cuatro idiomas. Idioma y servicio llegan en data de la ruta; el texto,
 * de contenido-servicios.ts.
 */
@Component({
  selector: 'app-servicio',
  standalone: true,
  imports: [RouterLink, ScrollRevealDirective],
  templateUrl: './servicio.html',
  styleUrl: './servicio.css'
})
export class Servicio {
  private readonly data = inject(ActivatedRoute).snapshot.data;
  private readonly idioma = this.data['idioma'] as Idioma;
  private readonly servicio = this.data['servicio'] as ServicioDetalle;

  readonly t = SERVICIOS[this.idioma][this.servicio];
  readonly c = COMUNES[this.idioma];
  readonly r = RUTAS[this.idioma];

  readonly whatsapp = enlaceWhatsapp(this.idioma);

  /**
   * Clave de ?servicio= que entiende el formulario de contacto en español
   * para dejar el tipo de servicio ya marcado. Las paginas de contacto en
   * otros idiomas la ignoran.
   */
  readonly claveContacto = ({ novias: 'novia', eventos: 'eventos', editorial: 'editorial', cine: 'cine' } as const)[this.servicio];

  readonly otros = SERVICIOS_DETALLE.filter(s => s !== this.servicio).map(s => ({
    ruta: this.r[s],
    nombre: SERVICIOS[this.idioma][s].nombre,
    imagen: SERVICIOS[this.idioma][s].imagen,
    alt: SERVICIOS[this.idioma][s].alt
  }));
}
