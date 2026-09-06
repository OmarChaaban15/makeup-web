import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

/**
 * Adjunta el Bearer token a las peticiones a nuestra API y centraliza la
 * reaccion al 401.
 *
 * Antes cada componente construia el header a mano y nadie manejaba el
 * token caducado: el usuario se quedaba en una pagina rota en lugar de
 * volver al login.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Solo tocamos las llamadas a nuestra propia API: nunca enviamos el
  // token a un tercero (mapas, fuentes, etc.).
  const esNuestraApi =
    req.url.startsWith(environment.apiUrl) || req.url.startsWith('/api/');

  const token = auth.token();

  const peticion =
    esNuestraApi && token
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

  return next(peticion).pipe(
    catchError((error: HttpErrorResponse) => {
      // /auth/login devuelve 401 con credenciales incorrectas y /auth/logout
      // puede devolverlo con un token ya caducado. Ninguno de los dos es una
      // sesion que expire a mitad de uso, y ambos se gestionan por su cuenta.
      const esFlujoDeSesion =
        req.url.includes('/auth/login') || req.url.includes('/auth/logout');

      if (error.status === 401 && esNuestraApi && !esFlujoDeSesion && auth.token()) {
        auth.limpiarSesion();
        router.navigate(['/login'], {
          queryParams: { motivo: 'sesion-caducada', redirect: router.url }
        });
      }

      return throwError(() => error);
    })
  );
};
