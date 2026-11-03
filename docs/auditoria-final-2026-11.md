# Análisis final de makeupbyyona.es: seguridad, legal, accesibilidad y SEO

Fecha: 3 de noviembre de 2026. Rama revisada: `main` tras mergear `seo-mejoras` (PR #31) y
`mejora-diseno` (commit `a032eee`).

Método: lectura del código, `npm audit`, tests del frontend (155) y del backend (47), Lighthouse
12.8.2 en móvil sobre 15 páginas del build prerenderizado (servido en local con la misma
negociación AVIF/WebP que Nginx), rastreo de los 1.515 enlaces internos de las 49 páginas
prerenderizadas, validación de todo el JSON-LD y comparación del inventario SEO antes y después.
No se ha probado contra el servidor de producción, que todavía no tiene este código desplegado.

La parte legal es una revisión técnica, no asesoramiento jurídico.

## Resumen

| Área | Estado | Lo más urgente |
|---|---|---|
| Seguridad | Buena. 0 vulnerabilidades en lo que se publica | Vídeos del curso en YouTube y compras de invitado sin verificar correo |
| Legal | Mucho mejor; quedan huecos de datos y de contenido | Domicilio en el aviso legal, "valores" tachados en /oferta, testimonios y cifras sin verificar |
| Accesibilidad | Lighthouse 100 en las 15 páginas medidas | Subtítulos en los vídeos de /oferta |
| SEO | Técnicamente completo. SEO 100 en todas las públicas | Desplegar: producción sigue con el SPA antiguo (canonical "/" en todas las páginas) |

## 1. Seguridad

### Resuelto desde la auditoría anterior
- **S1** Angular actualizado: `npm audit --omit=dev` da **0 vulnerabilidades** en lo que llega al navegador.
- **S2 (en parte)** Content-Security-Policy con hashes en las 50 páginas HTML (`scripts/csp.mjs`).
- **S6** Contraseñas filtradas rechazadas en registro y restablecimiento (`AuthController::noFiltrada`).
- **S7** `server_tokens off` en Nginx.
- **S8** Asunto del correo de contacto saneado (`MensajeContacto::limpiar`).
- Nuevo: login, registro y restablecer contraseña ya muestran el error (antes, sin Zone.js, un
  login fallido se quedaba en "Accediendo..."). El formulario de contacto confirma el envío.

### Pendiente
| Prioridad | Hallazgo | Solución |
|---|---|---|
| Medio | **S3** El vídeo del curso es un enlace de YouTube (`seeders`): quien compra puede compartirlo y la caducidad de 6 meses no lo protege. | Vimeo con dominio restringido, Bunny Stream o Mux con URLs firmadas. |
| Medio | **S4** El registro no verifica el correo (`MustVerifyEmail` comentado) y `AltaDeCompra` asocia la compra de invitado a la cuenta con ese correo. | Verificar el correo o dejar el acceso pendiente hasta confirmarlo. |
| Medio | **S2** El token de sesión sigue en `localStorage`. La CSP reduce el riesgo, pero un XSS lo podría leer. | Aceptable con la CSP actual; a medio plazo, cookie `HttpOnly`. |
| Bajo | **S5** `POST /api/pedidos` responde 409 a un invitado si ese correo ya compró: revela compras ajenas. | Comprobar "ya comprado" solo con sesión. |
| Bajo | 16 avisos "moderate" en dependencias de desarrollo (`glob`/`minimatch` vía `@angular/cli`). No se publican. | Se resuelven al subir a Angular CLI 22. |
| Info | **S9** `composer audit` sin ejecutar: Composer no está instalado en este equipo. | Ejecutarlo en el servidor. |
| Info | El PHP local no tiene la extensión `openssl`: 1 test del backend falla por eso (46/47). | Solo afecta a este equipo. |

## 2. Legal

### Resuelto
- **L1** Aviso legal con titular (Yonaida Douhri Belhuman), NIF, email y teléfono.
- **L2** Condiciones de venta, doble casilla con renuncia expresa al desistimiento (art. 103.m TRLGDCU)
  en /oferta y /cursos, "IVA incluido" junto al precio.
- **L3** Política de privacidad con Stripe, Google, OpenStreetMap, YouTube, WhatsApp, transferencias a
  EE. UU. (Marco de Privacidad UE-EE. UU.) y plazos de conservación.
- **L4** Fuentes autoalojadas, mapa solo tras un clic, aviso de cookies informativo y política de
  cookies con lo que de verdad se guarda.
- **L5** Información básica de protección de datos bajo el formulario de contacto y en la compra.
- Nuevo: la Certificación Pro dice con claridad que no está a la venta ("Aún no disponible",
  inscripciones cerradas, "precio previsto"), sin sugerir que se puede comprar.

### Pendiente
| Prioridad | Hallazgo | Solución |
|---|---|---|
| Alto | **Domicilio** del titular sin rellenar: el aviso legal muestra "pendiente de completar" (LSSI art. 10 exige una dirección; puede ser la fiscal). Alojamiento y correo ya indicados (Hostinger). | Completar `domicilio` en `shared/datos-legales.ts`. |
| Alto | **"Valores" tachados en /oferta**: "Valor 120 €" y "Valor 35 €" junto a un curso de 55 €. Si esos importes no se han cobrado nunca, es un anclaje de precio que la Ley de Competencia Desleal puede considerar engañoso. | Quitar los importes o sustituirlos por lo que incluye cada parte. |
| Alto | **L6 Testimonios y cifras**: los 3 testimonios están escritos en el código y no se ha confirmado que sean reales. Las cifras no cuadran: "+500 clientas" en inicio y "+150 novias" en sobre mí. | Confirmar y demostrar, o quitar. Mejor reseñas reales de Google con permiso. |
| Medio | **L7** Precio tachado de la masterclass cuando hay oferta: solo es correcto si 55 € se ha cobrado antes. | Si no, "Precio de lanzamiento" sin tachar. |
| Medio | **L11** Los artículos del blog y las páginas en inglés, italiano y alemán los redacté yo con su voz. | Que Yonaida los lea antes de publicar. |
| Bajo | **L8** Derecho de imagen de clientas y modelos de las fotos. **L9** IVA OSS y factura del curso. | Consentimientos por escrito; confirmar con el gestor. |

## 3. Accesibilidad

Lighthouse (móvil): **100** en inicio, servicios, cursos, contacto, sobre mí, oferta, blog, un artículo,
una página de servicio, login, aviso legal, privacidad y las versiones /en y /de. Antes iban de 90 a 96.

### Resuelto
- **A1** Pausa del vídeo, las partículas y el pase de fotos; arranca en pausa con reducir movimiento.
- **A3** Contrastes: hovers en dorado sobre blanco pasados a cobre; pie a `white/70`.
- **A4** `<main>` y enlace "Saltar al contenido".
- **A5** Menú móvil con `aria-expanded`, foco al abrir y Escape que devuelve el foco.
- **A6** Errores y confirmaciones con `role="alert"`/`role="status"`; errores de cada campo con
  `aria-describedby` y `aria-invalid`; el foco va al primer error.
- **A7** Botones y puntos del carrusel de 44 px o más.
- Nuevo: visor de fotos como diálogo modal (foco atrapado, flechas, Escape); carrusel con botones
  enfocables; transiciones y apariciones respetan `prefers-reduced-motion`.

### Pendiente
| Prioridad | Hallazgo | Solución |
|---|---|---|
| Alto | **A2** Los vídeos de /oferta tienen controles y sonido pero ningún `<track>` de subtítulos (WCAG 1.2.2). Comprobar también los del curso. | Subtítulos WebVTT. |
| Bajo | **A8** Quedan 5 textos por debajo de 12 px (`text-[10px]`, `0.52rem`, `0.58rem`), sobre todo en el lema de la cabecera en móvil. | Subir a 12 px como mínimo. |

## 4. SEO

### Estado técnico (verificado sobre el build)
- 49 URLs en el sitemap, robots.txt abierto, privadas con `noindex` (login sale con SEO 58 en
  Lighthouse precisamente por eso, y es lo correcto).
- 1.515 enlaces internos rastreados: 0 rotos (el único aviso es `/mis-cursos`, privada y no
  prerenderizada a propósito).
- JSON-LD válido en todas las páginas: negocio, persona, sitio, 20 `Service`, 10 `BlogPosting`
  (con `articleSection` y `dateModified`), migas de pan.
- Ninguna imagen social apunta a un archivo inexistente.
- Comparado con el inventario previo: ningún title, description, canonical, robots, hreflang ni URL
  ha cambiado con el rediseño. Solo hay más encabezados en el blog y dos imágenes sociales nuevas.

### Resuelto desde la auditoría anterior
E2 (página por servicio en cuatro idiomas), E3 (cifras en el HTML), E4 (favicon e iconos), E7
(nombres de imagen y TikTok en `sameAs`), E10 (`Service`), E11 (fecha caducable). Además, el blog
ampliado con categorías, resumen, índice y enlaces a cada servicio, y una guía de lectura para novias.

### Pendiente
| Prioridad | Hallazgo | Solución |
|---|---|---|
| **Crítico** | **Producción no tiene nada de esto.** Sigue el SPA antiguo: mismo title y canonical "/" en todas las URL, og:image `yonaida2.PNG`, robots bloqueando /oferta, formulario de contacto que no confirma el envío. | Desplegar `main` (`deploy/deploy.sh`) y pedir reindexación en Search Console. |
| Alto | **E1** Ficha de Google Business Profile y reseñas reales. | Fuera del código. |
| Medio | **E9** Precios orientativos: el hueco "desde X €" ya está en las tarjetas de la portada (`desde: null` en `inicio.ts`). | Rellenar las cifras. |
| Medio | **E5/E6/E8** Bodas reales como portfolio, presencia en directorios de bodas y artículos en inglés, italiano y alemán. | Contenido. |

## 5. Siguientes pasos, en orden

1. Desplegar `main` en producción y comprobar Search Console.
2. Completar el domicilio en `datos-legales.ts`.
3. Quitar los "Valor X €" tachados de /oferta y decidir el precio tachado de la masterclass.
4. Confirmar testimonios y la cifra de clientas, o retirarlos.
5. Subtítulos en los vídeos de /oferta.
6. Mover los vídeos del curso a un alojamiento con dominio restringido.
7. Verificación de correo en el registro.
8. Ficha de Google y reseñas.
