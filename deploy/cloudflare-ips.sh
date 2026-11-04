#!/usr/bin/env bash
#
# Regenera /etc/nginx/conf.d/cloudflare-ip-real.conf con los rangos de IP
# que Cloudflare publica, y recarga Nginx solo si han cambiado.
#
#   sudo bash deploy/cloudflare-ips.sh
#
# Pensado para lanzarse a mano o desde cron (ver deploy/README.md, paso 13).
# Si la descarga falla o devuelve algo raro, no toca el fichero actual:
# dejar Nginx sin rangos haria que todas las visitas compartieran IP.

set -euo pipefail

DESTINO="${DESTINO:-/etc/nginx/conf.d/cloudflare-ip-real.conf}"
TMP=$(mktemp)
trap 'rm -f "$TMP"' EXIT

V4=$(curl -fsS --max-time 20 https://www.cloudflare.com/ips-v4)
V6=$(curl -fsS --max-time 20 https://www.cloudflare.com/ips-v6)

# Cada linea tiene que ser un rango CIDR; si no, mejor no tocar nada.
for rango in $V4 $V6; do
  [[ "$rango" =~ ^[0-9a-fA-F:.]+/[0-9]+$ ]] || {
    echo "ERROR: respuesta inesperada de Cloudflare: '$rango'"
    exit 1
  }
done

[ "$(echo "$V4" | wc -w)" -ge 5 ] || { echo "ERROR: lista IPv4 demasiado corta"; exit 1; }

{
  echo "# Generado por deploy/cloudflare-ips.sh el $(date +%F). No editar a mano."
  for rango in $V4 $V6; do
    echo "set_real_ip_from $rango;"
  done
  echo ""
  echo "real_ip_header CF-Connecting-IP;"
} > "$TMP"

if [ -f "$DESTINO" ] && diff -q \
     <(grep -v '^#' "$DESTINO") <(grep -v '^#' "$TMP") >/dev/null; then
  echo "Sin cambios en los rangos de Cloudflare."
  exit 0
fi

cp "$DESTINO" "$DESTINO.anterior" 2>/dev/null || true
install -m 644 "$TMP" "$DESTINO"

if nginx -t 2>/dev/null; then
  systemctl reload nginx
  echo "Rangos de Cloudflare actualizados y Nginx recargado."
else
  echo "ERROR: nginx -t falla con los rangos nuevos; se restaura el anterior."
  [ -f "$DESTINO.anterior" ] && mv "$DESTINO.anterior" "$DESTINO"
  exit 1
fi
