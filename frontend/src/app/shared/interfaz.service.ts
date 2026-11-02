import { Injectable, signal } from '@angular/core';

/**
 * Estado compartido entre las piezas fijas de la pantalla (menu movil, aviso
 * de cookies y barra de reserva), para que nunca se tapen entre si: la barra
 * se aparta mientras el aviso o el menu estan abiertos.
 */
@Injectable({ providedIn: 'root' })
export class InterfazService {
  readonly menuAbierto = signal(false);
  readonly avisoCookiesVisible = signal(false);
}
