import type { Idioma } from '../../shared/idioma';

/**
 * Texto de las cuatro paginas que existen en ingles, italiano y aleman
 * (/en, /it, /de). Las plantillas de pages/multi/ solo pintan estos datos;
 * la version en español conserva sus propias plantillas.
 *
 * Los textos parten de lo que dice la web en español: no añaden precios,
 * cifras ni promesas que alli no esten.
 */
export type IdiomaNativo = Exclude<Idioma, 'es'>;

/** Trozo de texto; `b` lo pone en negrita. */
export interface Trozo {
  t: string;
  b?: boolean;
}

export interface Tarjeta {
  titulo: string;
  texto: string;
  alt: string;
}

export interface ContenidoInicio {
  altHero: string;
  insignia: string;
  h1: string;
  h1Em: string;
  intro: string;
  ctaCita: string;
  ctaServicios: string;
  sobreKicker: string;
  sobreSaludo: string;
  sobreNombre: string;
  sobreP1: Trozo[];
  sobreP2: string;
  sobreEnlace: string;
  altSobre: string;
  serviciosKicker: string;
  serviciosH2: string;
  tarjetas: Tarjeta[];
  serviciosTodos: string;
  cursosKicker: string;
  cursosH2: string;
  cursosTexto: string;
  cursosNota: string;
  cursosCta: string;
  cierreH2: string;
  cierreTexto: string;
  cierreBoton: string;
}

export interface ServicioDetalle {
  titulo: string;
  tituloEm: string;
  texto: string;
  items: string[];
  boton: string;
  alt: string;
}

export interface ContenidoServicios {
  altHero: string;
  insignia: string;
  h1: string;
  h1Em: string;
  intro: string;
  filosofiaKicker: string;
  filosofiaH2: string;
  filosofiaH2Em: string;
  filosofiaTexto: string;
  badge1Titulo: string;
  badge1Texto: string;
  badge2Titulo: string;
  badge2Texto: string;
  altFoto: string;
  serviciosKicker: string;
  serviciosH2: string;
  incluyeEtiqueta: string;
  servicios: ServicioDetalle[];
  procesoKicker: string;
  procesoH2: string;
  pasos: { titulo: string; texto: string }[];
  cierreKicker: string;
  cierreH2: string;
  cierreTexto: string;
  cierreBoton: string;
}

export interface ContenidoSobre {
  altHero: string;
  insignia: string;
  h1: string;
  h1Em: string;
  intro: string;
  cta: string;
  historiaKicker: string;
  historiaH2: string;
  historiaH2Em: string;
  p1: string;
  p2: Trozo[];
  p3: string;
  cita: string;
  citaAutor: string;
  altHistoria: string;
  valoresKicker: string;
  valoresH2: string;
  valores: { titulo: string; texto: string }[];
  dedicKicker: string;
  dedicH2: string;
  dedicH2Em: string;
  dedicP1: string;
  dedicP2: string;
  dedicBoton1: string;
  dedicBoton2: string;
  altDedic: string;
}

export interface ContenidoContacto {
  kicker: string;
  h1: string;
  h1Em: string;
  intro: Trozo[];
  whatsapp: string;
  correo: string;
  mensajeWhatsapp: string;
  datosH2: string;
  etTelefono: string;
  etCorreo: string;
  etInstagram: string;
  etHorario: string;
  horario: string;
  dondeH2: string;
  dondeTexto: string;
  verServicios: string;
  enEspanol: string;
}

export interface Contenido {
  inicio: ContenidoInicio;
  servicios: ContenidoServicios;
  sobre: ContenidoSobre;
  contacto: ContenidoContacto;
}

