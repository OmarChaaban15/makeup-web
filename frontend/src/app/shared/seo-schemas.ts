import type { Curso } from './cursos.service';

/**
 * Datos del negocio para el marcado schema.org. Solo lo que la web ya
 * muestra publicamente: no hay direccion postal ni reseñas verificables,
 * asi que no se publican PostalAddress con calle, geo, AggregateRating ni
 * Review.
 */
export const SITIO = {
  origen: 'https://makeupbyyona.es',
  nombre: 'Makeup by Yona',
  titular: 'Yonaida Belhuman',
  telefono: '+34658728433',
  email: 'info@makeupbyyona.es',
  // Solo el perfil publico. El otro (@yonadobe) es privado y no aporta
  // nada a un buscador.
  sameAs: ['https://www.instagram.com/byyonai'],
  imagenOg: '/images/og-makeup-by-yona.jpg'
} as const;

const ID_NEGOCIO = `${SITIO.origen}/#negocio`;
const ID_PERSONA = `${SITIO.origen}/#yonaida`;
const ID_WEB = `${SITIO.origen}/#web`;

const IBIZA = { '@type': 'AdministrativeArea', name: 'Ibiza, Islas Baleares, España' };

export function url(ruta: string): string {
  return ruta === '/' ? `${SITIO.origen}/` : `${SITIO.origen}${ruta}`;
}

/** Negocio, titular y sitio web. Va en la portada. */
export function schemaNegocio(): object {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'HealthAndBeautyBusiness',
        '@id': ID_NEGOCIO,
        name: SITIO.nombre,
        description:
          'Maquilladora profesional en Ibiza: novias, eventos, moda y editorial, audiovisual y cursos de maquillaje.',
        url: url('/'),
        image: url(SITIO.imagenOg),
        telephone: SITIO.telefono,
        email: SITIO.email,
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Ibiza',
          addressRegion: 'Islas Baleares',
          addressCountry: 'ES'
        },
        areaServed: IBIZA,
        founder: { '@id': ID_PERSONA },
        sameAs: SITIO.sameAs
      },
      {
        '@type': 'Person',
        '@id': ID_PERSONA,
        name: SITIO.titular,
        givenName: 'Yonaida',
        familyName: 'Belhuman',
        jobTitle: 'Maquilladora profesional',
        url: url('/sobre-mi'),
        image: url('/images/yonaida.jpg'),
        worksFor: { '@id': ID_NEGOCIO },
        sameAs: SITIO.sameAs
      },
      {
        '@type': 'WebSite',
        '@id': ID_WEB,
        url: url('/'),
        name: SITIO.nombre,
        inLanguage: 'es-ES',
        publisher: { '@id': ID_NEGOCIO }
      }
    ]
  };
}

/** Los cuatro servicios que describe /servicios. */
export function schemaServicios(): object {
  const servicios = [
    ['Maquillaje de novia', 'Prueba de maquillaje, asesoría previa y maquillaje de boda en Ibiza con acabado de larga duración.'],
    ['Maquillaje para eventos y social', 'Maquillaje profesional para eventos, invitadas y celebraciones en Ibiza.'],
    ['Maquillaje de moda y editorial', 'Maquillaje para sesiones de moda, editoriales y campañas.'],
    ['Maquillaje para cine y rodajes', 'Maquillaje para producciones audiovisuales y rodajes.']
  ];

  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: servicios.map(([name, description], i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Service',
        name,
        description,
        serviceType: name,
        areaServed: IBIZA,
        provider: { '@id': ID_NEGOCIO }
      }
    }))
  };
}

export function schemaMigas(migas: { nombre: string; ruta: string }[]): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: migas.map((miga, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: miga.nombre,
      item: url(miga.ruta)
    }))
  };
}

/** Curso con el importe que el servidor cobraria ahora mismo. */
export function schemaCurso(curso: Curso, ruta: string): object {
  const descripcion = curso.descripcion_corta ?? curso.descripcion_larga ?? curso.titulo;

  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: curso.titulo,
    description: descripcion,
    inLanguage: 'es',
    url: url(ruta),
    ...(curso.miniatura_url ? { image: curso.miniatura_url } : {}),
    provider: { '@id': ID_NEGOCIO },
    offers: {
      '@type': 'Offer',
      category: 'Paid',
      price: Number(curso.precio_efectivo).toFixed(2),
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
      url: url(ruta)
    }
  };
}
