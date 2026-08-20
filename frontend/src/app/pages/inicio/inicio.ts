import { Component, signal, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-inicio',
  imports: [RouterLink],
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

  /** Carga y reproduce un video concreto del array */
  private playHeroVideo(index: number): void {
    const video = this.heroVideoRef?.nativeElement;
    if (!video) return;

    // Siempre silenciar (el atributo HTML no siempre aplica la propiedad)
    video.muted = true;
    video.volume = 0;
    video.src = this.heroVideos[index];
    video.load();
    video.play().catch(() => {
      // Si autoplay sigue bloqueado, esperamos interacción del usuario
    });
  }

  /** Se llama desde el template cuando termina el video actual */
  onHeroVideoEnded(): void {
    this.heroVideoIndex = (this.heroVideoIndex + 1) % this.heroVideos.length;
    this.playHeroVideo(this.heroVideoIndex);
  }

  ngAfterViewInit(): void {
    this.playHeroVideo(0);
  }

  // ── Slideshow existente (sección de trabajos) ─────────────────
  readonly slides = [
    { src: 'images/IMG_1.PNG', alt: 'Trabajo de maquillaje 1', pos: 'center center' },
    { src: 'images/IMG_2.PNG', alt: 'Trabajo de maquillaje 2', pos: 'center 35%' },
    { src: 'images/IMG_3.PNG', alt: 'Trabajo de maquillaje 3', pos: 'center 35%' },
    { src: 'images/IMG_4.PNG', alt: 'Trabajo de maquillaje 4', pos: 'center 40%' },
    { src: 'images/IMG_5.JPEG', alt: 'Trabajo de maquillaje 5', pos: 'center center' },
  ];

  currentIndex = signal(0);
  private autoPlayTimer: ReturnType<typeof setInterval> | null = null;

  ngOnInit() {
    this.startAutoPlay();
  }

  ngOnDestroy() {
    this.stopAutoPlay();
  }

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

  private startAutoPlay() {
    this.autoPlayTimer = setInterval(() => this.next(), 4500);
  }

  private stopAutoPlay() {
    if (this.autoPlayTimer) {
      clearInterval(this.autoPlayTimer);
      this.autoPlayTimer = null;
    }
  }

  private restartAutoPlay() {
    this.stopAutoPlay();
    this.startAutoPlay();
  }
}
