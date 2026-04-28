# rift-root Production Freeze

## Why This Exists

The production surface (`site/`, `wrangler.toml`, `Makefile`, and the hook files
themselves) is frozen while a v2 QA build is being assembled at `site-qa/`. This
prevents accidental writes to prod during parallel development. The freeze is
enforced by a Claude Code `PreToolUse` hook that blocks all file-edit tools
**and** destructive Bash operations targeting frozen paths.

## Frozen Paths

| Path | Notes |
|---|---|
| `site/**` | All worker assets / public files for production |
| `wrangler.toml` | Production Wrangler config |
| `Makefile` | Shared build/deploy entrypoint |
| `.claude/settings.json` | Hook config — protected to prevent bypass |
| `.claude/hooks/riftroot-prod-freeze.sh` | The hook itself — protected |

## Writable Paths (not frozen)

- `site-qa/**` — QA build target
- `site-qa-*/**` — any variant staging dirs
- `public/**` — planning docs (top-level, not worker assets)
- `scripts/**` — utility scripts
- `worker/**` — worker source (writable for QA worker additions)
- Everything else not in the frozen list

## Sentinel File

The freeze is controlled by the presence of a sentinel file:

```
/Users/mock1ng/AntiGH/rift-root/.claude/.riftroot-prod-thaw
```

- **File absent** → freeze is ON (default, normal state).
- **File present** → freeze is OFF (thawed).

The sentinel file is intentionally `.gitignore`-able and is never committed.

## Thaw (disable freeze)

```bash
touch /Users/mock1ng/AntiGH/rift-root/.claude/.riftroot-prod-thaw
```

## Re-freeze After Thaw

```bash
rm /Users/mock1ng/AntiGH/rift-root/.claude/.riftroot-prod-thaw
```

## Cutover Procedure (when v2 is ready)

1. QA sign-off complete on `site-qa/`.
2. Thaw: `touch /Users/mock1ng/AntiGH/rift-root/.claude/.riftroot-prod-thaw`
3. Merge / copy `site-qa/` → `site/` and update `wrangler.toml` / `Makefile` as needed.
4. Deploy via `make deploy` (or the updated target).
5. Smoke-test production.
6. Re-freeze: `rm /Users/mock1ng/AntiGH/rift-root/.claude/.riftroot-prod-thaw`
7. Archive or delete `site-qa/` once stable.

## Hook Implementation

- **Script**: `.claude/hooks/riftroot-prod-freeze.sh`
- **Trigger**: `PreToolUse` for `Write`, `Edit`, `MultiEdit`, `NotebookEdit`, and `Bash`
- **Deny signal**: script exits `2` (Claude Code hard-deny) with a stderr message
- **Allow signal**: script exits `0`
- The hook reads JSON from stdin per the Claude Code `PreToolUse` protocol, extracts
  `tool_input.file_path` (or `command` for Bash), and checks against the frozen prefix list.
