import { Routes } from '@angular/router';
import { Inicio } from './pages/inicio/inicio';
import { SobreMi } from './pages/sobre-mi/sobre-mi';
import { Servicios } from './pages/servicios/servicios';
import { Cursos } from './pages/cursos/cursos';
import { Contacto } from './pages/contacto/contacto';
import { ReservarCita } from './pages/reservar-cita/reservar-cita';
import { PoliticaPrivacidad } from './pages/politica-privacidad/politica-privacidad';
import { Login } from './pages/login/login';
import { Registro } from './pages/registro/registro';

export const routes: Routes = [
  { path: '', redirectTo: 'inicio', pathMatch: 'full' },
  { path: 'inicio', component: Inicio },
  { path: 'sobre-mi', component: SobreMi },
  { path: 'servicios', component: Servicios },
  { path: 'cursos', component: Cursos },
  { path: 'contacto', component: Contacto },
  { path: 'reservar-cita', component: ReservarCita },
  { path: 'politica-privacidad', component: PoliticaPrivacidad },
  { path: 'login', component: Login },
  { path: 'registro', component: Registro },
  { path: '**', redirectTo: 'inicio' }
];