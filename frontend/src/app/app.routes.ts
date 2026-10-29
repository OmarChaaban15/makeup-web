import { Route, Routes } from '@angular/router';
import { Idioma, Pagina, RUTAS } from './shared/idioma';
import type { IdiomaNativo } from './pages/multi/contenido';
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
import { articuloResolver, seoResolver, tituloResolver } from './blog/blog-rutas';
import type { SeoRuta } from './shared/seo.service';

const NOINDEX: SeoRuta = { descripcion: '', noindex: true };

/** Carga de la plantilla de cada pagina; la misma sirve para los tres idiomas. */
const PLANTILLAS: Record<Pagina, () => Promise<unknown>> = {
  inicio: () => import('./pages/multi/inicio/inicio').then(m => m.MultiInicio),
  servicios: () => import('./pages/multi/servicios/servicios').then(m => m.MultiServicios),
  sobre: () => import('./pages/multi/sobre-mi/sobre-mi').then(m => m.MultiSobreMi),
  contacto: () => import('./pages/multi/contacto/contacto').then(m => m.MultiContacto)
};

interface MetaPagina {
  title: string;
  descripcion: string;
  /** Nombre para las migas; la portada no lleva. */
  nombre?: string;
}

const META: Record<IdiomaNativo, Record<Pagina, MetaPagina>> = {
  en: {
    inicio: {
      title: 'Professional Makeup Artist in Ibiza · Makeup by Yona',
      descripcion: 'Professional makeup artist in Ibiza. Bridal, event, fashion and editorial makeup with luminous, long-lasting finishes. Book your appointment.'
    },
    servicios: {
      title: 'Makeup Services in Ibiza · Makeup by Yona', nombre: 'Services',
      descripcion: 'Makeup services in Ibiza: brides, events, fashion and editorial, film and TV. At the studio or at your villa, hotel or finca.'
    },
    sobre: {
      title: 'Yonaida, Makeup Artist in Ibiza · Makeup by Yona', nombre: 'About',
      descripcion: 'Yonaida Belhuman, professional makeup artist in Ibiza with more than five years of experience in destination weddings, fashion and audiovisual productions.'
    },
    contacto: {
      title: 'Book Your Makeup in Ibiza · Makeup by Yona', nombre: 'Contact',
      descripcion: 'Contact Makeup by Yona to book your makeup in Ibiza: weddings, events and shoots. Message me on WhatsApp or by email.'
    }
  },
  it: {
    inicio: {
      title: 'Truccatrice professionista a Ibiza · Makeup by Yona',
      descripcion: 'Truccatrice professionista a Ibiza. Trucco da sposa, per eventi, moda ed editoriale con finish luminosi e duraturi. Richiedi un appuntamento.'
    },
    servicios: {
      title: 'Servizi di trucco a Ibiza · Makeup by Yona', nombre: 'Servizi',
      descripcion: 'Servizi di trucco a Ibiza: spose, eventi, moda ed editoriale, cinema e TV. In studio o nella tua villa, hotel o finca.'
    },
    sobre: {
      title: 'Yonaida, truccatrice a Ibiza · Makeup by Yona', nombre: 'Chi sono',
      descripcion: 'Yonaida Belhuman, truccatrice professionista a Ibiza con oltre cinque anni di esperienza in matrimoni di destinazione, moda e produzioni audiovisive.'
    },
    contacto: {
      title: 'Prenota il tuo trucco a Ibiza · Makeup by Yona', nombre: 'Contatti',
      descripcion: 'Contatta Makeup by Yona per prenotare il tuo trucco a Ibiza: matrimoni, eventi e servizi fotografici. Scrivimi su WhatsApp o via email.'
    }
  },
  de: {
    inicio: {
      title: 'Professionelle Visagistin auf Ibiza · Makeup by Yona',
      descripcion: 'Professionelle Visagistin auf Ibiza. Braut-, Event-, Mode- und Editorial-Make-up mit leuchtenden, langanhaltenden Ergebnissen. Jetzt Termin anfragen.'
    },
    servicios: {
      title: 'Make-up-Leistungen auf Ibiza · Makeup by Yona', nombre: 'Leistungen',
      descripcion: 'Make-up-Leistungen auf Ibiza: Bräute, Events, Mode und Editorial, Film und TV. Im Studio oder in deiner Villa, deinem Hotel oder deiner Finca.'
    },
    sobre: {
      title: 'Yonaida, Visagistin auf Ibiza · Makeup by Yona', nombre: 'Über mich',
      descripcion: 'Yonaida Belhuman, professionelle Visagistin auf Ibiza mit mehr als fünf Jahren Erfahrung bei Destination Weddings, Mode und audiovisuellen Produktionen.'
    },
    contacto: {
      title: 'Make-up auf Ibiza buchen · Makeup by Yona', nombre: 'Kontakt',
      descripcion: 'Kontaktiere Makeup by Yona, um dein Make-up auf Ibiza zu buchen: Hochzeiten, Events und Shootings. Schreib mir per WhatsApp oder E-Mail.'
    }
  }
};

const RUTAS_MULTI: Route[] = (Object.keys(META) as IdiomaNativo[]).flatMap(idioma =>
  (Object.keys(META[idioma]) as Pagina[]).map((pagina): Route => ({
    path: RUTAS[idioma as Idioma][pagina].slice(1),
    pathMatch: pagina === 'inicio' ? 'full' : 'prefix',
    loadComponent: PLANTILLAS[pagina] as Route['loadComponent'],
    title: META[idioma][pagina].title,
    data: {
      idioma,
      seo: { nombre: META[idioma][pagina].nombre, descripcion: META[idioma][pagina].descripcion } satisfies SeoRuta
    }
  }))
);

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

  // Blog: los articulos estan en blog/articulos.json. El titulo y los
  // metadatos de cada uno los calculan los resolvers; el articulo en ingles
  // cuelga de /en para que navbar y pie salgan en ingles.
  {
    path: 'blog',
    pathMatch: 'full',
    loadComponent: () => import('./pages/blog/blog').then(m => m.Blog),
    title: 'Blog de maquillaje en Ibiza · Makeup by Yona',
    data: {
      seo: {
        nombre: 'Blog',
        descripcion:
          'Guías de maquillaje de novia, invitadas y eventos, cuidado de la piel y automaquillaje, por una maquilladora profesional en Ibiza.'
      } satisfies SeoRuta
    }
  },
  {
    path: 'blog/:slug',
    loadComponent: () => import('./pages/blog-articulo/blog-articulo').then(m => m.BlogArticulo),
    title: tituloResolver('es'),
    resolve: { articulo: articuloResolver('es'), seo: seoResolver('es') }
  },
  {
    path: 'en/blog/:slug',
    loadComponent: () => import('./pages/blog-articulo/blog-articulo').then(m => m.BlogArticulo),
    title: tituloResolver('en'),
    resolve: { articulo: articuloResolver('en'), seo: seoResolver('en') }
  },

  // Paginas en ingles, italiano y aleman (ver shared/idioma.ts y pages/multi).
  // Cada una tiene su pareja en español; el SeoService publica el hreflang.
  ...RUTAS_MULTI,

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
