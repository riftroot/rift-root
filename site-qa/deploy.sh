#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
VERSION="${VERSION:-$(date +%s)}"
echo "▶ building bundle"
./build.sh
echo "▶ deploying rift-root-site · VERSION=${VERSION}"
# Auth: env > wrangler OAuth session > keychain
if [ -z "${CLOUDFLARE_API_TOKEN:-}" ] && [ ! -f "$HOME/.wrangler/config/default.toml" ]; then
  CLOUDFLARE_API_TOKEN="$(security find-generic-password -s bifrost-bootstrap -a CF_WORKERS_TOKEN -w 2>/dev/null || true)"
  export CLOUDFLARE_API_TOKEN
  [ -n "${CLOUDFLARE_API_TOKEN:-}" ] || { echo "✘ no CF auth (run 'npx wrangler login')" >&2; exit 1; }
fi
npx wrangler@latest deploy --var "VERSION:${VERSION}"
echo "✔ deployed VERSION=${VERSION}"
