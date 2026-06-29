import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-cookie-banner',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cookie-banner.html',
  styleUrl: './cookie-banner.css'
})
export class CookieBanner implements OnInit {
  isVisible = false;
  isHiding = false;
  showConfig = false;
  analyticsEnabled = false;
  marketingEnabled = false;

  ngOnInit() {
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
