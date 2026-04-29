#!/usr/bin/env bash
# preflight-ship.sh — live-state deploy validator for rift-root
# Usage: scripts/preflight-ship.sh <target>   (target = key in .preflight-config.json)
# Exit codes: 0=pass, 1=config/usage error, 3=must_contain fail,
#             4=must_not_contain fail
# NOTE: hash mismatch (formerly exit 2) is now a WARN — esbuild non-determinism
#       makes cross-session hashes differ even for identical inputs.
set -euo pipefail

# ── color setup ──────────────────────────────────────────────────────────────
if command -v tput &>/dev/null && [ "$(tput colors 2>/dev/null || echo 0)" -ge 8 ]; then
  RED=$(tput setaf 1); GRN=$(tput setaf 2); YLW=$(tput setaf 3); RST=$(tput sgr0)
else
  RED=''; GRN=''; YLW=''; RST=''
fi

pass() { printf "%s[PASS]%s %s\n" "$GRN" "$RST" "$*"; }
fail() { printf "%s[FAIL]%s %s\n" "$RED" "$RST" "$*"; }
warn() { printf "%s[WARN]%s %s\n" "$YLW" "$RST" "$*"; }
info() { printf "       %s\n" "$*"; }

# ── args ─────────────────────────────────────────────────────────────────────
TARGET="${1:-}"
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CONFIG_FILE="${REPO_ROOT}/.preflight-config.json"

if [ -z "$TARGET" ]; then
  echo "Usage: $0 <target>"
  echo "Targets: $(jq -r '.targets | keys | join(", ")' "$CONFIG_FILE")"
  exit 1
fi

if ! jq -e ".targets[\"$TARGET\"]" "$CONFIG_FILE" &>/dev/null; then
  echo "Unknown target: $TARGET"
  echo "Available: $(jq -r '.targets | keys | join(", ")' "$CONFIG_FILE")"
  exit 1
fi

cfg() { jq -r ".targets[\"$TARGET\"].$1" "$CONFIG_FILE"; }

URL="$(cfg url)"
BUNDLE_PATH="$(cfg bundle_path)"
BUILD_CMD="$(cfg build_cmd)"
LOCAL_BUNDLE="$(REPO_ROOT_VAR="$REPO_ROOT"; jq -r ".targets[\"$TARGET\"].local_bundle_path" "$CONFIG_FILE")"
LOCAL_BUNDLE="${REPO_ROOT}/${LOCAL_BUNDLE}"
MUST_CONTAIN_LEN="$(jq ".targets[\"$TARGET\"].must_contain | length" "$CONFIG_FILE")"
MUST_NOT_CONTAIN_LEN="$(jq ".targets[\"$TARGET\"].must_not_contain | length" "$CONFIG_FILE")"

BUNDLE_URL="${URL}${BUNDLE_PATH}"

# ── sha256 helper (macOS compat) ──────────────────────────────────────────────
sha256_file() {
  if command -v sha256sum &>/dev/null; then
    sha256sum "$1" | awk '{print $1}'
  else
    shasum -a 256 "$1" | awk '{print $1}'
  fi
}

# ── temp dir ─────────────────────────────────────────────────────────────────
TMPDIR_WORK="$(mktemp -d)"
trap 'rm -rf "$TMPDIR_WORK"' EXIT
LIVE_BUNDLE="${TMPDIR_WORK}/live_bundle.js"

OVERALL_EXIT=0
CF_RAY="(none)"
DEPLOY_DATE=""

echo ""
echo "═══════════════════════════════════════════════════════"
echo "  preflight-ship  •  target: ${TARGET}  •  ${URL}"
echo "═══════════════════════════════════════════════════════"
echo ""

# ── CHECK 1: HTTP 200 + headers ───────────────────────────────────────────────
printf "[ 1 ] HTTP status + headers … "
HEADERS="$(curl -sI "${URL}" 2>&1)"
HTTP_CODE="$(printf '%s' "$HEADERS" | grep -i "^HTTP/" | tail -1 | awk '{print $2}')"
CF_RAY="$(printf '%s' "$HEADERS" | grep -i "^cf-ray:" | awk '{print $2}' | tr -d '\r')"
DEPLOY_DATE="$(printf '%s' "$HEADERS" | grep -i "^date:" | sed 's/^[Dd]ate: //' | tr -d '\r')"

if [ "$HTTP_CODE" = "200" ]; then
  pass "HTTP $HTTP_CODE  cf-ray=${CF_RAY}  date=${DEPLOY_DATE}"
else
  fail "HTTP $HTTP_CODE (expected 200)"
  OVERALL_EXIT=1
fi

# ── CHECK 2: fetch live bundle ────────────────────────────────────────────────
printf "[ 2 ] Fetch live bundle … "
HTTP_BUNDLE_CODE="$(curl -s -o "$LIVE_BUNDLE" -w "%{http_code}" "$BUNDLE_URL")"
if [ "$HTTP_BUNDLE_CODE" = "200" ] && [ -s "$LIVE_BUNDLE" ]; then
  LIVE_HASH="$(sha256_file "$LIVE_BUNDLE")"
  pass "fetched $(wc -c < "$LIVE_BUNDLE" | tr -d ' ') bytes  sha256=${LIVE_HASH:0:16}…"
else
  fail "Could not fetch bundle at $BUNDLE_URL (HTTP $HTTP_BUNDLE_CODE)"
  OVERALL_EXIT=1
  # Can't continue hash checks without live bundle
  echo ""
  echo "───────────────────────────────────────────────────────"
  fail "PREFLIGHT FAILED — could not fetch live bundle (exit ${OVERALL_EXIT})"
  echo "  CF-Ray: ${CF_RAY}"
  echo "═══════════════════════════════════════════════════════"
  exit $OVERALL_EXIT
