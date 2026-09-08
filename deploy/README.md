# Despliegue en producción · makeupbyyona.es

Guía para dejar el proyecto funcionando en un servidor Ubuntu 22.04/24.04
con el dominio `makeupbyyona.es`.

Arquitectura: Nginx sirve el SPA de Angular como ficheros estáticos y hace
de proxy hacia PHP-FPM para todo lo que cuelga de `/api`. Al compartir
dominio, el navegador no hace peticiones cruzadas y CORS deja de ser un
problema.

```
                    ┌──────────── Nginx (443) ────────────┐
navegador ────────► │ /            → frontend-dist/ (SPA)  │
                    │ /api/*, /up  → PHP-FPM → Laravel     │
                    └──────────────────────────────────────┘
```

---

## Paso 0 · Antes de tocar el servidor

Estas dos cosas hay que hacerlas en local, y son bloqueantes.

### 0.1 · Compilar y pasar los tests

El código de esta rama **no se ha compilado ni ejecutado nunca**: se
escribió en una máquina sin PHP ni Node. Hasta que esto pase en verde, no
tiene sentido subir nada.

```bash
cd backend  && composer install && composer test
cd ../frontend && npm install && npm test && npm run build
```

Además, levanta el proyecto en local y comprueba a mano el recorrido
completo: registro, login, recuperación de contraseña, compra con una
tarjeta de prueba de Stripe, y el formulario de contacto.

### 0.2 · Fusionar el trabajo en `main`

El script de despliegue toma `main` por defecto. Si los cambios siguen en
`rama-omar`, **se desplegaría la versión antigua sin darse cuenta**.

```bash
git checkout main
git merge rama-omar        # o mejor: abrir un Pull Request y revisarlo
git push origin main
```

(Si prefieres desplegar la rama directamente, `RAMA=rama-omar bash
deploy/deploy.sh`. El script muestra el commit y pide confirmación antes
de continuar.)

---

## 1 · DNS

En el panel del dominio:

| Tipo | Nombre | Valor           |
|------|--------|-----------------|
| A    | `@`    | IP del servidor |
| A    | `www`  | IP del servidor |

Comprobar **antes** de seguir; sin esto el certificado no se emite:

```bash
dig +short makeupbyyona.es
```

## 2 · Paquetes del sistema

```bash
sudo apt update
sudo apt install -y nginx mysql-server git rsync unzip curl ufw \
  php8.3-fpm php8.3-mysql php8.3-mbstring php8.3-xml php8.3-curl \
  php8.3-zip php8.3-bcmath php8.3-intl

# Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer

# Node 22 LTS
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

node --version   # comprobar que Angular lo acepta al compilar (paso 0.1)
```

### Cortafuegos

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable
```

## 3 · Base de datos

```bash
sudo mysql <<'SQL'
CREATE DATABASE makeup_web CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'makeup_web'@'localhost' IDENTIFIED BY 'PON_AQUI_UNA_CLAVE_LARGA';
GRANT ALL PRIVILEGES ON makeup_web.* TO 'makeup_web'@'localhost';
FLUSH PRIVILEGES;
SQL
```

## 4 · Código y variables de entorno

```bash
sudo mkdir -p /var/www/makeup-web
sudo chown -R $USER:www-data /var/www/makeup-web
git clone <url-del-repo> /var/www/makeup-web
cd /var/www/makeup-web

