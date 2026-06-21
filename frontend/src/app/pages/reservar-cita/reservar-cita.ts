import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-reservar-cita',
  imports: [CommonModule, FormsModule],
  templateUrl: './reservar-cita.html',
  styleUrl: './reservar-cita.css',
})
export class ReservarCita implements OnInit {
  servicios: any[] = [];
  
  formData = {
    fecha: null as number | null,
    nombre_cliente: '',
    servicio_id: '',
    telefono_cliente: '',
    email_cliente: '',
  };

  mesActual: number = new Date().getMonth();
  anioActual: number = new Date().getFullYear();
  mesNombre: string = '';
  
  diasMes: number[] = [];
  diasSemanaOffset: number[] = [];

  nombresMeses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  enviando = false;
  exito = false;
  error = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.generarCalendario();
    this.http.get<any[]>('http://localhost:8000/api/servicios').subscribe({
      next: (data) => {
        this.servicios = data;
        if (data.length > 0) {
          this.formData.servicio_id = data[0].id.toString();
        }
      },
      error: (err) => console.error('Error cargando servicios', err)
    });
  }

  generarCalendario() {
    this.mesNombre = this.nombresMeses[this.mesActual];
    const diasEnElMes = new Date(this.anioActual, this.mesActual + 1, 0).getDate();
    this.diasMes = Array.from({length: diasEnElMes}, (_, i) => i + 1);
    
    const primerDia = new Date(this.anioActual, this.mesActual, 1);
    const offset = (primerDia.getDay() + 6) % 7; // Monday = 0
    this.diasSemanaOffset = Array.from({length: offset}, () => 0);
    
    // Reset selection when changing month
    this.formData.fecha = null;
  }

  mesAnterior() {
    this.mesActual--;
    if (this.mesActual < 0) {
      this.mesActual = 11;
      this.anioActual--;
    }
    this.generarCalendario();
  }

  mesSiguiente() {
    this.mesActual++;
    if (this.mesActual > 11) {
      this.mesActual = 0;
      this.anioActual++;
    }
    this.generarCalendario();
  }

  seleccionarFecha(dia: number) {
    this.formData.fecha = dia;
  }

  onSubmit() {
    if (!this.formData.fecha) {
      this.error = 'Por favor, selecciona una fecha en el calendario.';
      return;
    }
    
    if (!this.formData.nombre_cliente || !this.formData.email_cliente || !this.formData.servicio_id) {
      this.error = 'Por favor, rellena todos los campos obligatorios (Nombre, Email y Servicio).';
      return;
    }

    this.error = '';
    this.enviando = true;

    const day = this.formData.fecha.toString().padStart(2, '0');
    const month = (this.mesActual + 1).toString().padStart(2, '0');
    const fecha_hora = `${this.anioActual}-${month}-${day} 10:00:00`;

    const payload = {
      servicio_id: parseInt(this.formData.servicio_id),
      fecha_hora: fecha_hora,
      nombre_cliente: this.formData.nombre_cliente,
      email_cliente: this.formData.email_cliente,
      telefono_cliente: this.formData.telefono_cliente,
      notas: 'Reserva desde la web',
    };

    this.http.post('http://localhost:8000/api/citas', payload).subscribe({
      next: () => {
        this.enviando = false;
        this.exito = true;
        this.formData = {
          fecha: null,
          nombre_cliente: '',
          servicio_id: this.servicios.length > 0 ? this.servicios[0].id.toString() : '',
          telefono_cliente: '',
          email_cliente: '',
        };
      },
      error: (err) => {
        this.enviando = false;
        this.error = 'Ocurrió un error al reservar la cita. Inténtalo de nuevo.';
        console.error(err);
      }
    });
  }
}