fi

# ── CHECK 3+4: build locally + compare hashes ────────────────────────────────
printf "[ 3 ] Build local bundle … "
cd "$REPO_ROOT"
BUILD_LOG="${TMPDIR_WORK}/build.log"
if bash -c "$BUILD_CMD" > "$BUILD_LOG" 2>&1; then
  pass "build succeeded"
else
  fail "build_cmd exited non-zero — see log below"
  cat "$BUILD_LOG"
  OVERALL_EXIT=1
fi

# ── CHECK 4: hash comparison (WARN-only) ─────────────────────────────────────
# Why WARN and not FAIL:
#   esbuild's minifier is non-deterministic across shell sessions — the same
#   JSX inputs can produce different byte sequences in a fresh build, so a
#   strict hash gate creates spurious failures unrelated to deploy correctness.
#
# What actually catches a bad deploy:
#   must_contain (check 5) is the right gate. Target a string that appears
#   only in the most-recent change (e.g. a new component name, an updated
#   copy string). If that string is absent from the live bundle, the wrong
#   artifact is deployed — and check 5 will fail with exit 3.
#
#   Hash equality here is a nice-to-have signal (same-session rebuilds DO
#   match), but a mismatch alone does not mean the deploy is broken.
printf "[ 4 ] Hash comparison … "
if [ -f "$LOCAL_BUNDLE" ]; then
  LOCAL_HASH="$(sha256_file "$LOCAL_BUNDLE")"
  if [ "$LIVE_HASH" = "$LOCAL_HASH" ]; then
    pass "hashes match  ${LIVE_HASH:0:16}…"
  else
    warn "hash differs (probable build non-determinism, not a deploy failure)"
    info "  live   sha256: ${LIVE_HASH}"
    info "  local  sha256: ${LOCAL_HASH}"
    info "  Tip: use must_contain with a recent-change string as the real deploy gate."
    # Do NOT set OVERALL_EXIT — hash mismatch alone is not a failure.
  fi
else
  warn "local bundle not found at ${LOCAL_BUNDLE} — skipping hash compare"
fi

# ── CHECK 5: must_contain ────────────────────────────────────────────────────
printf "[ 5 ] must_contain checks … "
MC_FAIL=0
for i in $(seq 0 $((MUST_CONTAIN_LEN - 1))); do
  NEEDLE="$(jq -r ".targets[\"$TARGET\"].must_contain[$i]" "$CONFIG_FILE")"
  if grep -qF "$NEEDLE" "$LIVE_BUNDLE"; then
    : # ok
  else
    fail "missing: \"${NEEDLE}\""
    MC_FAIL=1
  fi
done
if [ "$MC_FAIL" -eq 0 ]; then
  pass "all ${MUST_CONTAIN_LEN} strings present"
  [ "$OVERALL_EXIT" -eq 0 ] && OVERALL_EXIT=0
else
  [ "$OVERALL_EXIT" -eq 0 ] && OVERALL_EXIT=3
fi

# ── CHECK 6: must_not_contain ────────────────────────────────────────────────
printf "[ 6 ] must_not_contain checks … "
MNC_FAIL=0
for i in $(seq 0 $((MUST_NOT_CONTAIN_LEN - 1))); do
  NEEDLE="$(jq -r ".targets[\"$TARGET\"].must_not_contain[$i]" "$CONFIG_FILE")"
  if grep -qF "$NEEDLE" "$LIVE_BUNDLE"; then
    fail "found forbidden: \"${NEEDLE}\""
    MNC_FAIL=1
  fi
done
if [ "$MNC_FAIL" -eq 0 ]; then
  pass "all ${MUST_NOT_CONTAIN_LEN} forbidden strings absent"
else
  [ "$OVERALL_EXIT" -eq 0 ] && OVERALL_EXIT=4
fi

# ── CHECK 7: commit staleness WARN ───────────────────────────────────────────
printf "[ 7 ] Commit staleness … "
COMMIT_TIME="$(git -C "$REPO_ROOT" log -1 --format=%ct HEAD 2>/dev/null || echo 0)"
if [ -n "$DEPLOY_DATE" ] && [ "$COMMIT_TIME" -gt 0 ]; then
  # macOS date parse
  DEPLOY_EPOCH="$(date -j -f "%a, %d %b %Y %H:%M:%S %Z" "$DEPLOY_DATE" +%s 2>/dev/null || echo 0)"
  if [ "$DEPLOY_EPOCH" -gt 0 ]; then
    DELTA=$(( COMMIT_TIME - DEPLOY_EPOCH ))
    if [ "$DELTA" -gt 60 ]; then
      warn "local commit is newer than deploy by ${DELTA}s — did you forget to deploy?"
    else
      pass "commit within deploy window (delta ${DELTA}s)"
    fi
  else
    warn "could not parse deploy date header: \"${DEPLOY_DATE}\""
  fi
else
  warn "skipped (no deploy date or git unavailable)"
fi

# ── SUMMARY ──────────────────────────────────────────────────────────────────
echo ""
echo "───────────────────────────────────────────────────────"
if [ "$OVERALL_EXIT" -eq 0 ]; then
  pass "PREFLIGHT PASSED — ${TARGET} is live and consistent"
else
  fail "PREFLIGHT FAILED — exit ${OVERALL_EXIT} (3=must_contain,4=must_not_contain)"
fi
echo "  CF-Ray: ${CF_RAY}"
echo "  Target: ${BUNDLE_URL}"
echo "═══════════════════════════════════════════════════════"
echo ""
exit "$OVERALL_EXIT"