cp backend/.env.production.example backend/.env
nano backend/.env
```

**Variables que no pueden quedarse en blanco**:

| Variable                   | De dónde sale                                            |
|----------------------------|----------------------------------------------------------|
| `APP_KEY`                  | `php artisan key:generate` (paso siguiente)               |
| `DB_PASSWORD`              | La del paso 3                                             |
| `STRIPE_SECRET`            | Stripe → Desarrolladores → Claves API (**live**, no test) |
| `STRIPE_WEBHOOK_SECRET`    | Se obtiene en el paso 8                                   |
| `STRIPE_PRICE_MASTERCLASS` | ID `price_...` de 55 € (tarifa base)                      |
| `STRIPE_PRICE_MASTERCLASS_OFERTA` | ID `price_...` de 45 € (oferta de lanzamiento)     |
| `MAIL_*`                   | SMTP del proveedor de correo                              |

```bash
cd backend
composer install --no-dev --optimize-autoloader
php artisan key:generate
php artisan migrate --force
```

## 5 · Datos iniciales

**Sin esto la base de datos queda vacía**: `/cursos` no muestra ningún
curso y no hay nada que vender.

```bash
cd /var/www/makeup-web/backend
php artisan db:seed --force
```

El seeder crea la categoría, el curso de muestra y la masterclass de pago.
Detecta que está en producción y **no** crea el usuario de prueba.

### Los DOS precios de Stripe

Stripe no permite cambiar el importe de un `price`: la tarifa base y la de
oferta son **dos objetos distintos**. Hay que crear los dos en el panel
(mismo producto, dos precios: 55 € y 45 €) y vincular cada uno.

```bash
# Qué cursos hay, qué precios les faltan y qué ofrece Stripe
php artisan stripe:vincular --listar

# Tarifa base (55 €)
php artisan stripe:vincular 2 price_ElDe55Euros

# Tarifa de oferta (45 €)
php artisan stripe:vincular 2 price_ElDe45Euros --oferta
```

El comando comprueba contra la API que el precio existe, está activo y que
el importe coincide con el de la web antes de guardarlo.

Si rellenaste las dos variables antes de sembrar, quedan vinculados solos
y este paso no hace falta.

### Ventana de la oferta

El seeder la deja fijada del **08/09/2026 a las 19:00** al **09/09/2026 a
las 19:00**, hora peninsular. Fuera de esa ventana se cobran 55 €.

La comparación se hace con la hora del **servidor**, y la API manda al
contador los *segundos restantes* en lugar de una fecha límite: así nadie
cambia el precio cambiando el reloj de su móvil.

Para moverla más adelante, sobre la tabla `tutoriales`:

```sql
-- OJO: la base de datos está en UTC. En horario de verano peninsular
-- (CEST) hay que restar 2 horas; en invierno (CET), 1.
UPDATE tutoriales
   SET oferta_inicio = '2026-10-01 17:00:00',   -- 19:00 en España
       oferta_fin    = '2026-10-02 17:00:00'
 WHERE titulo = 'Masterclass de Automaquillaje';
```

### Duración del acceso

Son 6 meses desde la compra, en `tutoriales.duracion_acceso_meses`. El fin
concreto de cada alumna queda en `accesos_tutorial.expira_en`; `NULL`
significa acceso sin límite, que es lo que conservan los accesos
concedidos antes de este cambio.

## 6 · Permisos

```bash
cd /var/www/makeup-web
sudo chown -R www-data:www-data backend/storage backend/bootstrap/cache
sudo chmod -R 775 backend/storage backend/bootstrap/cache

# El usuario que despliega tiene que poder escribir en esos directorios
# (Laravel escribe ahí las cachés durante el despliegue).
sudo usermod -aG www-data $USER
```

**Cierra la sesión SSH y vuelve a entrar** para que el cambio de grupo
tenga efecto. Comprobarlo con `groups` (debe aparecer `www-data`).

El resto del código pertenece a tu usuario; solo `storage/` y
`bootstrap/cache/` necesitan ser de `www-data`, que es quien ejecuta
PHP-FPM.

## 7 · Nginx y certificado TLS

Va en dos fases a propósito. La configuración definitiva declara
`ssl_certificate`, y esos ficheros no existen hasta que certbot los emite:
si se instala de golpe, `nginx -t` falla, nginx no arranca y certbot no
puede validar el dominio.

**Fase 1 — provisional, solo HTTP:**

```bash
cd /var/www/makeup-web
sudo cp deploy/nginx/makeupbyyona.es.bootstrap.conf \
        /etc/nginx/sites-available/makeupbyyona.es.conf
sudo ln -sf /etc/nginx/sites-available/makeupbyyona.es.conf \
            /etc/nginx/sites-enabled/makeupbyyona.es.conf
sudo rm -f /etc/nginx/sites-enabled/default
sudo mkdir -p /var/www/certbot

