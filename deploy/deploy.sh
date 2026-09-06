#!/usr/bin/env bash
#
# Despliegue de makeupbyyona.es
#
#   cd /var/www/makeup-web && bash deploy/deploy.sh
#
# Se ejecuta con un usuario normal que tenga sudo (no www-data: necesita
# reiniciar servicios). Los ficheros deben pertenecer a ese usuario con
# grupo www-data; storage/ y bootstrap/cache/ son de www-data.
#
# Idempotente: se puede volver a lanzar tantas veces como haga falta.
# No toca .env ni la base de datos mas alla de aplicar migraciones.

set -euo pipefail

RAIZ="${RAIZ:-/var/www/makeup-web}"
RAMA="${RAMA:-main}"
DIST="$RAIZ/frontend-dist"

echo "==> Desplegando en $RAIZ (rama $RAMA)"
cd "$RAIZ"

# ─── 1. Código ───────────────────────────────────────────────────────
git fetch --all --prune
git checkout "$RAMA"
git pull --ff-only origin "$RAMA"

# ─── 2. Backend ──────────────────────────────────────────────────────
cd "$RAIZ/backend"

if [ ! -f .env ]; then
  echo "ERROR: falta backend/.env. Copia .env.production.example, rellénalo"
  echo "       y ejecuta: php artisan key:generate"
  exit 1
fi

php artisan down --retry=60 || true

composer install --no-dev --optimize-autoloader --no-interaction

php artisan migrate --force

# Cachés de producción: hay que regenerarlas en cada despliegue o
# Laravel seguirá sirviendo la configuración anterior.
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

# storage/ debe ser escribible por php-fpm.
chmod -R ug+rw storage bootstrap/cache

php artisan up

# ─── 3. Frontend ─────────────────────────────────────────────────────
cd "$RAIZ/frontend"

npm ci
npm run build   # defaultConfiguration: production -> usa environment.prod.ts

# El build de Angular 21 deja los estáticos en dist/frontend/browser.
SALIDA="$RAIZ/frontend/dist/frontend/browser"

if [ ! -d "$SALIDA" ]; then
  echo "ERROR: no se encontró $SALIDA. Revisa la salida de 'npm run build'."
  exit 1
fi

# Se publica con rsync --delete para que no queden bundles viejos, pero
# sobre un directorio aparte del de trabajo para no servir un estado a medias.
mkdir -p "$DIST"
rsync -a --delete "$SALIDA/" "$DIST/"

# ─── 4. Servicios ────────────────────────────────────────────────────
sudo systemctl restart php8.3-fpm
sudo systemctl restart makeup-queue
sudo systemctl reload nginx

echo "==> Despliegue completado"
echo "    Comprueba: https://makeupbyyona.es/up  (health check de Laravel)"
