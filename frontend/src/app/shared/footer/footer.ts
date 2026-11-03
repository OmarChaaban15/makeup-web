import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IdiomaRuta, RUTAS } from '../idioma';
import { ACCION, PIE, enlaceWhatsapp } from '../textos';

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.css'
})
export class Footer {
  currentYear = new Date().getFullYear();

  private idioma = inject(IdiomaRuta);

  readonly t = computed(() => PIE[this.idioma.idioma()]);

  readonly inicioRuta = computed(() => RUTAS[this.idioma.idioma()].inicio);

  readonly contactoRuta = computed(() => RUTAS[this.idioma.idioma()].contacto);

  readonly a = computed(() => ACCION[this.idioma.idioma()]);

  readonly whatsapp = computed(() => enlaceWhatsapp(this.idioma.idioma()));
}