/**
 * Datos del titular que exigen el aviso legal (LSSI art. 10), la politica de
 * privacidad (RGPD art. 13) y las condiciones de venta. Estan aqui para que
 * se rellenen en un solo sitio: las tres paginas los leen de esta constante.
 *
 * Los campos a null se muestran como "pendiente de completar" hasta tenerlos.
 */
export interface DatosLegales {
  titular: string;
  nombreComercial: string;
  nif: string | null;
  domicilio: string | null;
  email: string;
  telefono: string;
  web: string;
  /** Empresa que aloja el servidor (encargada del tratamiento). */
  alojamiento: string | null;
  /** Proveedor del correo saliente (SMTP). */
  correo: string | null;
}

export const DATOS_LEGALES: DatosLegales = {
  titular: 'Yonaida Belhuman',
  nombreComercial: 'Makeup by Yona',
  nif: null,
  domicilio: null,
  email: 'info@makeupbyyona.es',
  telefono: '+34 658 728 433',
  web: 'https://makeupbyyona.es',
  alojamiento: null,
  correo: null
};

export const PENDIENTE = 'pendiente de completar';

/** Fecha de la ultima revision de los textos legales. */
export const REVISION_LEGAL = 'noviembre de 2026';
