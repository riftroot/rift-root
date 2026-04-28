#!/usr/bin/env bash
# riftroot-prod-freeze.sh — PreToolUse hook that blocks writes to the production surface.
# Exit 0 = allow. Exit 2 = block (Claude Code treats exit 2 as a hard deny).
#
# Sentinel: if .claude/.riftroot-prod-thaw exists, the freeze is OFF and all ops are allowed.
# Thaw:    touch /Users/mock1ng/AntiGH/rift-root/.claude/.riftroot-prod-thaw
# Re-freeze: rm /Users/mock1ng/AntiGH/rift-root/.claude/.riftroot-prod-thaw

set -euo pipefail

REPO_ROOT="/Users/mock1ng/AntiGH/rift-root"
SENTINEL="${REPO_ROOT}/.claude/.riftroot-prod-thaw"

# --- Thaw check -----------------------------------------------------------
if [[ -f "$SENTINEL" ]]; then
  exit 0
fi

# --- Read JSON from stdin --------------------------------------------------
INPUT="$(cat)"

TOOL_NAME="$(printf '%s' "$INPUT" | python3 -c "
import sys, json
d = json.load(sys.stdin)
print(d.get('tool_name', ''))
" 2>/dev/null || true)"

# ---------------------------------------------------------------------------
# Frozen path patterns (relative to repo root, as prefix strings)
# ---------------------------------------------------------------------------
FROZEN_PREFIXES=(
  "site/"
  "wrangler.toml"
  "Makefile"
  ".claude/settings.json"
  ".claude/hooks/riftroot-prod-freeze.sh"
)

# Returns 0 if the given path (absolute or relative) falls under a frozen prefix
is_frozen() {
  local raw_path="$1"
  # Normalise: strip repo root prefix so we work with repo-relative paths
  local rel="${raw_path#${REPO_ROOT}/}"
  # If still absolute (outside repo), not frozen
  [[ "$rel" == /* ]] && return 1

  for prefix in "${FROZEN_PREFIXES[@]}"; do
    # Exact file match or directory prefix match
    if [[ "$rel" == "$prefix" ]] || [[ "$rel" == "${prefix%/}"/* ]] || [[ "$rel" == "${prefix}" ]]; then
      return 0
    fi
    # Handle prefix without trailing slash (e.g. "wrangler.toml")
    if [[ "$rel" == "$prefix" ]]; then
      return 0
    fi
  done
  return 1
}

deny() {
  echo "PROD-FREEZE: write blocked — '$1' is on the frozen production surface." >&2
  echo "To thaw: touch ${SENTINEL}" >&2
  exit 2
}

# ---------------------------------------------------------------------------
# File-edit tools: Write, Edit, MultiEdit, NotebookEdit
# ---------------------------------------------------------------------------
case "$TOOL_NAME" in
  Write|Edit|MultiEdit|NotebookEdit)
    # Extract file_path field (works for Write, Edit; MultiEdit has edits[].file_path)
    PATHS="$(printf '%s' "$INPUT" | python3 -c "
import sys, json
d = json.load(sys.stdin)
ti = d.get('tool_input', {})
paths = []
if 'file_path' in ti:
    paths.append(ti['file_path'])
if 'edits' in ti:
    for e in ti['edits']:
        if 'file_path' in e:
            paths.append(e['file_path'])
# NotebookEdit
if 'notebook_path' in ti:
    paths.append(ti['notebook_path'])
for p in paths:
    print(p)
" 2>/dev/null || true)"

    while IFS= read -r p; do
      [[ -z "$p" ]] && continue
      is_frozen "$p" && deny "$p"
    done <<< "$PATHS"
    ;;

  # ---------------------------------------------------------------------------
  # Bash tool — scan the command string for destructive ops on frozen paths
  # ---------------------------------------------------------------------------
  Bash)
    CMD="$(printf '%s' "$INPUT" | python3 -c "
import sys, json
d = json.load(sys.stdin)
print(d.get('tool_input', {}).get('command', ''))
" 2>/dev/null || true)"

    # Helper: check every word-ish token in the command that looks like a path
    check_cmd_paths() {
      local cmd="$1"
      # Extract anything that looks like a path (contains /, or matches a frozen filename)
      # We tokenise roughly on whitespace and common shell punctuation
      local tokens
      tokens="$(printf '%s' "$cmd" | tr ' \t;|&<>' '\n' | grep -E '(^/|site/|wrangler\.toml|Makefile|\.claude/)' || true)"
      while IFS= read -r tok; do
        [[ -z "$tok" ]] && continue
        # Strip leading redirect chars
        tok="${tok#>}"
        tok="${tok#>>}"
        # Resolve relative to repo root if not absolute
        if [[ "$tok" != /* ]]; then
          tok="${REPO_ROOT}/${tok}"
        fi
        is_frozen "$tok" && deny "$tok"
      done <<< "$tokens"
    }

    # Detect destructive operations; only check paths if a dangerous op is present
    if printf '%s' "$CMD" | grep -qE '\brm\b|\bmv\b|sed\s+-i|>\s*[^>]|>>[[:space:]]|tee\b|\bcp\b|\bchmod\b|\btruncate\b'; then
      check_cmd_paths "$CMD"
    fi
    ;;
esac

exit 0
