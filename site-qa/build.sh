#!/usr/bin/env bash
# rift-root-site · pre-bundle JSX → app.js so the browser doesn't pay
# Babel-standalone's ~2 MB transpile tax on every load.
#
# Each file gets wrapped in its own IIFE so duplicate top-level declarations
# (e.g. `const { useEffect } = React` in multiple files) don't collide.
set -euo pipefail
cd "$(dirname "$0")/public"

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

for f in tweaks-panel.jsx components/header.jsx components/footer.jsx components/sections.jsx components/about-contact.jsx components/router.jsx app.jsx; do
  base="$(basename "$f" .jsx)"
  out="$TMP/${base}.js"
  npx --yes esbuild@0.25.0 "$f" \
    --loader:.jsx=jsx \
    --target=es2020 \
    --minify \
    --legal-comments=none \
    --outfile="$out" >/dev/null
done

# Wrap each transpiled chunk in an IIFE then concatenate.
{
  for base in tweaks-panel header footer sections about-contact router app; do
    printf '(function(){'
    cat "$TMP/${base}.js"
    printf '\n})();\n'
  done
} > app.js

echo "✔ built public/app.js ($(du -h app.js | cut -f1))"
