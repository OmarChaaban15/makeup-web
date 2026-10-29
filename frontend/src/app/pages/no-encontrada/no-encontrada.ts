import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * Destino de cualquier URL que no exista. Nginx la sirve con estado 404
 * (ver deploy/nginx): antes la ruta comodin redirigia a la portada y un
 * buscador veia un 200 por cada direccion inventada.
 */
@Component({
  selector: 'app-no-encontrada',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './no-encontrada.html'
})
export class NoEncontrada {}
