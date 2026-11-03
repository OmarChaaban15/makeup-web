import type { Idioma } from './idioma';

/**
 * Textos fijos de la barra de navegacion, el pie y el banner de cookies en
 * cada idioma. El resto de la web (paginas en ingles, italiano y aleman) vive
 * en pages/multi/contenido.ts.
 */
export interface TextosNavbar {
  inicio: string;
  sobre: string;
  servicios: string;
  cursos: string;
  blog: string;
  contacto: string;
  misCursos: string;
  contactar: string;
  sesion: string;
  cerrar: string;
  iniciar: string;
  menuUsuario: string;
  abrirMenu: string;
  saltar: string;
}

export const NAVBAR: Record<Idioma, TextosNavbar> = {
  es: {
    inicio: 'Inicio', sobre: 'Sobre mí', servicios: 'Servicios', cursos: 'Cursos', blog: 'Blog', contacto: 'Contacto',
    misCursos: 'Mis Cursos', contactar: 'Contactar ahora', sesion: 'Sesión iniciada', cerrar: 'Cerrar sesión',
    iniciar: 'Iniciar sesión', menuUsuario: 'Menú de usuario', abrirMenu: 'Abrir menú',
    saltar: 'Saltar al contenido'
  },
  en: {
    inicio: 'Home', sobre: 'About', servicios: 'Services', cursos: 'Courses (ES)', blog: 'Blog (ES)', contacto: 'Contact',
    misCursos: 'My Courses', contactar: 'Get in touch', sesion: 'Signed in', cerrar: 'Log out',
    iniciar: 'Log in', menuUsuario: 'User menu', abrirMenu: 'Open menu',
    saltar: 'Skip to content'
  },
  it: {
    inicio: 'Home', sobre: 'Chi sono', servicios: 'Servizi', cursos: 'Corsi (ES)', blog: 'Blog (ES)', contacto: 'Contatti',
    misCursos: 'I miei corsi', contactar: 'Contattami', sesion: 'Accesso effettuato', cerrar: 'Esci',
    iniciar: 'Accedi', menuUsuario: 'Menu utente', abrirMenu: 'Apri il menu',
    saltar: 'Vai al contenuto'
  },
  de: {
    inicio: 'Start', sobre: 'Über mich', servicios: 'Leistungen', cursos: 'Kurse (ES)', blog: 'Blog (ES)', contacto: 'Kontakt',
    misCursos: 'Meine Kurse', contactar: 'Kontakt aufnehmen', sesion: 'Angemeldet', cerrar: 'Abmelden',
    iniciar: 'Anmelden', menuUsuario: 'Benutzermenü', abrirMenu: 'Menü öffnen',
    saltar: 'Zum Inhalt springen'
  }
};

export interface TextosPie {
  lema: string;
  lugar: string;
  seguir: string;
  igPro: string;
  igPers: string;
  derechos: string;
  privacidad: string;
  avisoLegal: string;
  condiciones: string;
  cookies: string;
}

export const PIE: Record<Idioma, TextosPie> = {
  es: {
    lema: 'Estudio Profesional de Maquillaje y Estilismo', lugar: 'Ibiza, España', seguir: 'Sígueme en',
    igPro: 'Maquillaje profesional', igPers: 'Perfil personal', derechos: 'Todos los derechos reservados.',
    privacidad: 'Política de privacidad', avisoLegal: 'Aviso legal', condiciones: 'Condiciones de venta',
    cookies: 'Política de cookies'
  },
  en: {
    lema: 'Professional Makeup and Styling Studio', lugar: 'Ibiza, Spain', seguir: 'Follow me on',
    igPro: 'Professional makeup', igPers: 'Personal profile', derechos: 'All rights reserved.',
    privacidad: 'Privacy policy (Spanish)', avisoLegal: 'Legal notice (Spanish)',
    condiciones: 'Terms of sale (Spanish)', cookies: 'Cookie policy (Spanish)'
  },
  it: {
    lema: 'Studio professionale di trucco e styling', lugar: 'Ibiza, Spagna', seguir: 'Seguimi su',
    igPro: 'Trucco professionale', igPers: 'Profilo personale', derechos: 'Tutti i diritti riservati.',
    privacidad: 'Informativa sulla privacy (in spagnolo)', avisoLegal: 'Note legali (in spagnolo)',
    condiciones: 'Condizioni di vendita (in spagnolo)', cookies: 'Cookie policy (in spagnolo)'
  },
  de: {
    lema: 'Professionelles Make-up- und Styling-Studio', lugar: 'Ibiza, Spanien', seguir: 'Folge mir auf',
    igPro: 'Professionelles Make-up', igPers: 'Persönliches Profil', derechos: 'Alle Rechte vorbehalten.',
    privacidad: 'Datenschutzerklärung (auf Spanisch)', avisoLegal: 'Impressum (auf Spanisch)',
    condiciones: 'Verkaufsbedingungen (auf Spanisch)', cookies: 'Cookie-Richtlinie (auf Spanisch)'
  }
};

