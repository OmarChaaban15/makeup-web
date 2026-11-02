import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DATOS_LEGALES, PENDIENTE, REVISION_LEGAL } from '../../shared/datos-legales';

@Component({
  selector: 'app-politica-privacidad',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './politica-privacidad.html',
  styleUrl: './politica-privacidad.css'
})
export class PoliticaPrivacidad {
  readonly d = DATOS_LEGALES;
  readonly pendiente = PENDIENTE;
  readonly revision = REVISION_LEGAL;
}
