import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { RUTAS } from '../../../shared/idioma';
import { CONTENIDO, IdiomaNativo } from '../contenido';

/**
 * Contacto en ingles, italiano o aleman. No lleva formulario: el de la
 * version en español envia a la API valores de servicio en español, asi que
 * aqui se contacta por WhatsApp o correo.
 */
@Component({
  selector: 'app-multi-contacto',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './contacto.html'
})
export class MultiContacto {
  private readonly idioma = inject(ActivatedRoute).snapshot.data['idioma'] as IdiomaNativo;

  readonly t = CONTENIDO[this.idioma].contacto;
  readonly r = RUTAS[this.idioma];

  readonly enlaceWhatsapp = `https://wa.me/34658728433?text=${encodeURIComponent(this.t.mensajeWhatsapp)}`;
}