sudo nginx -t && sudo systemctl reload nginx
curl http://makeupbyyona.es      # debe responder el texto provisional
```

**Fase 2 — emitir el certificado y poner la configuración definitiva:**

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot certonly --webroot -w /var/www/certbot \
     -d makeupbyyona.es -d www.makeupbyyona.es

sudo cp deploy/nginx/makeupbyyona.es.conf \
        /etc/nginx/sites-available/makeupbyyona.es.conf
sudo nginx -t && sudo systemctl reload nginx
```

La renovación automática la instala el propio paquete de certbot
(`systemctl list-timers | grep certbot`). Comprobarla:

```bash
sudo certbot renew --dry-run
```

## 8 · Webhook de Stripe

En Stripe → Desarrolladores → Webhooks → Añadir endpoint:

- **URL**: `https://makeupbyyona.es/api/webhooks/stripe`
- **Eventos**: `checkout.session.completed`, `checkout.session.expired`,
  `charge.refunded`

Copiar el *signing secret* (`whsec_...`) a `STRIPE_WEBHOOK_SECRET` en el
`.env` y volver a cachear la configuración:

```bash
cd /var/www/makeup-web/backend && php artisan config:cache
```

Sin ese secreto el webhook rechaza **todo** con un 500, a propósito:
aceptar payloads sin verificar la firma permitiría a cualquiera regalarse
cursos.

## 9 · Servicios en segundo plano

```bash
cd /var/www/makeup-web
sudo cp deploy/systemd/makeup-queue.service     /etc/systemd/system/
sudo cp deploy/systemd/makeup-scheduler.service /etc/systemd/system/
sudo cp deploy/systemd/makeup-scheduler.timer   /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now makeup-queue makeup-scheduler.timer
```

El *timer* dispara el planificador de Laravel, del que dependen dos cosas:

- `sanctum:prune-expired` — sin él, `personal_access_tokens` crece sin parar.
- `cursos:avisar-caducidad` — el correo de "te queda un mes de acceso".
  **Si el timer no está activo, ese aviso no se envía nunca.**

Comprobar el aviso sin mandar nada a nadie:

```bash
cd /var/www/makeup-web/backend
php artisan cursos:avisar-caducidad --simular
```

## 10 · Primer despliegue

```bash
cd /var/www/makeup-web
bash deploy/deploy.sh
```

El script muestra el commit que va a desplegar y pide confirmación. Si
algo falla a mitad, devuelve la web al aire automáticamente (no se queda
en modo mantenimiento) y termina con error.

A partir de aquí, cada actualización es ese mismo comando.

## 11 · Comprobaciones

Automáticas (las hace el propio `deploy.sh` al terminar):

```bash
curl -s https://makeupbyyona.es/up                  # health check de Laravel
curl -s https://makeupbyyona.es/api/tutoriales      # catálogo público (JSON)
curl -sI https://makeupbyyona.es/mis-cursos         # 200 + index.html del SPA
curl -s https://makeupbyyona.es/api/mis-cursos      # 401 sin token
```

A mano, en el navegador y **también en un móvil real**:

1. Registro y login.
2. "¿Olvidaste tu contraseña?" → llega el correo → el enlace abre
   `/restablecer-password` → cambia la contraseña.
3. Compra **con** cuenta → vuelve a `/pago-exitoso` → el curso aparece en
   `/mis-cursos`, con su fecha de fin de acceso, y el vídeo se reproduce.
4. Compra **sin** cuenta desde `/oferta`: solo nombre y correo → paga →
   llega el justificante con copia a `info@makeupbyyona.es` y un enlace
   para crear la contraseña → ese enlace deja entrar en `/mis-cursos`.
5. `/oferta` en un móvil: sin navbar ni footer, contador corriendo y el
   precio que toque según la hora.
6. Formulario de contacto → llega el correo a `info@makeupbyyona.es`.
7. Recarga la página estando en `/cursos` (comprueba el `try_files` del SPA).

## 12 · Copias de seguridad

No hay nada configurado y el despliegue no lo cubre. Como mínimo:

```bash
sudo tee /etc/cron.daily/backup-makeup >/dev/null <<'EOF'
#!/bin/sh
DESTINO=/var/backups/makeup
mkdir -p "$DESTINO"
mysqldump --single-transaction makeup_web \
  | gzip > "$DESTINO/makeup_web-$(date +%F).sql.gz"
find "$DESTINO" -name '*.sql.gz' -mtime +30 -delete
EOF
sudo chmod +x /etc/cron.daily/backup-makeup
```

