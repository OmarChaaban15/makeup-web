import { Component, ElementRef, OnDestroy, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ScrollRevealDirective } from '../../shared/scroll-reveal.directive';
import { environment } from '../../../environments/environment';
import { mensajeDeError } from '../../shared/errores-api';
import type * as L from 'leaflet';

@Component({
  selector: 'app-contacto',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ScrollRevealDirective],
  templateUrl: './contacto.html',
  styleUrl: './contacto.css',
})
export class Contacto implements OnDestroy {
  @ViewChild('mapContainer') private mapContainer?: ElementRef<HTMLDivElement>;

  private map?: L.Map;
  private destruido = false;
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

  // Signals y no propiedades sueltas: la app funciona sin Zone.js, asi que un
  // cambio hecho al volver la peticion HTTP no repintaba la vista (el boton
  // se quedaba en "Enviando mensaje..." aunque el mensaje hubiera llegado).
  readonly enviando = signal(false);
  readonly enviado = signal(false);
  readonly error = signal('');
  readonly emailCopiado = signal(false);

  /**
   * Error de cada campo, junto al propio campo (aria-describedby). Se
   * comprueba al salir del campo, no mientras se escribe: avisar de un
   * correo "invalido" a mitad de teclearlo solo molesta.
   */
  readonly errores = signal<Partial<Record<'nombre' | 'email' | 'mensaje', string>>>({});

  /** Los botones de cada servicio (/servicios) llegan con ?servicio=... */
  private readonly servicioPorClave: Record<string, string> = {
    novia: 'Maquillaje de Novia',
    eventos: 'Maquillaje Social & Fiesta',
    editorial: 'Editorial / Fotografía',
    cine: 'Audiovisual / Cine',
    formacion: 'Masterclass / Formación',
  };

  @ViewChild('avisoEnviado') private avisoEnviado?: ElementRef<HTMLDivElement>;

  /** El mapa no se carga hasta que la visita lo pide (ver contacto.html). */
  mapaVisible = signal(false);

  constructor(private http: HttpClient) {
    const clave = inject(ActivatedRoute).snapshot.queryParamMap.get('servicio');
    if (clave && this.servicioPorClave[clave]) {
      this.formData.servicio = this.servicioPorClave[clave];
    }
  }

  /** Comprueba un campo y devuelve su mensaje de error (o '' si esta bien). */
  validarCampo(campo: 'nombre' | 'email' | 'mensaje'): string {
    const valor = this.formData[campo].trim();
    let mensaje = '';

    if (campo === 'nombre' && !valor) {
      mensaje = 'Escribe tu nombre para saber a quién responder.';
    } else if (campo === 'email') {
      // ngModel sin validadores: el formato del correo se comprueba aqui.
      if (!valor) mensaje = 'Necesito tu correo para enviarte la respuesta.';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(valor)) mensaje = 'Revisa el correo: falta algo (por ejemplo, la @ o el dominio).';
    } else if (campo === 'mensaje' && !valor) {
      mensaje = 'Cuéntame en una línea qué necesitas.';
    }

    this.errores.update(errores => ({ ...errores, [campo]: mensaje || undefined }));
    return mensaje;
  }

  /** Al corregir un campo con error, el aviso desaparece en cuanto vuelve a ser valido. */
  revalidar(campo: 'nombre' | 'email' | 'mensaje'): void {
    if (this.errores()[campo]) this.validarCampo(campo);
  }

  mostrarMapa(): void {
    this.mapaVisible.set(true);
    this.initMap();
  }

  ngOnDestroy(): void {
    this.destruido = true;
    this.map?.remove();
  }

  seleccionarServicio(servicio: string): void {
    this.formData.servicio = servicio;
  }

  onSubmit(): void {
    // Se comprueban los tres campos obligatorios y el foco va al primero
    // que falle, para que quien usa teclado o lector de pantalla llegue a el.
    const campos = ['nombre', 'email', 'mensaje'] as const;
    const fallidos = campos.filter(campo => this.validarCampo(campo));
    if (fallidos.length) {
      this.error.set('');
      document.getElementById(`contacto-${fallidos[0]}`)?.focus();
      return;
    }

    this.error.set('');
    this.enviado.set(false);
    this.enviando.set(true);

    // La URL sale de environment: estaba escrita a mano apuntando a
    // localhost:8000, lo que rompía el formulario en producción.
    this.http.post(`${environment.apiUrl}/contacto`, this.formData).subscribe({
      next: () => {
        this.enviando.set(false);
        this.enviado.set(true);
        this.formData = {
          nombre: '',
          email: '',
          telefono: '',
          servicio: 'Maquillaje de Novia',
          fecha_evento: '',
          mensaje: '',
        };
        this.errores.set({});
        // El aviso de exito recibe el foco: se lee en voz alta y, en el
        // movil, la pantalla se desplaza hasta el.
        setTimeout(() => this.avisoEnviado?.nativeElement.focus());
      },
      error: (err) => {
        this.enviando.set(false);
        // Si algo falla, ofrecemos la vía directa de correo o WhatsApp.
        this.error.set(mensajeDeError(
          err,
          'Hubo un inconveniente al enviar el mensaje. También puedes escribirme directamente por email o WhatsApp.'
        ));
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
    navigator.clipboard.writeText('info@makeupbyyona.es').then(() => {
      this.emailCopiado.set(true);
      setTimeout(() => this.emailCopiado.set(false), 2500);
    });
  }

  private async initMap(): Promise<void> {
    if (!this.mapContainer || this.map) {
      return;
    }

    // Leaflet usa `window` nada mas cargarse. Se importa aqui, ya en el
    // navegador, para que el prerender no falle al evaluar este modulo.
    const modulo = await import('leaflet');
    const L = ('default' in modulo ? modulo.default : modulo) as typeof import('leaflet');

    if (this.destruido || !this.mapContainer || this.map) {
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
