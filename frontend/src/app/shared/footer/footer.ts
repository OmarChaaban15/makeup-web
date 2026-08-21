import { Component, ElementRef, HostListener, PLATFORM_ID, Inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { ScrollRevealDirective } from '../scroll-reveal.directive';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, ScrollRevealDirective],
  templateUrl: './footer.html',
  styleUrl: './footer.css'
})
export class Footer {
  currentYear = new Date().getFullYear();
  private isBrowser: boolean;

  constructor(
    private elRef: ElementRef,
    @Inject(PLATFORM_ID) private platformId: object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  resetCookies() {
    localStorage.removeItem('cookie-consent');
    window.location.reload();
  }

  /** Magnetic button effect — buttons attract toward cursor */
  onMagneticMove(event: MouseEvent, btn: HTMLElement): void {
    if (!this.isBrowser || window.innerWidth < 768) return;
    const rect = btn.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    btn.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
  }

  onMagneticLeave(btn: HTMLElement): void {
    btn.style.transform = '';
  }
}