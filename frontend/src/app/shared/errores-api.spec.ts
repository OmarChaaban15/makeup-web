import { HttpErrorResponse } from '@angular/common/http';
import { mensajeDeError } from './errores-api';

describe('mensajeDeError', () => {
  it('avisa de fallo de conexión cuando el status es 0', () => {
    // Regresion: la version anterior comprobaba !error.error antes que
    // status === 0, asi que este mensaje no llegaba a mostrarse.
    const error = new HttpErrorResponse({ status: 0, error: null });

    expect(mensajeDeError(error, 'fallback')).toContain('No se pudo conectar');
  });

  it('devuelve el primer error de validación de Laravel', () => {
    const error = new HttpErrorResponse({
      status: 422,
      error: { message: 'Datos inválidos', errors: { email: ['Ya existe una cuenta con este correo electrónico.'] } }
    });

    expect(mensajeDeError(error, 'fallback')).toBe('Ya existe una cuenta con este correo electrónico.');
  });

  it('usa message cuando no hay errores de validación', () => {
    const error = new HttpErrorResponse({
      status: 401,
      error: { message: 'El correo o la contraseña son incorrectos.' }
    });

    expect(mensajeDeError(error, 'fallback')).toBe('El correo o la contraseña son incorrectos.');
  });

  it('explica el 429 del rate limiting', () => {
    const error = new HttpErrorResponse({ status: 429, error: null });

    expect(mensajeDeError(error, 'fallback')).toContain('Demasiados intentos');
  });

  it('cae al mensaje por defecto si no reconoce la respuesta', () => {
    const error = new HttpErrorResponse({ status: 500, error: '<html>error</html>' });

    expect(mensajeDeError(error, 'fallback')).toBe('fallback');
  });
});
