import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { RUTAS } from '../../../shared/idioma';
import { CONTENIDO, IdiomaNativo } from '../contenido';

/** Sobre mi en ingles, italiano o aleman. El idioma lo da data.idioma de la ruta. */
@Component({
  selector: 'app-multi-sobre-mi',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './sobre-mi.html'
})
export class MultiSobreMi {
  private readonly idioma = inject(ActivatedRoute).snapshot.data['idioma'] as IdiomaNativo;

  readonly t = CONTENIDO[this.idioma].sobre;
  readonly r = RUTAS[this.idioma];
}
