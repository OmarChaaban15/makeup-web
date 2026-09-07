import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
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
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  /**
   * Las páginas marcadas con data.sinLayout se muestran sin navbar ni
   * footer. Es el caso de la landing de campaña: quien llega de un anuncio
   * no debe tener enlaces que lo saquen del embudo de compra.
   */
  sinLayout = signal(false);

  // El scroll al cambiar de página lo gestiona el router con
  // withInMemoryScrolling (app.config.ts). No hay que forzar
  // window.scrollTo aquí: anularía la restauración al pulsar "atrás".
  constructor() {
    this.router.events
      .pipe(filter(evento => evento instanceof NavigationEnd))
      .subscribe(() => this.sinLayout.set(this.rutaSinLayout()));
  }

  private rutaSinLayout(): boolean {
    let ruta = this.route.snapshot.firstChild;

    while (ruta?.firstChild) {
      ruta = ruta.firstChild;
    }

    return ruta?.data?.['sinLayout'] === true;
  }
}
