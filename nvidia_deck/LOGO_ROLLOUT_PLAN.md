# Rift Root logo rollout — plan for next clear session

**Canonical artifact:** `~/AntiGH/rift-root/nvidia_deck/assets/rift-root-logo.svg`

This is the locked-in, color-corrected, neon-violet variant produced for the
NVIDIA Inception deck. It replaces every prior rift-root logo across the project.

Colors (frozen):
- `#FCFCFB` — formerly dark glyph paths, now light
- `#100F0F` — formerly light glyph paths, now dark
- `#E040FF` — neon electric violet rings (was muted `#771E8C`)

Resume cue: **"run rift root logo rollout"** or "execute LOGO_ROLLOUT_PLAN.md".

---

## Pre-flight (read before doing anything)

1. **Local-only token note (no rotation required).**
   `~/AntiGH/rift-root/.git/config` and global `url.<…>.insteadof` embed a
   literal `ghp_…` PAT for the rip-rooter bot. Machines are physically secure
   and only reachable via Tailscale, so rotation is not blocking. The same PAT
   is mirrored in keychain (`bifrost-GH_RIFTROOT_BOT_TOKEN`) and BIFROST_KV.
   Verify push works before pushing real changes:
   ```
   cd ~/AntiGH/rift-root && git ls-remote origin HEAD >/dev/null && echo OK
   ```

2. **Prod-freeze acknowledgement.** Per memory
   `feedback-commit-deploy-scope.md`, "deploy" never means qa→main promote by
   default. This rollout IS the explicit cutover ask, but only for the logo
   asset + favicon. Do not branch-thaw, do not promote unrelated qa changes.

3. **Worker name reality.** Per memory `rift-root-worker-names.md`, live binds
   to `riftroot-edge` (prod) / `riftroot-qa-edge` (staging). Makefile / wrangler
   names are reconciled but worth re-asserting via `make verify` before deploy.

4. **Completion standard.** Per memory `feedback-prove-it-done.md` and the
   active hook reminder: "shipped" = `bash scripts/preflight-ship.sh` exits 0
   AND `curl https://riftroot.com/...logo.svg` returns the new bytes. Push is
   not deploy.

---

## Step 1 — promote SVG to canonical location

Single source of truth lives in the repo, not in `nvidia_deck/`.

```
mkdir -p ~/AntiGH/rift-root/site/public/assets
cp ~/AntiGH/rift-root/nvidia_deck/assets/rift-root-logo.svg \
   ~/AntiGH/rift-root/site/public/assets/rift-root-logo.svg
# Mirror to site-qa for parity (so QA doesn't drift back).
cp ~/AntiGH/rift-root/nvidia_deck/assets/rift-root-logo.svg \
   ~/AntiGH/rift-root/site-qa/public/assets/rift-root-logo.svg

# Record the hash so future drift is detectable.
shasum -a 256 ~/AntiGH/rift-root/site/public/assets/rift-root-logo.svg \
  | tee ~/AntiGH/rift-root/site/public/assets/rift-root-logo.svg.sha256
```

Retire the legacy logo files **only after the new one is live**:
- `site/public/assets/riftroot-logo.svg`
- `site/public/assets/riftroot-full-logo.svg`
- `site/public/assets/riftroot-logo-tinted.svg`
- `site/public/assets/riftroot-logo-organic.svg`
- (and the `site-qa/` mirrors)

Plan: leave them in place for the deploy commit, then delete in a follow-up
commit once smoke confirms the new asset serves.

---

## Step 2 — update site references

Files that import / reference the logo (from `grep -rl`):
- `site/public/components/header.jsx`
- `site/public/app-DoNTdWJs.js`  *(check whether this is a built artefact — if
  so, it gets rebuilt by Vite, do not hand-edit)*
- `site-qa/public/components/header.jsx`
- `site-qa/public/app-*.js`

Action: open `header.jsx` in both, swap any `riftroot-logo.svg` /
`riftroot-full-logo.svg` reference to `rift-root-logo.svg`. Verify via
`npx vite build` (or whatever the project runs) and inspect the output bundle
for the new path. **Do not** edit the `app-*.js` artefact directly.

---

## Step 3 — favicon

The new SVG is square (`viewBox="0 0 1024 1024"`), so it can drive favicon
variants directly. Generate the standard set:

