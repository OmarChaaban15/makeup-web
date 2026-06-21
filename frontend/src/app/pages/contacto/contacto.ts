import { afterNextRender, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import * as L from 'leaflet';

@Component({
  selector: 'app-contacto',
  imports: [RouterLink],
  templateUrl: './contacto.html',
  styleUrl: './contacto.css',
})
export class Contacto implements OnDestroy {
  @ViewChild('mapContainer') private mapContainer?: ElementRef<HTMLDivElement>;

  private map?: L.Map;
  private readonly studioLocation: L.LatLngExpression = [38.9067, 1.4206];

  constructor() {
    afterNextRender(() => this.initMap());
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }

  private initMap(): void {
    if (!this.mapContainer || this.map) {
      return;
    }

    this.map = L.map(this.mapContainer.nativeElement, {
      center: this.studioLocation,
      zoom: 13,
      scrollWheelZoom: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.map);

    L.marker(this.studioLocation)
      .addTo(this.map)
      .bindPopup('Makeup By Yona · Ibiza, España')
      .openPopup();
  }
}
