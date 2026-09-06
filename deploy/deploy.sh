#!/usr/bin/env bash
#
# Despliegue de makeupbyyona.es
#
#   cd /var/www/makeup-web && bash deploy/deploy.sh
#
# Se ejecuta con un usuario normal que tenga sudo (no www-data: necesita
# reiniciar servicios). El codigo pertenece a ese usuario; storage/ y
# bootstrap/cache/ pertenecen a www-data.
#
# Variables:
#   RAMA=otra-rama bash deploy/deploy.sh   despliega otra rama
#   SIN_CONFIRMAR=1                        no pregunta antes de desplegar
#
# Idempotente: se puede volver a lanzar tantas veces como haga falta.
# No toca .env, y de la base de datos solo aplica migraciones.

set -euo pipefail

RAIZ="${RAIZ:-/var/www/makeup-web}"
RAMA="${RAMA:-main}"
DIST="$RAIZ/frontend-dist"
URL="${URL:-https://makeupbyyona.es}"

cd "$RAIZ"

# ─── 0. Comprobaciones previas ───────────────────────────────────────
# Mejor abortar aqui que a mitad, con la web ya en mantenimiento.

if [ ! -f backend/.env ]; then
  echo "ERROR: falta backend/.env."
  echo "       cp backend/.env.production.example backend/.env"
  echo "       (rellenar) y luego: php artisan key:generate"
  exit 1
fi

for binario in php composer node npm rsync git curl; do
  command -v "$binario" >/dev/null 2>&1 || {
    echo "ERROR: falta '$binario' en el PATH."
    exit 1
  }
done

if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "ERROR: hay cambios sin confirmar en $RAIZ."
  echo "       El despliegue hace checkout y los perderia. Revisa 'git status'."
  exit 1
fi

git fetch --all --prune --quiet
git checkout --quiet "$RAMA"
git pull --ff-only --quiet origin "$RAMA"

DESCRIPCION=$(git log -1 --pretty='%h %s')

echo ""
echo "  Destino : $RAIZ"
echo "  Rama    : $RAMA"
echo "  Commit  : $DESCRIPCION"
echo ""

# La rama por defecto es main. Si el trabajo esta en otra rama y nadie la
# ha fusionado, sin este aviso se desplegaria codigo antiguo sin enterarse.
if [ "${SIN_CONFIRMAR:-0}" != "1" ]; then
  read -r -p "¿Desplegar este commit? [s/N] " respuesta
  case "$respuesta" in
    s|S|si|SI|y|Y) ;;
    *) echo "Cancelado."; exit 1 ;;
  esac
fi

# ─── Red de seguridad ────────────────────────────────────────────────
# Si algo falla despues de 'artisan down', la web se quedaria en
# mantenimiento indefinidamente. Este trap la devuelve al aire siempre.
EN_MANTENIMIENTO=0

al_salir() {
  local codigo=$?
  if [ "$EN_MANTENIMIENTO" = "1" ]; then
    (cd "$RAIZ/backend" && php artisan up >/dev/null 2>&1) || true
  fi
  if [ "$codigo" != "0" ]; then
    echo ""
    echo "==> DESPLIEGUE FALLIDO (código $codigo). La web se ha reactivado."
    echo "    Revisa el error de arriba antes de volver a intentarlo."
  fi
}
trap al_salir EXIT

# ─── 1. Backend ──────────────────────────────────────────────────────
cd "$RAIZ/backend"

echo "==> Backend"
php artisan down --retry=60 >/dev/null 2>&1 || true
EN_MANTENIMIENTO=1

composer install --no-dev --optimize-autoloader --no-interaction --quiet

php artisan migrate --force

# Cachés de producción: hay que regenerarlas en cada despliegue o Laravel
# seguirá sirviendo la configuración y las rutas anteriores.
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

php artisan up
EN_MANTENIMIENTO=0

# Los permisos se ajustan DESPUÉS de 'artisan up', no antes: el fichero de
# mantenimiento lo crea el usuario que despliega, y si a mitad le cambiamos
# el dueño a www-data, ese mismo usuario ya no puede borrarlo y la web se
# queda caída.
#
# Las cachés recién escritas (bootstrap/cache) y los logs (storage) tienen
# que quedar en manos de www-data, que es quien ejecuta PHP-FPM.
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache

# ─── 2. Frontend ─────────────────────────────────────────────────────
cd "$RAIZ/frontend"

echo "==> Frontend"
npm ci --no-audit --no-fund
npm run build   # defaultConfiguration: production -> usa environment.prod.ts

# El build de Angular deja los estáticos en dist/<proyecto>/browser.
SALIDA="$RAIZ/frontend/dist/frontend/browser"

if [ ! -f "$SALIDA/index.html" ]; then
  echo "ERROR: no se generó $SALIDA/index.html."
  echo "       Revisa la salida de 'npm run build'."
  exit 1
fi

# rsync --delete para que no queden bundles viejos. Se publica en un
# directorio aparte del de trabajo para no servir un estado a medias.
mkdir -p "$DIST"
rsync -a --delete "$SALIDA/" "$DIST/"

# Nginx sirve como www-data y necesita poder leer lo publicado.
chmod -R a+rX "$DIST"

# ─── 3. Servicios ────────────────────────────────────────────────────
echo "==> Servicios"
sudo systemctl restart php8.3-fpm

# El worker de colas puede no estar instalado todavía en el primer
# despliegue; no es motivo para dar el despliegue por fallido.
sudo systemctl restart makeup-queue 2>/dev/null || \
  echo "    (aviso: makeup-queue no está instalado; ver paso 9 del README)"

sudo nginx -t && sudo systemctl reload nginx

# ─── 4. Verificación ─────────────────────────────────────────────────
echo "==> Comprobando que responde"

ESTADO_UP=$(curl -s -o /dev/null -w '%{http_code}' "$URL/up" || echo "000")
ESTADO_API=$(curl -s -o /dev/null -w '%{http_code}' "$URL/api/tutoriales" || echo "000")

echo "    /up             -> $ESTADO_UP"
echo "    /api/tutoriales -> $ESTADO_API"

if [ "$ESTADO_UP" != "200" ] || [ "$ESTADO_API" != "200" ]; then
  echo ""
  echo "    AVISO: algo no responde con 200. Revisa:"
  echo "      tail -50 $RAIZ/backend/storage/logs/laravel.log"
  echo "      tail -50 /var/log/nginx/makeupbyyona.error.log"
  exit 1
fi

echo ""
echo "==> Despliegue completado: $DESCRIPCION"
