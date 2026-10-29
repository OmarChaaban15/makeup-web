import { Routes } from '@angular/router';
import { Inicio } from './pages/inicio/inicio';
import { SobreMi } from './pages/sobre-mi/sobre-mi';
import { Servicios } from './pages/servicios/servicios';
import { Cursos } from './pages/cursos/cursos';
import { Oferta } from './pages/oferta/oferta';
import { Contacto } from './pages/contacto/contacto';
import { PoliticaPrivacidad } from './pages/politica-privacidad/politica-privacidad';
import { Login } from './pages/login/login';
import { Registro } from './pages/registro/registro';
import { RestablecerPassword } from './pages/restablecer-password/restablecer-password';
import { MisCursos } from './pages/mis-cursos/mis-cursos';
import { authGuard } from './guards/auth-guard';
import { PagoExitoso } from './pages/pago-exitoso/pago-exitoso';
import { PagoCancelado } from './pages/pago-cancelado/pago-cancelado';
import { NoEncontrada } from './pages/no-encontrada/no-encontrada';
import type { SeoRuta } from './shared/seo.service';

const NOINDEX: SeoRuta = { descripcion: '', noindex: true };

export const routes: Routes = [
  // La portada vive en "/". /inicio se conserva como redireccion para no
  // romper enlaces antiguos; Nginx la sirve con un 301.
  {
    path: '',
    pathMatch: 'full',
    component: Inicio,
    title: 'Makeup by Yona · Maquillaje profesional en Ibiza',
    data: {
      seo: {
        descripcion:
          'Maquilladora profesional en Ibiza. Maquillaje de novia, eventos, moda y editorial con acabados luminosos y de larga duración. Reserva tu cita.',
        schema: 'negocio'
      } satisfies SeoRuta
    }
  },
  { path: 'inicio', redirectTo: '', pathMatch: 'full' },
  {
    path: 'sobre-mi',
    component: SobreMi,
    title: 'Yonaida Belhuman, maquilladora en Ibiza · Makeup by Yona',
    data: {
      seo: {
        nombre: 'Sobre mí',
        descripcion:
          'Yonaida Belhuman, maquilladora profesional en Ibiza con más de cinco años de experiencia en bodas de destino, moda y producciones audiovisuales.'
      } satisfies SeoRuta
    }
  },
  {
    path: 'servicios',
    component: Servicios,
    title: 'Servicios de maquillaje en Ibiza · Makeup by Yona',
    data: {
      seo: {
        nombre: 'Servicios',
        descripcion:
          'Servicios de maquillaje en Ibiza: novias, eventos, moda y editorial, cine y rodajes. En estudio o a domicilio en hoteles, fincas y villas.',
        schema: 'servicios'
      } satisfies SeoRuta
    }
  },
  {
    path: 'cursos',
    component: Cursos,
    title: 'Cursos y masterclasses de maquillaje · Makeup by Yona',
    data: {
      seo: {
        nombre: 'Cursos',
        descripcion:
          'Cursos y masterclasses de maquillaje online de Yonaida Belhuman: clases en vídeo Full HD, paso a paso, para lograr acabados profesionales.'
      } satisfies SeoRuta
    }
  },

  // Landing de campaña (destino del anuncio de Instagram). sinLayout la
  // sirve sin navbar ni footer: es un embudo cerrado, sin enlaces que
  // saquen al visitante antes de comprar. Se indexa: tiene su propio
  // canonical, y su titulo y H1 son distintos de los de /cursos.
  {
    path: 'oferta',
    component: Oferta,
    data: {
      sinLayout: true,
      seo: {
        nombre: 'Masterclass de automaquillaje',
        descripcion:
          'Masterclass de automaquillaje online con precio de lanzamiento. Descubre qué colores y técnicas te favorecen, en vídeo paso a paso.'
      } satisfies SeoRuta
    },
    title: 'Masterclass de Automaquillaje · Precio de lanzamiento'
  },
  {
    path: 'contacto',
    component: Contacto,
    title: 'Reserva tu maquillaje en Ibiza · Makeup by Yona',
    data: {
      seo: {
        nombre: 'Contacto',
        descripcion:
          'Contacta con Makeup by Yona para reservar tu maquillaje en Ibiza: bodas, eventos y sesiones. Escríbeme por WhatsApp, email o formulario.'
      } satisfies SeoRuta
    }
  },
  { path: 'reservar-cita', redirectTo: 'contacto', pathMatch: 'full' },

  // Version en ingles (ver shared/idioma.ts). Cada pagina tiene su pareja
  // en español; el SeoService publica el hreflang entre ellas.
  {
    path: 'en',
    pathMatch: 'full',
    loadComponent: () => import('./pages/en/home/home').then(m => m.EnHome),
    title: 'Professional Makeup Artist in Ibiza · Makeup by Yona',
    data: {
      seo: {
        descripcion:
          'Professional makeup artist in Ibiza. Bridal, event, fashion and editorial makeup with luminous, long-lasting finishes. Book your appointment.'
      } satisfies SeoRuta
    }
  },
  {
    path: 'en/services',
    loadComponent: () => import('./pages/en/services/services').then(m => m.EnServices),
    title: 'Makeup Services in Ibiza · Makeup by Yona',
    data: {
      seo: {
        nombre: 'Services',
        descripcion:
          'Makeup services in Ibiza: brides, events, fashion and editorial, film and TV. At the studio or at your villa, hotel or finca.'
      } satisfies SeoRuta
    }
  },
  {
    path: 'en/about',
    loadComponent: () => import('./pages/en/about/about').then(m => m.EnAbout),
    title: 'Yonaida, Makeup Artist in Ibiza · Makeup by Yona',
    data: {
      seo: {
        nombre: 'About',
        descripcion:
          'Yonaida Belhuman, professional makeup artist in Ibiza with more than five years of experience in destination weddings, fashion and audiovisual productions.'
      } satisfies SeoRuta
    }
  },
  {
    path: 'en/contact',
    loadComponent: () => import('./pages/en/contact/contact').then(m => m.EnContact),
    title: 'Book Your Makeup in Ibiza · Makeup by Yona',
    data: {
      seo: {
        nombre: 'Contact',
        descripcion:
          'Contact Makeup by Yona to book your makeup in Ibiza: weddings, events and shoots. Message me on WhatsApp or by email.'
      } satisfies SeoRuta
    }
  },
  {
    path: 'politica-privacidad',
    component: PoliticaPrivacidad,
    title: 'Política de privacidad · Makeup by Yona',
    data: {
      seo: {
        nombre: 'Política de privacidad',
        descripcion: 'Política de privacidad de Makeup by Yona: qué datos se recogen y cómo se tratan.'
      } satisfies SeoRuta
    }
  },
  { path: 'mis-cursos', component: MisCursos, canActivate: [authGuard], title: 'Mis cursos · Makeup by Yona', data: { seo: NOINDEX } },
  { path: 'login', component: Login, title: 'Acceder · Makeup by Yona', data: { seo: NOINDEX } },
  { path: 'registro', component: Registro, title: 'Crear cuenta · Makeup by Yona', data: { seo: NOINDEX } },
  { path: 'restablecer-password', component: RestablecerPassword, title: 'Nueva contraseña · Makeup by Yona', data: { seo: NOINDEX } },
  { path: 'pago-exitoso', component: PagoExitoso, title: 'Pago completado · Makeup by Yona', data: { seo: NOINDEX } },
  { path: 'pago-cancelado', component: PagoCancelado, title: 'Pago cancelado · Makeup by Yona', data: { seo: NOINDEX } },
  { path: '**', component: NoEncontrada, title: 'Página no encontrada · Makeup by Yona', data: { seo: NOINDEX } }
];
