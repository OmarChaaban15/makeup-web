// Entorno de produccion (makeupbyyona.es).
//
// La API se sirve bajo el mismo dominio a traves de Nginx, asi que basta
// con una ruta relativa: evita problemas de CORS y de certificado, y
// permite cambiar de dominio sin recompilar.
export const environment = {
  production: true,
  apiUrl: '/api'
};
