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

export const COOKIES: Record<Idioma, TextosCookies> = {
  es: {
    aviso: 'Esta web no usa cookies de análisis ni de publicidad. Solo guarda en tu navegador lo necesario para que funcione, como tu sesión o tu idioma.',
    mas: 'Política de cookies', entendido: 'Entendido', region: 'Aviso de cookies'
  },
  en: {
    aviso: 'This website does not use analytics or advertising cookies. It only stores what it needs to work in your browser, such as your session or language.',
    mas: 'Cookie policy (Spanish)', entendido: 'Got it', region: 'Cookie notice'
  },
  it: {
    aviso: 'Questo sito non usa cookie analitici né pubblicitari. Salva nel tuo browser solo ciò che serve per funzionare, come la sessione o la lingua.',
    mas: 'Cookie policy (in spagnolo)', entendido: 'Ho capito', region: 'Avviso sui cookie'
  },
  de: {
    aviso: 'Diese Website verwendet keine Analyse- oder Werbe-Cookies. Sie speichert in deinem Browser nur, was sie zum Funktionieren braucht, etwa deine Sitzung oder Sprache.',
    mas: 'Cookie-Richtlinie (auf Spanisch)', entendido: 'Verstanden', region: 'Cookie-Hinweis'
  }
};
