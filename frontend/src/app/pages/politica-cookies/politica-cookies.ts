import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DATOS_LEGALES, PENDIENTE, REVISION_LEGAL } from '../../shared/datos-legales';

@Component({
  selector: 'app-politica-cookies',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './politica-cookies.html',
  styleUrl: '../politica-privacidad/politica-privacidad.css'
})
export class PoliticaCookies {
  readonly d = DATOS_LEGALES;
  readonly pendiente = PENDIENTE;
  readonly revision = REVISION_LEGAL;
}
