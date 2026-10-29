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
}

export const NAVBAR: Record<Idioma, TextosNavbar> = {
  es: {
    inicio: 'Inicio', sobre: 'Sobre mí', servicios: 'Servicios', cursos: 'Cursos', blog: 'Blog', contacto: 'Contacto',
    misCursos: 'Mis Cursos', contactar: 'Contactar ahora', sesion: 'Sesión iniciada', cerrar: 'Cerrar sesión',
    iniciar: 'Iniciar sesión', menuUsuario: 'Menú de usuario', abrirMenu: 'Abrir menú'
  },
  en: {
    inicio: 'Home', sobre: 'About', servicios: 'Services', cursos: 'Courses (ES)', blog: 'Blog (ES)', contacto: 'Contact',
    misCursos: 'My Courses', contactar: 'Get in touch', sesion: 'Signed in', cerrar: 'Log out',
    iniciar: 'Log in', menuUsuario: 'User menu', abrirMenu: 'Open menu'
  },
  it: {
    inicio: 'Home', sobre: 'Chi sono', servicios: 'Servizi', cursos: 'Corsi (ES)', blog: 'Blog (ES)', contacto: 'Contatti',
    misCursos: 'I miei corsi', contactar: 'Contattami', sesion: 'Accesso effettuato', cerrar: 'Esci',
    iniciar: 'Accedi', menuUsuario: 'Menu utente', abrirMenu: 'Apri il menu'
  },
  de: {
    inicio: 'Start', sobre: 'Über mich', servicios: 'Leistungen', cursos: 'Kurse (ES)', blog: 'Blog (ES)', contacto: 'Kontakt',
    misCursos: 'Meine Kurse', contactar: 'Kontakt aufnehmen', sesion: 'Angemeldet', cerrar: 'Abmelden',
    iniciar: 'Anmelden', menuUsuario: 'Benutzermenü', abrirMenu: 'Menü öffnen'
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
  cookies: string;
}

export const PIE: Record<Idioma, TextosPie> = {
  es: {
    lema: 'Estudio Profesional de Maquillaje y Estilismo', lugar: 'Ibiza, España', seguir: 'Sígueme en',
    igPro: 'Maquillaje profesional', igPers: 'Perfil personal', derechos: 'Todos los derechos reservados.',
    privacidad: 'Política de privacidad', cookies: 'Gestionar cookies'
  },
  en: {
    lema: 'Professional Makeup and Styling Studio', lugar: 'Ibiza, Spain', seguir: 'Follow me on',
    igPro: 'Professional makeup', igPers: 'Personal profile', derechos: 'All rights reserved.',
    privacidad: 'Privacy policy (Spanish)', cookies: 'Manage cookies'
  },
  it: {
    lema: 'Studio professionale di trucco e styling', lugar: 'Ibiza, Spagna', seguir: 'Seguimi su',
    igPro: 'Trucco professionale', igPers: 'Profilo personale', derechos: 'Tutti i diritti riservati.',
    privacidad: 'Informativa sulla privacy (in spagnolo)', cookies: 'Gestisci i cookie'
  },
  de: {
    lema: 'Professionelles Make-up- und Styling-Studio', lugar: 'Ibiza, Spanien', seguir: 'Folge mir auf',
    igPro: 'Professionelles Make-up', igPers: 'Persönliches Profil', derechos: 'Alle Rechte vorbehalten.',
    privacidad: 'Datenschutzerklärung (auf Spanisch)', cookies: 'Cookies verwalten'
  }
};

export interface TextosCookies {
  aviso: string;
  mas: string;
  tituloConfig: string;
  configurar: string;
  rechazar: string;
  aceptar: string;
  nec: string;
  necDesc: string;
  siempre: string;
  ana: string;
  anaDesc: string;
  mkt: string;
  mktDesc: string;
  cancelar: string;
  guardar: string;
}

export const COOKIES: Record<Idioma, TextosCookies> = {
  es: {
    aviso: 'Utilizamos cookies propias y de terceros para mejorar tu experiencia y analizar el uso de nuestra web. Puedes aceptarlas todas o configurar tus preferencias.',
    mas: 'Más información', tituloConfig: 'Configurar cookies', configurar: 'Configurar', rechazar: 'Rechazar',
    aceptar: 'Aceptar', nec: 'Cookies necesarias',
    necDesc: 'Imprescindibles para el funcionamiento básico de la web. No pueden desactivarse.',
    siempre: 'Siempre activas', ana: 'Cookies analíticas',
    anaDesc: 'Nos ayudan a entender cómo interactúas con la web para mejorar nuestros servicios.',
    mkt: 'Cookies de marketing',
    mktDesc: 'Permiten mostrarte contenido y anuncios personalizados según tus intereses.',
    cancelar: 'Cancelar', guardar: 'Guardar preferencias'
  },
  en: {
    aviso: 'We use our own and third-party cookies to improve your experience and analyse how our website is used. You can accept them all or set your preferences.',
    mas: 'More information', tituloConfig: 'Cookie settings', configurar: 'Settings', rechazar: 'Reject',
    aceptar: 'Accept', nec: 'Necessary cookies',
    necDesc: 'Essential for the basic operation of the website. They cannot be turned off.',
    siempre: 'Always on', ana: 'Analytics cookies',
    anaDesc: 'They help us understand how you use the website so we can improve our services.',
    mkt: 'Marketing cookies',
    mktDesc: 'They let us show you personalised content and ads based on your interests.',
    cancelar: 'Cancel', guardar: 'Save preferences'
  },
  it: {
    aviso: 'Utilizziamo cookie propri e di terze parti per migliorare la tua esperienza e analizzare l\'uso del sito. Puoi accettarli tutti o configurare le tue preferenze.',
    mas: 'Maggiori informazioni', tituloConfig: 'Impostazioni dei cookie', configurar: 'Impostazioni', rechazar: 'Rifiuta',
    aceptar: 'Accetta', nec: 'Cookie necessari',
    necDesc: 'Indispensabili per il funzionamento di base del sito. Non possono essere disattivati.',
    siempre: 'Sempre attivi', ana: 'Cookie analitici',
    anaDesc: 'Ci aiutano a capire come usi il sito per migliorare i nostri servizi.',
    mkt: 'Cookie di marketing',
    mktDesc: 'Ci permettono di mostrarti contenuti e annunci personalizzati in base ai tuoi interessi.',
    cancelar: 'Annulla', guardar: 'Salva le preferenze'
  },
  de: {
    aviso: 'Wir verwenden eigene Cookies und Cookies von Drittanbietern, um dein Erlebnis zu verbessern und die Nutzung der Website zu analysieren. Du kannst alle akzeptieren oder deine Einstellungen anpassen.',
    mas: 'Mehr erfahren', tituloConfig: 'Cookie-Einstellungen', configurar: 'Einstellungen', rechazar: 'Ablehnen',
    aceptar: 'Akzeptieren', nec: 'Notwendige Cookies',
    necDesc: 'Unverzichtbar für die Grundfunktionen der Website. Sie können nicht deaktiviert werden.',
    siempre: 'Immer aktiv', ana: 'Analyse-Cookies',
    anaDesc: 'Sie helfen uns zu verstehen, wie du die Website nutzt, damit wir unser Angebot verbessern können.',
    mkt: 'Marketing-Cookies',
    mktDesc: 'Sie ermöglichen uns, dir personalisierte Inhalte und Anzeigen passend zu deinen Interessen zu zeigen.',
    cancelar: 'Abbrechen', guardar: 'Einstellungen speichern'
  }
};
