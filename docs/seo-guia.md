# SEO: guia de puesta en marcha y seguimiento

Este documento recoge lo que no vive en el codigo: que desplegar, como darlo de alta en
los buscadores, la ficha de Google, el plan de contenidos y como medir. Lo implementado en
el codigo esta resumido en la seccion 1.

## 1. Que hay implementado

| Area | Donde |
|---|---|
| Un H1 por pagina y sin saltos de nivel | plantillas de `frontend/src/app/pages/`; lo vigila `seo-encabezados.spec.ts` |
| title, description, canonical, robots, Open Graph, Twitter, JSON-LD por ruta | `shared/seo.service.ts` y `data.seo` en `app.routes.ts` |
| Datos estructurados (negocio, persona, servicios, curso, migas) | `shared/seo-schemas.ts` |
| Paginas privadas con `noindex` (no bloqueadas en robots) | `data.seo.noindex` |
| Prerender de las paginas publicas | `outputMode: static` en `angular.json`, `app.routes.server.ts` |
| 404 real y rutas por Nginx | `deploy/nginx/makeupbyyona.es.conf` |
| Version en ingles bajo `/en` con hreflang | `pages/en/`, `shared/idioma.ts` |
| `robots.txt` abierto y `sitemap.xml` generado en cada build | `public/robots.txt`, `scripts/generar-sitemap.mjs` |

## 2. Antes de desplegar

1. Instalar el Nginx nuevo. Sin las reglas nuevas, `/en/...` y las rutas prerenderizadas no
   se sirven bien:

   ```bash
   sudo cp deploy/nginx/makeupbyyona.es.conf /etc/nginx/sites-available/makeupbyyona.es.conf
   sudo nginx -t && sudo systemctl reload nginx
   ```

2. Desplegar con `deploy/deploy.sh`. El build prerenderiza y genera `sitemap.xml` solo
   (necesita `git` en el servidor para los `lastmod`).
3. Comprobar (ver tambien la seccion 11 de `deploy/README.md`):

   ```bash
   curl -sI https://makeupbyyona.es/inicio              # 301 a /
   curl -sI https://makeupbyyona.es/esta-no-existe      # 404
   curl -s  https://makeupbyyona.es/servicios | grep -o "<h1[^>]*>"
   curl -s  https://makeupbyyona.es/en/services | grep -o 'hreflang="[a-z-]*"'
   curl -s  https://makeupbyyona.es/sitemap.xml | head
   ```

Nota: `/oferta` y la zona privada se renderizan en el navegador (no se prerenderizan).
`/oferta` depende por completo del curso que devuelve la API, que no esta disponible al
compilar. Google la indexa ejecutando JavaScript, como antes. Si algun dia hace falta
HTML estatico, hay dos caminos: pintar el contenido fijo de la pagina sin esperar a la API,
o consultar la API durante el build.

## 3. Google Search Console

1. Entrar en <https://search.google.com/search-console> y añadir la propiedad de tipo
   **Dominio** (`makeupbyyona.es`). Se verifica con un registro TXT en el DNS.
2. Menu **Sitemaps**: enviar `https://makeupbyyona.es/sitemap.xml`. Debe aparecer como
   "Correcto" con 11 URLs descubiertas.
3. Menu **Inspeccion de URLs**: pegar cada pagina clave (`/`, `/servicios`, `/sobre-mi`,
   `/cursos`, `/oferta`, `/contacto`, `/en`, `/en/services`) y pulsar "Solicitar
   indexacion". Comprobar en "Ver pagina probada" que el HTML renderizado trae el H1 y
   que el canonical es el esperado.
4. Para Bing: <https://www.bing.com/webmasters> permite importar la propiedad desde
   Search Console.

Que revisar y cuando:

| Cuando | Que mirar |
|---|---|
| 7 dias | Paginas indexadas (informe Indexacion), errores de sitemap, que `/login`, `/registro` y `/mis-cursos` aparezcan como "Excluida por etiqueta noindex" (es lo correcto) |
| 30 dias | Rendimiento: consultas con "maquilladora Ibiza", "maquillaje novia Ibiza"; paginas con impresiones pero pocos clics (reescribir title y description) |
| 90 dias | Informe de resultados enriquecidos (Course, migas), Core Web Vitals con datos de campo, consultas en ingles |

## 4. Ficha de Google Business Profile

La ficha da visibilidad en Google Maps y en las busquedas locales. Como no hay direccion
publica, se configura como **negocio con zona de servicio** (no muestra direccion).

- **Nombre:** `Makeup by Yona`, exactamente igual que en la web y en Instagram.
- **Categoria principal:** la de maquillador/a profesional; elegir en el desplegable la
  opcion exacta disponible en español. Secundarias: las que ofrezca la lista para novias,
  eventos y formacion.
- **Zona de servicio:** Ibiza (y Formentera si se trabaja alli).
- **Telefono y web:** `+34 658 728 433` y `https://makeupbyyona.es`. Mismo formato en
  todos los sitios (NAP coherente).
- **Servicios:** maquillaje de novia, invitada y eventos, moda y editorial, cine y
  rodajes, masterclass de automaquillaje.
