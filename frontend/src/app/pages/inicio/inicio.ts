import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-inicio',
  imports: [RouterLink],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css'
})
export class Inicio implements OnInit, OnDestroy {
  readonly slides = [
    { src: 'images/IMG_1.PNG', alt: 'Trabajo de maquillaje 1', pos: 'center center' },
    { src: 'images/IMG_2.PNG', alt: 'Trabajo de maquillaje 2', pos: 'center 35%' },
    { src: 'images/IMG_3.PNG', alt: 'Trabajo de maquillaje 3', pos: 'center 35%' },
    { src: 'images/IMG_4.PNG', alt: 'Trabajo de maquillaje 4', pos: 'center 40%' },
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
