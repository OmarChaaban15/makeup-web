# Auditoría de makeupbyyona.es: seguridad, accesibilidad, legal y SEO

Fecha: 2 de noviembre de 2026. Rama revisada: `seo-mejoras` (commit `2844f39`).

Método: lectura del código del backend (Laravel) y del frontend (Angular), configuración de Nginx,
`npm audit` de las dependencias, Lighthouse 12 (accesibilidad, buenas prácticas y SEO) sobre ocho
páginas del build prerenderizado servido en local, y revisión manual de los textos legales y de los
formularios. No se ha probado contra el servidor real ni se ha ejecutado `composer audit` (Composer
no está instalado en este equipo).

La parte legal es una revisión técnica, no asesoramiento jurídico: conviene validarla con un
abogado o gestor antes de publicar los textos.

Prioridades: **Crítico** (riesgo legal o de seguridad inmediato), **Alto**, **Medio**, **Bajo**.

## Resumen

| Área | Estado | Lo más urgente |
|---|---|---|
| Seguridad | Buena base, dos huecos importantes | Actualizar Angular (avisos de XSS) y añadir Content-Security-Policy |
| Accesibilidad | Lighthouse 90 a 100, fallos de fondo | Movimiento automático sin pausa, vídeos sin subtítulos, contraste |
| Legal | Es el área más débil | Falta aviso legal, condiciones de venta y renuncia al desistimiento; privacidad y cookies no reflejan la realidad |
| SEO | Técnicamente sólido (SEO 100 en Lighthouse) | Ficha de Google y reseñas, páginas por servicio, contadores "+0" en el HTML |

## 1. Seguridad

