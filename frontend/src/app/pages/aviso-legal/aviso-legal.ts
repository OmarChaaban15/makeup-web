import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DATOS_LEGALES, PENDIENTE, REVISION_LEGAL } from '../../shared/datos-legales';

@Component({
  selector: 'app-aviso-legal',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './aviso-legal.html',
  styleUrl: '../politica-privacidad/politica-privacidad.css'
})
export class AvisoLegal {
  readonly d = DATOS_LEGALES;
  readonly pendiente = PENDIENTE;
  readonly revision = REVISION_LEGAL;
}
