import { Routes } from '@angular/router';
import { Inicio } from './pages/inicio/inicio';
import { SobreMi } from './pages/sobre-mi/sobre-mi';
import { Servicios } from './pages/servicios/servicios';
import { Cursos } from './pages/cursos/cursos';
import { Contacto } from './pages/contacto/contacto';
import { PoliticaPrivacidad } from './pages/politica-privacidad/politica-privacidad';
import { Login } from './pages/login/login';
import { Registro } from './pages/registro/registro';
import { RestablecerPassword } from './pages/restablecer-password/restablecer-password';
import { MisCursos } from './pages/mis-cursos/mis-cursos';
import { authGuard } from './guards/auth-guard';
import { PagoExitoso } from './pages/pago-exitoso/pago-exitoso';
import { PagoCancelado } from './pages/pago-cancelado/pago-cancelado';

export const routes: Routes = [
  { path: '', redirectTo: 'inicio', pathMatch: 'full' },
  { path: 'inicio', component: Inicio, title: 'Makeup by Yona · Maquillaje profesional en Ibiza' },
  { path: 'sobre-mi', component: SobreMi, title: 'Sobre mí · Makeup by Yona' },
  { path: 'servicios', component: Servicios, title: 'Servicios · Makeup by Yona' },
  { path: 'cursos', component: Cursos, title: 'Cursos y masterclasses · Makeup by Yona' },
  { path: 'contacto', component: Contacto, title: 'Contacto y reservas · Makeup by Yona' },
  { path: 'reservar-cita', redirectTo: 'contacto', pathMatch: 'full' },
  { path: 'politica-privacidad', component: PoliticaPrivacidad, title: 'Política de privacidad · Makeup by Yona' },
  { path: 'mis-cursos', component: MisCursos, canActivate: [authGuard], title: 'Mis cursos · Makeup by Yona' },
  { path: 'login', component: Login, title: 'Acceder · Makeup by Yona' },
  { path: 'registro', component: Registro, title: 'Crear cuenta · Makeup by Yona' },
  { path: 'restablecer-password', component: RestablecerPassword, title: 'Nueva contraseña · Makeup by Yona' },
  { path: 'pago-exitoso', component: PagoExitoso, title: 'Pago completado · Makeup by Yona' },
  { path: 'pago-cancelado', component: PagoCancelado, title: 'Pago cancelado · Makeup by Yona' },
  { path: '**', redirectTo: 'inicio' }
];
