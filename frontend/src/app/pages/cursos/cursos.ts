import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ScrollRevealDirective } from '../../shared/scroll-reveal.directive';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-cursos',
  standalone: true,
  imports: [CommonModule, ScrollRevealDirective],
  templateUrl: './cursos.html',
  styleUrl: './cursos.css',
})
export class Cursos {
  private http = inject(HttpClient);
  private router = inject(Router);

  comprando = false;
  errorMsg = '';
  notificado = false;
  emailAviso = '';

  abrirAvisoProximamente(): void {
    const email = prompt('Introduce tu email para recibir aviso preferente del lanzamiento:');
    if (email && email.includes('@')) {
      this.notificado = true;
      alert('¡Gracias! Te avisaremos antes del lanzamiento con un descuento exclusivo.');
    }
  }

  comprarMasterclass(): void {
    const token = localStorage.getItem('auth_token');

    if (!token) {
      this.router.navigate(['/login'], { queryParams: { redirect: '/cursos' } });
      return;
    }

    this.comprando = true;
    this.errorMsg = '';

    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.post<{ pedido: any; checkout_url: string }>(
      `${environment.apiUrl}/pedidos`,
      { tutoriales: [2] },
      { headers }
    ).subscribe({
      next: (respuesta) => {
        window.location.href = respuesta.checkout_url;
      },
      error: () => {
        this.comprando = false;
        this.errorMsg = 'No se pudo iniciar el pago seguro con Stripe. Por favor, inténtalo de nuevo o contáctame por WhatsApp.';
      }
    });
  }
}