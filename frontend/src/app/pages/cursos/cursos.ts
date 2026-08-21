import { Component } from '@angular/core';
import { ScrollRevealDirective } from '../../shared/scroll-reveal.directive';

@Component({
  selector: 'app-cursos',
  imports: [ScrollRevealDirective],
  templateUrl: './cursos.html',
  styleUrl: './cursos.css',
})
export class Cursos {}
