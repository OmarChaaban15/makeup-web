import { Component, HostListener } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

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

  constructor(private router: Router, private http: HttpClient) {}

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
  }

  closeMenu() {
    this.menuOpen = false;
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
    this.menuOpen = false;
    this.router.navigate(['/inicio']);
  }
}