- **Descripcion (borrador, maximo 750 caracteres):**
  "Maquilladora profesional en Ibiza con mas de cinco años de experiencia en bodas de
  destino, eventos, moda y producciones audiovisuales. Pieles luminosas y duraderas
  adaptadas al clima mediterraneo, en mi estudio o en tu villa, hotel o finca. Tambien
  imparto una masterclass de automaquillaje online."
- **Fotos:** trabajos reales (novias, eventos, editorial), sin logos ni texto encima, y
  una portada. Subir fotos nuevas cada mes.
- **Reseñas:** pedir una reseña a cada clienta tras el servicio con el enlace corto de la
  ficha, y responder a todas. Cuando haya reseñas reales y visibles en la web, se podran
  añadir al marcado schema (`AggregateRating`/`Review`); hasta entonces no deben
  publicarse en el JSON-LD.

## 5. Datos que faltan

Cada uno mejora el SEO cuando se pueda aportar:

- Direccion publica del estudio o confirmacion de que no habra (cambia el schema a
  `PostalAddress` con calle y `geo`).
- Horario con horas concretas (hoy solo "Lunes a Sabado, con cita previa").
- Reseñas reales con permiso para mostrarlas, y menciones en prensa o colaboraciones
  (marcas, fotografos, planificadores de bodas) que se puedan citar.
- Revisar el pie de pagina: `@yonadobe` es un perfil privado y esta enlazado.
- Actualizar el texto "Agenda abierta 2026" cuando cambie el año.

## 6. Plan de contenidos (blog)

Hoy no hay seccion de blog. Seria una fase aparte (rutas `/blog/...`, prerender y entrada en
el sitemap). Estos diez articulos atacan busquedas de intencion alta y enlazan a las
paginas que convierten. Los terminos son hipotesis a validar en Search Console, no datos de
volumen.

| # | Titulo | Palabra clave principal | Secundarias | Enlaza a |
|---|---|---|---|---|
| 1 | Cuanto cuesta una maquilladora de novia en Ibiza | maquillaje novia Ibiza precio | maquilladora novia Ibiza, presupuesto maquillaje boda | `/servicios`, `/contacto` |
| 2 | La prueba de maquillaje de novia: que es y cuando hacerla | prueba maquillaje novia | cuanto antes de la boda, que llevar a la prueba | `/servicios` |
| 3 | Maquillaje de novia con calor: como conseguir que dure | maquillaje novia calor | maquillaje resistente al sudor, boda en la playa | `/servicios` |
| 4 | Como elegir maquilladora para tu boda en Ibiza: 10 preguntas | maquilladora boda Ibiza | maquillaje a domicilio Ibiza | `/servicios`, `/contacto` |
| 5 | Maquillaje de invitada de boda segun tu vestido | maquillaje invitada boda | maquillaje de fiesta, pestañas para evento | `/servicios` |
| 6 | Rutina de piel los 7 dias antes de un evento | preparar la piel antes de maquillarse | piel luminosa, hidratacion antes del maquillaje | `/cursos` |
| 7 | Tono de piel y base: como saber si eres calida, fria o neutra | tono de piel base maquillaje | fototipo, colores que favorecen | `/cursos`, `/oferta` |
| 8 | Del maquillaje de dia al de noche en 5 minutos | maquillaje de dia a noche | transformar maquillaje, retoque rapido | `/oferta` |
| 9 | Boda de destino en Ibiza: checklist de belleza | boda de destino Ibiza | calendario belleza boda, novias extranjeras | `/servicios`, `/en` |
| 10 | Bridal makeup in Ibiza: what to expect for a destination wedding (en ingles) | bridal makeup Ibiza | destination wedding makeup, wedding makeup artist Ibiza | `/en/services`, `/en/contact` |

Reglas: cada articulo con un H1 unico, H2 por apartado, fotos propias con alt descriptivo,
enlace interno al servicio relacionado y fecha de actualizacion visible. Evitar promesas
(duracion garantizada, resultados) que no se puedan sostener.

## 7. Medicion tecnica

Las fotos y el video de portada se sirven a calidad completa y sin diferir (politica del
proyecto), asi que el trabajo de rendimiento se centra en lo demas. Medir antes de tocar:

```bash
npx lighthouse https://makeupbyyona.es/ --only-categories=performance,seo --form-factor=mobile --view
npx lighthouse https://makeupbyyona.es/servicios --only-categories=performance,seo --form-factor=mobile --view
```

Puntos a vigilar, sin cambiar el contenido visual:

- **LCP:** la imagen o el video de portada. `fetchpriority="high"` y `decoding="async"`
  estan permitidos; WebM/AVIF como `<source>` extra con el original de respaldo tambien.
- **CLS:** imagenes con `width` y `height` (o `aspect-ratio`) para reservar el espacio.
- **INP:** el canvas de particulas y los listeners de `mousemove` de la portada.
- **Bundle inicial:** el build avisa de que supera el presupuesto de 700 kB. Cargar en
  diferido el codigo de paginas poco visitadas (como ya se hace con el ingles y Leaflet)
  lo reduce sin tocar medios.

Hasta que haya una medicion, estos puntos son hipotesis; no se han medido.