// ─── Ingles ──────────────────────────────────────────────────────────
const en: Contenido = {
  inicio: {
    altHero: 'Yonaida, professional makeup artist in Ibiza',
    insignia: 'Makeup Atelier · Ibiza',
    h1: 'Professional makeup artist in Ibiza',
    h1Em: 'made for you',
    intro: 'Enhancing your natural essence with high-end technique, luminous skin and flawless staying power in any climate and for any emotion.',
    ctaCita: 'Request an appointment',
    ctaServicios: 'View services',
    sobreKicker: 'Beauty Atelier',
    sobreSaludo: "Hi, I'm",
    sobreNombre: 'Yonaida',
    sobreP1: [
      { t: 'Professional makeup artist based in ' },
      { t: 'Ibiza', b: true },
      { t: ' with more than five years of experience helping brides, private clients and brands show their best selves.' }
    ],
    sobreP2: 'My technique is not about transforming your features, but about enhancing the freshness of your gaze and the glow of your skin, with long-lasting finishes that respect your natural features.',
    sobreEnlace: 'My story and philosophy',
    altSobre: 'Yonaida, professional makeup artist in Ibiza',
    serviciosKicker: 'Specialised services',
    serviciosH2: 'Elegance in every discipline',
    tarjetas: [
      { titulo: 'Brides & Weddings', texto: 'Personalised trial, touch-up kit and getting ready at villas or hotels in Ibiza.', alt: 'Bridal makeup in Ibiza' },
      { titulo: 'Guests & Galas', texto: 'Sophisticated party looks with custom lashes and extreme staying power to dance all night.', alt: 'Event and guest makeup in Ibiza' },
      { titulo: 'Editorial & Campaigns', texto: 'Creative concept for fashion brands, lookbooks and shoots with international photographers.', alt: 'Editorial and fashion campaign makeup' },
      { titulo: 'Film & TV', texto: 'Shine and texture control for 4K/8K optics on outdoor shoots, commercials and music videos.', alt: 'Makeup for film and television' }
    ],
    serviciosTodos: 'Explore all services',
    cursosKicker: 'Learn with me from home',
    cursosH2: 'Online self-makeup masterclass',
    cursosTexto: 'Learn to know your skin and hydrate it so your makeup looks far better, to apply makeup for the shape of your face, to choose the colours that suit your skin tone, and to turn a day look into an evening look in just 5 minutes.',
    cursosNota: 'The course and its video lessons are in Spanish.',
    cursosCta: 'See the masterclass (in Spanish)',
    cierreH2: 'Planning a wedding or event in Ibiza?',
    cierreTexto: 'Tell me the date, how many people need makeup and any details you would like. I will reply personally with availability and a quote.',
    cierreBoton: 'Get in touch'
  },
  servicios: {
    altHero: 'Yonaida, professional makeup artist in Ibiza',
    insignia: 'Makeup Atelier · Ibiza',
    h1: 'Makeup services',
    h1Em: 'in Ibiza',
    intro: 'From bridal exclusivity to fashion productions and gala events. Every technique is designed to bring out your features with luminosity, elegance and maximum staying power.',
    filosofiaKicker: 'Beauty philosophy',
    filosofiaH2: 'Polished naturalness,',
    filosofiaH2Em: 'flawless staying power.',
    filosofiaTexto: 'My approach avoids heavy or artificial makeup. I work the skin to create a luminous, silky base that stands up to the Mediterranean climate, enhancing the eyes and lips so you keep recognising yourself at your best.',
    badge1Titulo: 'Premium cosmetics',
    badge1Texto: 'Charlotte Tilbury, Dior, NARS & MAC.',
    badge2Titulo: 'At your villa or hotel',
    badge2Texto: 'Service anywhere in Ibiza.',
    altFoto: 'Yonaida, professional makeup in Ibiza',
    serviciosKicker: 'Exclusive services',
    serviciosH2: 'Designed for every moment',
    incluyeEtiqueta: 'What is included',
    servicios: [
      {
        titulo: 'Bridal', tituloEm: 'makeup',
        texto: 'Your wedding in Ibiza needs meticulous preparation. Together we create the look that reflects your essence, built to last through tears, hugs and warm weather.',
        items: [
          'Preliminary consultation and personalised face-shape advice.',
          'Full makeup trial with photographic record.',
          'Skin preparation with a hydrating mask beforehand.',
          'Touch-up kit as a gift for the day of the wedding.'
        ],
        boton: 'Request a wedding proposal', alt: 'Bridal makeup in Ibiza'
      },
      {
        titulo: 'Guests &', tituloEm: 'special occasions',
        texto: 'For graduations, galas, parties in Ibiza or wedding guests who want to impress with a sophisticated style and fresh skin that lasts the whole evening.',
        items: [
          'Quick skin assessment and advice to match your outfit.',
          'Individual lashes or custom strip lashes included.',
          'Professional sweat-resistant setting and extreme staying power.'
        ],
        boton: 'Book for an event', alt: 'Event and guest makeup in Ibiza'
      },
      {
        titulo: 'Fashion, editorial', tituloEm: '& photo shoots',
        texto: "Coordination with photographers, brands and models for lookbooks, fashion campaigns and covers, with precision under studio lighting or Ibiza's natural light.",
        items: [
          'Moodboard and creative concept developed with the team.',
          'On-set assistance and continuous touch-ups during the whole shoot.',
          'Quick look changes between wardrobe sets.'
        ],
        boton: 'Ask about day rates', alt: 'Editorial and fashion shoot makeup'
      },
      {
        titulo: 'Film, music videos', tituloEm: '& advertising',
        texto: 'Service for production companies, television networks, commercials and fiction projects. Specific techniques for 4K/8K optics with no shine or imperfections.',
        items: [
          'Continuity control between scenes.',
          'Compatibility with digital cameras and high-power lights.',
          'Adapted to outdoor shoots on beaches and boats.'
        ],
        boton: 'Coordinate a production', alt: 'Makeup for film, music videos and advertising'
      }
    ],
    procesoKicker: 'Your peace of mind comes first',
    procesoH2: 'How we work together',
    pasos: [
      { titulo: 'Initial consultation', texto: 'We talk about your event, the dress, the time of the celebration and your personal preferences.' },
      { titulo: 'Trial & adjustments', texto: 'For brides, a meticulous trial to refine every shade of colour, intensity and durability.' },
      { titulo: 'Skin preparation', texto: 'A hydrating skincare routine and depuffing massage before any pigment is applied.' },
      { titulo: 'The big day', texto: 'Strict punctuality at your villa or hotel, so you can enjoy a moment of calm and relaxation.' }
    ],
    cierreKicker: 'Open calendar 2026',
    cierreH2: 'Your moment starts here',
    cierreTexto: 'Tell me the date of your event, the people to be made up and any detail you want. I will reply personally with availability and a quote.',
    cierreBoton: 'Get in touch'
  },
  sobre: {
    altHero: 'Yonaida, professional makeup artist in Ibiza',
    insignia: 'Makeup Artist · Ibiza Atelier',
    h1: 'Yonaida, professional',
    h1Em: 'makeup artist in Ibiza',
    intro: 'An honest view of how I understand beauty: celebrating the uniqueness of every woman with technical precision, warmth and total dedication in every brushstroke.',
    cta: "Let's talk about your moment",
    historiaKicker: 'Behind the brush',
    historiaH2: "Hi, I'm Yonaida.",
    historiaH2Em: "I believe in beauty that doesn't disguise.",
    p1: "My path in makeup began with a deep fascination with light, textures and the way a carefully done look can transform a person's confidence.",
    p2: [
      { t: 'After more than five years working in ' },
      { t: 'Ibiza', b: true },
      { t: ', I have specialised in destination weddings, fashion editorials and audiovisual productions. On an island where the sunset light takes centre stage and the Mediterranean climate is demanding, my technique focuses on ' },
      { t: 'flawless, fresh and long-lasting skin', b: true },
      { t: '.' }
    ],
    p3: "I don't see makeup as a mask to hide behind, but as an art that reveals and enhances what makes you unrepeatable.",
    cita: 'When a woman looks in the mirror and smiles with relief and emotion at seeing herself, but radiant... that is the moment I love my work for.',
    citaAutor: 'Yonaida',
    altHistoria: 'Yonaida at work as a makeup artist in Ibiza',
    valoresKicker: 'Values & quality',
    valoresH2: 'What defines my signature',
    valores: [
      { titulo: 'Radiant, light skin', texto: 'The secret of elegant makeup lies in how the skin is prepared and worked. Fewer visible layers, more freshness and a texture that breathes.' },
      { titulo: 'Premium, careful products', texto: 'I work exclusively with international reference brands, selected for their dermatological compatibility, pigmentation and performance on camera.' },
      { titulo: 'Warmth & calm', texto: 'On your wedding day or event, nerves run high. My commitment is to give you an atmosphere of calm, punctuality and complete care at every moment.' }
    ],
    dedicKicker: 'Total dedication',
    dedicH2: 'Every detail counts,',
    dedicH2Em: 'every client is unique.',
    dedicP1: 'I love accompanying each person from the first conversation: listening to your concerns, seeing the inspiration photos of your dress or event, and designing a proposal in which you feel 100% yourself.',
    dedicP2: 'Whether in my atelier in Ibiza or travelling to your private villa, hotel or location on the island, you can be sure you are in the hands of a professional who loves what she does.',
    dedicBoton1: 'Get in touch',
    dedicBoton2: 'See my services',
    altDedic: 'Makeup artist Yonaida preparing a client in Ibiza'
  },
  contacto: {
    kicker: 'Appointments · Ibiza',
    h1: 'Book your makeup',
    h1Em: 'in Ibiza.',
    intro: [
      { t: 'Every makeup service is arranged in a ' },
      { t: 'completely personal, hands-on way', b: true },
      { t: '. Message me with the details of your event and I will reply personally with availability and a quote.' }
    ],
    whatsapp: 'WhatsApp',
    correo: 'Send an email',
    mensajeWhatsapp: 'Hello Yonaida, I would like to ask about your makeup services',
    datosH2: 'Contact details',
    etTelefono: 'Phone / WhatsApp:',
    etCorreo: 'Email:',
    etInstagram: 'Instagram:',
    etHorario: 'Hours:',
    horario: 'Monday to Saturday · by appointment',
    dondeH2: 'Where I work',
    dondeTexto: 'At my studio in Ibiza, or travelling to hotels, fincas and villas anywhere on the island. Weddings, events, fashion and film productions.',
    verServicios: 'See all services',
    enEspanol: 'Spanish version'
  }
};

