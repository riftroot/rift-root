#!/usr/bin/env bash
# rift-root-site (QA) · Vite build wrapper.
#
# Produces site-qa/public/app.js as a single self-executing IIFE bundle.
# React + ReactDOM are externalized — they load via <script> tags in
# index.html (CDN). See vite.qa.config.mjs for the full rationale.
#
# Dev (HMR): from repo root, run `npm run dev`. Edit any .jsx file under
# site-qa/public/ and the browser hot-reloads without a full refresh.
set -euo pipefail

# Run from repo root (one level up from this script).
cd "$(dirname "$0")/.."

# Lazy-install vite if node_modules is missing. Keeps `bash site-qa/build.sh`
# a one-command bootstrap on a fresh checkout — same UX as the old script.
if [ ! -d node_modules/vite ]; then
  echo "==> installing vite + plugin-react"
  npm install --no-audit --no-fund --silent
fi

npx vite build --config vite.qa.config.mjs

HASHED="$(ls -1 site-qa/public/app-*.js 2>/dev/null | head -1)"
if [ -n "$HASHED" ]; then
  echo "==> built ${HASHED} ($(du -h "$HASHED" | cut -f1))"
else
  echo "==> WARN: no hashed app-*.js found in site-qa/public/" >&2
  exit 1
fi