export interface TextosCookies {
  aviso: string;
  mas: string;
  entendido: string;
  /** Nombre accesible de la region del aviso. */
  region: string;
}

// El aviso es informativo (ver cookie-banner.ts): basta con decir que no hay
// cookies de analisis ni publicidad y enlazar la politica. Corto a proposito,
// para que en un movil ocupe una franja y no tape el contenido.
export const COOKIES: Record<Idioma, TextosCookies> = {
  es: {
    aviso: 'Sin cookies de análisis ni de publicidad: solo lo necesario para que la web funcione.',
    mas: 'Política de cookies', entendido: 'Entendido', region: 'Aviso de cookies'
  },
  en: {
    aviso: 'No analytics or advertising cookies: only what the site needs to work.',
    mas: 'Cookie policy (Spanish)', entendido: 'Got it', region: 'Cookie notice'
  },
  it: {
    aviso: 'Nessun cookie analitico o pubblicitario: solo ciò che serve al sito per funzionare.',
    mas: 'Cookie policy (in spagnolo)', entendido: 'Ho capito', region: 'Avviso sui cookie'
  },
  de: {
    aviso: 'Keine Analyse- oder Werbe-Cookies: nur das, was die Website zum Funktionieren braucht.',
    mas: 'Cookie-Richtlinie (auf Spanisch)', entendido: 'Verstanden', region: 'Cookie-Hinweis'
  }
};

export interface TextosAccion {
  /** Boton principal de la barra fija del movil y del cierre del pie. */
  cita: string;
  whatsapp: string;
  /** Mensaje que llega ya escrito al abrir WhatsApp. */
  mensajeWhatsapp: string;
  /** Nombre accesible de la barra fija. */
  region: string;
  /** Frase de cierre del pie, encima de los botones. */
  cierre: string;
}

export const ACCION: Record<Idioma, TextosAccion> = {
  es: {
    cita: 'Solicitar cita', whatsapp: 'WhatsApp', region: 'Reservar',
    mensajeWhatsapp: 'Hola Yonaida, me gustaría información sobre tus servicios de maquillaje',
    cierre: 'Cuéntame tu fecha y te respondo con disponibilidad en 24-48 horas.'
  },
  en: {
    cita: 'Book an appointment', whatsapp: 'WhatsApp', region: 'Book',
    mensajeWhatsapp: 'Hello Yonaida, I would like to ask about your makeup services',
    cierre: 'Tell me your date and I will reply with availability within 24-48 hours.'
  },
  it: {
    cita: 'Richiedi un appuntamento', whatsapp: 'WhatsApp', region: 'Prenota',
    mensajeWhatsapp: 'Ciao Yonaida, vorrei informazioni sui tuoi servizi di trucco',
    cierre: 'Dimmi la tua data e ti rispondo con la disponibilità entro 24-48 ore.'
  },
  de: {
    cita: 'Termin anfragen', whatsapp: 'WhatsApp', region: 'Buchen',
    mensajeWhatsapp: 'Hallo Yonaida, ich möchte mich über deine Make-up-Leistungen informieren',
    cierre: 'Nenne mir dein Datum, ich antworte innerhalb von 24-48 Stunden mit meiner Verfügbarkeit.'
  }
};

/** Enlace a WhatsApp con el mensaje del idioma ya escrito. */
export function enlaceWhatsapp(idioma: Idioma): string {
  return `https://wa.me/34658728433?text=${encodeURIComponent(ACCION[idioma].mensajeWhatsapp)}`;
}
