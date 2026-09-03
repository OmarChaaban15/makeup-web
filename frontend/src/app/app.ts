import { Component, OnInit, inject } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
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
export class App implements OnInit {
  private router = inject(Router);
  public translation = inject(TranslationService);

  ngOnInit(): void {
    // Garantiza que en cada cambio de página se suba siempre al inicio exacto (0, 0)
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      });
  }
}
