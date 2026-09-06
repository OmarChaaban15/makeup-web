# Despliegue en producción · makeupbyyona.es

Guía para dejar el proyecto funcionando en un servidor Ubuntu 22.04/24.04 con
el dominio `makeupbyyona.es`.

Arquitectura: Nginx sirve el SPA de Angular como ficheros estáticos y hace de
proxy hacia PHP-FPM para todo lo que cuelga de `/api`. Al compartir dominio,
el navegador no hace peticiones cruzadas y CORS deja de ser un problema.

```
                    ┌──────────── Nginx (443) ────────────┐
navegador ────────► │ /            → frontend-dist/ (SPA)  │
                    │ /api/*, /up  → PHP-FPM → Laravel     │
                    └──────────────────────────────────────┘
```

---

## 1. DNS

En el panel del dominio:

| Tipo  | Nombre | Valor              |
|-------|--------|--------------------|
| A     | `@`    | IP del servidor    |
| A     | `www`  | IP del servidor    |

Comprobar antes de seguir (el certificado no se emitirá si no resuelve):

```bash
dig +short makeupbyyona.es
```

## 2. Paquetes del sistema

```bash
sudo apt update
sudo apt install -y nginx mysql-server git rsync unzip curl \
  php8.3-fpm php8.3-mysql php8.3-mbstring php8.3-xml php8.3-curl \
  php8.3-zip php8.3-bcmath php8.3-intl

# Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer

# Node 22 (Angular 21 requiere Node >= 20.19)
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
```

## 3. Base de datos

```bash
sudo mysql <<'SQL'
CREATE DATABASE makeup_web CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'makeup_web'@'localhost' IDENTIFIED BY 'PON_AQUI_UNA_CLAVE_LARGA';
GRANT ALL PRIVILEGES ON makeup_web.* TO 'makeup_web'@'localhost';
FLUSH PRIVILEGES;
SQL
```

## 4. Código y variables de entorno

```bash
sudo mkdir -p /var/www/makeup-web
sudo chown -R $USER:www-data /var/www/makeup-web
git clone <url-del-repo> /var/www/makeup-web
cd /var/www/makeup-web

cp backend/.env.production.example backend/.env
# Rellenar: DB_PASSWORD, credenciales SMTP y las tres claves de Stripe.
nano backend/.env

cd backend
composer install --no-dev --optimize-autoloader
php artisan key:generate
php artisan migrate --force
```

**Variables que no pueden quedarse en blanco** (`backend/.env`):

| Variable                   | De dónde sale                                            |
|----------------------------|----------------------------------------------------------|
| `APP_KEY`                  | `php artisan key:generate`                                |
| `DB_PASSWORD`              | La del paso 3                                             |
| `STRIPE_SECRET`            | Stripe → Desarrolladores → Claves API (**live**, no test) |
| `STRIPE_WEBHOOK_SECRET`    | Se obtiene en el paso 7                                   |
| `STRIPE_PRICE_MASTERCLASS` | ID `price_...` del producto en Stripe                     |
| `MAIL_*`                   | SMTP del proveedor de correo                              |

Sin `STRIPE_PRICE_MASTERCLASS` el botón de compra devuelve un 503 con un
mensaje claro en lugar de romperse. Es la causa número uno de "la compra
no funciona" en este proyecto.

### Vincular el curso con su precio de Stripe

El `price_id` lo genera Stripe al crear el producto; no se puede inventar.
Para no tener que tocar la base de datos a mano:

```bash
cd /var/www/makeup-web/backend

# Qué tutoriales hay, cuáles están sin vincular y qué precios tiene Stripe
php artisan stripe:vincular --listar

# Vincular (comprueba contra la API que el precio existe, está activo
# y que el importe coincide con el de la web antes de guardarlo)
php artisan stripe:vincular 2 price_1AbCdEf...
```

Si el seeder ya se ejecutó con `STRIPE_PRICE_MASTERCLASS` relleno, el
curso queda vinculado solo y este paso no hace falta.

## 5. Permisos

```bash
sudo chown -R www-data:www-data /var/www/makeup-web/backend/storage \
                                /var/www/makeup-web/backend/bootstrap/cache
sudo chmod -R 775 /var/www/makeup-web/backend/storage \
                  /var/www/makeup-web/backend/bootstrap/cache
```

## 6. Nginx y certificado TLS

```bash
sudo cp deploy/nginx/makeupbyyona.es.conf /etc/nginx/sites-available/
sudo ln -s /etc/nginx/sites-available/makeupbyyona.es.conf /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d makeupbyyona.es -d www.makeupbyyona.es

sudo nginx -t && sudo systemctl reload nginx
```

> El fichero de Nginx ya incluye los bloques `ssl_certificate`. Si se
> despliega **antes** de tener el certificado, comentar esas líneas y los
> bloques 443, lanzar certbot y volver a activarlas.

## 7. Webhook de Stripe

En el panel de Stripe → Desarrolladores → Webhooks → Añadir endpoint:

- **URL**: `https://makeupbyyona.es/api/webhooks/stripe`
- **Eventos**: `checkout.session.completed`, `checkout.session.expired`,
  `charge.refunded`

