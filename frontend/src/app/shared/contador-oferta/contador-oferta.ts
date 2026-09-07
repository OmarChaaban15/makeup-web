import { Component, DestroyRef, EventEmitter, Input, OnInit, Output, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { interval } from 'rxjs';

/**
 * Cuenta atrás para el fin de una oferta.
 *
 * Recibe del servidor los SEGUNDOS que quedan, no una fecha límite: así el
 * contador no depende de que el reloj del navegador esté en hora, que es
 * algo que el visitante puede cambiar y de lo que depende un precio.
 *
 * Cuando llega a cero emite (terminado) para que la página vuelva a pedir
 * el curso al servidor y muestre el precio nuevo.
 */
@Component({
  selector: 'app-contador-oferta',
  standalone: true,
  templateUrl: './contador-oferta.html',
  styleUrl: './contador-oferta.css'
})
export class ContadorOferta implements OnInit {
  /** Segundos restantes según el servidor (campo oferta_segundos_restantes). */
  @Input({ required: true }) segundos!: number;

  /** Estilo: 'claro' sobre fondos oscuros, 'oscuro' sobre fondos claros. */
  @Input() tema: 'claro' | 'oscuro' = 'oscuro';

  /** Se emite una sola vez, al llegar a cero. */
  @Output() terminado = new EventEmitter<void>();

  private destroyRef = inject(DestroyRef);
  private restantes = signal(0);
  private yaAvisado = false;

  readonly haTerminado = computed(() => this.restantes() <= 0);

  readonly horas = computed(() => Math.floor(this.restantes() / 3600));
  readonly minutos = computed(() => Math.floor((this.restantes() % 3600) / 60));
  readonly segundosVisibles = computed(() => this.restantes() % 60);

  ngOnInit(): void {
    this.restantes.set(Math.max(0, Math.floor(this.segundos ?? 0)));

    interval(1000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.restantes.update(valor => (valor > 0 ? valor - 1 : 0));

        if (this.restantes() === 0 && !this.yaAvisado) {
          this.yaAvisado = true;
          this.terminado.emit();
        }
      });
  }

  /** Dos dígitos, para que el marcador no baile de ancho al contar. */
  dosDigitos(valor: number): string {
    return valor.toString().padStart(2, '0');
  }
}
