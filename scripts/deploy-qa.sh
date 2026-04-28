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
echo "==> deploy-qa: VERSION=${VERSION}"

npx wrangler@latest deploy \
  -c wrangler.qa.toml \
  --name riftroot-qa-edge \
  --var "VERSION:${VERSION}"

echo "==> verifying"
curl -s https://riftroot-qa.mock1ngbb.com/api/version
echo
curl -s https://riftroot-qa.mock1ngbb.com/ | grep -oE 'app\.js\?v=[^"]+' | head -1
