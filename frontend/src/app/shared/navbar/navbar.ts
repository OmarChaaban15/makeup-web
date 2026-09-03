import { Component, HostListener } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { filter } from 'rxjs/operators';

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
  isHeroPage = true; // transparent navbar on hero pages

  constructor(private router: Router, private http: HttpClient) {
    // Detect route changes to toggle transparent navbar
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(e => {
        const path = e.urlAfterRedirects || e.url;
        this.isHeroPage = path === '/' || path === '/inicio';
      });
  }

  get isLoggedIn(): boolean {
    return !!localStorage.getItem('auth_token');
  }

  get userName(): string {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user?.name || 'Mi cuenta';
    } catch {
      return 'Mi cuenta';
    }
  }

  /** Returns true when navbar should be transparent (hero page, not scrolled) */
  get isTransparent(): boolean {
    return this.isHeroPage && !this.isScrolled && !this.menuOpen;
  }

  @HostListener('window:scroll')
  onScroll() {
    this.isScrolled = window.scrollY > 20;
  }

  // Cierra el desplegable de usuario al hacer clic fuera de él
  @HostListener('document:click')
  closeUserMenu() {
    this.userMenuOpen = false;
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
      if (this.menuOpen) {
        document.body.classList.add('overflow-hidden');
      } else {
        document.body.classList.remove('overflow-hidden');
      }
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
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    // Invalida el token en el servidor; pase lo que pase limpiamos la sesión local.
    this.http.post(`${environment.apiUrl}/auth/logout`, {}, { headers }).subscribe({
      next: () => this.finishLogout(),
      error: () => this.finishLogout()
    });
  }

  private finishLogout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    this.userMenuOpen = false;
    this.closeMenu();
    this.router.navigate(['/inicio']);
  }
}
