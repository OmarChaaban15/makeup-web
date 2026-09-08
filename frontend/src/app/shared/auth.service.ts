import { Injectable, computed, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Usuario {
  id: number;
  name: string;
  email: string;
}

interface RespuestaAuth {
  message: string;
  user: Usuario;
  token: string;
}

const CLAVE_TOKEN = 'auth_token';
const CLAVE_USUARIO = 'user';

/**
 * Estado de sesion centralizado.
 *
 * Antes cada componente leia localStorage por su cuenta (incluso desde
 * getters de plantilla, que se ejecutan en cada ciclo de deteccion de
 * cambios). Aqui se lee una sola vez y se expone como signals.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private esNavegador = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly _token = signal<string | null>(this.leer(CLAVE_TOKEN));
  private readonly _usuario = signal<Usuario | null>(this.leerUsuario());

  readonly token = this._token.asReadonly();
  readonly usuario = this._usuario.asReadonly();
  readonly estaAutenticado = computed(() => this._token() !== null);
  readonly nombre = computed(() => this._usuario()?.name ?? 'Mi cuenta');

  login(email: string, password: string): Observable<RespuestaAuth> {
    return this.http
      .post<RespuestaAuth>(`${environment.apiUrl}/auth/login`, { email, password })
      .pipe(tap(respuesta => this.guardarSesion(respuesta)));
  }

  registro(datos: Record<string, unknown>): Observable<RespuestaAuth> {
    return this.http
      .post<RespuestaAuth>(`${environment.apiUrl}/auth/register`, datos)
      .pipe(tap(respuesta => this.guardarSesion(respuesta)));
  }

  solicitarRecuperacion(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${environment.apiUrl}/auth/forgot-password`, { email });
  }

  restablecerPassword(datos: {
    token: string;
    email: string;
    password: string;
    password_confirmation: string;
  }): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${environment.apiUrl}/auth/reset-password`, datos);
  }

  /**
   * Cierra sesion. Se limpia el estado local pase lo que pase con la
   * peticion: si el token ya habia caducado el servidor devuelve 401 y
   * dejar al usuario "dentro" seria peor que ignorar el error.
   */
  logout(redirigirA: string | null = '/inicio'): void {
    const finalizar = () => {
      this.limpiarSesion();
      if (redirigirA) {
        this.router.navigate([redirigirA]);
      }
    };

    if (!this._token()) {
      finalizar();
      return;
    }

    this.http.post(`${environment.apiUrl}/auth/logout`, {}).subscribe({
      next: finalizar,
      error: finalizar
    });
  }

  /** Invalida la sesion local sin llamar al servidor (lo usa el interceptor al recibir un 401). */
  limpiarSesion(): void {
    this._token.set(null);
    this._usuario.set(null);

    if (this.esNavegador) {
      localStorage.removeItem(CLAVE_TOKEN);
      localStorage.removeItem(CLAVE_USUARIO);
    }
  }

  private guardarSesion(respuesta: RespuestaAuth): void {
    this._token.set(respuesta.token);
    this._usuario.set(respuesta.user);

    if (this.esNavegador) {
      localStorage.setItem(CLAVE_TOKEN, respuesta.token);
      localStorage.setItem(CLAVE_USUARIO, JSON.stringify(respuesta.user));
    }
  }

  private leer(clave: string): string | null {
    if (!this.esNavegador) return null;
    try {
      return localStorage.getItem(clave);
    } catch {
      return null;
    }
  }

  private leerUsuario(): Usuario | null {
    const bruto = this.leer(CLAVE_USUARIO);
    if (!bruto) return null;
    try {
      return JSON.parse(bruto) as Usuario;
    } catch {
      return null;
    }
  }
}
