import type { Idioma, PaginaServicio } from '../../shared/idioma';

/**
 * Paginas de cada servicio en los cuatro idiomas. Escritas a mano en cada
 * idioma (no traducidas automaticamente) a partir de lo que ya dice
 * /servicios: no se añaden precios, cifras ni afirmaciones nuevas.
 *
 * La ruta de cada una esta en RUTAS (shared/idioma.ts); el titulo y la
 * descripcion, aqui, para que texto y metadatos no se separen.
 */
export type ServicioDetalle = PaginaServicio;

export const SERVICIOS_DETALLE: readonly ServicioDetalle[] = ['novias', 'eventos', 'editorial', 'cine'];

export interface TextosServicio {
  title: string;
  descripcion: string;
  /** Nombre corto: migas de pan, enlaces a otros servicios y schema Service. */
  nombre: string;
  insignia: string;
  h1: string;
  h1Em: string;
  intro: string;
  cta: string;
  imagen: string;
  alt: string;
  /** object-position de la foto principal. */
  posicion: string;
  imagen2: string;
  alt2: string;
  incluyeH2: string;
  incluye: string[];
  textoH2: string;
  texto: string[];
  pasos: { titulo: string; texto: string }[];
  faq: { p: string; r: string }[];
}

export interface TextosComunesServicio {
  servicios: string;
  incluyeKicker: string;
  procesoKicker: string;
  procesoH2: string;
  faqKicker: string;
  faqH2: string;
  otrosKicker: string;
  otrosH2: string;
  verMas: string;
  cierreKicker: string;
  cierreH2: string;
  cierreTexto: string;
  cierreBoton: string;
}

export const COMUNES: Record<Idioma, TextosComunesServicio> = {
  es: {
    servicios: 'Servicios',
    incluyeKicker: 'Qué incluye',
    procesoKicker: 'Paso a paso',
    procesoH2: 'Cómo trabajamos',
    faqKicker: 'Dudas frecuentes',
    faqH2: 'Preguntas frecuentes',
    otrosKicker: 'También hago',
    otrosH2: 'Otros servicios',
    verMas: 'Ver servicio',
    cierreKicker: 'Agenda abierta',
    cierreH2: 'Cuéntame tu fecha',
    cierreTexto: 'Escríbeme con el día, el lugar y lo que tienes en mente y te respondo con disponibilidad y presupuesto.',
    cierreBoton: 'Pedir disponibilidad'
  },
  en: {
    servicios: 'Services',
    incluyeKicker: 'What is included',
    procesoKicker: 'Step by step',
    procesoH2: 'How we work together',
    faqKicker: 'Good to know',
    faqH2: 'Frequently asked questions',
    otrosKicker: 'I also do',
    otrosH2: 'Other services',
    verMas: 'See service',
    cierreKicker: 'Now booking',
    cierreH2: 'Tell me your date',
    cierreTexto: 'Send me the day, the place and what you have in mind, and I will reply with availability and a quote.',
    cierreBoton: 'Check availability'
  },
  it: {
    servicios: 'Servizi',
    incluyeKicker: 'Cosa include',
    procesoKicker: 'Passo dopo passo',
    procesoH2: 'Come lavoriamo insieme',
    faqKicker: 'Da sapere',
    faqH2: 'Domande frequenti',
    otrosKicker: 'Mi occupo anche di',
    otrosH2: 'Altri servizi',
    verMas: 'Vedi il servizio',
    cierreKicker: 'Agenda aperta',
    cierreH2: 'Raccontami la tua data',
    cierreTexto: 'Scrivimi il giorno, il luogo e cosa hai in mente: ti rispondo con disponibilità e preventivo.',
    cierreBoton: 'Chiedi disponibilità'
  },
  de: {
    servicios: 'Leistungen',
    incluyeKicker: 'Was enthalten ist',
    procesoKicker: 'Schritt für Schritt',
    procesoH2: 'So arbeiten wir zusammen',
    faqKicker: 'Gut zu wissen',
    faqH2: 'Häufige Fragen',
    otrosKicker: 'Außerdem',
    otrosH2: 'Weitere Leistungen',
    verMas: 'Zur Leistung',
    cierreKicker: 'Termine frei',
    cierreH2: 'Nenn mir dein Datum',
    cierreTexto: 'Schreib mir Tag, Ort und deine Vorstellungen, und ich antworte dir mit Verfügbarkeit und Angebot.',
    cierreBoton: 'Verfügbarkeit anfragen'
  }
};

const IMG = {
  novia: 'images/maquillaje-novia-detalle-ojos.jpg',
  novia2: 'images/maquillaje-novia-ibiza.png',
  eventos: 'images/maquillaje-invitada-fiesta-ibiza.png',
  eventos2: 'images/maquillaje-social-eventos-ibiza.png',
  editorial: 'images/maquillaje-editorial-moda-ibiza.png',
  editorial2: 'images/maquillaje-sesion-creativa-editorial.jpg',
  cine: 'images/maquillaje-cine-rodaje-ibiza.jpeg',
  cine2: 'images/maquillaje-pasarela-editorial.jpeg'
} as const;

