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

echo "==> built site-qa/public/app.js ($(du -h site-qa/public/app.js | cut -f1))"
