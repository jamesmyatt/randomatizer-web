#!/bin/sh
# Installs or updates Randomatizer web in an Alpine Linux container (e.g. a Proxmox LXC), served by nginx.
#
#   wget -qO- https://raw.githubusercontent.com/jamesmyatt/randomatizer-web/main/scripts/alpine-install.sh | sh
#
# Run it again to update to the latest release. Environment variables:
#   VERSION  release to install, e.g. 1.0.0 (default: latest)
#   PORT     port nginx listens on (default: 80)
set -eu

REPO="jamesmyatt/randomatizer-web"
PORT="${PORT:-80}"
WEB_ROOT="/usr/share/nginx/html"
VERSION_FILE="/opt/randomatizer-web_version.txt"

msg() { printf '==> %s\n' "$*"; }
die() { printf 'Error: %s\n' "$*" >&2; exit 1; }

[ -f /etc/alpine-release ] || die "this script is for Alpine Linux"
[ "$(id -u)" -eq 0 ] || die "run as root"

msg "Installing nginx"
apk add --no-cache nginx >/dev/null

if [ -z "${VERSION:-}" ]; then
  VERSION=$(wget -qO- "https://api.github.com/repos/${REPO}/releases/latest" |
    sed -n 's/.*"tag_name": *"v\([^"]*\)".*/\1/p')
  [ -n "$VERSION" ] || die "could not find the latest release"
fi

NGINX_CONF="/etc/nginx/http.d/randomatizer.conf"
if [ -f "$VERSION_FILE" ] && [ "$(cat "$VERSION_FILE")" = "$VERSION" ] &&
  grep -q "listen ${PORT};" "$NGINX_CONF" 2>/dev/null; then
  msg "Randomatizer web ${VERSION} is already installed on port ${PORT}"
  exit 0
fi

msg "Downloading Randomatizer web ${VERSION}"
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT
ASSET="randomatizer-web-${VERSION}.tar.gz"
BASE="https://github.com/${REPO}/releases/download/v${VERSION}"
wget -qO "$TMP/$ASSET" "$BASE/$ASSET"
wget -qO "$TMP/$ASSET.sha256" "$BASE/$ASSET.sha256"
(cd "$TMP" && sha256sum -c "$ASSET.sha256" >/dev/null) || die "checksum mismatch"
mkdir "$TMP/pkg"
tar -xzf "$TMP/$ASSET" -C "$TMP/pkg"

msg "Installing"
mkdir -p "$WEB_ROOT" /etc/nginx/snippets
rm -rf "${WEB_ROOT:?}"/*
cp -R "$TMP/pkg/html/." "$WEB_ROOT/"
cp "$TMP/pkg/nginx/security-headers.conf" /etc/nginx/snippets/security-headers.conf
sed "s/listen 8080;/listen ${PORT};/" "$TMP/pkg/nginx/default.conf" >"$NGINX_CONF"
# Alpine's default server also listens on port 80.
rm -f /etc/nginx/http.d/default.conf
nginx -t 2>/dev/null || die "nginx configuration test failed (run nginx -t)"

rc-update add nginx default >/dev/null 2>&1 || true
if rc-service nginx status >/dev/null 2>&1; then
  rc-service nginx reload >/dev/null
else
  rc-service nginx start >/dev/null
fi
echo "$VERSION" >"$VERSION_FILE"
msg "Randomatizer web ${VERSION} is running on port ${PORT}"
