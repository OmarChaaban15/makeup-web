import { Component, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LoginModal } from '../login-modal/login-modal';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, LoginModal],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {
  isScrolled = false;
  menuOpen = false;
  loginOpen = false;

  @HostListener('window:scroll')
  onScroll() {
    this.isScrolled = window.scrollY > 20;
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu() {
    this.menuOpen = false;
  }

  openLogin() {
    this.loginOpen = true;
    this.menuOpen = false;
  }
}
