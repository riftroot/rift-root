#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
VERSION="${VERSION:-$(date +%s)}"
echo "▶ deploying rift-root-site · VERSION=${VERSION}"
if [ -z "${CLOUDFLARE_API_TOKEN:-}" ]; then
  CLOUDFLARE_API_TOKEN="$(security find-generic-password -s bifrost-bootstrap -a CF_WORKERS_TOKEN -w 2>/dev/null || true)"
  export CLOUDFLARE_API_TOKEN
fi
[ -n "${CLOUDFLARE_API_TOKEN:-}" ] || { echo "✘ CLOUDFLARE_API_TOKEN missing" >&2; exit 1; }
npx wrangler@latest deploy --var "VERSION:${VERSION}"
echo "✔ deployed VERSION=${VERSION}"
