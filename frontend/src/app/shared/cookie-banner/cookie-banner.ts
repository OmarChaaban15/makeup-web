import { Component, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-cookie-banner',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cookie-banner.html',
  styleUrl: './cookie-banner.css'
})
export class CookieBanner implements OnInit {
  private esNavegador = isPlatformBrowser(inject(PLATFORM_ID));

  isVisible = false;
  isHiding = false;
  showConfig = false;
  analyticsEnabled = false;
  marketingEnabled = false;

  ngOnInit() {
    // En el prerender no hay localStorage ni consentimiento que leer.
    if (!this.esNavegador) return;

    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      // Pequeño delay para que no aparezca de golpe al cargar
      setTimeout(() => { this.isVisible = true; }, 800);
    }
  }

  accept() {
    localStorage.setItem('cookie-consent', JSON.stringify({
      necessary: true,
      analytics: true,
      marketing: true,
      date: new Date().toISOString()
    }));
    this.hide();
  }

  rejectAll() {
    localStorage.setItem('cookie-consent', JSON.stringify({
      necessary: true,
      analytics: false,
      marketing: false,
      date: new Date().toISOString()
    }));
    this.hide();
  }

  configure() {
    this.showConfig = !this.showConfig;
  }

  saveConfig() {
    localStorage.setItem('cookie-consent', JSON.stringify({
      necessary: true,
      analytics: this.analyticsEnabled,
      marketing: this.marketingEnabled,
      date: new Date().toISOString()
    }));
    this.hide();
  }

  private hide() {
    this.isHiding = true;
    setTimeout(() => { this.isVisible = false; }, 400);
  }
}
