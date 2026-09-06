import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Footer } from './shared/footer/footer';
import { Navbar } from './shared/navbar/navbar';
import { CookieBanner } from './shared/cookie-banner/cookie-banner';
import { TranslationService } from './shared/translation.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, Navbar, Footer, CookieBanner],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  public translation = inject(TranslationService);

  // El scroll al cambiar de pagina lo gestiona el router con
  // withInMemoryScrolling (app.config.ts). Antes ademas se forzaba
  // window.scrollTo(0,0) en cada NavigationEnd, lo que anulaba la
  // restauracion de posicion al pulsar "atras" en el navegador.
}
