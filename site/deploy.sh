#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
VERSION="${VERSION:-$(date +%s)}"
echo "▶ building bundle"
./build.sh
echo "▶ deploying riftroot-edge · VERSION=${VERSION}"
# Auth: env > wrangler OAuth session > keychain
if [ -z "${CLOUDFLARE_API_TOKEN:-}" ] && [ ! -f "$HOME/.wrangler/config/default.toml" ]; then
  CLOUDFLARE_API_TOKEN="$(security find-generic-password -s bifrost-bootstrap -a CF_WORKERS_TOKEN -w 2>/dev/null || true)"
  export CLOUDFLARE_API_TOKEN
  [ -n "${CLOUDFLARE_API_TOKEN:-}" ] || { echo "✘ no CF auth (run 'npx wrangler login')" >&2; exit 1; }
fi

# Discover hashed bundle for APP_BUNDLE var (worker uses it for Link preload).
APP_BUNDLE="$(ls -1 public/app-*.js 2>/dev/null | head -1 | sed 's|^public/||')"
if [ -z "$APP_BUNDLE" ]; then
  echo "✘ no hashed app-*.js found in site/public/" >&2
  exit 1
fi
echo "▶ APP_BUNDLE=${APP_BUNDLE}"

npx wrangler@latest deploy --var "VERSION:${VERSION}" --var "APP_BUNDLE:${APP_BUNDLE}"
echo "✔ deployed VERSION=${VERSION}"
