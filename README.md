# Makeup by Yona

Web de **Makeup by Yona**, el atelier de maquillaje de Yonaida Belhuman en Ibiza:
[makeupbyyona.es](https://makeupbyyona.es).

Escaparate de los servicios (novias, invitadas y eventos, editorial y moda, cine y TV), reserva de
cita por formulario o WhatsApp, blog, versiones en inglés, italiano y alemán y una pequeña academia
online con venta de cursos por Stripe.

| Capa | Tecnología |
|---|---|
| Frontend | Angular 21 (standalone, signals, sin Zone.js) · TypeScript 5 · Tailwind CSS 4 · Vitest |
| Renderizado | Prerender estático de las páginas públicas (`outputMode: static`) |
| Backend | Laravel 13 · PHP 8.3 o superior · API REST con tokens Sanctum |
| Base de datos | MySQL 8 (SQLite vale para desarrollo) |
| Pagos | Stripe Checkout y webhook |
| Servidor | Nginx sirve el frontend y la API desde el mismo dominio |

---

## Índice

1. [Estructura del repositorio](#estructura-del-repositorio)
2. [Puesta en marcha en local](#puesta-en-marcha-en-local)
3. [Variables de entorno](#variables-de-entorno)
4. [Pagos con Stripe en local](#pagos-con-stripe-en-local)
5. [Comandos habituales](#comandos-habituales)
6. [Tareas de contenido](#tareas-de-contenido)
7. [Calidad: tests, SEO y accesibilidad](#calidad-tests-seo-y-accesibilidad)
8. [Despliegue](#despliegue)
9. [Documentación](#documentación)

---

## Estructura del repositorio

```
makeup-web/
├── backend/            API Laravel (rutas en routes/api.php, prefijo /api)
│   ├── app/            Controladores, modelos, correos, servicios (AltaDeCompra, PasarelaPago)
│   ├── database/       Migraciones y DatabaseSeeder
│   └── tests/          PHPUnit (SQLite en memoria)
├── frontend/           SPA Angular con prerender
│   ├── public/         Fotos, vídeos, iconos (cada foto con su copia .avif y .webp)
│   ├── scripts/        Sitemap, CSP, formatos de imagen e iconos (se ejecutan en el build)
│   └── src/app/
│       ├── pages/      Una carpeta por página (inicio, servicios, servicio, cursos, blog...)
│       ├── shared/     Cabecera, pie, aviso de cookies, barra de reserva, SEO, textos, servicios
│       └── blog/       articulos.json y su lógica
├── deploy/             Nginx, systemd y deploy.sh del servidor de producción
└── docs/               Guía SEO y auditorías
```

Las dos aplicaciones son independientes: cada una se instala, se arranca y se prueba desde su carpeta.

---

## Puesta en marcha en local

### Requisitos

- **PHP 8.3 o superior** con las extensiones `openssl`, `mbstring`, `xml`, `curl`, `zip`, `bcmath`,
  `pdo_mysql` (o `pdo_sqlite`) y `fileinfo`.
- **Composer 2**.
- **Node.js 22 LTS** o superior y npm.
- **MySQL 8**, o SQLite si solo quieres probar.

<details>
<summary>Instalar los requisitos en Ubuntu 22.04 o superior</summary>

```bash
sudo apt update && sudo apt install -y curl git unzip software-properties-common

# PHP 8.4 y extensiones
sudo add-apt-repository ppa:ondrej/php -y && sudo apt update
sudo apt install -y php8.4-cli php8.4-fpm php8.4-mysql php8.4-sqlite3 php8.4-xml \
  php8.4-mbstring php8.4-curl php8.4-zip php8.4-bcmath php8.4-gd

# Composer
curl -sS https://getcomposer.org/installer | php && sudo mv composer.phar /usr/local/bin/composer

# MySQL 8
sudo apt install -y mysql-server && sudo systemctl enable --now mysql

# Node.js 22
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash - && sudo apt install -y nodejs
```

Base de datos y usuario para desarrollo:

```sql
CREATE DATABASE makeup_web CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'makeup'@'localhost' IDENTIFIED BY 'una_contraseña';
GRANT ALL PRIVILEGES ON makeup_web.* TO 'makeup'@'localhost';
FLUSH PRIVILEGES;
```

</details>

### 1. Backend

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
```

Rellena la base de datos en `.env` (`DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`). Para probar sin
MySQL basta con SQLite:

```env
DB_CONNECTION=sqlite
DB_DATABASE=database/database.sqlite
```

```bash
touch database/database.sqlite   # solo con SQLite
php artisan migrate --seed       # crea las tablas y la masterclass de ejemplo
php artisan serve                # API en http://localhost:8000
```

`composer dev` arranca a la vez la API, la cola, el visor de logs (`pail`) y Vite.

Con `MAIL_MAILER=log` (el valor por defecto) los correos no se envían: se escriben en
`storage/logs/laravel.log`.

### 2. Frontend

En otra terminal:

```bash
cd frontend
npm install
npm start                        # http://localhost:4200
```

En desarrollo el frontend llama a `http://localhost:8000/api` (`src/environments/environment.ts`).
En producción usa `/api`, porque Nginx sirve la web y la API desde el mismo dominio. Las URL de la
API se construyen siempre desde `environment.apiUrl`.

---

## Variables de entorno

Todas están documentadas en `backend/.env.example`. Las que importan:

| Variable | Para qué sirve |
|---|---|
| `APP_URL`, `FRONTEND_URL` | URL de la API y de la web (enlaces de los correos y del pago) |
| `DB_*` | Conexión a la base de datos |
| `MAIL_*` | Envío de correos. `MAIL_CONTACTO_DESTINO` recibe el formulario de contacto y las citas |
| `CORS_ALLOWED_ORIGINS` | Orígenes permitidos, separados por comas (vacío = puertos de `ng serve`) |
| `SANCTUM_TOKEN_EXPIRATION` | Vida de la sesión en minutos (30 días por defecto) |
| `AUTH_PASSWORD_RESET_EXPIRE` | Validez del enlace para elegir contraseña tras una compra (24 h) |
| `STRIPE_KEY`, `STRIPE_SECRET` | Claves de Stripe. Sin ellas no se puede comprar |
| `STRIPE_WEBHOOK_SECRET` | Firma del webhook. Sin ella el webhook rechaza todo |
| `STRIPE_PRICE_MASTERCLASS`, `..._OFERTA` | Precios de Stripe del curso (normal y de oferta) que usa el seeder |

Nunca subas un `.env` real al repositorio.

---

## Pagos con Stripe en local

1. Pon las claves **de test** (`sk_test_...`, `pk_test_...`) en `backend/.env`.
2. Crea en el panel de Stripe (modo test) el producto con su precio y vincúlalo al curso:

   ```bash
   php artisan stripe:vincular --listar            # estado y precios disponibles
   php artisan stripe:vincular 1 price_XXXX        # precio normal del curso 1
   php artisan stripe:vincular 1 price_YYYY --oferta
   ```

3. Reenvía los eventos a tu API con la [CLI de Stripe](https://stripe.com/docs/stripe-cli) y copia el
   secreto que muestra en `STRIPE_WEBHOOK_SECRET`:

   ```bash
   stripe listen --forward-to localhost:8000/api/webhooks/stripe
   ```

4. Compra en `/cursos` con la tarjeta de prueba `4242 4242 4242 4242`. El webhook da el acceso, crea
   la cuenta si la compra fue sin sesión y envía el justificante.

---

## Comandos habituales

### Backend (`cd backend`)

| Comando | Qué hace |
|---|---|
| `composer dev` | API, cola, logs y Vite a la vez |
| `php artisan serve` | Solo la API, en http://localhost:8000 |
| `composer test` | Tests (PHPUnit con SQLite en memoria) |
| `php artisan test --filter=NombreTest` | Un test concreto |
| `./vendor/bin/pint` | Formatea el PHP (antes de cada commit) |
| `php artisan migrate:fresh --seed` | Rehace la base de datos desde cero |
| `php artisan cursos:avisar-caducidad --simular` | Muestra a quién se avisaría de que su acceso caduca |

Tareas programadas (`routes/console.php`): limpieza de tokens caducados y de eventos de Stripe
cada día, y aviso de caducidad de cursos a las 10:00 (hora de Madrid).

### Frontend (`cd frontend`)

| Comando | Qué hace |
|---|---|
| `npm start` | Servidor de desarrollo en http://localhost:4200 |
| `npm test` | Tests (Vitest) |
| `npm run build` | Build de producción con prerender, sitemap y CSP |
| `npm run formatos` | Genera las copias `.avif` y `.webp` de las fotos que se usan |
| `npm run iconos` | Regenera favicon e iconos a partir de `public/logo/my_logo.svg` |

---

## Tareas de contenido

### Añadir o cambiar una foto
1. Guárdala en `frontend/public/images/` con un nombre descriptivo (`maquillaje-novia-ibiza.jpg`,
   no `IMG_1.PNG`).
2. Úsala en la plantilla o en el contenido correspondiente.
3. Ejecuta `npm run formatos`. Las fotos se sirven a calidad completa: no se recomprimen ni se cargan
   en diferido. Nginx entrega la copia AVIF o WebP en la misma URL si el navegador la acepta.

### Escribir un artículo del blog
Los artículos están en `frontend/src/app/blog/articulos.json`, sin base de datos. Cada uno lleva
título (70 caracteres como máximo), descripción (de 60 a 160), categoría, foto, resumen "En 30
segundos", bloques de contenido (`p`, `h2`, `h3`, `ul`, `ol`, `nota`), preguntas frecuentes opcionales
y relacionados. Los enlaces internos se escriben `[texto](/ruta)`. `npm test` comprueba longitudes,
enlaces, categorías y anclas, y el build crea la página y la añade al sitemap.

### Textos de las páginas de servicio y de los idiomas
- Servicios en los cuatro idiomas: `frontend/src/app/pages/servicio/contenido-servicios.ts`.
- Inicio, sobre mí, servicios y contacto en inglés, italiano y alemán:
  `frontend/src/app/pages/multi/contenido.ts`.
- Cabecera, pie, aviso de cookies y barra de reserva: `frontend/src/app/shared/textos.ts`.

### Datos legales
Titular, NIF, domicilio y proveedores están en `frontend/src/app/shared/datos-legales.ts`. Un campo
a `null` aparece como "pendiente de completar" en el aviso legal y en la privacidad.

### Precios orientativos de los servicios
Las tarjetas de la portada ya tienen el hueco "Desde X €": rellena `desde` en
`frontend/src/app/pages/inicio/inicio.ts` (por ejemplo `desde: '180 €'`). Con `null` no se muestra.

---

## Calidad: tests, SEO y accesibilidad

- **Tests**: `npm test` en el frontend comprueba, entre otras cosas, un solo `h1` por página, la tabla
  de idiomas y el blog. `composer test` cubre en el backend la API, los pagos y el webhook.
- **SEO**: cada página pública declara su `title` y `data.seo` en `app.routes.ts`. Una página nueva
  necesita además su entrada en `scripts/generar-sitemap.mjs`. Guía completa en
  [docs/seo-guia.md](docs/seo-guia.md).
- **Accesibilidad**: foco visible, navegación por teclado, `prefers-reduced-motion` respetado,
  contrastes AA y botones de 44 px. Lighthouse da 100 en accesibilidad en las páginas públicas.

---

## Despliegue

Producción (makeupbyyona.es) se instala y se actualiza según [deploy/README.md](deploy/README.md):
paquetes del servidor, Nginx con TLS, webhook de Stripe, servicios systemd, copias de seguridad y
`deploy/deploy.sh` para cada despliegue.

---

## Documentación

| Documento | Contenido |
|---|---|
| [CLAUDE.md](CLAUDE.md) | Arquitectura y decisiones técnicas en detalle |
| [deploy/README.md](deploy/README.md) | Servidor de producción |
| [docs/seo-guia.md](docs/seo-guia.md) | SEO técnico y lista de comprobación |
| [docs/auditoria-final-2026-11.md](docs/auditoria-final-2026-11.md) | Último análisis de seguridad, legal, accesibilidad y SEO |
