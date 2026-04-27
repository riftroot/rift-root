#!/usr/bin/env bash
# rift-bifrost-demo deploy
#
# Stamps a fresh VERSION (epoch seconds) into the Worker so the browser-side
# cache-bust + service worker can detect an upgrade and force a hard reload
# on iPhone Safari (the worst offender).
set -euo pipefail

cd "$(dirname "$0")/.."

VERSION="${VERSION:-$(date +%s)}"
echo "▶ deploying rift-bifrost-demo · VERSION=${VERSION}"

if [ -z "${CLOUDFLARE_API_TOKEN:-}" ]; then
  CLOUDFLARE_API_TOKEN="$(security find-generic-password -s bifrost-bootstrap -a CF_WORKERS_TOKEN -w 2>/dev/null || true)"
  export CLOUDFLARE_API_TOKEN
fi

if [ -z "${CLOUDFLARE_API_TOKEN:-}" ]; then
  echo "✘ CLOUDFLARE_API_TOKEN missing (not in env, not in keychain bifrost-bootstrap/CF_WORKERS_TOKEN)" >&2
  exit 1
fi

npx wrangler@latest deploy --var "VERSION:${VERSION}"
echo "✔ deployed VERSION=${VERSION}"
