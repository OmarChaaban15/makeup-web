import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-pago-exitoso',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './pago-exitoso.html',
  styleUrl: './pago-exitoso.css'
})
export class PagoExitoso implements OnInit {
  private route = inject(ActivatedRoute);
  pedidoId: string | null = null;

  ngOnInit(): void {
    this.pedidoId = this.route.snapshot.queryParamMap.get('pedido');
  }
}