export const SERVICIOS: Record<Idioma, Record<ServicioDetalle, TextosServicio>> = {
  es: {
    novias: {
      title: 'Maquillaje de novia en Ibiza · Makeup by Yona',
      descripcion:
        'Maquillaje de novia en Ibiza y Formentera: asesoría, prueba con fotos y maquillaje de larga duración el día de tu boda, en tu villa, hotel o finca.',
      nombre: 'Maquillaje de novia',
      insignia: 'Ibiza y Formentera',
      h1: 'Maquillaje de novia',
      h1Em: 'en Ibiza',
      intro:
        'Tu boda merece una preparación sin prisas. Diseñamos juntas un maquillaje que te represente y que aguante lágrimas, abrazos y el calor de la isla de principio a fin.',
      cta: 'Solicitar propuesta de boda',
      imagen: IMG.novia,
      alt: 'Maquillaje de novia en Ibiza con acabado luminoso',
      posicion: 'center 18%',
      imagen2: IMG.novia2,
      alt2: 'Novia maquillada para su boda en Ibiza',
      incluyeH2: 'Todo lo que necesitas para el gran día',
      incluye: [
        'Sesión previa de asesoría y visagismo personalizado.',
        'Prueba de maquillaje completa con registro fotográfico.',
        'Preparación de la piel con mascarilla hidratante antes de maquillar.',
        'Maquillaje el día de la boda donde te prepares: villa, hotel, finca o estudio.',
        'Kit de retoque de regalo para el transcurso de la celebración.'
      ],
      textoH2: 'Un maquillaje que sea tuyo y que dure',
      texto: [
        'Muchas novias que se casan en Ibiza vienen de fuera y llegan con pocos días de margen. Por eso empezamos hablando con calma: el vestido, el peinado, la hora de la ceremonia, si será al sol o al atardecer y cómo te gusta verte en tu día a día.',
        'En la prueba afinamos cada matiz de color e intensidad y lo dejamos fotografiado, para que el día de la boda no haya sorpresas. La piel se prepara antes de aplicar ningún producto y el acabado se sella para el clima de la isla: calor, brisa del mar y muchas horas de celebración.'
      ],
      pasos: [
        { titulo: 'Consulta', texto: 'Me cuentas la fecha, el lugar, el vestido y el estilo que buscas.' },
        { titulo: 'Prueba', texto: 'Probamos el maquillaje, ajustamos cada detalle y lo dejamos en fotos.' },
        { titulo: 'Preparación', texto: 'El día de la boda empiezo por la piel: hidratación y una base que dure.' },
        { titulo: 'Tu momento', texto: 'Llego puntual a tu villa, hotel o finca para que vivas la mañana con calma.' }
      ],
      faq: [
        {
          p: '¿Con cuánta antelación debo reservar?',
          r: 'Lo antes posible en cuanto tengas la fecha. Las bodas en Ibiza se concentran en temporada y cada día solo puedo atender un número limitado de novias.'
        },
        {
          p: '¿Cuándo se hace la prueba de maquillaje?',
          r: 'La fijamos juntas según tu llegada a la isla. Si vives fuera, buscamos un día cercano a la boda para que puedas hacerla sin un viaje extra.'
        },
        {
          p: '¿Te desplazas al lugar de la boda?',
          r: 'Sí. Voy a tu villa, hotel o finca en Ibiza y Formentera. También puedes prepararte en el estudio.'
        },
        {
          p: '¿Puedes maquillar también a madres, hermanas o damas de honor?',
          r: 'Sí. Dime cuántas personas sois y organizamos los horarios para que todas estéis listas a tiempo.'
        }
      ]
    },
    eventos: {
      title: 'Maquillaje para invitadas y eventos en Ibiza · Makeup by Yona',
      descripcion:
        'Maquillaje para invitadas de boda, galas, graduaciones y fiestas en Ibiza. Piel fresca, pestañas incluidas y sellado para que dure toda la noche.',
      nombre: 'Maquillaje de invitada y eventos',
      insignia: 'Social y fiesta',
      h1: 'Maquillaje para invitadas',
      h1Em: 'y eventos en Ibiza',
      intro:
        'Para invitadas de boda, galas, graduaciones y fiestas: un maquillaje sofisticado, con la piel fresca y fijado para que dure toda la velada.',
      cta: 'Reservar para mi evento',
      imagen: IMG.eventos,
      alt: 'Maquillaje de invitada para una fiesta en Ibiza',
      posicion: 'center 35%',
      imagen2: IMG.eventos2,
      alt2: 'Maquillaje social para un evento en Ibiza',
      incluyeH2: 'Lista para lucirte toda la noche',
      incluye: [
        'Diagnóstico rápido de la piel y asesoría según tu estilismo.',
        'Pestañas individuales o de tira a medida incluidas.',
        'Sellado profesional antitranspirante y fijación de larga duración.',
        'En el estudio o a domicilio, en tu casa, villa u hotel.'
      ],
      textoH2: 'Elegante, sin parecer otra persona',
      texto: [
        'El objetivo es que te veas como tu mejor versión, no disfrazada. Miro tu piel, el vestido y el tipo de evento, y elegimos juntas la intensidad: más natural para una boda de día, más marcada para una gala o una fiesta de noche.',
        'En Ibiza las celebraciones son largas y con calor, así que el maquillaje se prepara para aguantar: piel bien preparada, productos de larga duración y un sellado final que evita brillos.'
      ],
      pasos: [
        { titulo: 'Reserva', texto: 'Me dices la fecha, la hora y el tipo de evento.' },
        { titulo: 'Asesoría', texto: 'Vemos tu vestido y el estilo que te apetece.' },
        { titulo: 'Maquillaje', texto: 'Preparo la piel, maquillo y coloco las pestañas.' },
        { titulo: 'Sellado', texto: 'Fijación final para que el maquillaje dure toda la noche.' }
      ],
      faq: [
        {
          p: '¿Maquillas a varias invitadas de la misma boda?',
          r: 'Sí. Si sois un grupo, dime cuántas personas y a qué hora tenéis que estar listas y organizo el orden.'
        },
        {
          p: '¿Las pestañas están incluidas?',
          r: 'Sí, individuales o de tira, según el resultado que busques.'
        },
        {
          p: '¿Vienes a domicilio?',
          r: 'Sí, a tu casa, villa u hotel en Ibiza. También puedes venir al estudio.'
        }
      ]
    },
    editorial: {
      title: 'Maquillaje editorial y de moda en Ibiza · Makeup by Yona',
      descripcion:
        'Maquilladora para sesiones de moda, lookbooks, campañas y editoriales en Ibiza. Moodboard, retoque continuo y cambios de look por jornada o media jornada.',
      nombre: 'Maquillaje editorial y de moda',
      insignia: 'Moda y revistas',
      h1: 'Maquillaje editorial',
      h1Em: 'y de moda en Ibiza',
      intro:
        'Trabajo con fotógrafos, marcas y modelos en lookbooks, campañas y portadas, con luz de estudio o con la luz natural de la isla.',
      cta: 'Consultar tarifas por jornada',
      imagen: IMG.editorial,
      alt: 'Maquillaje editorial para una producción de moda en Ibiza',
      posicion: 'center 40%',
      imagen2: IMG.editorial2,
      alt2: 'Sesión de fotos creativa con maquillaje editorial',
      incluyeH2: 'Al servicio de la imagen',
      incluye: [
        'Desarrollo del moodboard y del concepto con el equipo.',
        'Asistencia y retoque continuo durante toda la sesión.',
        'Cambios de look rápidos entre sets de vestuario.',
        'Tarifa por jornada completa o media jornada.'
      ],
      textoH2: 'Precisión delante de la cámara',
      texto: [
        'Antes de la sesión revisamos el concepto, las referencias y la luz con la que se va a fotografiar. Así llego con la propuesta preparada y el día del shooting el tiempo se dedica a hacer fotos.',
        'Durante la sesión estoy pendiente de cada plano: retoques de brillo, cambios de look entre vestuarios y el detalle que pide un primer plano.'
      ],
      pasos: [
        { titulo: 'Briefing', texto: 'Recibo el concepto, las referencias y el plan de la jornada.' },
        { titulo: 'Moodboard', texto: 'Propongo los looks y los cerramos con el equipo.' },
        { titulo: 'Sesión', texto: 'Maquillo y retoco durante toda la producción.' },
        { titulo: 'Cambios', texto: 'Paso de un look a otro rápido entre sets.' }
      ],
      faq: [
        {
          p: '¿Trabajas por jornada o por look?',
          r: 'Por jornada completa o media jornada. Cuéntame el plan de la sesión y te envío presupuesto.'
        },
        {
          p: '¿Te desplazas a localizaciones exteriores?',
          r: 'Sí, por toda Ibiza, también en exteriores.'
        },
        {
          p: '¿Puedes encargarte de varios modelos?',
          r: 'Sí. Con el número de modelos y de looks organizo los tiempos de la jornada.'
        }
      ]
    },
    cine: {
      title: 'Maquillaje para cine, televisión y rodajes en Ibiza · Makeup by Yona',
      descripcion:
        'Maquilladora para rodajes en Ibiza: cine, televisión, videoclips y publicidad. Raccord, técnicas para cámaras 4K y 8K y rodajes en exteriores.',
      nombre: 'Maquillaje para cine y rodajes',
      insignia: 'Cine y televisión',
      h1: 'Maquillaje para cine',
      h1Em: 'y rodajes en Ibiza',
      intro:
        'Para productoras, cadenas de televisión, anuncios, videoclips y ficción: maquillaje pensado para la cámara y para mantener la continuidad de cada escena.',
      cta: 'Coordinar una producción',
      imagen: IMG.cine,
      alt: 'Maquillaje en un rodaje audiovisual en Ibiza',
      posicion: 'center center',
      imagen2: IMG.cine2,
      alt2: 'Maquillaje de pasarela con mirada protagonista',
      incluyeH2: 'Preparado para la cámara',
      incluye: [
        'Raccord y control de continuidad entre escenas.',
        'Técnicas para cámaras digitales 4K y 8K y focos de alta potencia, sin brillos.',
        'Adaptación a rodajes en exteriores, calas y barcos.',
        'Disponibilidad durante la jornada de rodaje.'
      ],
      textoH2: 'Que no se note en pantalla',
      texto: [
        'Las cámaras de alta resolución lo ven todo. El maquillaje para rodaje tiene que corregir sin que se note y mantenerse igual de una toma a otra, aunque pasen horas entre ellas.',
        'En Ibiza muchos rodajes son en exteriores, con sol, viento y agua. Adapto productos y técnicas a cada localización y llevo el control de raccord para que cada escena encaje en montaje.'
      ],
      pasos: [
        { titulo: 'Guion', texto: 'Reviso el plan de rodaje, los personajes y las escenas.' },
        { titulo: 'Pruebas', texto: 'Ajustamos el maquillaje con dirección y fotografía.' },
        { titulo: 'Rodaje', texto: 'Maquillo y retoco en el set durante toda la jornada.' },
        { titulo: 'Raccord', texto: 'Registro cada look para mantener la continuidad.' }
      ],
      faq: [
        {
          p: '¿Trabajas en rodajes de varios días?',
          r: 'Sí. Cuéntame el calendario de rodaje y el número de intérpretes y te envío disponibilidad.'
        },
        {
          p: '¿Puedes trabajar en barcos o calas?',
          r: 'Sí, preparo el maquillaje para exteriores, sol y humedad.'
        },
        {
          p: '¿Haces videoclips y publicidad?',
          r: 'Sí, además de cine, series y televisión.'
        }
      ]
    }
  },
  en: {
    novias: {
      title: 'Bridal Makeup Artist in Ibiza · Makeup by Yona',
      descripcion:
        'Bridal makeup in Ibiza and Formentera: consultation, a trial with photos and long-lasting makeup on your wedding day, at your villa, hotel or finca.',
      nombre: 'Bridal makeup',
      insignia: 'Ibiza & Formentera',
      h1: 'Bridal makeup',
      h1Em: 'in Ibiza',
      intro:
        'Your wedding deserves an unhurried morning. Together we design a look that feels like you and lasts through tears, hugs and the island heat from start to finish.',
      cta: 'Request a wedding proposal',
      imagen: IMG.novia,
      alt: 'Bridal makeup in Ibiza with a luminous finish',
      posicion: 'center 18%',
      imagen2: IMG.novia2,
      alt2: 'Bride with her wedding makeup in Ibiza',
      incluyeH2: 'Everything you need for the big day',
      incluye: [
        'A consultation and personalised face analysis beforehand.',
        'A full makeup trial, documented with photos.',
        'Skin preparation with a hydrating mask before any makeup.',
        'Makeup on the wedding day wherever you get ready: villa, hotel, finca or studio.',
        'A touch-up kit as a gift for the celebration.'
      ],
      textoH2: 'Makeup that is yours and that lasts',
      texto: [
        'Many brides who marry in Ibiza travel from abroad and arrive only a few days before. That is why we start with a calm conversation: your dress, your hair, the time of the ceremony, sun or sunset, and how you like to look every day.',
        'At the trial we fine-tune every shade and intensity and photograph the result, so there are no surprises on the day. Your skin is prepared before any product goes on, and the finish is set for the island climate: heat, sea breeze and many hours of celebration.'
      ],
      pasos: [
        { titulo: 'Consultation', texto: 'You tell me your date, venue, dress and the style you want.' },
        { titulo: 'Trial', texto: 'We try the makeup, adjust every detail and capture it in photos.' },
        { titulo: 'Preparation', texto: 'On the day I start with your skin: hydration and a base that lasts.' },
        { titulo: 'Your moment', texto: 'I arrive on time at your villa, hotel or finca so you can enjoy a calm morning.' }
      ],
      faq: [
        {
          p: 'How far in advance should I book?',
          r: 'As soon as you have your date. Ibiza weddings are concentrated in the season, and I can only take a limited number of brides each day.'
        },
        {
          p: 'When do we do the makeup trial?',
          r: 'We set it together around your arrival on the island. If you live abroad, we choose a day close to the wedding so you do not need an extra trip.'
        },
        {
          p: 'Do you travel to the wedding venue?',
          r: 'Yes. I come to your villa, hotel or finca in Ibiza and Formentera. You can also get ready at the studio.'
        },
        {
          p: 'Can you also do makeup for mothers, sisters or bridesmaids?',
          r: 'Yes. Tell me how many of you there are and I will plan the timings so everyone is ready on time.'
        }
      ]
    },
    eventos: {
      title: 'Wedding Guest & Event Makeup in Ibiza · Makeup by Yona',
      descripcion:
        'Makeup for wedding guests, galas, graduations and parties in Ibiza. Fresh skin, lashes included and a setting finish that lasts all night.',
      nombre: 'Wedding guest & event makeup',
      insignia: 'Social & party',
      h1: 'Wedding guest',
      h1Em: 'and event makeup in Ibiza',
      intro:
        'For wedding guests, galas, graduations and parties: a sophisticated look with fresh skin, set to last the whole evening.',
      cta: 'Book for my event',
      imagen: IMG.eventos,
      alt: 'Guest makeup for a party in Ibiza',
      posicion: 'center 35%',
      imagen2: IMG.eventos2,
      alt2: 'Social makeup for an event in Ibiza',
      incluyeH2: 'Ready to shine all night',
      incluye: [
        'A quick skin check and advice based on your outfit.',
        'Individual or custom strip lashes included.',
        'Professional sweat-proof setting for a long-lasting finish.',
        'At the studio or at your home, villa or hotel.'
      ],
      textoH2: 'Elegant, and still you',
      texto: [
        'The aim is for you to look like your best self, not like someone else. I look at your skin, your outfit and the kind of event, and together we choose the intensity: softer for a daytime wedding, stronger for a gala or a night party.',
        'Celebrations in Ibiza are long and warm, so the makeup is built to last: well-prepared skin, long-wear products and a final setting step that keeps shine away.'
      ],
      pasos: [
        { titulo: 'Booking', texto: 'Tell me the date, time and kind of event.' },
        { titulo: 'Advice', texto: 'We look at your outfit and the style you fancy.' },
        { titulo: 'Makeup', texto: 'I prep your skin, do your makeup and apply lashes.' },
        { titulo: 'Setting', texto: 'A final setting step so it lasts all night.' }
      ],
      faq: [
        {
          p: 'Can you do makeup for several guests at the same wedding?',
          r: 'Yes. If you are a group, tell me how many people and what time you need to be ready, and I will plan the order.'
        },
        {
          p: 'Are lashes included?',
          r: 'Yes, individual or strip lashes, depending on the look you want.'
        },
        {
          p: 'Do you come to me?',
          r: 'Yes, to your home, villa or hotel in Ibiza. You can also come to the studio.'
        }
      ]
    },
    editorial: {
      title: 'Editorial & Fashion Makeup Artist in Ibiza · Makeup by Yona',
      descripcion:
        'Makeup artist for fashion shoots, lookbooks, campaigns and editorials in Ibiza. Moodboard, on-set touch-ups and quick look changes, by the full or half day.',
      nombre: 'Editorial & fashion makeup',
      insignia: 'Fashion & magazines',
      h1: 'Editorial',
      h1Em: 'and fashion makeup in Ibiza',
      intro:
        'I work with photographers, brands and models on lookbooks, campaigns and covers, under studio lights or in the island’s natural light.',
      cta: 'Ask about day rates',
      imagen: IMG.editorial,
      alt: 'Editorial makeup for a fashion production in Ibiza',
      posicion: 'center 40%',
      imagen2: IMG.editorial2,
      alt2: 'Creative photo shoot with editorial makeup',
      incluyeH2: 'Serving the image',
      incluye: [
        'Moodboard and concept development with the team.',
        'On-set assistance and touch-ups throughout the shoot.',
        'Quick look changes between wardrobe sets.',
        'Full-day or half-day rate.'
      ],
      textoH2: 'Precision in front of the camera',
      texto: [
        'Before the shoot we go through the concept, the references and the lighting. That way I arrive with the looks ready, and on the day the time goes into taking pictures.',
        'During the shoot I watch every frame: shine control, look changes between outfits and the detail a close-up needs.'
      ],
      pasos: [
        { titulo: 'Briefing', texto: 'I receive the concept, references and plan for the day.' },
        { titulo: 'Moodboard', texto: 'I propose the looks and we agree them with the team.' },
        { titulo: 'Shoot', texto: 'Makeup and touch-ups throughout the production.' },
        { titulo: 'Changes', texto: 'Fast switches from one look to the next between sets.' }
      ],
      faq: [
        {
          p: 'Do you work by the day or by the look?',
          r: 'By the full or half day. Tell me the plan for the shoot and I will send you a quote.'
        },
        {
          p: 'Do you travel to outdoor locations?',
          r: 'Yes, anywhere in Ibiza, outdoors included.'
        },
        {
          p: 'Can you handle several models?',
          r: 'Yes. With the number of models and looks I plan the timings of the day.'
        }
      ]
    },
    cine: {
      title: 'Film, TV & Production Makeup in Ibiza · Makeup by Yona',
      descripcion:
        'Makeup artist for productions in Ibiza: film, TV, music videos and commercials. Continuity, techniques for 4K and 8K cameras and outdoor shoots.',
      nombre: 'Film & TV makeup',
      insignia: 'Film & television',
      h1: 'Film and TV makeup',
      h1Em: 'for productions in Ibiza',
      intro:
        'For production companies, TV channels, commercials, music videos and fiction: makeup made for the camera and for keeping continuity from scene to scene.',
      cta: 'Plan a production',
      imagen: IMG.cine,
      alt: 'Makeup on an audiovisual shoot in Ibiza',
      posicion: 'center center',
      imagen2: IMG.cine2,
      alt2: 'Runway makeup with a statement eye',
      incluyeH2: 'Camera-ready',
      incluye: [
        'Continuity tracking between scenes.',
        'Techniques for 4K and 8K digital cameras and high-power lights, with no shine.',
        'Adapted to outdoor shoots, coves and boats.',
        'Available throughout the shooting day.'
      ],
      textoH2: 'Invisible on screen',
      texto: [
        'High-resolution cameras see everything. Production makeup has to correct without showing, and stay the same from one take to the next, even with hours in between.',
        'Many shoots in Ibiza happen outdoors, with sun, wind and water. I adapt products and techniques to each location and keep track of continuity so every scene cuts together in the edit.'
      ],
      pasos: [
        { titulo: 'Script', texto: 'I review the shooting plan, the characters and the scenes.' },
        { titulo: 'Tests', texto: 'We fine-tune the makeup with the director and DP.' },
        { titulo: 'Shoot', texto: 'Makeup and touch-ups on set all day.' },
        { titulo: 'Continuity', texto: 'Every look is recorded to keep continuity.' }
      ],
      faq: [
        {
          p: 'Do you work on multi-day shoots?',
          r: 'Yes. Send me the shooting schedule and number of cast members and I will confirm availability.'
        },
        {
          p: 'Can you work on boats or in coves?',
          r: 'Yes, I prepare the makeup for outdoor conditions, sun and humidity.'
        },
        {
          p: 'Do you do music videos and commercials?',
          r: 'Yes, as well as film, series and television.'
        }
      ]
    }
  },
  it: {
    novias: {
      title: 'Trucco sposa a Ibiza · Makeup by Yona',
      descripcion:
        'Trucco sposa a Ibiza e Formentera: consulenza, prova con foto e trucco a lunga tenuta il giorno del matrimonio, nella tua villa, hotel o finca.',
      nombre: 'Trucco sposa',
      insignia: 'Ibiza e Formentera',
      h1: 'Trucco sposa',
      h1Em: 'a Ibiza',
      intro:
        'Il tuo matrimonio merita una preparazione senza fretta. Creiamo insieme un trucco che ti somigli e che resista a lacrime, abbracci e al caldo dell’isola dall’inizio alla fine.',
      cta: 'Richiedi una proposta',
      imagen: IMG.novia,
      alt: 'Trucco sposa a Ibiza con finish luminoso',
      posicion: 'center 18%',
      imagen2: IMG.novia2,
      alt2: 'Sposa truccata per il suo matrimonio a Ibiza',
      incluyeH2: 'Tutto ciò che serve per il grande giorno',
      incluye: [
        'Consulenza preliminare e analisi del viso personalizzata.',
        'Prova trucco completa documentata con foto.',
        'Preparazione della pelle con maschera idratante prima del trucco.',
        'Trucco il giorno del matrimonio dove ti prepari: villa, hotel, finca o studio.',
        'Kit per i ritocchi in regalo per la festa.'
      ],
      textoH2: 'Un trucco che sia tuo e che duri',
      texto: [
        'Molte spose che si sposano a Ibiza arrivano dall’estero pochi giorni prima. Per questo iniziamo con una conversazione tranquilla: l’abito, l’acconciatura, l’ora della cerimonia, sole o tramonto, e come ti piace vederti ogni giorno.',
        'Durante la prova definiamo ogni sfumatura e intensità e fotografiamo il risultato, così il giorno del matrimonio non ci sono sorprese. La pelle viene preparata prima di qualsiasi prodotto e il finish viene fissato per il clima dell’isola: caldo, brezza marina e tante ore di festa.'
      ],
      pasos: [
        { titulo: 'Consulenza', texto: 'Mi racconti data, luogo, abito e lo stile che desideri.' },
        { titulo: 'Prova', texto: 'Proviamo il trucco, regoliamo ogni dettaglio e lo fotografiamo.' },
        { titulo: 'Preparazione', texto: 'Il giorno del matrimonio parto dalla pelle: idratazione e una base che duri.' },
        { titulo: 'Il tuo momento', texto: 'Arrivo puntuale nella tua villa, hotel o finca per una mattina tranquilla.' }
      ],
      faq: [
        {
          p: 'Con quanto anticipo devo prenotare?',
          r: 'Appena hai la data. I matrimoni a Ibiza si concentrano in stagione e ogni giorno posso seguire solo un numero limitato di spose.'
        },
        {
          p: 'Quando si fa la prova trucco?',
          r: 'La fissiamo insieme in base al tuo arrivo sull’isola. Se vivi all’estero, scegliamo un giorno vicino al matrimonio per evitarti un viaggio in più.'
        },
        {
          p: 'Ti sposti sul luogo del matrimonio?',
          r: 'Sì. Vengo nella tua villa, hotel o finca a Ibiza e Formentera. Puoi anche prepararti in studio.'
        },
        {
          p: 'Puoi truccare anche mamme, sorelle o damigelle?',
          r: 'Sì. Dimmi quante siete e organizzo gli orari perché siate tutte pronte in tempo.'
        }
      ]
    },
    eventos: {
      title: 'Trucco per invitate ed eventi a Ibiza · Makeup by Yona',
      descripcion:
        'Trucco per invitate di matrimonio, gala, lauree e feste a Ibiza. Pelle fresca, ciglia incluse e fissaggio per durare tutta la notte.',
      nombre: 'Trucco per invitate ed eventi',
      insignia: 'Eventi e feste',
      h1: 'Trucco per invitate',
      h1Em: 'ed eventi a Ibiza',
      intro:
        'Per invitate di matrimonio, gala, lauree e feste: un trucco sofisticato, con la pelle fresca e fissato per durare tutta la serata.',
      cta: 'Prenota per il tuo evento',
      imagen: IMG.eventos,
      alt: 'Trucco da invitata per una festa a Ibiza',
      posicion: 'center 35%',
      imagen2: IMG.eventos2,
      alt2: 'Trucco per un evento a Ibiza',
      incluyeH2: 'Pronta a brillare tutta la notte',
      incluye: [
        'Rapida analisi della pelle e consigli in base al tuo outfit.',
        'Ciglia singole o a striscia su misura incluse.',
        'Fissaggio professionale anti-sudore a lunga tenuta.',
        'In studio o a domicilio, a casa tua, in villa o in hotel.'
      ],
      textoH2: 'Elegante, restando te stessa',
      texto: [
        'L’obiettivo è che tu sia la versione migliore di te, non un’altra persona. Guardo la tua pelle, l’abito e il tipo di evento, e scegliamo insieme l’intensità: più naturale per un matrimonio di giorno, più decisa per una gala o una festa di sera.',
        'A Ibiza le feste sono lunghe e calde, quindi il trucco è pensato per durare: pelle ben preparata, prodotti a lunga tenuta e un fissaggio finale contro la lucidità.'
      ],
      pasos: [
        { titulo: 'Prenotazione', texto: 'Mi dici data, ora e tipo di evento.' },
        { titulo: 'Consigli', texto: 'Guardiamo l’outfit e lo stile che preferisci.' },
        { titulo: 'Trucco', texto: 'Preparo la pelle, trucco e applico le ciglia.' },
        { titulo: 'Fissaggio', texto: 'Un fissaggio finale per durare tutta la notte.' }
      ],
      faq: [
        {
          p: 'Trucchi più invitate dello stesso matrimonio?',
          r: 'Sì. Se siete un gruppo, dimmi quante persone e a che ora dovete essere pronte e organizzo l’ordine.'
        },
        {
          p: 'Le ciglia sono incluse?',
          r: 'Sì, singole o a striscia, in base al risultato che cerchi.'
        },
        {
          p: 'Vieni a domicilio?',
          r: 'Sì, a casa tua, in villa o in hotel a Ibiza. Puoi anche venire in studio.'
        }
      ]
    },
    editorial: {
      title: 'Trucco editoriale e moda a Ibiza · Makeup by Yona',
      descripcion:
        'Truccatrice per servizi di moda, lookbook, campagne ed editoriali a Ibiza. Moodboard, ritocchi sul set e cambi di look, a giornata o mezza giornata.',
      nombre: 'Trucco editoriale e moda',
      insignia: 'Moda e riviste',
      h1: 'Trucco editoriale',
      h1Em: 'e moda a Ibiza',
      intro:
        'Lavoro con fotografi, brand e modelle per lookbook, campagne e copertine, con luce da studio o con la luce naturale dell’isola.',
      cta: 'Chiedi le tariffe a giornata',
      imagen: IMG.editorial,
      alt: 'Trucco editoriale per una produzione di moda a Ibiza',
      posicion: 'center 40%',
      imagen2: IMG.editorial2,
      alt2: 'Servizio fotografico creativo con trucco editoriale',
      incluyeH2: 'Al servizio dell’immagine',
      incluye: [
        'Sviluppo del moodboard e del concept con il team.',
        'Assistenza e ritocchi continui per tutto lo shooting.',
        'Cambi di look rapidi tra un set e l’altro.',
        'Tariffa a giornata intera o mezza giornata.'
      ],
      textoH2: 'Precisione davanti all’obiettivo',
      texto: [
        'Prima dello shooting rivediamo il concept, le referenze e la luce. Così arrivo con i look già pronti e il giorno della produzione il tempo va tutto nelle foto.',
        'Durante lo shooting seguo ogni scatto: controllo della lucidità, cambi di look tra un outfit e l’altro e la cura che richiede un primo piano.'
      ],
      pasos: [
        { titulo: 'Briefing', texto: 'Ricevo concept, referenze e programma della giornata.' },
        { titulo: 'Moodboard', texto: 'Propongo i look e li definiamo con il team.' },
        { titulo: 'Shooting', texto: 'Trucco e ritocchi per tutta la produzione.' },
        { titulo: 'Cambi', texto: 'Passaggi veloci da un look all’altro tra i set.' }
      ],
      faq: [
        {
          p: 'Lavori a giornata o a look?',
          r: 'A giornata intera o mezza giornata. Raccontami il programma dello shooting e ti mando un preventivo.'
        },
        {
          p: 'Ti sposti in location esterne?',
          r: 'Sì, in tutta Ibiza, anche all’aperto.'
        },
        {
          p: 'Puoi seguire più modelle?',
          r: 'Sì. In base al numero di modelle e di look organizzo i tempi della giornata.'
        }
      ]
    },
    cine: {
      title: 'Trucco per cinema, TV e riprese a Ibiza · Makeup by Yona',
      descripcion:
        'Truccatrice per riprese a Ibiza: cinema, televisione, videoclip e pubblicità. Continuità, tecniche per camere 4K e 8K e riprese in esterni.',
      nombre: 'Trucco per cinema e TV',
      insignia: 'Cinema e televisione',
      h1: 'Trucco per cinema',
      h1Em: 'e riprese a Ibiza',
      intro:
        'Per case di produzione, canali TV, spot, videoclip e fiction: un trucco pensato per la camera e per mantenere la continuità tra le scene.',
      cta: 'Organizza una produzione',
      imagen: IMG.cine,
      alt: 'Trucco su un set audiovisivo a Ibiza',
      posicion: 'center center',
      imagen2: IMG.cine2,
      alt2: 'Trucco da passerella con sguardo protagonista',
      incluyeH2: 'Pronto per la camera',
      incluye: [
        'Controllo della continuità tra le scene.',
        'Tecniche per camere digitali 4K e 8K e luci ad alta potenza, senza lucidità.',
        'Adattamento a riprese in esterni, calette e barche.',
        'Disponibilità per tutta la giornata di riprese.'
      ],
      textoH2: 'Invisibile sullo schermo',
      texto: [
        'Le camere ad alta risoluzione vedono tutto. Il trucco per le riprese deve correggere senza farsi notare e restare uguale da un ciak all’altro, anche a distanza di ore.',
        'A Ibiza molte riprese sono in esterni, con sole, vento e acqua. Adatto prodotti e tecniche a ogni location e seguo la continuità perché ogni scena funzioni al montaggio.'
      ],
      pasos: [
        { titulo: 'Copione', texto: 'Studio il piano di lavorazione, i personaggi e le scene.' },
        { titulo: 'Prove', texto: 'Regoliamo il trucco con regia e direzione della fotografia.' },
        { titulo: 'Riprese', texto: 'Trucco e ritocchi sul set per tutta la giornata.' },
        { titulo: 'Continuità', texto: 'Documento ogni look per mantenere la continuità.' }
      ],
      faq: [
        {
          p: 'Lavori su riprese di più giorni?',
          r: 'Sì. Mandami il calendario e il numero di interpreti e ti confermo la disponibilità.'
        },
        {
          p: 'Puoi lavorare su barche o calette?',
          r: 'Sì, preparo il trucco per esterni, sole e umidità.'
        },
        {
          p: 'Fai anche videoclip e pubblicità?',
          r: 'Sì, oltre a cinema, serie e televisione.'
        }
      ]
    }
  },
  de: {
    novias: {
      title: 'Braut-Make-up auf Ibiza · Makeup by Yona',
      descripcion:
        'Braut-Make-up auf Ibiza und Formentera: Beratung, Probe-Make-up mit Fotos und langanhaltendes Make-up am Hochzeitstag in deiner Villa, deinem Hotel oder deiner Finca.',
      nombre: 'Braut-Make-up',
      insignia: 'Ibiza und Formentera',
      h1: 'Braut-Make-up',
      h1Em: 'auf Ibiza',
      intro:
        'Deine Hochzeit verdient einen Morgen ohne Eile. Gemeinsam entwerfen wir ein Make-up, das zu dir passt und Tränen, Umarmungen und die Hitze der Insel vom ersten bis zum letzten Moment übersteht.',
      cta: 'Hochzeitsangebot anfragen',
      imagen: IMG.novia,
      alt: 'Braut-Make-up auf Ibiza mit strahlendem Finish',
      posicion: 'center 18%',
      imagen2: IMG.novia2,
      alt2: 'Braut mit ihrem Hochzeits-Make-up auf Ibiza',
      incluyeH2: 'Alles für deinen großen Tag',
      incluye: [
        'Vorgespräch mit persönlicher Gesichtsanalyse.',
        'Vollständiges Probe-Make-up, mit Fotos festgehalten.',
        'Hautvorbereitung mit feuchtigkeitsspendender Maske vor dem Schminken.',
        'Make-up am Hochzeitstag dort, wo du dich fertig machst: Villa, Hotel, Finca oder Studio.',
        'Ein Touch-up-Set als Geschenk für die Feier.'
      ],
      textoH2: 'Ein Make-up, das zu dir gehört und hält',
      texto: [
        'Viele Bräute, die auf Ibiza heiraten, reisen aus dem Ausland an und sind nur wenige Tage vorher auf der Insel. Deshalb beginnen wir mit einem ruhigen Gespräch: dein Kleid, deine Frisur, die Uhrzeit der Trauung, Sonne oder Sonnenuntergang und wie du dich im Alltag am liebsten siehst.',
        'Beim Probe-Make-up stimmen wir jede Nuance und Intensität ab und fotografieren das Ergebnis, damit es am Hochzeitstag keine Überraschungen gibt. Die Haut wird vor jedem Produkt vorbereitet, und das Finish wird für das Inselklima fixiert: Hitze, Meeresbrise und viele Stunden Feier.'
      ],
      pasos: [
        { titulo: 'Gespräch', texto: 'Du erzählst mir Datum, Ort, Kleid und den Stil, den du dir wünschst.' },
        { titulo: 'Probe', texto: 'Wir testen das Make-up, passen jedes Detail an und halten es in Fotos fest.' },
        { titulo: 'Vorbereitung', texto: 'Am Hochzeitstag beginne ich mit der Haut: Feuchtigkeit und eine Basis, die hält.' },
        { titulo: 'Dein Moment', texto: 'Ich komme pünktlich in deine Villa, dein Hotel oder deine Finca, damit du den Morgen genießen kannst.' }
      ],
      faq: [
        {
          p: 'Wie früh sollte ich buchen?',
          r: 'Sobald du dein Datum hast. Hochzeiten auf Ibiza konzentrieren sich auf die Saison, und ich kann pro Tag nur eine begrenzte Zahl von Bräuten betreuen.'
        },
        {
          p: 'Wann findet das Probe-Make-up statt?',
          r: 'Wir legen es gemeinsam nach deiner Ankunft auf der Insel fest. Wenn du im Ausland lebst, wählen wir einen Tag kurz vor der Hochzeit, damit du keine zusätzliche Reise brauchst.'
        },
        {
          p: 'Kommst du zum Hochzeitsort?',
          r: 'Ja. Ich komme in deine Villa, dein Hotel oder deine Finca auf Ibiza und Formentera. Du kannst dich auch im Studio fertig machen.'
        },
        {
          p: 'Kannst du auch Mütter, Schwestern oder Brautjungfern schminken?',
          r: 'Ja. Sag mir, wie viele ihr seid, und ich plane die Zeiten so, dass alle rechtzeitig fertig sind.'
        }
      ]
    },
    eventos: {
      title: 'Make-up für Hochzeitsgäste und Events auf Ibiza · Makeup by Yona',
      descripcion:
        'Make-up für Hochzeitsgäste, Galas, Abschlussfeiern und Partys auf Ibiza. Frische Haut, Wimpern inklusive und eine Fixierung, die die ganze Nacht hält.',
      nombre: 'Make-up für Gäste und Events',
      insignia: 'Events und Partys',
      h1: 'Make-up für Hochzeitsgäste',
      h1Em: 'und Events auf Ibiza',
      intro:
        'Für Hochzeitsgäste, Galas, Abschlussfeiern und Partys: ein raffiniertes Make-up mit frischer Haut, fixiert für den ganzen Abend.',
      cta: 'Für mein Event buchen',
      imagen: IMG.eventos,
      alt: 'Gäste-Make-up für eine Party auf Ibiza',
      posicion: 'center 35%',
      imagen2: IMG.eventos2,
      alt2: 'Make-up für ein Event auf Ibiza',
      incluyeH2: 'Bereit, die ganze Nacht zu strahlen',
      incluye: [
        'Kurze Hautanalyse und Beratung passend zu deinem Outfit.',
        'Einzelwimpern oder maßgeschneiderte Wimpernbänder inklusive.',
        'Professionelle, schweißresistente Fixierung für langen Halt.',
        'Im Studio oder bei dir zu Hause, in der Villa oder im Hotel.'
      ],
      textoH2: 'Elegant und trotzdem du',
      texto: [
        'Ziel ist, dass du wie die beste Version von dir aussiehst, nicht wie jemand anderes. Ich schaue mir deine Haut, dein Outfit und den Anlass an, und gemeinsam wählen wir die Intensität: natürlicher für eine Hochzeit am Tag, ausdrucksstärker für eine Gala oder eine Party am Abend.',
        'Feiern auf Ibiza dauern lange und es ist warm, deshalb ist das Make-up auf Halt ausgelegt: gut vorbereitete Haut, langanhaltende Produkte und eine abschließende Fixierung gegen Glanz.'
      ],
      pasos: [
        { titulo: 'Buchung', texto: 'Du nennst mir Datum, Uhrzeit und Anlass.' },
        { titulo: 'Beratung', texto: 'Wir schauen uns dein Outfit und deinen Wunschstil an.' },
        { titulo: 'Make-up', texto: 'Ich bereite die Haut vor, schminke und setze die Wimpern.' },
        { titulo: 'Fixierung', texto: 'Eine finale Fixierung, damit alles die ganze Nacht hält.' }
      ],
      faq: [
        {
          p: 'Schminkst du mehrere Gäste derselben Hochzeit?',
          r: 'Ja. Wenn ihr eine Gruppe seid, sag mir, wie viele Personen und bis wann ihr fertig sein müsst, und ich plane die Reihenfolge.'
        },
        {
          p: 'Sind Wimpern inklusive?',
          r: 'Ja, Einzelwimpern oder Wimpernbänder, je nach gewünschtem Ergebnis.'
        },
        {
          p: 'Kommst du zu mir?',
          r: 'Ja, zu dir nach Hause, in die Villa oder ins Hotel auf Ibiza. Du kannst auch ins Studio kommen.'
        }
      ]
    },
    editorial: {
      title: 'Editorial- und Mode-Make-up auf Ibiza · Makeup by Yona',
      descripcion:
        'Visagistin für Modeshootings, Lookbooks, Kampagnen und Editorials auf Ibiza. Moodboard, Touch-ups am Set und schnelle Look-Wechsel, als Tages- oder Halbtagessatz.',
      nombre: 'Editorial- und Mode-Make-up',
      insignia: 'Mode und Magazine',
      h1: 'Editorial-',
      h1Em: 'und Mode-Make-up auf Ibiza',
      intro:
        'Ich arbeite mit Fotografen, Marken und Models an Lookbooks, Kampagnen und Covern, im Studiolicht oder im natürlichen Licht der Insel.',
      cta: 'Tagessätze anfragen',
      imagen: IMG.editorial,
      alt: 'Editorial-Make-up für eine Modeproduktion auf Ibiza',
      posicion: 'center 40%',
      imagen2: IMG.editorial2,
      alt2: 'Kreatives Fotoshooting mit Editorial-Make-up',
      incluyeH2: 'Im Dienst des Bildes',
      incluye: [
        'Entwicklung von Moodboard und Konzept mit dem Team.',
        'Betreuung und Touch-ups während des gesamten Shootings.',
        'Schnelle Look-Wechsel zwischen den Outfits.',
        'Tagessatz oder Halbtagessatz.'
      ],
      textoH2: 'Präzision vor der Kamera',
      texto: [
        'Vor dem Shooting gehen wir Konzept, Referenzen und Licht durch. So komme ich mit fertigen Looks, und am Produktionstag fließt die Zeit in die Fotos.',
        'Während des Shootings achte ich auf jedes Bild: Glanzkontrolle, Look-Wechsel zwischen den Outfits und das Detail, das eine Nahaufnahme braucht.'
      ],
      pasos: [
        { titulo: 'Briefing', texto: 'Ich bekomme Konzept, Referenzen und Tagesplan.' },
        { titulo: 'Moodboard', texto: 'Ich schlage die Looks vor und wir stimmen sie im Team ab.' },
        { titulo: 'Shooting', texto: 'Make-up und Touch-ups während der ganzen Produktion.' },
        { titulo: 'Wechsel', texto: 'Schnelle Übergänge von einem Look zum nächsten.' }
      ],
      faq: [
        {
          p: 'Arbeitest du pro Tag oder pro Look?',
          r: 'Als Tages- oder Halbtagessatz. Schick mir den Plan des Shootings und ich sende dir ein Angebot.'
        },
        {
          p: 'Kommst du auch an Außenlocations?',
          r: 'Ja, überall auf Ibiza, auch im Freien.'
        },
        {
          p: 'Kannst du mehrere Models betreuen?',
          r: 'Ja. Anhand der Zahl der Models und Looks plane ich den Ablauf des Tages.'
        }
      ]
    },
    cine: {
      title: 'Make-up für Film, TV und Drehs auf Ibiza · Makeup by Yona',
      descripcion:
        'Visagistin für Drehs auf Ibiza: Film, Fernsehen, Musikvideos und Werbung. Continuity, Techniken für 4K- und 8K-Kameras und Außendrehs.',
      nombre: 'Make-up für Film und TV',
      insignia: 'Film und Fernsehen',
      h1: 'Make-up für Film',
      h1Em: 'und Drehs auf Ibiza',
      intro:
        'Für Produktionsfirmen, TV-Sender, Werbespots, Musikvideos und Fiction: ein Make-up für die Kamera, das die Continuity von Szene zu Szene hält.',
      cta: 'Produktion planen',
      imagen: IMG.cine,
      alt: 'Make-up bei einem Dreh auf Ibiza',
      posicion: 'center center',
      imagen2: IMG.cine2,
      alt2: 'Laufsteg-Make-up mit ausdrucksstarkem Blick',
      incluyeH2: 'Bereit für die Kamera',
      incluye: [
        'Continuity-Kontrolle zwischen den Szenen.',
        'Techniken für digitale 4K- und 8K-Kameras und starke Scheinwerfer, ohne Glanz.',
        'Angepasst an Außendrehs, Buchten und Boote.',
        'Verfügbar während des gesamten Drehtags.'
      ],
      textoH2: 'Unsichtbar auf dem Bildschirm',
      texto: [
        'Hochauflösende Kameras sehen alles. Make-up für den Dreh muss korrigieren, ohne aufzufallen, und von einem Take zum nächsten gleich bleiben, auch wenn Stunden dazwischen liegen.',
        'Viele Drehs auf Ibiza finden draußen statt, mit Sonne, Wind und Wasser. Ich passe Produkte und Techniken an jede Location an und dokumentiere die Continuity, damit jede Szene im Schnitt passt.'
      ],
      pasos: [
        { titulo: 'Drehbuch', texto: 'Ich prüfe Drehplan, Figuren und Szenen.' },
        { titulo: 'Tests', texto: 'Wir stimmen das Make-up mit Regie und Kamera ab.' },
        { titulo: 'Dreh', texto: 'Make-up und Touch-ups am Set, den ganzen Tag.' },
        { titulo: 'Continuity', texto: 'Jeder Look wird dokumentiert, damit die Continuity stimmt.' }
      ],
      faq: [
        {
          p: 'Arbeitest du bei mehrtägigen Drehs?',
          r: 'Ja. Schick mir Drehplan und Zahl der Darsteller, und ich bestätige dir die Verfügbarkeit.'
        },
        {
          p: 'Kannst du auf Booten oder in Buchten arbeiten?',
          r: 'Ja, ich bereite das Make-up auf Außenbedingungen, Sonne und Feuchtigkeit vor.'
        },
        {
          p: 'Machst du auch Musikvideos und Werbung?',
          r: 'Ja, außerdem Film, Serien und Fernsehen.'
        }
      ]
    }
  }
};