// ─── Italiano ────────────────────────────────────────────────────────
const it: Contenido = {
  inicio: {
    altHero: 'Yonaida, truccatrice professionista a Ibiza',
    insignia: 'Atelier di trucco · Ibiza',
    h1: 'Truccatrice professionista a Ibiza',
    h1Em: 'su misura per te',
    intro: 'Esalto la tua bellezza naturale con tecnica di alta moda, pelle luminosa e una tenuta impeccabile con qualsiasi clima e in ogni emozione.',
    ctaCita: 'Richiedi un appuntamento',
    ctaServicios: 'Scopri i servizi',
    sobreKicker: 'Atelier di bellezza',
    sobreSaludo: 'Ciao, sono',
    sobreNombre: 'Yonaida',
    sobreP1: [
      { t: 'Truccatrice professionista con base a ' },
      { t: 'Ibiza', b: true },
      { t: ' e oltre cinque anni di esperienza al fianco di spose, clienti private e marchi, per far emergere la loro versione migliore.' }
    ],
    sobreP2: 'La mia tecnica non vuole trasformare i tuoi lineamenti, ma esaltare la freschezza dello sguardo e la luce della pelle, con finish duraturi che rispettano la tua fisionomia.',
    sobreEnlace: 'La mia storia e la mia filosofia',
    altSobre: 'Yonaida, truccatrice professionista a Ibiza',
    serviciosKicker: 'Servizi specializzati',
    serviciosH2: 'Eleganza in ogni disciplina',
    tarjetas: [
      { titulo: 'Spose e matrimoni', texto: 'Prova personalizzata, kit per i ritocchi e preparazione in ville o hotel a Ibiza.', alt: 'Trucco da sposa a Ibiza' },
      { titulo: 'Ospiti e gala', texto: 'Look da festa sofisticati con ciglia su misura e una tenuta estrema per ballare tutta la notte.', alt: 'Trucco per ospiti ed eventi a Ibiza' },
      { titulo: 'Editoriale e campagne', texto: 'Concept creativo per marchi di moda, lookbook e servizi fotografici con fotografi internazionali.', alt: 'Trucco editoriale e per campagne di moda' },
      { titulo: 'Cinema e TV', texto: 'Controllo di lucidità e texture specifico per ottiche 4K/8K, in esterni, spot e videoclip.', alt: 'Trucco per cinema e televisione' }
    ],
    serviciosTodos: 'Scopri tutti i servizi',
    cursosKicker: 'Impara con me da casa',
    cursosH2: 'Masterclass di auto-trucco online',
    cursosTexto: 'Impara a conoscere la tua pelle e a idratarla perché il trucco riesca molto meglio, a truccarti in base alla forma del viso, a scegliere i colori che valorizzano il tuo fototipo e a trasformare un trucco da giorno in uno da sera in soli 5 minuti.',
    cursosNota: 'Il corso e le lezioni video sono in spagnolo.',
    cursosCta: 'Scopri la masterclass (in spagnolo)',
    cierreH2: 'Ti sposi o hai un evento a Ibiza?',
    cierreTexto: 'Dimmi la data, quante persone devono essere truccate e ogni dettaglio che desideri. Ti risponderò personalmente con disponibilità e preventivo.',
    cierreBoton: 'Contattami'
  },
  servicios: {
    altHero: 'Yonaida, truccatrice professionista a Ibiza',
    insignia: 'Atelier di trucco · Ibiza',
    h1: 'Servizi di trucco',
    h1Em: 'a Ibiza',
    intro: "Dall'esclusività del trucco da sposa alle produzioni di moda e agli eventi di gala. Ogni tecnica è pensata per valorizzare i tuoi tratti con luminosità, eleganza e la massima tenuta.",
    filosofiaKicker: 'Filosofia di bellezza',
    filosofiaH2: 'Naturalezza raffinata,',
    filosofiaH2Em: 'tenuta impeccabile.',
    filosofiaTexto: 'Il mio approccio evita i trucchi pesanti o artificiali. Lavoro la pelle per creare una base luminosa, setosa e resistente al clima mediterraneo, valorizzando occhi e labbra perché tu continui a riconoscerti nella tua versione migliore.',
    badge1Titulo: 'Cosmetici di alta gamma',
    badge1Texto: 'Charlotte Tilbury, Dior, NARS e MAC.',
    badge2Titulo: 'Nella tua villa o hotel',
    badge2Texto: 'Servizio in qualsiasi punto di Ibiza.',
    altFoto: 'Yonaida, trucco professionale a Ibiza',
    serviciosKicker: 'Servizi esclusivi',
    serviciosH2: 'Pensati per ogni momento',
    incluyeEtiqueta: 'Cosa include',
    servicios: [
      {
        titulo: 'Trucco', tituloEm: 'da sposa',
        texto: 'Il tuo matrimonio a Ibiza richiede una preparazione meticolosa. Creiamo insieme il look che riflette la tua essenza, pensato per resistere a lacrime, abbracci e clima caldo.',
        items: [
          'Consulenza preliminare personalizzata sulla forma del viso.',
          'Prova trucco completa con documentazione fotografica.',
          'Preparazione della pelle con una maschera idratante.',
          'Kit per i ritocchi in omaggio per il giorno delle nozze.'
        ],
        boton: 'Richiedi una proposta per le nozze', alt: 'Trucco da sposa a Ibiza'
      },
      {
        titulo: 'Ospiti e', tituloEm: 'occasioni speciali',
        texto: 'Per lauree, gala, feste a Ibiza o ospiti di matrimonio che vogliono distinguersi con uno stile sofisticato e una pelle fresca che dura per tutta la serata.',
        items: [
          'Rapida analisi della pelle e consigli in base al tuo outfit.',
          'Ciglia singole o a striscia su misura incluse.',
          'Fissaggio professionale anti-sudore e tenuta estrema.'
        ],
        boton: 'Prenota per un evento', alt: 'Trucco per ospiti ed eventi a Ibiza'
      },
      {
        titulo: 'Moda, editoriale', tituloEm: 'e servizi fotografici',
        texto: 'Coordinamento con fotografi, marchi e modelle per lookbook, campagne di moda e copertine, con precisione sotto la luce da studio o la luce naturale di Ibiza.',
        items: [
          'Moodboard e concept creativo sviluppati con il team.',
          'Assistenza sul set e ritocchi continui durante tutto lo shooting.',
          'Cambi di look rapidi tra un set di abiti e l\'altro.'
        ],
        boton: 'Chiedi le tariffe a giornata', alt: 'Trucco per servizi editoriali e di moda'
      },
      {
        titulo: 'Cinema, videoclip', tituloEm: 'e pubblicità',
        texto: 'Servizio per case di produzione, reti televisive, spot commerciali e progetti di fiction. Tecniche specifiche per ottiche 4K/8K, senza lucidità né imperfezioni.',
        items: [
          'Controllo della continuità tra le scene.',
          'Compatibilità con fotocamere digitali e luci ad alta potenza.',
          'Adattamento a riprese in esterni su calette e barche.'
        ],
        boton: 'Coordina una produzione', alt: 'Trucco per cinema, videoclip e pubblicità'
      }
    ],
    procesoKicker: 'La tua serenità viene prima di tutto',
    procesoH2: 'Come lavoriamo insieme',
    pasos: [
      { titulo: 'Consulenza iniziale', texto: "Parliamo del tuo evento, dell'abito, dell'orario della cerimonia e delle tue preferenze personali." },
      { titulo: 'Prova e ritocchi', texto: 'Per le spose, una prova meticolosa per affinare ogni sfumatura di colore, intensità e durata.' },
      { titulo: 'Preparazione della pelle', texto: 'Una routine cosmetica idratante e un massaggio decongestionante prima di applicare qualsiasi pigmento.' },
      { titulo: 'Il grande giorno', texto: 'Massima puntualità nella tua villa o hotel, perché tu possa goderti un momento di calma e relax.' }
    ],
    cierreKicker: 'Agenda aperta 2026',
    cierreH2: 'Il tuo momento inizia qui',
    cierreTexto: "Dimmi la data del tuo evento, le persone da truccare e ogni dettaglio che desideri. Ti risponderò personalmente con disponibilità e preventivo.",
    cierreBoton: 'Contattami'
  },
  sobre: {
    altHero: 'Yonaida, truccatrice professionista a Ibiza',
    insignia: 'Makeup Artist · Atelier Ibiza',
    h1: 'Yonaida, truccatrice',
    h1Em: 'professionista a Ibiza',
    intro: 'Uno sguardo sincero su come intendo la bellezza: celebrare la unicità di ogni donna con precisione tecnica, vicinanza e totale dedizione in ogni pennellata.',
    cta: 'Parliamo del tuo momento',
    historiaKicker: 'Dietro il pennello',
    historiaH2: 'Ciao, sono Yonaida.',
    historiaH2Em: 'Credo in una bellezza che non maschera.',
    p1: 'Il mio percorso nel trucco è nato da una profonda fascinazione per la luce, le texture e il modo in cui un look curato può trasformare la sicurezza di una persona.',
    p2: [
      { t: 'Dopo più di cinque anni di lavoro a ' },
      { t: 'Ibiza', b: true },
      { t: ', mi sono specializzata in matrimoni di destinazione, editoriali di moda e produzioni audiovisive. In un\'isola dove la luce del tramonto è protagonista e il clima mediterraneo è esigente, la mia tecnica si concentra su ' },
      { t: 'pelle impeccabile, fresca e duratura', b: true },
      { t: '.' }
    ],
    p3: 'Non concepisco il trucco come una maschera per nascondersi, ma come un\'arte per rivelare e valorizzare ciò che ti rende irripetibile.',
    cita: 'Quando una donna si guarda allo specchio e sorride con sollievo ed emozione vedendosi se stessa, ma radiosa... è questo il momento per cui amo il mio lavoro.',
    citaAutor: 'Yonaida',
    altHistoria: 'Yonaida al lavoro come truccatrice a Ibiza',
    valoresKicker: 'Valori e qualità',
    valoresH2: 'Ciò che definisce il mio stile',
    valores: [
      { titulo: 'Pelle radiosa e leggera', texto: 'Il segreto di un trucco elegante sta in come si prepara e si lavora la pelle. Meno strati visibili, più freschezza e una texture che respira.' },
      { titulo: 'Prodotti di alta gamma, selezionati con cura', texto: 'Lavoro esclusivamente con marchi internazionali di riferimento, scelti per compatibilità dermatologica, pigmentazione e resa in camera.' },
      { titulo: 'Vicinanza e calma', texto: "Il giorno del tuo matrimonio o evento i nervi sono a fior di pelle. Il mio impegno è offrirti un ambiente di calma, puntualità e cura totale in ogni momento." }
    ],
    dedicKicker: 'Dedizione totale',
    dedicH2: 'Ogni dettaglio conta,',
    dedicH2Em: 'ogni cliente è unica.',
    dedicP1: "Mi piace accompagnare ogni persona fin dalla prima conversazione: ascoltare le tue preoccupazioni, vedere le foto di ispirazione del tuo abito o evento e progettare una proposta in cui ti senti al 100% te stessa.",
    dedicP2: "Che sia nel mio atelier a Ibiza o spostandomi nella tua villa privata, hotel o location sull'isola, avrai la certezza di essere nelle mani di una professionista che ama ciò che fa.",
    dedicBoton1: 'Contattami',
    dedicBoton2: 'Scopri i miei servizi',
    altDedic: 'La truccatrice Yonaida prepara una cliente a Ibiza'
  },
  contacto: {
    kicker: 'Appuntamenti · Ibiza',
    h1: 'Prenota il tuo trucco',
    h1Em: 'a Ibiza.',
    intro: [
      { t: 'Ogni servizio di trucco viene organizzato in modo ' },
      { t: 'completamente personale e artigianale', b: true },
      { t: '. Scrivimi i dettagli del tuo evento e ti risponderò personalmente con disponibilità e preventivo.' }
    ],
    whatsapp: 'WhatsApp',
    correo: 'Invia un\'email',
    mensajeWhatsapp: 'Ciao Yonaida, vorrei informazioni sui tuoi servizi di trucco',
    datosH2: 'Recapiti',
    etTelefono: 'Telefono / WhatsApp:',
    etCorreo: 'Email:',
    etInstagram: 'Instagram:',
    etHorario: 'Orari:',
    horario: 'Dal lunedì al sabato · su appuntamento',
    dondeH2: 'Dove lavoro',
    dondeTexto: "Nel mio studio a Ibiza, oppure spostandomi in hotel, fincas e ville in qualsiasi punto dell'isola. Matrimoni, eventi, moda e produzioni cinematografiche.",
    verServicios: 'Scopri tutti i servizi',
    enEspanol: 'Versione in spagnolo'
  }
};

