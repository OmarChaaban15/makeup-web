import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ScrollRevealDirective } from '../../shared/scroll-reveal.directive';

@Component({
  selector: 'app-sobre-mi',
  imports: [RouterLink, ScrollRevealDirective],
  templateUrl: './sobre-mi.html',
  styleUrl: './sobre-mi.css',
})
export class SobreMi {
  // Cifras fijas: antes arrancaban en 0 y se animaban en el navegador, asi
  // que el HTML prerenderizado (lo que lee Google) decia "+0 novias".
  readonly counterYears = () => 5;
  readonly counterNovias = () => 150;
  readonly counterPersonal = () => 100;
}