### Lo que está bien
- Webhook de Stripe con verificación de firma, idempotencia por `event.id` y rechazo si falta el secreto.
- Límites de peticiones por ruta (login 5/min por IP y email, correo 3/min, escritura pública 10/min).
- `forgot-password` no revela si la cuenta existe; el cambio de contraseña revoca todos los tokens.
- Plantilla de producción con `APP_DEBUG=false`, `LOG_LEVEL=error` y cookies de sesión seguras.
- CORS cerrado a los dominios propios, sin comodines.
- Precios calculados en el servidor; el frontend no decide lo que se cobra.
- Correos de contacto con los datos escapados (`htmlspecialchars`); sin `{!! !!}` en vistas.
- Cabeceras HSTS, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy` y `Permissions-Policy`.
- No hay ningún `.env` real en el repositorio.

### Hallazgos

**S1. Alto. Angular 21.2.16 con avisos de seguridad publicados.**
`npm audit` marca `@angular/core`, `compiler`, `common`, `router` y `platform-server` (hasta 21.2.19 o 21.2.24)
con varios avisos, entre ellos XSS por saltarse el saneado en enlaces bidireccionales (GHSA-58w9-8g37-x9v5)
y XSS en el renderizado en servidor (GHSA-vpx6-8pjr-4g3v, GHSA-v3p8-whq6-r5jg). La web ahora prerenderiza,
así que los avisos de SSR aplican.
Solución: subir todos los paquetes `@angular/*` y `@angular/ssr` a la última 21.2.x a la vez y volver a
pasar build y tests. Del resto de avisos (vite, postcss, esbuild, nanoid, immutable), la mayoría son de las
herramientas de compilación y del servidor de desarrollo, no del código que se publica; se resuelven con el
mismo `npm audit fix`.

**S2. Alto. No hay Content-Security-Policy y el token de sesión vive en `localStorage`.**
`shared/auth.service.ts` guarda el token Sanctum en `localStorage`; cualquier XSS lo puede leer. Sin CSP no
hay segunda barrera.
Solución: añadir una CSP en Nginx. Con Angular hay que permitir los scripts propios con hash o nonce (Angular
ofrece CSP automática por hashes para builds estáticos; hay que verificar la opción en la documentación de
Angular 21 antes de activarla) y los orígenes que la web usa de verdad: `translate.google.com` y
`translate.googleapis.com` (traductor), `fonts.googleapis.com`/`fonts.gstatic.com` (mientras no se
autoalojen las fuentes, ver L4), `*.tile.openstreetmap.org` (mapa), `www.youtube.com` o el proveedor de
vídeo de los cursos (`frame-src`). Empezar con `Content-Security-Policy-Report-Only` una semana.

**S3. Medio. Los vídeos de los cursos son enlaces de YouTube.**
El seeder usa `https://www.youtube.com/embed/...` y `mis-cursos` lo incrusta. Quien compra puede copiar la URL
y compartirla, y la caducidad de 6 meses (`accesos_tutorial.expira_en`) deja de tener efecto: el vídeo
sigue visible para cualquiera con el enlace.
Solución: un alojamiento con restricción de dominio o URLs firmadas (Vimeo con privacidad "solo
incrustado en mi dominio", Bunny Stream o Mux con tokens). Es lo que protege el producto que se vende.

**S4. Medio. Registro sin verificación de correo y compras de invitado asociadas por email.**
`AltaDeCompra::cuentaPara` (`backend/app/Services/AltaDeCompra.php:80`) entrega el curso a la cuenta que
ya exista con ese correo. Como el registro no verifica el email (`MustVerifyEmail` está comentado en
`User.php`), alguien puede registrar el correo de otra persona y quedarse con el acceso cuando esa persona
compre como invitada.
Solución: verificar el correo en el registro, o asociar compras solo a cuentas verificadas y, si la cuenta
no lo está, crear el acceso pendiente hasta que se confirme.

**S5. Bajo. Se puede saber si un email ha comprado o tiene cuenta.**
`POST /api/pedidos` responde 409 "Ya tienes acceso a este curso" a cualquiera que escriba un correo ajeno
(`PedidoController::yaTieneAcceso`), y el registro dice "Ya existe una cuenta con este correo".
Solución: hacer la comprobación de "ya comprado" solo con sesión iniciada; para invitados, dejar que el
webhook evite el duplicado.

**S6. Bajo. Contraseñas débiles permitidas.** Solo se exige `min:8`. Usar
`Password::min(8)->uncompromised()` para rechazar contraseñas filtradas.

**S7. Bajo. Detalles de Nginx.** Añadir `server_tokens off;`. Valorar `limit_req` en `/api/auth` como
segunda capa delante de Laravel.

**S8. Bajo. Asunto del correo de contacto sin limpiar.** `MensajeContacto` mete el nombre en el asunto sin la
función `limpiar` que sí usa `CitaReservada`. Symfony Mailer impide la inyección de cabeceras, pero conviene
alinear ambos.

**S9. Pendiente.** Ejecutar `composer audit` en el servidor (no se ha podido aquí).

## 2. Accesibilidad

Lighthouse (móvil): portada 92, servicios 95, sobre mí 95, cursos 96, oferta 96, blog 96, contacto 100,
login 90. Lighthouse solo detecta una parte de los problemas; lo siguiente sale de revisar el código.

**A1. Alto. Movimiento automático sin forma de pararlo (WCAG 2.2.2).**
La portada tiene vídeo en bucle, partículas animadas en un canvas y un carrusel de testimonios que avanza
solo (`inicio.ts`, `startAutoPlay`). Ninguno tiene botón de pausa y el carrusel y las partículas no
respetan `prefers-reduced-motion`.
Solución: botón de pausa visible para vídeo y carrusel, detener el carrusel al recibir foco o al pasar el
ratón, y desactivar partículas y autoavance con `prefers-reduced-motion: reduce`. El vídeo se sigue
sirviendo completo (política de medios); solo se añade el control.

**A2. Alto. Vídeos con sonido sin subtítulos (WCAG 1.2.2).**
Los dos vídeos de `/oferta` (día y noche) tienen botón de sonido y ningún `<track>`. Lo mismo hay que
comprobar en los vídeos del curso.
Solución: subtítulos en WebVTT (`<track kind="captions" srclang="es">`).

**A3. Medio. Contraste insuficiente.**
Lighthouse lo marca en 7 de 8 páginas: gris `#888` sobre fondo claro, dorado `#c4956a`/`#9c6e45` en textos
pequeños y, sin detectar por Lighthouse, el pie con `text-white/25` sobre `#1a1a1a` (copyright, privacidad,
cookies), muy por debajo de 4,5:1.
Solución: oscurecer los grises a `#666` o más, usar el dorado solo en textos grandes o sobre fondo oscuro y
subir el pie a `text-white/60` como mínimo.

**A4. Medio. Sin región principal ni enlace para saltar al contenido (WCAG 2.4.1).**
Solo `contacto` usa `<main>`; `app.html` envuelve el `router-outlet` en un `<div>`.
Solución: `<main id="contenido">` en `app.html` y un enlace "Saltar al contenido" visible al recibir foco.
Después, quitar el `<main>` interno de contacto para no duplicarlo.

**A5. Medio. Estados de componentes interactivos sin anunciar.**
El botón del menú móvil no tiene `aria-expanded` ni `aria-controls`; el menú de idiomas y el de usuario
tampoco. El banner de cookies no es un `role="dialog"` ni recibe el foco.
Solución: añadir los atributos y mover el foco al abrir y al cerrar.

**A6. Medio. Mensajes de formularios que no se anuncian (WCAG 4.1.3).**
Los errores y confirmaciones de contacto, login, registro y compra aparecen sin `aria-live` ni
`role="alert"`, así que un lector de pantalla no los lee.

**A7. Bajo. Objetivos táctiles pequeños (WCAG 2.5.8).** Los puntos del carrusel (`h-2`) y el botón de mostrar
contraseña.

**A8. Bajo. Texto muy pequeño.** Muchas etiquetas a 0,6 a 0,7 rem (unos 10 px) en mayúsculas con mucho
espaciado; difíciles de leer en móvil.

**A9. Bajo. Nombre accesible distinto del texto visible** en el botón de idioma de `/oferta`
(`aria-label="Seleccionar idioma"` mientras muestra "ES").

Marco legal: la Ley 11/2023 (transposición de la Directiva Europea de Accesibilidad) obliga desde junio de
2025 a los servicios de comercio electrónico, pero exime a las microempresas que prestan servicios. Si el
negocio es una microempresa, no es obligatoria, aunque sigue siendo recomendable y es buena práctica
publicar una declaración de accesibilidad.

## 3. Legal

**L1. Crítico. No hay aviso legal (LSSI, art. 10).**
La web vende y debe identificar al titular: nombre (Yonaida Belhuman o la sociedad), NIF, domicilio (puede
ser el fiscal), email de contacto y, si aplica, datos registrales. Hoy solo consta "Makeup by Yona, con
domicilio en España".
Solución: página `/aviso-legal` enlazada en el pie y en la oferta.

**L2. Crítico. Venta de cursos sin condiciones de contratación ni renuncia al desistimiento.**
- No existen condiciones generales de venta: precio, impuestos, forma de pago, duración del acceso (6 meses),
  requisitos técnicos, soporte, reclamaciones.
- Para contenido digital, la consumidora conserva 14 días de desistimiento salvo que, antes de empezar,
  dé su **consentimiento expreso** a la ejecución inmediata y **reconozca** que pierde ese derecho
  (art. 103.m TRLGDCU), y eso se le confirme por escrito. Hoy el checkbox de compra solo menciona la
  política de privacidad (`oferta.html:1000`, `cursos.html:225`). Tal como está, puede pedir el reembolso
  dentro de los 14 días aunque haya visto el curso.
- El precio no indica "IVA incluido" (el precio a consumidores debe ser final).
- El registro pide aceptar "las condiciones del servicio" (`registro.html:163`), que no existen.
Solución: página `/condiciones` y, en la compra, un segundo checkbox obligatorio del tipo "Solicito acceso
inmediato al curso y reconozco que pierdo el derecho de desistimiento", más la confirmación en el
justificante (`JustificanteCompra`). Confirmar con el gestor el tratamiento del IVA y la factura.

**L3. Alto. La política de privacidad no refleja lo que hace la web.**
`politica-privacidad.html`:
- Responsable sin identificar (falta nombre, NIF, dirección y un email para ejercer derechos; remite al
  formulario).
- Faltan finalidades reales: venta de cursos, cuenta de usuario, justificante de compra, avisos de
  caducidad del acceso, reseñas.
- Faltan los proveedores: Stripe (pagos), proveedor de correo, alojamiento, YouTube o el proveedor de
  vídeo, Google (fuentes y traductor), OpenStreetMap (mapa), WhatsApp/Meta si se usa para atender.
- Transferencias internacionales: Stripe y Google están en EE. UU. y hay que indicar la garantía (por
  ejemplo, el Marco de Privacidad de Datos UE-EE. UU.).
- Conservación genérica: hay que dar plazos (por ejemplo, datos de facturación 6 años por el Código de
  Comercio).
- Habla de cookies analíticas que la web no usa.

**L4. Alto. Cookies: el banner no corresponde a la realidad.**
- El banner ofrece aceptar cookies analíticas y de marketing, pero la web no carga ninguna herramienta de
  analítica ni de publicidad.
- En cambio, sí se contacta con terceros sin pedir permiso: las fuentes se descargan de `fonts.gstatic.com`
  (Google recibe la IP de cada visita) y el mapa de contacto carga teselas de OpenStreetMap.
- No hay una política de cookies propia con la lista de lo que se guarda (token de sesión y consentimiento
  en `localStorage`, cookie `googtrans` del traductor, cookies de YouTube en la zona de alumnas).
Solución: autoalojar las fuentes (elimina la transferencia a Google y mejora el rendimiento), cargar el mapa
solo tras un clic, usar `youtube-nocookie.com` o el nuevo proveedor de vídeo, simplificar el banner a lo que
de verdad existe y redactar `/politica-cookies`. Si en el futuro se añade analítica, entonces sí el banner
con aceptar y rechazar al mismo nivel (que ya lo hace).

**L5. Alto. El formulario de contacto no informa de la protección de datos.**
`contacto.html` recoge nombre, email, teléfono y mensaje sin la información básica (responsable,
finalidad, derechos, enlace a la política) que exigen el art. 13 RGPD y el art. 11 LOPDGDD en el momento de la
recogida. Añadir un texto breve bajo el botón de envío.

**L6. Alto (verificar). Testimonios y cifras.**
Los tres testimonios de la portada están fijos en el código (`inicio.ts:51`), uno de ellos de una "alumna
de la masterclass" que acaba de salir. Los contadores dicen "+500 clientas" y "+150 novias y eventos".
Tienen que ser reales y demostrables: las reseñas falsas son una práctica prohibida y hay que informar de si
las reseñas están verificadas y cómo (Directiva Ómnibus, transpuesta por el RDL 24/2021). Lo más seguro es
mostrar reseñas reales de Google o de clientas con su permiso y decir de dónde vienen.

**L7. Medio. Precio tachado.**
`/oferta` y `/cursos` muestran 55 € tachado junto a 45 €. Si 55 € todavía no se ha cobrado nunca, presentarlo
como precio anterior puede considerarse engañoso (Ley 3/1991 de Competencia Desleal). Es más seguro "Precio
de lanzamiento: 45 €. Después, 55 €" sin tachar, hasta que el precio de 55 € se haya aplicado.

**L8. Medio. Derecho de imagen.** Las fotos de clientas y modelos se usan con fines comerciales: hace falta su
consentimiento por escrito (LO 1/1982 y RGPD), también en Instagram y en el blog.

**L9. Bajo. Fiscalidad del curso.** El curso online vendido a particulares de otros países de la UE puede
tributar en el país de la clienta (régimen OSS) a partir de 10.000 € anuales de ventas a la UE. Hay que
emitir factura, no solo justificante. Confirmar con el gestor.

**L10. Información.** Ya no hace falta enlazar la plataforma europea de resolución de litigios en línea (se
cerró en julio de 2025). Comprobar con el gestor las obligaciones de hojas de reclamaciones en Baleares para
venta online.

**L11. Revisión de textos.** Los artículos del blog y las páginas en inglés, italiano y alemán los redacté yo
con la voz de Yonaida. Debe leerlos ella antes de publicarlos: cualquier afirmación de su experiencia tiene que
ser cierta.

## 4. SEO para el sector (maquillaje de novia y eventos en Ibiza)

### Punto de partida
SEO técnico en buen estado: HTML prerenderizado, un H1 por página, canonical, hreflang en cuatro idiomas,
datos estructurados (negocio, persona, servicios, curso, artículos), sitemap automático, 404 real, imágenes
AVIF y WebP. Lighthouse SEO: 100 en todas las páginas públicas.

El sector se decide sobre todo en la búsqueda local (mapa de Google) y en la búsqueda de novias extranjeras
que planean una boda de destino con meses de antelación, en su idioma y buscando fotos.

**E1. Alto. Ficha de Google Business Profile y reseñas reales.**
Para "maquilladora Ibiza" o "maquillaje novia Ibiza" manda el bloque del mapa, que depende de la ficha. Crearla
como negocio con zona de servicio, categoría de maquillador/a, fotos reales cada mes y una petición de reseña
a cada clienta. Nota: Google no muestra estrellas en los resultados para reseñas que una empresa publica de sí
misma en su web, así que el valor de las reseñas está en la ficha y en la confianza, no en el marcado.

**E2. Alto. Una página por servicio, en cada idioma.**
Hoy todos los servicios comparten `/servicios`. Las búsquedas son específicas: "maquillaje de novia Ibiza",
"maquillaje invitada boda Ibiza", "bridal makeup Ibiza", "Braut Make-up Ibiza", "trucco sposa Ibiza". Crear
páginas propias para novias (la más importante), eventos e invitadas, y editorial y rodajes, con su propio H1,
fotos, preguntas frecuentes y llamada a la acción, y enlazarlas entre idiomas con hreflang.

**E3. Alto. Corregir los contadores "+0".**
El HTML prerenderizado de la portada y de sobre mí dice "+0 Años", "+0 Clientas" y "0% A medida" (Google y
cualquiera sin JavaScript lo ven así), y en la portada la animación solo arranca al pasar el ratón, que en
móvil no ocurre. Pintar las cifras finales en el HTML y animar solo en el navegador.

**E4. Alto. Favicon roto en todas las páginas.**
`index.html` enlaza `logo/my_logo.png`, que no existe (404 en cada visita; Lighthouse lo marca como error de
consola). Google muestra el favicon junto al resultado en móvil. Crear el PNG (al menos 48x48, cuadrado) y
añadir `apple-touch-icon` y un `manifest`.

**E5. Medio. Bodas reales como portfolio.**
Una página por boda o sesión (con permiso de la pareja): lugar, estilo, fotógrafo acreditado con enlace. Atrae
búsquedas por lugar y estilo, genera enlaces de fotógrafos y planificadoras y alimenta Pinterest.

**E6. Medio. Enlaces y presencia en el sector.**
Perfiles en directorios de bodas españoles e internacionales (por ejemplo Bodas.net, Zankyou o Hitched para el
mercado británico), colaboración con planificadoras, fincas y fotógrafos de Ibiza, y el mismo nombre, teléfono y
web en todos ellos.

**E7. Medio. Imágenes.**
Nombres de archivo descriptivos (`IMG_1.PNG` no dice nada a Google Imágenes), una imagen para redes por página
de servicio y, en el negocio, añadir el TikTok `@byyonai` a `sameAs` (ya está enlazado en el pie).

**E8. Medio. Contenido con calendario.**
Las novias buscan entre 6 y 12 meses antes de la boda: publicar en invierno y primavera. Hay un solo artículo en
inglés y ninguno en alemán o italiano, que son los mercados de bodas de destino; ampliar ahí.

**E9. Medio. Precios orientativos.**
"Precio maquilladora novia Ibiza" es una búsqueda frecuente. Un "desde X €" por servicio responde a esa
intención y permite añadir `priceRange` al negocio.

**E10. Bajo. Datos estructurados adicionales.**
`openingHoursSpecification` cuando haya horario con horas, `VideoObject` para los vídeos públicos y `Service`
en cada página de servicio. Las preguntas frecuentes siguen siendo útiles como contenido, aunque Google ya no
muestra resultados enriquecidos de FAQ para este tipo de webs.

**E11. Bajo. Fecha que caduca.**
"Agenda abierta 2026" aparece en las cuatro versiones de servicios y faltan dos meses para 2027.

**E12. Oportunidad de negocio.** Muchas novias buscan "hair and makeup Ibiza". Si hay una peluquera de
confianza, un paquete de peinado y maquillaje abre esa búsqueda.

## 5. Plan de trabajo propuesto

| Orden | Tarea | Área | Esfuerzo |
|---|---|---|---|
| 1 | Actualizar Angular a la última 21.2.x y `npm audit fix` | Seguridad | Bajo |
| 2 | Aviso legal, condiciones de venta, checkbox de desistimiento e "IVA incluido" | Legal | Medio (textos a validar) |
| 3 | Reescribir privacidad y crear política de cookies; aviso en el formulario de contacto | Legal | Medio |
| 4 | Autoalojar fuentes, mapa tras clic, banner acorde | Legal y rendimiento | Bajo |
| 5 | Verificar testimonios y cifras; precio tachado | Legal | Bajo (decisión del negocio) |
| 6 | Favicon, contadores "+0", `sameAs` con TikTok, "Agenda 2026" | SEO | Bajo |
| 7 | Content-Security-Policy (primero en modo informe) y `server_tokens off` | Seguridad | Medio |
| 8 | Pausa de vídeo y carrusel, reduced-motion, `<main>` y enlace de salto, ARIA, `aria-live`, contraste | Accesibilidad | Medio |
| 9 | Verificación de correo y compras de invitado | Seguridad | Medio |
| 10 | Vídeos de curso con dominio restringido; subtítulos | Seguridad y accesibilidad | Medio |
| 11 | Ficha de Google y campaña de reseñas | SEO | Fuera del código |
| 12 | Páginas por servicio en cuatro idiomas y bodas reales | SEO | Alto |
