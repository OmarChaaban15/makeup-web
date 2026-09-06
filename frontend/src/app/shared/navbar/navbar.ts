import { Component, HostListener, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { TranslationService } from '../translation.service';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {
  isScrolled = false;
  menuOpen = false;
  userMenuOpen = false;
  langMenuOpen = false;
  isHeroPage = true; // transparent navbar on hero pages

  public translation = inject(TranslationService);
  private auth = inject(AuthService);
  private router = inject(Router);

  // Rutas con imagen a pantalla completa donde el navbar va transparente.
  private readonly rutasHero = new Set(['/', '/inicio', '/sobre-mi', '/servicios']);

  constructor() {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(e => {
        const path = (e.urlAfterRedirects || e.url).split('?')[0];
        this.isHeroPage = this.rutasHero.has(path);
      });
  }

  toggleLangMenu(event?: Event): void {
    if (event) event.stopPropagation();
    this.langMenuOpen = !this.langMenuOpen;
    if (this.langMenuOpen) this.userMenuOpen = false;
  }

  selectLanguage(lang: 'es' | 'en' | 'it' | 'de', event?: Event): void {
    if (event) event.stopPropagation();
    this.translation.setLanguage(lang);
    this.langMenuOpen = false;
  }

  // Leen signals del AuthService en lugar de tocar localStorage (y hacer
  // JSON.parse) en cada ciclo de deteccion de cambios.
  get isLoggedIn(): boolean {
    return this.auth.estaAutenticado();
  }

  get userName(): string {
    return this.auth.nombre();
  }

  /** Returns true when navbar should be transparent (hero page, not scrolled) */
  get isTransparent(): boolean {
    return this.isHeroPage && !this.isScrolled && !this.menuOpen;
  }

  @HostListener('window:scroll')
  onScroll() {
    this.isScrolled = window.scrollY > 20;
  }

  // Cierra los desplegables al hacer clic fuera
  @HostListener('document:click')
  closeMenus() {
    this.userMenuOpen = false;
    this.langMenuOpen = false;
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
    this.updateBodyScroll();
  }

  closeMenu() {
    this.menuOpen = false;
    this.updateBodyScroll();
  }

  private updateBodyScroll() {
    if (typeof document !== 'undefined') {
      document.body.classList.toggle('overflow-hidden', this.menuOpen);
    }
  }

  toggleUserMenu(event: Event) {
    event.stopPropagation();
    this.userMenuOpen = !this.userMenuOpen;
  }

  openLogin() {
    this.router.navigate(['/login']);
    this.menuOpen = false;
  }

  logout() {
    this.userMenuOpen = false;
    this.closeMenu();
    this.auth.logout('/inicio');
  }
}