Copiar el *signing secret* (`whsec_...`) a `STRIPE_WEBHOOK_SECRET` en el
`.env` y volver a cachear la configuración:

```bash
cd /var/www/makeup-web/backend && php artisan config:cache
```

Sin ese secreto el webhook rechaza **todo** con un 500 (a propósito: aceptar
payloads sin verificar la firma permitiría a cualquiera regalarse cursos).

## 8. Servicios en segundo plano

```bash
sudo cp deploy/systemd/makeup-queue.service     /etc/systemd/system/
sudo cp deploy/systemd/makeup-scheduler.service /etc/systemd/system/
sudo cp deploy/systemd/makeup-scheduler.timer   /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now makeup-queue makeup-scheduler.timer
```

El *timer* es el que ejecuta la poda de tokens caducados de Sanctum. Sin él
la tabla `personal_access_tokens` crece sin parar.

## 9. Primer despliegue

```bash
cd /var/www/makeup-web
bash deploy/deploy.sh
```

A partir de ahí, cada actualización es ese mismo comando.

## 10. Comprobaciones

```bash
curl -s https://makeupbyyona.es/up                  # health check de Laravel
curl -s https://makeupbyyona.es/api/tutoriales      # catálogo público (JSON)
curl -sI https://makeupbyyona.es/mis-cursos         # 200 + index.html del SPA
curl -s https://makeupbyyona.es/api/mis-cursos      # 401 sin token
```

Y en el navegador:

1. Registro y login.
2. "¿Olvidaste tu contraseña?" → llega el correo → el enlace abre
   `/restablecer-password` → cambia la contraseña.
3. Compra de la masterclass con una tarjeta de prueba → vuelve a
   `/pago-exitoso` → el curso aparece en `/mis-cursos` con vídeo.
4. Formulario de contacto → llega el correo.

## Resolución de problemas

| Síntoma                                     | Causa habitual                                                       |
|---------------------------------------------|----------------------------------------------------------------------|
| El botón de compra devuelve 503             | El tutorial no tiene `stripe_price_id`: `php artisan stripe:vincular --listar` |
| Se paga pero el curso no aparece            | El webhook no llega: revisar la URL y el secreto en Stripe            |
| El webhook devuelve 500                     | `STRIPE_WEBHOOK_SECRET` vacío                                        |
| Cambios en `.env` que no surten efecto      | Falta `php artisan config:cache`                                     |
| 419 / 429 al iniciar sesión                 | Rate limiting: 5 intentos por minuto y por IP/email                  |
| Recargar `/cursos` da 404                   | Falta el `try_files ... /index.html` del SPA en Nginx                |
| Los formularios no envían correo            | Credenciales SMTP; mirar `storage/logs/laravel.log`                  |

Logs útiles:

```bash
tail -f /var/www/makeup-web/backend/storage/logs/laravel.log
tail -f /var/log/nginx/makeupbyyona.error.log
journalctl -u makeup-queue -f
```

## Medios (vídeo e imágenes)

Son la pieza principal de la web y se sirven **íntegros, sin recorte de
calidad ni carga diferida**: nada de `loading="lazy"`, ni posters
sustitutivos, ni saltarse el vídeo en conexiones lentas.

Lo que sí se hace para que carguen rápido sin tocar la calidad:

- Nginx los cachea 30 días y sirve peticiones por rango (`Range`), que es
  lo que permite al navegador empezar a reproducir el vídeo sin haberlo
  descargado entero.
- El segundo vídeo del bucle se precarga con `prefetch` en cuanto el
  primero ya está reproduciéndose, así que el cambio es instantáneo.
- Los `<img>` llevan `decoding="async"` (no bloquea el hilo principal; no
  altera el resultado) y los de cabecera `fetchpriority="high"`.

**Si en el futuro se quiere reducir el peso sin perder calidad**, la vía
correcta es añadir formatos alternativos, no recomprimir el original:

```bash
# Vídeo: añadir una versión WebM/VP9 como <source> adicional.
# El navegador elige; quien no soporte WebM sigue recibiendo el MP4 actual.
ffmpeg -i masterclass_dia_final.mp4 -c:v libvpx-vp9 -crf 30 -b:v 0 -an \
       masterclass_dia_final.webm

# Imágenes: AVIF/WebP como <source> dentro de un <picture>, con el
# PNG/JPEG original como fallback.
ffmpeg -i IMG_1.PNG -c:v libaom-av1 -crf 28 -still-picture IMG_1.avif
```

Eso mantiene el original intacto y solo sirve el formato ligero a quien
puede mostrarlo con la misma calidad percibida.

## Pendiente antes de abrir al público

- **Copias de seguridad**: no hay nada configurado. Como mínimo, un
  `mysqldump` diario de `makeup_web`.
- **Correo**: verificar que `info@makeupbyyona.es` existe y que el SMTP
  configurado puede enviar desde `no-reply@makeupbyyona.es` (SPF/DKIM del
  dominio), o los correos acabarán en spam.
