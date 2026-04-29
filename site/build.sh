#!/usr/bin/env bash
# rift-root-site (PROD) · Vite build wrapper.
#
# Produces site/public/app-[hash].js as a single self-executing IIFE bundle.
# React + ReactDOM are externalized — they load via <script> tags in
# index.html (CDN). See vite.prod.config.mjs for the full rationale.
set -euo pipefail

# Run from repo root (one level up from this script).
cd "$(dirname "$0")/.."

if [ ! -d node_modules/vite ]; then
  echo "==> installing vite + plugin-react"
  npm install --no-audit --no-fund --silent
fi

npx vite build --config vite.prod.config.mjs

HASHED="$(ls -1 site/public/app-*.js 2>/dev/null | head -1)"
if [ -n "$HASHED" ]; then
  echo "==> built ${HASHED} ($(du -h "$HASHED" | cut -f1))"
else
  echo "==> WARN: no hashed app-*.js found in site/public/" >&2
  exit 1
fi
