import { Component, ElementRef, HostListener, ViewChild, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { IdiomaRuta, RUTAS } from '../idioma';
import { NAVBAR, enlaceWhatsapp } from '../textos';
import { InterfazService } from '../interfaz.service';
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
  private interfaz = inject(InterfazService);

  @ViewChild('botonMenu') botonMenu?: ElementRef<HTMLButtonElement>;

  /** Idioma de la pagina visible (por la URL). */
  readonly idiomaPagina = this.idioma.idioma;

  /** Idioma que se marca como activo: el de la pagina, o el del traductor en las paginas en español. */
  readonly idiomaActual = computed(() =>
    this.idiomaPagina() === 'es' ? this.translation.currentLang() : this.idiomaPagina()
  );

  readonly t = computed(() => NAVBAR[this.idiomaPagina()]);

  readonly whatsapp = computed(() => enlaceWhatsapp(this.idiomaPagina()));

  /** Enlaces del menu. Cursos y blog solo existen en español. */
  readonly r = computed(() => ({ ...RUTAS[this.idiomaPagina()], cursos: '/cursos', blog: '/blog' }));

  // Rutas con imagen a pantalla completa donde el navbar va transparente.
  private readonly rutasHero = new Set([
    '/inicio',
    ...Object.values(RUTAS).flatMap(rutas => [
      rutas.inicio, rutas.sobre, rutas.servicios,
      // Paginas de cada servicio: foto a sangre bajo la cabecera en el movil.
      rutas.novias, rutas.eventos, rutas.editorial, rutas.cine
    ])
  ]);

  constructor() {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(e => {
        const path = (e.urlAfterRedirects || e.url).split('?')[0];
        this.isHeroPage = this.rutasHero.has(path);
        // Al llegar a otra pagina el menu ya ha cumplido: se cierra.
        if (this.menuOpen) this.closeMenu();
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
      // Con el traductor de Google encendido (se eligio un idioma en el blog,
      // por ejemplo) hay que apagarlo: si no, la portada en español seguia
      // traducida y elegir "Español" no hacia nada.
      if (this.translation.quitarTraduccion(destino)) return;
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
    // Al abrir, el foco entra en el menu (primera opcion) para quien navega
    // con teclado o lector de pantalla; el panel pasa de inert a activo en
    // este mismo ciclo, por eso se espera al siguiente fotograma.
    if (this.menuOpen) {
      requestAnimationFrame(() =>
        document.querySelector<HTMLElement>('#menu-movil a, #menu-movil button')?.focus()
      );
    }
  }

  closeMenu() {
    this.menuOpen = false;
    this.updateBodyScroll();
  }

  /** Escape cierra el menu y devuelve el foco al boton que lo abrio. */
  @HostListener('document:keydown.escape')
  cerrarConEscape() {
    this.userMenuOpen = false;
    this.langMenuOpen = false;
    if (!this.menuOpen) return;
    this.closeMenu();
    this.botonMenu?.nativeElement.focus();
  }

  private updateBodyScroll() {
    if (typeof document !== 'undefined') {
      document.body.classList.toggle('overflow-hidden', this.menuOpen);
    }
    this.interfaz.menuAbierto.set(this.menuOpen);
  }

  toggleUserMenu(event: Event) {
    event.stopPropagation();
    this.userMenuOpen = !this.userMenuOpen;
  }

  openLogin() {
    this.router.navigate(['/login']);
    // closeMenu y no menuOpen = false: tambien hay que devolver el scroll
    // de la pagina, que el menu abierto habia bloqueado.
    this.closeMenu();
  }

  logout() {
    this.userMenuOpen = false;
    this.closeMenu();
    this.auth.logout('/');
  }
}
