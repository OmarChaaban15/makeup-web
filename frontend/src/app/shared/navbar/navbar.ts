import { Component, HostListener, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { IdiomaRuta } from '../idioma';
import { TranslationService } from '../translation.service';
import { AuthService } from '../auth.service';

const TEXTOS = {
  es: {
    inicio: 'Inicio', sobre: 'Sobre mí', servicios: 'Servicios', cursos: 'Cursos', contacto: 'Contacto',
    blog: 'Blog', misCursos: 'Mis Cursos', contactar: 'Contactar ahora', sesion: 'Sesión iniciada', cerrar: 'Cerrar sesión',
    iniciar: 'Iniciar sesión', menuUsuario: 'Menú de usuario', abrirMenu: 'Abrir menú'
  },
  en: {
    inicio: 'Home', sobre: 'About', servicios: 'Services', cursos: 'Courses (ES)', contacto: 'Contact',
    blog: 'Blog (ES)', misCursos: 'My Courses', contactar: 'Get in touch', sesion: 'Signed in', cerrar: 'Log out',
    iniciar: 'Log in', menuUsuario: 'User menu', abrirMenu: 'Open menu'
  }
};

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

  readonly ingles = this.idioma.ingles;

  /** Idioma que se marca como activo: el de la pagina, si es una de /en. */
  readonly idiomaActual = computed(() => (this.ingles() ? 'en' : this.translation.currentLang()));

  readonly t = computed(() => (this.ingles() ? TEXTOS.en : TEXTOS.es));

  /** Enlaces del menu. Cursos solo existe en español. */
  readonly r = computed(() =>
    this.ingles()
      ? { inicio: '/en', sobre: '/en/about', servicios: '/en/services', cursos: '/cursos', blog: '/blog', contacto: '/en/contact' }
      : { inicio: '/', sobre: '/sobre-mi', servicios: '/servicios', cursos: '/cursos', blog: '/blog', contacto: '/contacto' }
  );

  // Rutas con imagen a pantalla completa donde el navbar va transparente.
  private readonly rutasHero = new Set(['/', '/inicio', '/sobre-mi', '/servicios', '/en', '/en/about', '/en/services']);

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

    // Español e ingles son paginas distintas cuando existe la pareja; solo
    // el resto (cursos, privacidad...) y los demas idiomas pasan por el
    // traductor de Google.
    if (lang === 'es' || lang === 'en') {
      const destino = this.idioma.equivalente(lang);

      if (destino) {
        this.closeMenu();
        this.router.navigateByUrl(destino);
        return;
      }
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