// ─── Aleman ──────────────────────────────────────────────────────────
const de: Contenido = {
  inicio: {
    altHero: 'Yonaida, professionelle Visagistin auf Ibiza',
    insignia: 'Make-up-Atelier · Ibiza',
    h1: 'Professionelle Visagistin auf Ibiza',
    h1Em: 'ganz auf dich abgestimmt',
    intro: 'Ich bringe deine natürliche Ausstrahlung mit hochwertiger Technik, strahlender Haut und perfektem Halt zur Geltung, bei jedem Klima und in jedem Moment.',
    ctaCita: 'Termin anfragen',
    ctaServicios: 'Leistungen ansehen',
    sobreKicker: 'Beauty-Atelier',
    sobreSaludo: 'Hallo, ich bin',
    sobreNombre: 'Yonaida',
    sobreP1: [
      { t: 'Professionelle Visagistin mit Sitz auf ' },
      { t: 'Ibiza', b: true },
      { t: ' und mehr als fünf Jahren Erfahrung. Ich begleite Bräute, Privatkundinnen und Marken dabei, sich von ihrer besten Seite zu zeigen.' }
    ],
    sobreP2: 'Meine Technik will deine Züge nicht verwandeln, sondern die Frische deines Blicks und das Leuchten deiner Haut betonen, mit langanhaltenden Ergebnissen, die zu deinem Typ passen.',
    sobreEnlace: 'Meine Geschichte und Philosophie',
    altSobre: 'Yonaida, professionelle Visagistin auf Ibiza',
    serviciosKicker: 'Spezialisierte Leistungen',
    serviciosH2: 'Eleganz in jeder Disziplin',
    tarjetas: [
      { titulo: 'Bräute & Hochzeiten', texto: 'Individuelles Probe-Make-up, Touch-up-Set und Styling in Villen oder Hotels auf Ibiza.', alt: 'Braut-Make-up auf Ibiza' },
      { titulo: 'Gäste & Galas', texto: 'Elegante Party-Looks mit maßgefertigten Wimpern und extremem Halt, damit du die ganze Nacht tanzen kannst.', alt: 'Make-up für Gäste und Events auf Ibiza' },
      { titulo: 'Editorial & Kampagnen', texto: 'Kreatives Konzept für Modemarken, Lookbooks und Shootings mit internationalen Fotografen.', alt: 'Editorial- und Modekampagnen-Make-up' },
      { titulo: 'Film & TV', texto: 'Glanz- und Texturkontrolle für 4K/8K-Optiken bei Außendrehs, Werbespots und Musikvideos.', alt: 'Make-up für Film und Fernsehen' }
    ],
    serviciosTodos: 'Alle Leistungen entdecken',
    cursosKicker: 'Lerne von zu Hause aus mit mir',
    cursosH2: 'Online-Masterclass für Selbst-Make-up',
    cursosTexto: 'Lerne deine Haut kennen und richtig mit Feuchtigkeit zu versorgen, damit dein Make-up viel schöner wirkt, dich passend zur Gesichtsform zu schminken, die Farben zu wählen, die zu deinem Hauttyp passen, und ein Tages-Make-up in nur 5 Minuten in ein Abend-Make-up zu verwandeln.',
    cursosNota: 'Der Kurs und seine Videolektionen sind auf Spanisch.',
    cursosCta: 'Masterclass ansehen (auf Spanisch)',
    cierreH2: 'Planst du eine Hochzeit oder ein Event auf Ibiza?',
    cierreTexto: 'Nenne mir das Datum, wie viele Personen geschminkt werden sollen und alle Details, die dir wichtig sind. Ich antworte dir persönlich mit Verfügbarkeit und Angebot.',
    cierreBoton: 'Kontakt aufnehmen'
  },
  servicios: {
    altHero: 'Yonaida, professionelle Visagistin auf Ibiza',
    insignia: 'Make-up-Atelier · Ibiza',
    h1: 'Make-up-Leistungen',
    h1Em: 'auf Ibiza',
    intro: 'Von exklusivem Braut-Make-up bis zu Modeproduktionen und Galaveranstaltungen. Jede Technik ist darauf ausgelegt, deine Züge mit Leuchtkraft, Eleganz und maximalem Halt zur Geltung zu bringen.',
    filosofiaKicker: 'Beauty-Philosophie',
    filosofiaH2: 'Gepflegte Natürlichkeit,',
    filosofiaH2Em: 'perfekter Halt.',
    filosofiaTexto: 'Mein Ansatz vermeidet schweres oder künstliches Make-up. Ich arbeite die Haut zu einer leuchtenden, seidigen Basis aus, die dem mediterranen Klima standhält, und betone Augen und Lippen, damit du dich weiterhin in deiner besten Version wiedererkennst.',
    badge1Titulo: 'Hochwertige Kosmetik',
    badge1Texto: 'Charlotte Tilbury, Dior, NARS & MAC.',
    badge2Titulo: 'In deiner Villa oder deinem Hotel',
    badge2Texto: 'Service an jedem Ort auf Ibiza.',
    altFoto: 'Yonaida, professionelles Make-up auf Ibiza',
    serviciosKicker: 'Exklusive Leistungen',
    serviciosH2: 'Für jeden besonderen Moment',
    incluyeEtiqueta: 'Das ist enthalten',
    servicios: [
      {
        titulo: 'Braut-', tituloEm: 'Make-up',
        texto: 'Deine Hochzeit auf Ibiza verlangt eine sorgfältige Vorbereitung. Gemeinsam entwerfen wir den Look, der dein Wesen widerspiegelt und Tränen, Umarmungen und warmem Wetter standhält.',
        items: [
          'Vorgespräch mit persönlicher Beratung zur Gesichtsform.',
          'Komplettes Probe-Make-up mit Fotodokumentation.',
          'Hautvorbereitung mit einer feuchtigkeitsspendenden Maske.',
          'Touch-up-Set als Geschenk für den Hochzeitstag.'
        ],
        boton: 'Hochzeitsangebot anfragen', alt: 'Braut-Make-up auf Ibiza'
      },
      {
        titulo: 'Gäste &', tituloEm: 'besondere Anlässe',
        texto: 'Für Abschlussfeiern, Galas, Partys auf Ibiza oder Hochzeitsgäste, die mit einem eleganten Stil und frischer Haut überzeugen möchten, die den ganzen Abend hält.',
        items: [
          'Kurze Hautanalyse und Beratung passend zu deinem Outfit.',
          'Einzelwimpern oder maßgefertigte Wimpernbänder inklusive.',
          'Professionelle schweißresistente Fixierung und extremer Halt.'
        ],
        boton: 'Für ein Event buchen', alt: 'Make-up für Gäste und Events auf Ibiza'
      },
      {
        titulo: 'Mode, Editorial', tituloEm: '& Fotoshootings',
        texto: 'Abstimmung mit Fotografen, Marken und Models für Lookbooks, Modekampagnen und Titelbilder, mit Präzision unter Studiolicht oder im natürlichen Licht Ibizas.',
        items: [
          'Moodboard und kreatives Konzept, gemeinsam mit dem Team entwickelt.',
          'Betreuung am Set und laufende Korrekturen während des gesamten Shootings.',
          'Schnelle Look-Wechsel zwischen den Outfits.'
        ],
        boton: 'Tagessätze erfragen', alt: 'Make-up für Editorial- und Mode-Shootings'
      },
      {
        titulo: 'Film, Musikvideos', tituloEm: '& Werbung',
        texto: 'Service für Produktionsfirmen, Fernsehsender, Werbespots und Spielfilmprojekte. Spezielle Techniken für 4K/8K-Optiken ohne Glanz und Unreinheiten.',
        items: [
          'Kontinuitätskontrolle zwischen den Szenen.',
          'Kompatibel mit Digitalkameras und leistungsstarken Scheinwerfern.',
          'Angepasst an Außendrehs an Buchten und auf Booten.'
        ],
        boton: 'Eine Produktion abstimmen', alt: 'Make-up für Film, Musikvideos und Werbung'
      }
    ],
    procesoKicker: 'Deine Ruhe steht an erster Stelle',
    procesoH2: 'So arbeiten wir zusammen',
    pasos: [
      { titulo: 'Erstgespräch', texto: 'Wir sprechen über dein Event, das Kleid, die Uhrzeit der Feier und deine persönlichen Wünsche.' },
      { titulo: 'Probe & Anpassungen', texto: 'Für Bräute eine sorgfältige Probe, um jede Farbnuance, Intensität und Haltbarkeit zu verfeinern.' },
      { titulo: 'Hautvorbereitung', texto: 'Eine feuchtigkeitsspendende Pflegeroutine und eine abschwellende Massage, bevor Pigmente aufgetragen werden.' },
      { titulo: 'Der große Tag', texto: 'Strenge Pünktlichkeit in deiner Villa oder deinem Hotel, damit du einen Moment der Ruhe und Entspannung genießen kannst.' }
    ],
    cierreKicker: 'Kalender offen 2026',
    cierreH2: 'Dein Moment beginnt hier',
    cierreTexto: 'Nenne mir das Datum deines Events, die Personen, die geschminkt werden sollen, und alle Details, die dir wichtig sind. Ich antworte dir persönlich mit Verfügbarkeit und Angebot.',
    cierreBoton: 'Kontakt aufnehmen'
  },
  sobre: {
    altHero: 'Yonaida, professionelle Visagistin auf Ibiza',
    insignia: 'Makeup Artist · Atelier Ibiza',
    h1: 'Yonaida, professionelle',
    h1Em: 'Visagistin auf Ibiza',
    intro: 'Ein ehrlicher Blick darauf, wie ich Schönheit verstehe: die Einzigartigkeit jeder Frau feiern, mit technischer Präzision, Nähe und vollem Einsatz bei jedem Pinselstrich.',
    cta: 'Lass uns über deinen Moment sprechen',
    historiaKicker: 'Hinter dem Pinsel',
    historiaH2: 'Hallo, ich bin Yonaida.',
    historiaH2Em: 'Ich glaube an eine Schönheit, die nichts verstellt.',
    p1: 'Mein Weg im Make-up begann mit einer tiefen Faszination für Licht, Texturen und dafür, wie ein sorgfältig gestalteter Look das Selbstvertrauen eines Menschen verändern kann.',
    p2: [
      { t: 'Nach mehr als fünf Jahren Arbeit auf ' },
      { t: 'Ibiza', b: true },
      { t: ' habe ich mich auf Destination Weddings, Mode-Editorials und audiovisuelle Produktionen spezialisiert. Auf einer Insel, auf der das Licht des Sonnenuntergangs die Hauptrolle spielt und das mediterrane Klima fordernd ist, konzentriert sich meine Technik auf ' },
      { t: 'makellose, frische und langanhaltende Haut', b: true },
      { t: '.' }
    ],
    p3: 'Für mich ist Make-up keine Maske zum Verstecken, sondern eine Kunst, die zum Vorschein bringt und betont, was dich unverwechselbar macht.',
    cita: 'Wenn eine Frau in den Spiegel schaut und erleichtert und gerührt lächelt, weil sie sich selbst sieht, aber strahlend... für diesen Moment liebe ich meine Arbeit.',
    citaAutor: 'Yonaida',
    altHistoria: 'Yonaida bei der Arbeit als Visagistin auf Ibiza',
    valoresKicker: 'Werte & Qualität',
    valoresH2: 'Was meine Handschrift ausmacht',
    valores: [
      { titulo: 'Strahlende, leichte Haut', texto: 'Das Geheimnis eines eleganten Make-ups liegt darin, wie die Haut vorbereitet und bearbeitet wird. Weniger sichtbare Schichten, mehr Frische und eine Textur, die atmet.' },
      { titulo: 'Hochwertige, sorgfältig ausgewählte Produkte', texto: 'Ich arbeite ausschließlich mit internationalen Referenzmarken, ausgewählt nach dermatologischer Verträglichkeit, Pigmentierung und Wirkung vor der Kamera.' },
      { titulo: 'Nähe & Ruhe', texto: 'Am Tag deiner Hochzeit oder deines Events liegen die Nerven blank. Mein Anspruch ist es, dir in jedem Moment eine Atmosphäre von Ruhe, Pünktlichkeit und voller Aufmerksamkeit zu bieten.' }
    ],
    dedicKicker: 'Volle Hingabe',
    dedicH2: 'Jedes Detail zählt,',
    dedicH2Em: 'jede Kundin ist einzigartig.',
    dedicP1: 'Ich begleite jeden Menschen gern von der ersten Unterhaltung an: Ich höre deine Anliegen, sehe mir die Inspirationsfotos zu deinem Kleid oder Event an und entwickle einen Vorschlag, bei dem du dich zu 100 % wie du selbst fühlst.',
    dedicP2: 'Ob in meinem Atelier auf Ibiza oder bei dir in der privaten Villa, im Hotel oder an einem Ort auf der Insel: Du kannst sicher sein, bei einer Fachfrau zu sein, die liebt, was sie tut.',
    dedicBoton1: 'Kontakt aufnehmen',
    dedicBoton2: 'Meine Leistungen ansehen',
    altDedic: 'Visagistin Yonaida bereitet eine Kundin auf Ibiza vor'
  },
  contacto: {
    kicker: 'Termine · Ibiza',
    h1: 'Buche dein Make-up',
    h1Em: 'auf Ibiza.',
    intro: [
      { t: 'Jede Make-up-Leistung wird ' },
      { t: 'vollkommen persönlich und individuell', b: true },
      { t: ' abgestimmt. Schreib mir die Details deines Events und ich antworte dir persönlich mit Verfügbarkeit und Angebot.' }
    ],
    whatsapp: 'WhatsApp',
    correo: 'E-Mail senden',
    mensajeWhatsapp: 'Hallo Yonaida, ich möchte mich über deine Make-up-Leistungen informieren',
    datosH2: 'Kontaktdaten',
    etTelefono: 'Telefon / WhatsApp:',
    etCorreo: 'E-Mail:',
    etInstagram: 'Instagram:',
    etHorario: 'Zeiten:',
    horario: 'Montag bis Samstag · nach Vereinbarung',
    dondeH2: 'Wo ich arbeite',
    dondeTexto: 'In meinem Studio auf Ibiza oder bei dir vor Ort, in Hotels, Fincas und Villen an jedem Ort der Insel. Hochzeiten, Events, Mode und Filmproduktionen.',
    verServicios: 'Alle Leistungen ansehen',
    enEspanol: 'Spanische Version'
  }
};

export const CONTENIDO: Record<IdiomaNativo, Contenido> = { en, it, de };
