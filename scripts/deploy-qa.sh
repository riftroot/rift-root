#!/usr/bin/env bash
# Deploy site-qa to riftroot-qa-edge with a unique VERSION stamp.
#
# WHY: the worker rewrites <script src> tags to append ?v=<VERSION>. If
# VERSION never changes, Safari (especially iOS, which has no devtools
# escape hatch) keeps serving the stale bundle URL even though the HTML
# itself is no-store. A unique version per deploy guarantees the script
# URL changes -> cache miss -> fresh bundle.
#
# Use this instead of `make deploy-qa` until the Makefile target is
# updated (Makefile is frozen during the QA staging period).

set -euo pipefail

cd "$(dirname "$0")/.."

bash site-qa/build.sh

VERSION="$(git rev-parse --short HEAD)-$(date +%s)"
APP_BUNDLE="$(ls -1 site-qa/public/app-*.js 2>/dev/null | head -1 | xargs -I{} basename {})"
if [ -z "$APP_BUNDLE" ]; then
  echo "==> deploy-qa: ERROR — no hashed app-*.js found" >&2
  exit 1
fi
echo "==> deploy-qa: VERSION=${VERSION} APP_BUNDLE=${APP_BUNDLE}"

npx wrangler@latest deploy \
  -c wrangler.qa.toml \
  --name riftroot-qa-edge \
  --var "VERSION:${VERSION}" \
  --var "APP_BUNDLE:${APP_BUNDLE}"

echo "==> verifying"
curl -s https://riftroot-qa.mock1ngbb.com/api/version
echo
curl -s https://riftroot-qa.mock1ngbb.com/ | grep -oE 'app\.js\?v=[^"]+' | head -1