```
cd ~/AntiGH/rift-root
# Use multimedia-rework's rasterizer if Pillow handles the SVG cleanly,
# otherwise rsvg-convert (Homebrew librsvg) is the no-fuss path.
brew list librsvg >/dev/null || brew install librsvg
SVG=site/public/assets/rift-root-logo.svg
for sz in 16 32 48 64 128 180 256 512; do
  rsvg-convert -w $sz -h $sz "$SVG" -o site/public/favicons/favicon-${sz}.png
done
# Apple touch icon
cp site/public/favicons/favicon-180.png site/public/favicons/apple-touch-icon.png
# Multi-resolution .ico for legacy
magick site/public/favicons/favicon-{16,32,48}.png site/public/favicon.ico
```

Update `<head>` in the site's HTML entry to reference these. Mirror to `site-qa/`.

(Note: `multimedia-rework/tools/svg_to_ascii/bake_logo_png.py` is shape-hardcoded
to the old sample SVG and won't render this one correctly — use `rsvg-convert`
or extend that tool with a generic path-renderer in a separate task.)

---

## Step 4 — deploy

QA first, prod second. Never skip QA.

```
cd ~/AntiGH/rift-root
make deploy-qa
# Wait for QA cron / smoke to pass.
curl -s https://riftroot-qa.mock1ngbb.com/assets/rift-root-logo.svg \
  | shasum -a 256
# Compare against site-qa/.../rift-root-logo.svg.sha256.

# Then prod:
make deploy-site
bash scripts/preflight-ship.sh   # MUST exit 0 — this is the "shipped" gate.
curl -s https://riftroot.com/assets/rift-root-logo.svg | shasum -a 256
curl -sI https://riftroot.com/favicon.ico | head -3
```

Live proof to paste back when done:
- `riftroot.com/assets/rift-root-logo.svg` SHA256 matches the canonical hash.
- `riftroot.com/favicon.ico` returns 200 + new `Content-Length`.
- `riftroot-qa.mock1ngbb.com` matches.

---

## Step 5 — push via rip-rooter bot to riftroot/* repos

All three GitHub orgs/repos that should carry the new logo:
- `riftroot/rift-root` (site source — the deploy commit lives here)
- `riftroot/erebus-edge` (architecture doc repo — README hero / social card)
- `riftroot/.github` (org profile — README hero)
- `riftroot/surface-optimization` (if it has a README hero, otherwise skip)

Note: `~/AntiGH/erebus-edge` currently has remote
`mockingb1rdblue/erebus-edge`, not `riftroot/erebus-edge`. Confirm which is
canonical before pushing — per memory `rift-root-session-2026-04-28.md` the
riftroot org repo is the public-facing one.

Push protocol (rip-rooter only):
```
# Verify rip-rooter insteadOf is the active credential path.
git config --global --get-regexp 'url\..*\.insteadof' | grep riftroot

# For each repo:
cd <repo>
git checkout -b chore/canonical-logo
# (drop in the SVG + favicons + any README references)
git add -A
git commit -m "chore: adopt canonical rift-root logo (neon-violet variant)"
git push -u origin chore/canonical-logo
gh pr create --title "Adopt canonical rift-root logo" --body "..."
gh pr merge --squash --delete-branch
```

`gh` calls authenticate via `GH_TOKEN=$(secret GH_RIFTROOT_BOT_TOKEN)`. Confirm
the merge commits show `rip-rooter` (or whatever the bot login is) as author,
not `mockingb1rdblue`. If they show the user account, the insteadOf is wrong —
stop and fix before continuing.

---

## Step 6 — final verification (live proof, no exceptions)

Print all of these in the chat when done:

```
# canonical hash
shasum -a 256 ~/AntiGH/rift-root/site/public/assets/rift-root-logo.svg

# live prod
curl -s https://riftroot.com/assets/rift-root-logo.svg | shasum -a 256
curl -sI https://riftroot.com/favicon.ico | head -2

# live qa
curl -s https://riftroot-qa.mock1ngbb.com/assets/rift-root-logo.svg | shasum -a 256

# repo state — author should be rip-rooter on each merge
for r in riftroot/rift-root riftroot/erebus-edge riftroot/.github; do
  gh api repos/$r/commits/main --jq '.commit.author.name + " :: " + .commit.message' | head -1
done
```

Done = every line above matches expectation. Anything else = not done.

---

## Out of scope for this rollout

- Updating the NVIDIA deck PDF — already done, locked.
- Touching anything in `bifrost-bridge`, `CarPiggy`, `vestas-warpath`. Logo is
  rift-root only.
- Promoting unrelated `qa/v2` changes to prod. The merge-freeze stays except
  for this asset swap.
- Renaming workers, migrating wrangler.toml, etc. The mismatch is logged in
  memory; not this session's problem.
