import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ScrollRevealDirective } from '../../shared/scroll-reveal.directive';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-cursos',
  imports: [ScrollRevealDirective],
  templateUrl: './cursos.html',
  styleUrl: './cursos.css',
})
export class Cursos {
  private http = inject(HttpClient);
  private router = inject(Router);

  comprando = false;
  errorMsg = '';

  comprarMasterclass(): void {
    const token = localStorage.getItem('auth_token');

    if (!token) {
      // Si no está logueado, lo mandamos a login para que pueda comprar
      this.router.navigate(['/login'], { queryParams: { redirect: '/cursos' } });
      return;
    }

    this.comprando = true;
    this.errorMsg = '';

    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.post<{ pedido: any; checkout_url: string }>(
      `${environment.apiUrl}/pedidos`,
      { tutoriales: [2] }, // id del tutorial "Masterclass de Automaquillaje Online"
      { headers }
    ).subscribe({
      next: (respuesta) => {
        // Redirige al usuario a la pasarela de pago de Stripe
        window.location.href = respuesta.checkout_url;
      },
      error: () => {
        this.comprando = false;
        this.errorMsg = 'No se pudo iniciar el pago. Inténtalo de nuevo.';
      }
    });
  }
}