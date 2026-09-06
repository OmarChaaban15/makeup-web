import { HttpErrorResponse } from '@angular/common/http';

/**
 * Traduce un error de HttpClient al mensaje que se le enseña a la persona.
 *
 * Login y registro tenian dos versiones distintas de esta funcion, y la de
 * login comprobaba `!error.error` antes que `status === 0`, con lo que el
 * aviso de "no se pudo conectar" no llegaba a mostrarse nunca.
 */
export function mensajeDeError(error: unknown, porDefecto: string): string {
  if (!(error instanceof HttpErrorResponse)) {
    return porDefecto;
  }

  // status 0 = la peticion no llego a salir (red caida, API apagada, CORS).
  if (error.status === 0) {
    return 'No se pudo conectar con el servidor. Inténtalo de nuevo más tarde.';
  }

  if (error.status === 429) {
    return 'Demasiados intentos seguidos. Espera un minuto y vuelve a probar.';
  }

  const cuerpo = error.error;

  if (cuerpo && typeof cuerpo === 'object') {
    // Errores de validación de Laravel: { errors: { campo: [mensaje] } }
    const errores = (cuerpo as { errors?: Record<string, string[]> }).errors;
    if (errores) {
      const primeraClave = Object.keys(errores)[0];
      const primerError = primeraClave ? errores[primeraClave] : undefined;
      if (Array.isArray(primerError) && primerError.length) {
        return primerError[0];
      }
    }

    const mensaje = (cuerpo as { message?: string; mensaje?: string });
    if (mensaje.message) return mensaje.message;
    if (mensaje.mensaje) return mensaje.mensaje;
  }

  return porDefecto;
}
