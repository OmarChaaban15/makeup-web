import { Component, HostListener, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { IdiomaRuta, RUTAS } from '../idioma';
import { NAVBAR } from '../textos';
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
  private idioma = inject(IdiomaRuta);

  /** Idioma de la pagina visible (por la URL). */
  readonly idiomaPagina = this.idioma.idioma;

  /** Idioma que se marca como activo: el de la pagina, o el del traductor en las paginas en español. */
  readonly idiomaActual = computed(() =>
    this.idiomaPagina() === 'es' ? this.translation.currentLang() : this.idiomaPagina()
  );

  readonly t = computed(() => NAVBAR[this.idiomaPagina()]);

  /** Enlaces del menu. Cursos y blog solo existen en español. */
  readonly r = computed(() => ({ ...RUTAS[this.idiomaPagina()], cursos: '/cursos', blog: '/blog' }));

  // Rutas con imagen a pantalla completa donde el navbar va transparente.
  private readonly rutasHero = new Set([
    '/inicio',
    ...Object.values(RUTAS).flatMap(rutas => [rutas.inicio, rutas.sobre, rutas.servicios])
  ]);

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
    this.langMenuOpen = false;

    // Si la pagina existe en ese idioma se navega a ella; solo el resto
    // (cursos, blog, privacidad...) pasa por el traductor de Google.
    const destino = this.idioma.equivalente(lang);

    if (destino) {
      this.closeMenu();
      this.router.navigateByUrl(destino);
      return;
    }

    this.translation.setLanguage(lang);
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
    this.auth.logout('/');
  }
}
