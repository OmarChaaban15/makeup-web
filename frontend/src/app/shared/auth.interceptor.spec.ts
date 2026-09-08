import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let auth: AuthService;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting()
      ]
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    auth = TestBed.inject(AuthService);
  });

  afterEach(() => httpMock.verify());

  function iniciarSesion(token = 'token-de-prueba') {
    auth.login('ana@example.com', 'secreto123').subscribe();
    httpMock.expectOne(`${environment.apiUrl}/auth/login`).flush({
      message: 'ok',
      token,
      user: { id: 1, name: 'Ana', email: 'ana@example.com' }
    });
  }

  it('añade el Bearer token a las llamadas a nuestra API', () => {
    iniciarSesion();

    http.get(`${environment.apiUrl}/mis-cursos`).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/mis-cursos`);
    expect(req.request.headers.get('Authorization')).toBe('Bearer token-de-prueba');
    req.flush([]);
  });

  it('no envía el token a dominios de terceros', () => {
    iniciarSesion();

    http.get('https://tile.openstreetmap.org/1/1/1.png').subscribe();

    const req = httpMock.expectOne('https://tile.openstreetmap.org/1/1/1.png');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('limpia la sesión y redirige al login cuando la API responde 401', () => {
    iniciarSesion();
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigate');

    http.get(`${environment.apiUrl}/mis-cursos`).subscribe({ error: () => {} });
    httpMock
      .expectOne(`${environment.apiUrl}/mis-cursos`)
      .flush({ message: 'Unauthenticated.' }, { status: 401, statusText: 'Unauthorized' });

    expect(auth.estaAutenticado()).toBe(false);
    expect(navigate).toHaveBeenCalledWith(
      ['/login'],
      expect.objectContaining({ queryParams: expect.objectContaining({ motivo: 'sesion-caducada' }) })
    );
  });

  it('un 401 de credenciales incorrectas no expulsa al usuario', () => {
    iniciarSesion();

    http.post(`${environment.apiUrl}/auth/login`, {}).subscribe({ error: () => {} });
    httpMock
      .expectOne(`${environment.apiUrl}/auth/login`)
      .flush({ message: 'Credenciales incorrectas' }, { status: 401, statusText: 'Unauthorized' });

    expect(auth.estaAutenticado()).toBe(true);
  });
});