Necesita credenciales en `/root/.my.cnf` o un usuario de solo lectura.
Y conviene copiar el resultado fuera del servidor.

---

## Resolución de problemas

| Síntoma                                | Causa habitual                                                                |
|----------------------------------------|-------------------------------------------------------------------------------|
| `/cursos` aparece vacío                | Falta el paso 5 (`php artisan db:seed --force`)                               |
| El botón de compra devuelve 503        | Falta el `price` de Stripe del importe vigente: `php artisan stripe:vincular --listar` |
| Cobra 55 € cuando debería cobrar 45 €  | Fuera de la ventana de la oferta, o falta `stripe_price_id_oferta` |
| El contador no aparece                 | La oferta no está activa según la hora del servidor: `date` y la ventana en `tutoriales` |
| No llega el aviso de "queda un mes"    | El timer del planificador no está activo (paso 9)                             |
| Un curso comprado no se reproduce      | El acceso ha caducado: `expira_en` en `accesos_tutorial`                      |
| Se paga pero el curso no aparece       | El webhook no llega: revisar URL y secreto en Stripe                          |
| El webhook devuelve 500                | `STRIPE_WEBHOOK_SECRET` vacío                                                 |
| Cambios en `.env` sin efecto           | Falta `php artisan config:cache`                                              |
| Se desplegó pero no se ven los cambios | `deploy.sh` cogió `main` y el trabajo está en otra rama (paso 0.2)             |
| 429 al iniciar sesión                  | Rate limiting: 5 intentos por minuto por IP y por email                       |
| Recargar `/cursos` da 404              | Falta el `try_files ... /index.html` del SPA en Nginx                         |
| Los formularios no envían correo       | Credenciales SMTP; mirar `storage/logs/laravel.log`                           |
| La web se quedó "en mantenimiento"     | `cd backend && php artisan up`                                                |

Logs:

```bash
tail -f /var/www/makeup-web/backend/storage/logs/laravel.log
tail -f /var/log/nginx/makeupbyyona.error.log
journalctl -u makeup-queue -f
```

---

## Medios (vídeo e imágenes)

Son la pieza principal de la web y se sirven **íntegros, sin recorte de
calidad ni carga diferida**: nada de `loading="lazy"`, ni posters
sustitutivos, ni saltarse el vídeo en conexiones lentas.

Lo que sí se hace para que carguen rápido sin tocar la calidad:

- Nginx los cachea 30 días y sirve peticiones por rango (`Range`), que es
  lo que permite al navegador empezar a reproducir el vídeo sin haberlo
  descargado entero.
- El segundo vídeo del bucle se precarga con `prefetch` en cuanto el
  primero ya está reproduciéndose, así el cambio es instantáneo.
- Los `<img>` llevan `decoding="async"` (no bloquea el hilo principal; no
  altera el resultado) y los de cabecera `fetchpriority="high"`.

**Si en el futuro se quiere reducir el peso sin perder calidad**, la vía
correcta es añadir formatos alternativos, no recomprimir el original:

```bash
# Vídeo: una versión WebM/VP9 como <source> adicional. El navegador
# elige; quien no soporte WebM sigue recibiendo el MP4 actual.
ffmpeg -i masterclass_dia_final.mp4 -c:v libvpx-vp9 -crf 30 -b:v 0 -an \
       masterclass_dia_final.webm

# Imágenes: AVIF/WebP dentro de un <picture>, con el PNG/JPEG original
# como fallback.
ffmpeg -i IMG_1.PNG -c:v libaom-av1 -crf 28 -still-picture IMG_1.avif
```

Eso mantiene el original intacto y solo sirve el formato ligero a quien
puede mostrarlo con la misma calidad percibida.

## Pendiente

- **Verificar el dominio del correo**: comprobar que `info@makeupbyyona.es`
  existe y que el SMTP puede enviar desde `no-reply@makeupbyyona.es`
  (SPF y DKIM del dominio), o los correos acabarán en spam.
- **Aviso legal**: hay política de privacidad, pero no aviso legal ni
  condiciones de contratación, que son obligatorios vendiendo online en
  España.
