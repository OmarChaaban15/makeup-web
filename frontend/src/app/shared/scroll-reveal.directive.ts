import { Directive, ElementRef, Input, OnInit, OnDestroy, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Directive({
  selector: '[scrollReveal], [appScrollReveal]',
  standalone: true
})
export class ScrollRevealDirective implements OnInit, OnDestroy {
  @Input('scrollReveal') direction: string = 'up';
  @Input('appScrollReveal') appDirection: string = '';
  @Input() scrollDelay: string = '0';

  private observer: IntersectionObserver | null = null;

  constructor(
    private el: ElementRef,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const element = this.el.nativeElement as HTMLElement;

    // El atributo data-scroll-reveal pone opacity:0 y solo la clase
    // "revealed" lo devuelve a la vista. Si no hay IntersectionObserver,
    // nadie añade esa clase y el contenido quedaría invisible para
    // siempre, así que sin él no se toca el elemento: se ve tal cual,
    // sin animación. Falla la animación, no el contenido.
    if (typeof IntersectionObserver === 'undefined') {
      return;
    }

    // Lo que ya se ve al cargar (la cabecera de la pagina) no se anima:
    // el HTML prerenderizado ya lo muestra, y ocultarlo para volver a
    // revelarlo lo haria parpadear y retrasaria el LCP hasta que arranque
    // JavaScript. Solo se anima lo que aparece al hacer scroll.
    const caja = element.getBoundingClientRect();
    if (caja.height > 0 && caja.top < window.innerHeight && caja.bottom > 0) {
      return;
    }

    const finalDirection = this.direction || this.appDirection || 'up';
    element.setAttribute('data-scroll-reveal', finalDirection);

    if (this.scrollDelay && this.scrollDelay !== '0') {
      element.setAttribute('data-scroll-delay', this.scrollDelay);
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            this.observer?.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    this.observer.observe(element);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
