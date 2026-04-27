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

# Auth resolution order:
#   1. Existing CLOUDFLARE_API_TOKEN env var (CI / explicit override)
#   2. Wrangler OAuth session (~/.wrangler/config/default.toml from `wrangler login`)
#   3. macOS keychain fallback (bifrost-bootstrap / CF_WORKERS_TOKEN)
if [ -z "${CLOUDFLARE_API_TOKEN:-}" ] && [ ! -f "$HOME/.wrangler/config/default.toml" ]; then
  CLOUDFLARE_API_TOKEN="$(security find-generic-password -s bifrost-bootstrap -a CF_WORKERS_TOKEN -w 2>/dev/null || true)"
  export CLOUDFLARE_API_TOKEN
  if [ -z "${CLOUDFLARE_API_TOKEN:-}" ]; then
    echo "✘ no CF auth (no env token, no wrangler OAuth session, no keychain entry)" >&2
    echo "  fix: run 'npx wrangler login' once" >&2
    exit 1
  fi
fi

npx wrangler@latest deploy --var "VERSION:${VERSION}"
echo "✔ deployed VERSION=${VERSION}"
