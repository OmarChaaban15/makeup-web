import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ScrollRevealDirective } from '../../shared/scroll-reveal.directive';

@Component({
  selector: 'app-servicios',
  imports: [RouterLink, ScrollRevealDirective],
  templateUrl: './servicios.html',
  styleUrl: './servicios.css'
})
export class Servicios {}
