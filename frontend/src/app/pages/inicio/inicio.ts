import {
  Component, signal, OnInit, OnDestroy, ElementRef,
  ViewChild, AfterViewInit, HostListener, PLATFORM_ID, Inject
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { ScrollRevealDirective } from '../../shared/scroll-reveal.directive';

interface Particle {
  x: number; y: number; size: number; speedX: number; speedY: number; opacity: number;
}

@Component({
  selector: 'app-inicio',
  imports: [RouterLink, ScrollRevealDirective],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css'
})
export class Inicio implements OnInit, OnDestroy, AfterViewInit {

  // ── Hero videos ──────────────────────────────────────────────
  private readonly heroVideos = [
    'videos/masterclass_dia_final.mp4',
    'videos/masterclass_noche_final.mp4',
  ];
  private heroVideoIndex = 0;

  @ViewChild('heroVideo') heroVideoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('particleCanvas') particleCanvasRef!: ElementRef<HTMLCanvasElement>;

  // ── Hero text animation ──
  heroTextVisible = signal(false);

  // ── Mouse parallax ──
  mouseX = signal(0);
  mouseY = signal(0);

  // ── Particle system ──
  private particles: Particle[] = [];
  private animFrameId: number | null = null;
  private canvasCtx: CanvasRenderingContext2D | null = null;

  // ── Counters ──
  counterYears = signal(0);
  counterClients = signal(0);
  counterPersonal = signal(0);
  private countersAnimated = false;

  // ── Slideshow (works section) ─────────────────
  readonly slides = [
    { src: 'images/IMG_1.PNG', alt: 'Trabajo de maquillaje 1', pos: 'center center' },
    { src: 'images/IMG_2.PNG', alt: 'Trabajo de maquillaje 2', pos: 'center 35%' },
    { src: 'images/IMG_3.PNG', alt: 'Trabajo de maquillaje 3', pos: 'center 35%' },
    { src: 'images/IMG_4.PNG', alt: 'Trabajo de maquillaje 4', pos: 'center 40%' },
    { src: 'images/IMG_5.JPEG', alt: 'Trabajo de maquillaje 5', pos: 'center center' },
  ];

  currentIndex = signal(0);
  private autoPlayTimer: ReturnType<typeof setInterval> | null = null;
  readonly autoPlayDuration = 5000;
  progressWidth = signal(0);
  private progressAnimFrame: number | null = null;
  private progressStart: number = 0;

  // ── Lightbox ──
  lightboxOpen = signal(false);
  lightboxSrc = signal('');
  lightboxAlt = signal('');

  // ── Ken Burns ──
  readonly kenBurnsVariants = [
    'ken-burns-1', 'ken-burns-2', 'ken-burns-3', 'ken-burns-4'
  ];

  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  // ── Lifecycle ──

  ngOnInit() {
    this.startAutoPlay();
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;

    this.playHeroVideo(0);
    this.initParticles();

    // Trigger hero text animation after a brief delay
    setTimeout(() => this.heroTextVisible.set(true), 300);
  }

  ngOnDestroy() {
    this.stopAutoPlay();
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    if (this.progressAnimFrame) cancelAnimationFrame(this.progressAnimFrame);
  }

  // ── Hero Video ──

  private playHeroVideo(index: number): void {
    const video = this.heroVideoRef?.nativeElement;
    if (!video) return;
    video.muted = true;
    video.volume = 0;
    video.src = this.heroVideos[index];
    video.load();
    video.play().catch(() => {});
  }

  onHeroVideoEnded(): void {
    this.heroVideoIndex = (this.heroVideoIndex + 1) % this.heroVideos.length;
    this.playHeroVideo(this.heroVideoIndex);
  }

  // ── Mouse Parallax ──

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(e: MouseEvent) {
    if (!this.isBrowser) return;
    const x = (e.clientX / window.innerWidth - 0.5) * 20;
    const y = (e.clientY / window.innerHeight - 0.5) * 20;
    this.mouseX.set(x);
    this.mouseY.set(y);
  }

  // ── Particle System ──

  private initParticles(): void {
    const canvas = this.particleCanvasRef?.nativeElement;
    if (!canvas) return;

    this.canvasCtx = canvas.getContext('2d');
    this.resizeCanvas(canvas);

    // Create particles
    const count = Math.min(35, Math.floor(window.innerWidth / 40));
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2.5 + 0.5,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.3 - 0.15,
        opacity: Math.random() * 0.5 + 0.1,
      });
    }

    this.animateParticles();
  }

  @HostListener('window:resize')
  onResize() {
    const canvas = this.particleCanvasRef?.nativeElement;
    if (canvas) this.resizeCanvas(canvas);
  }

  private resizeCanvas(canvas: HTMLCanvasElement): void {
    const hero = canvas.parentElement;
    if (hero) {
      canvas.width = hero.offsetWidth;
      canvas.height = hero.offsetHeight;
    }
  }

  private animateParticles(): void {
    const ctx = this.canvasCtx;
    const canvas = this.particleCanvasRef?.nativeElement;
    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const p of this.particles) {
      p.x += p.speedX;
      p.y += p.speedY;

      // Wrap around
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(232, 201, 154, ${p.opacity})`;
      ctx.fill();
    }

    this.animFrameId = requestAnimationFrame(() => this.animateParticles());
  }

  // ── Animated Counters ──

  animateCounters(): void {
    if (this.countersAnimated || !this.isBrowser) return;
    this.countersAnimated = true;

    this.animateNumber(0, 5, 1500, v => this.counterYears.set(v));
    this.animateNumber(0, 500, 2000, v => this.counterClients.set(v));
    this.animateNumber(0, 100, 1800, v => this.counterPersonal.set(v));
  }

  private animateNumber(start: number, end: number, duration: number, setter: (v: number) => void): void {
    const startTime = performance.now();
    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setter(Math.round(start + (end - start) * eased));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  // ── Slideshow / Carousel ──

  prev() {
    this.currentIndex.update(i => (i - 1 + this.slides.length) % this.slides.length);
    this.restartAutoPlay();
  }

  next() {
    this.currentIndex.update(i => (i + 1) % this.slides.length);
    this.restartAutoPlay();
  }

  goTo(index: number) {
    this.currentIndex.set(index);
    this.restartAutoPlay();
  }

  getKenBurnsClass(index: number): string {
    return this.kenBurnsVariants[index % this.kenBurnsVariants.length];
  }

  private startAutoPlay() {
    this.progressStart = Date.now();
    this.animateProgress();
    this.autoPlayTimer = setInterval(() => {
      this.next();
    }, this.autoPlayDuration);
  }

  private stopAutoPlay() {
    if (this.autoPlayTimer) {
      clearInterval(this.autoPlayTimer);
      this.autoPlayTimer = null;
    }
    if (this.progressAnimFrame) {
      cancelAnimationFrame(this.progressAnimFrame);
      this.progressAnimFrame = null;
    }
  }

  private restartAutoPlay() {
    this.stopAutoPlay();
    this.startAutoPlay();
  }

  private animateProgress(): void {
    if (!this.isBrowser) return;
    const elapsed = Date.now() - this.progressStart;
    const pct = Math.min((elapsed / this.autoPlayDuration) * 100, 100);
    this.progressWidth.set(pct);
    if (pct < 100) {
      this.progressAnimFrame = requestAnimationFrame(() => this.animateProgress());
    }
  }

  // ── Lightbox ──

  openLightbox(slide: { src: string; alt: string }): void {
    this.lightboxSrc.set(slide.src);
    this.lightboxAlt.set(slide.alt);
    this.lightboxOpen.set(true);
  }

  closeLightbox(): void {
    this.lightboxOpen.set(false);
  }

  @HostListener('document:keydown.escape')
  onEscKey() {
    if (this.lightboxOpen()) this.closeLightbox();
  }

  // ── 3D Tilt for service cards ──

  onCardMouseMove(event: MouseEvent, card: HTMLElement): void {
    if (!this.isBrowser || window.innerWidth < 768) return;
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -6;
    const rotateY = ((x - centerX) / centerX) * 6;

    card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;

    // Shine effect
    const shine = card.querySelector('.card-shine') as HTMLElement;
    if (shine) {
      shine.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(232,201,154,0.15) 0%, transparent 60%)`;
      shine.style.opacity = '1';
    }
  }

  onCardMouseLeave(card: HTMLElement): void {
    card.style.transform = '';
    const shine = card.querySelector('.card-shine') as HTMLElement;
    if (shine) shine.style.opacity = '0';
  }
}
