import { Component, signal, PLATFORM_ID, Inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { ScrollRevealDirective } from '../../shared/scroll-reveal.directive';

@Component({
  selector: 'app-sobre-mi',
  imports: [RouterLink, ScrollRevealDirective],
  templateUrl: './sobre-mi.html',
  styleUrl: './sobre-mi.css',
})
export class SobreMi {
  // ── Animated Counters ──
  counterYears = signal(0);
  counterNovias = signal(0);
  counterPersonal = signal(0);
  private countersAnimated = false;
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);
    if (this.isBrowser) {
      setTimeout(() => this.animateCounters(), 600);
    }
  }

  animateCounters(): void {
    if (this.countersAnimated || !this.isBrowser) return;
    this.countersAnimated = true;
    this.animateNumber(0, 5, 1400, v => this.counterYears.set(v));
    this.animateNumber(0, 150, 1800, v => this.counterNovias.set(v));
    this.animateNumber(0, 100, 1600, v => this.counterPersonal.set(v));
  }

  private animateNumber(start: number, end: number, duration: number, setter: (v: number) => void): void {
    const startTime = performance.now();
    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setter(Math.round(start + (end - start) * eased));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
}
