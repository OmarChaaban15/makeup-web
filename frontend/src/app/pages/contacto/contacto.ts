import { afterNextRender, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ScrollRevealDirective } from '../../shared/scroll-reveal.directive';
import { environment } from '../../../environments/environment';
import { mensajeDeError } from '../../shared/errores-api';
import * as L from 'leaflet';

@Component({
  selector: 'app-contacto',
  standalone: true,
  imports: [CommonModule, FormsModule, ScrollRevealDirective],
  templateUrl: './contacto.html',
  styleUrl: './contacto.css',
})
export class Contacto implements OnDestroy {
  @ViewChild('mapContainer') private mapContainer?: ElementRef<HTMLDivElement>;

  private map?: L.Map;
  private readonly studioLocation: L.LatLngExpression = [38.9067, 1.4206];

  formData = {
    nombre: '',
    email: '',
    telefono: '',
    servicio: 'Maquillaje de Novia',
    fecha_evento: '',
    mensaje: '',
  };

  serviciosOpciones = [
    'Maquillaje de Novia',
    'Maquillaje Social & Fiesta',
    'Editorial / Fotografía',
    'Audiovisual / Cine',
    'Masterclass / Formación',
    'Otro servicio / Consulta'
  ];

  enviando = false;
  enviado = false;
  error = '';
  emailCopiado = false;

  constructor(private http: HttpClient) {
    afterNextRender(() => this.initMap());
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }

  seleccionarServicio(servicio: string): void {
    this.formData.servicio = servicio;
  }

  onSubmit(): void {
    if (!this.formData.nombre || !this.formData.email || !this.formData.mensaje) {
      this.error = 'Por favor, introduce al menos tu nombre, correo electrónico y tu mensaje.';
      return;
    }

    // El formulario usa ngModel sin validadores, así que el formato del
    // correo hay que comprobarlo aquí: sin esto la respuesta nunca llegaría.
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(this.formData.email.trim())) {
      this.error = 'Revisa tu correo electrónico: no parece una dirección válida.';
      return;
    }

    this.error = '';
    this.enviando = true;

    // La URL sale de environment: estaba escrita a mano apuntando a
    // localhost:8000, lo que rompía el formulario en producción.
    this.http.post(`${environment.apiUrl}/contacto`, this.formData).subscribe({
      next: () => {
        this.enviando = false;
        this.enviado = true;
        this.formData = {
          nombre: '',
          email: '',
          telefono: '',
          servicio: 'Maquillaje de Novia',
          fecha_evento: '',
          mensaje: '',
        };
      },
      error: (err) => {
        this.enviando = false;
        // Si algo falla, ofrecemos la vía directa de correo o WhatsApp.
        this.error = mensajeDeError(
          err,
          'Hubo un inconveniente al enviar el mensaje. También puedes escribirme directamente por email o WhatsApp.'
        );
      }
    });
  }

  enviarPorWhatsApp(): void {
    const nombre = this.formData.nombre ? encodeURIComponent(this.formData.nombre) : 'Hola';
    const servicio = encodeURIComponent(this.formData.servicio);
    const fecha = this.formData.fecha_evento ? encodeURIComponent(this.formData.fecha_evento) : 'a convenir';
    const mensaje = this.formData.mensaje ? encodeURIComponent(this.formData.mensaje) : '';

    const texto = `Hola%20Yonaida!%20Mi%20nombre%20es%20${nombre}.%0A%0AEstoy%20interesada/o%20en%20el%20servicio:%20*${servicio}*%0AFecha%20aproximada:%20${fecha}${mensaje ? '%0A%0A' + mensaje : ''}`;
    
    window.open(`https://wa.me/34658728433?text=${texto}`, '_blank');
  }

  copiarEmail(): void {
    navigator.clipboard.writeText('info@makeupbyyona.com').then(() => {
      this.emailCopiado = true;
      setTimeout(() => this.emailCopiado = false, 2500);
    });
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
      .bindPopup('<b>Makeup By Yona</b><br>Atelier & Citas · Ibiza, España')
      .openPopup();
  }
}
