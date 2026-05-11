# Plan — riftroot.com user-unreachable triage (parallel sonnet + haiku)

**Status:** PLAN ONLY · awaiting kickoff
**Created:** 2026-05-11
**Repo:** `/Users/mock1ng/AntiGH/rift-root` · branch `main`
**Default branch:** `main`
**Last prod deploy:** `riftroot-edge` version `1778510630` (commit `d83c17a`)

## 1. Context snapshot

- User reports riftroot.com and subpages are unreachable from their browser ("this site can't be reached").
- From the planner's network, **apex riftroot.com responds 200** (cf-ray DEN POP, `x-app-version: 1778510630`, cf-cache HIT, content-type text/html). DNS resolves to Cloudflare IPs (172.67.200.171, 104.21.90.135, 2606:4700:…). So this is **not** a global deploy failure.
- **`www.riftroot.com` has no DNS record at all** — verified via `dig +short www.riftroot.com` (empty) and CF API zone listing (zone `7c6b1d1c1eb965121e25b57106c5e47a`, no www record present). If the user typed `www.riftroot.com`, NXDOMAIN explains the symptom verbatim.
- Recent change: commit `d83c17a` added a `<noscript>` fallback block inside `#root` in `site/public/index.html`. Preflight (`scripts/preflight-ship.sh prod`) passed all 7 checks against the live URL after deploy. No service worker is registered by the site (only `cache-bust.js` polling `/api/version`).
- Suspect cause priority (planner's read): (a) user typed www-prefixed URL → NXDOMAIN, (b) stale browser cache or wedged `cache-bust.js` reload loop, (c) ISP DNS / local resolver hijack, (d) CF WAF or regional POP issue, (e) noscript regression breaking React hydration in a specific browser. (a) and (b) are by far the most likely.

## 2. Proposed partition

Six parallel agents. Independent scopes, non-overlapping file ownership.

| # | Agent | Model | Scope | Owns | Must NOT touch |
|---|---|---|---|---|---|
| A1 | `client-side-triage` | haiku | Build a runnable diagnostic script + a user-facing Q&A checklist that pinpoints whether the failure is DNS, browser cache, ISP, or device-specific. Produces `docs/triage/client-diagnostic.sh` + `docs/triage/USER-CHECKLIST.md`. | `docs/triage/**` | `site/`, `wrangler*.toml`, `Makefile` |
| A2 | `cf-edge-investigation` | sonnet | Pull CF zone analytics, firewall events, Workers Custom Domain status, zone status, recent rule changes. Produces `docs/triage/cf-edge-report.md` with verbatim API output. Read-only against CF. | `docs/triage/cf-edge-report.md` | everything else |
| A3 | `www-subdomain-fix` | sonnet | Add `www.riftroot.com` so the www URL works (CNAME flattening to apex + Workers Custom Domain attach, OR a CF redirect rule www→apex — pick after reading CF state). Deploy and verify `curl -sI https://www.riftroot.com` returns 200/301. | `site/wrangler.toml` (if a route stanza is needed), CF DNS record creation via API | `site/public/**` |
| A4 | `noscript-regression-verify` | sonnet | Confirm commit `d83c17a` did not break React hydration in Chrome/Safari/Firefox. Use a headless browser; capture screenshot + console logs; verify `#root` ends up with React-rendered DOM (not noscript copy). If broken, prepare a clean revert PR to `0afb0a0`. Produces `docs/triage/noscript-verify.md`. | `docs/triage/noscript-verify.md`, optionally a revert branch | `site/public/index.html` unless rollback is needed |
| A5 | `headless-smoke-multi-ua` | haiku | Run curl + headless fetches against `https://riftroot.com`, `https://www.riftroot.com`, and each in-page hash route, with multiple user-agents (Chrome, Safari iOS, Firefox, Googlebot, curl). Capture status, response size, content snippet. Produces `docs/triage/smoke-matrix.md`. | `docs/triage/smoke-matrix.md` | everything else |
| A6 | `session-prep` | sonnet | Required by skill. Writes/refreshes `docs/plans/next-session-kickoff.md`, `STATUS.md`, and a triage runbook so a cold-start session can land here. Aggregates outputs from A1–A5 at the end. | `docs/plans/next-session-kickoff.md`, `STATUS.md`, `docs/triage/RUNBOOK.md` | source code, infra config |

All six are truly independent. A6 reads A1–A5 artifacts after they merge but doesn't gate them.

## 3. Per-agent prompt drafts

> All agents share these hard rules. Quote them verbatim at the top of each prompt:
> - Consult docs first (`use-docs` skill if applicable) and Perplexity Sonar Pro on any blocker or failure reaction BEFORE the next attempt. Cite sources in the PR body.
> - No `--no-verify` on commits. Proper branch (`triage/<agent>`) + PR + squash-merge to `main`.
> - Commit body ends with a `Learnings:` section.
> - Read `.agent/workflows/agent-quality-gate.md` if present.
> - Secret resolution order: UDS daemon (`~/.bifrost/daemon.sock`) → macOS Keychain (`security find-generic-password -w -s "bifrost-<NAME>" ~/Library/Keychains/login.keychain-db`) + CF REST → exit 1. Never use `wrangler kv` or `fly ssh` for secrets.
> - Ship gate: nothing is "shipped" until `bash scripts/preflight-ship.sh prod` exits 0 against the live URL. `git push` is not deploy.
> - File exclusion list per-agent is binding — do not edit files outside your owned paths.

### A1 — client-side-triage (haiku)
Branch: `triage/client-side-diagnostic`

> Build the user-side diagnostic kit for riftroot.com unreachability. The user reports "this site can't be reached"; from the planner's network the site returns HTTP/2 200 with `x-app-version: 1778510630`. Likely causes ranked: (a) user typed `www.riftroot.com` and got NXDOMAIN, (b) browser cache or wedged `cache-bust.js` reload loop, (c) ISP DNS / local resolver, (d) device-specific.
>
> Deliverables:
> 1. `docs/triage/client-diagnostic.sh` — a bash script the user runs on their machine: prints `dig riftroot.com`, `dig www.riftroot.com`, `curl -sI https://riftroot.com`, `curl -sI https://www.riftroot.com`, `nslookup riftroot.com 1.1.1.1`, `ping -c 3 riftroot.com`, `traceroute -m 12 riftroot.com`, and a final pass/fail summary. Exit 0.
> 2. `docs/triage/USER-CHECKLIST.md` — a numbered checklist for the user, in plain English, ordered by probability: (1) try `https://riftroot.com` (no www) in incognito, (2) try on cellular hotspot, (3) flush DNS (`sudo killall -HUP mDNSResponder` on mac), (4) try a different browser, (5) try `1.1.1.1` or `8.8.8.8` as resolver, (6) run the diagnostic script.
>
> Do NOT touch `site/`, `wrangler*.toml`, `Makefile`. Open one PR. Add a `Learnings:` block. Squash-merge.

### A2 — cf-edge-investigation (sonnet)
Branch: `triage/cf-edge-report`

> Pull a complete CF edge health report for zone `7c6b1d1c1eb965121e25b57106c5e47a` (riftroot.com). Authenticate with `secret CF_ZONE_TOKEN_RIFTROOT` (or `secret CF_ADMIN_TOKEN` if zone token lacks scope — note which). Read-only.
>
> Endpoints to hit:
> - `GET /zones/{zone_id}` — zone status, name servers, paused flag.
> - `GET /zones/{zone_id}/dns_records?per_page=100` — full record set; confirm whether www exists.
> - `GET /zones/{zone_id}/firewall/events?since=-86400` — last 24h security events.
> - `GET /zones/{zone_id}/analytics/dashboard?since=-1440` — last 24h request volume, error rate, country breakdown.
> - `GET /accounts/{account_id}/workers/domains?zone_id={zone_id}` — confirm `riftroot-edge` is bound to apex.
> - `GET /accounts/{account_id}/workers/scripts/riftroot-edge` — script metadata.
>
> Write findings verbatim (API output preserved in code fences) to `docs/triage/cf-edge-report.md`. Highlight anything anomalous: paused zone, blocked country, 5xx spike, missing Workers Domain binding, recent firewall rule changes. Cite the request URLs.
>
> Open one PR. `Learnings:` block. Squash-merge. Do NOT modify any zone state.

### A3 — www-subdomain-fix (sonnet)
Branch: `triage/www-subdomain`

> `www.riftroot.com` currently has no DNS record. Add it so `https://www.riftroot.com` resolves and serves the same content as the apex.
>
> Approach (pick after reading A2's report once available, or run independently):
> 1. **Preferred:** create a Single Redirect rule on the zone that 301s `www.riftroot.com/*` → `https://riftroot.com/$1`. This avoids a second Workers Custom Domain.
> 2. **Fallback if redirect rule conflicts:** add a CNAME `www → riftroot.com` proxied=true, then attach `riftroot-edge` to `www.riftroot.com` via `/accounts/.../workers/domains`.
>
> Authenticate via Keychain (`CF_ZONE_TOKEN_RIFTROOT` for DNS, `CF_WORKERS_DOMAINS_TOKEN` for domain attach). Verify with `curl -sI https://www.riftroot.com` — expect 200 or 301→200. Re-query CF API to show final state. Show one line of live proof in the PR description.
>
> Owned files: any new wrangler stanza in `site/wrangler.toml` only if Workers Domain attach is needed. Do NOT touch `site/public/**`.
>
> `Learnings:` block. Squash-merge.

### A4 — noscript-regression-verify (sonnet)
Branch: `triage/noscript-verify` (rollback branch only if needed: `revert/noscript-d83c17a`)

> Commit `d83c17a` added a `<noscript>` block inside `#root` in `site/public/index.html`. Verify React hydration still works correctly across Chrome, Safari, and Firefox.
>
> Steps:
> 1. Use a headless browser (Playwright preferred — install if needed via `npx playwright`). Load `https://riftroot.com` with each engine.
> 2. After load, evaluate `document.getElementById('root').innerHTML` — confirm React-rendered content is present (look for a unique component string like `compositor`), and the noscript element is gone (React replaced #root's children).
> 3. Capture: screenshot, console logs, network HAR.
> 4. Write findings to `docs/triage/noscript-verify.md` with verdict: PASS (no regression) or FAIL (rollback required).
> 5. If FAIL: open a clean revert PR `revert/noscript-d83c17a` that reverts only `site/public/index.html` to its `0afb0a0` state, run `make deploy-site` (export `CLOUDFLARE_API_TOKEN` from Keychain bootstrap entry), confirm `scripts/preflight-ship.sh prod` exits 0, show live proof.
>
> Do NOT touch `site/public/index.html` unless FAIL verdict is reached.
>
> `Learnings:` block. Squash-merge.

### A5 — headless-smoke-multi-ua (haiku)
Branch: `triage/smoke-matrix`

> Build a smoke matrix of riftroot.com across user agents. For each of `{Chrome desktop, Safari iOS, Firefox desktop, Googlebot/2.1, curl/8.7.1}` × `{https://riftroot.com, https://www.riftroot.com}`, run a curl with `-A "<UA>"` and capture:
> - HTTP status
> - `content-type`, `cf-ray`, `x-app-version`, `cf-cache-status`
> - Response size in bytes
> - First 200 bytes of body
>
> Output a markdown table at `docs/triage/smoke-matrix.md`. Flag any row that returns non-200 or non-text/html.
>
> Read-only. No file edits outside `docs/triage/smoke-matrix.md`. `Learnings:` block. Squash-merge.

### A6 — session-prep (sonnet)
Branch: `triage/session-prep`

> Skill-required. After A1–A5 land (or in parallel for the static parts), aggregate and write:
> 1. `docs/plans/next-session-kickoff.md` — cold-start pointer doc. Includes: links to A1–A5 PRs, the current state of riftroot.com from the latest CF report, the recommended user-facing remediation in order of probability, and the exact kickoff phrase to resume triage if the user comes back unresolved.
> 2. `STATUS.md` at repo root — one-screen project status: prod URL, live version, open triage PRs, last preflight result, known outstanding issues. Replace existing if present.
> 3. `docs/triage/RUNBOOK.md` — operator runbook for "user reports site unreachable" with a decision tree (NXDOMAIN? → www fix; specific browser? → cache/SW clear; whole network? → CF edge report; recent deploy? → noscript rollback).
>
> Do NOT modify source. `Learnings:` block. Squash-merge.

## 4. Session-prep agent

A6 above. Required by skill — already enumerated.

## 5. Preconditions + risks

**Preconditions for kickoff:**
- Tree clean except `Ingest_Plan/` (untracked — fine).
- `main` is at `d83c17a` (this plan doc adds one commit on top).
- Keychain unlocked (already done this session with pw 7098).
- User has not reported any additional symptoms since "can't reach the page."

**Risks:**
- **A3 (www fix) might be premature** if the user wasn't actually typing www. Mitigation: A3 is cheap and idempotent — adding www→apex redirect doesn't harm anything even if unneeded.
- **A4 (regression check) might find a real hydration bug.** Mitigation: A4 has a built-in clean rollback path; revert PR is small and the preflight gate catches anything off.
- **A2 (CF investigation) might find a zone-level issue** (paused, suspended, recent WAF). Mitigation: A2 is read-only; any remediation goes into a follow-up agent gated on the report.
- **All agents run in parallel against the same repo.** Each owns disjoint paths (see partition table) so merge conflicts are nil. A6 reads but doesn't write A1–A5's files.

**Ordering:**
- A1, A2, A3, A4, A5 fire in parallel. No dependencies between them.
- A6 fires last (or in parallel with a phase-2 trigger once A1–A5 PRs land).

## 6. Global skill compliance

- ✅ No deferral — every actionable item gets an agent, no "do later."
- ✅ Parallel by default — 5 agents in one wave + 1 session-prep.
- ✅ Docs + Sonar Pro mandate cited in every prompt.
- ✅ Branch + PR + squash-merge, no force-push, no `--no-verify`.
- ✅ `Learnings:` block required in every PR body.
- ✅ Secret resolution order spelled out per-agent.
- ✅ Ship gate (`preflight-ship.sh prod`) referenced wherever an agent deploys.
- ✅ Plan doc committed to repo before kickoff (this very commit).
- ✅ Mix of sonnet (judgment-heavy) and haiku (mechanical/triage) per user request.

## 7. Stop condition

All 6 PRs squash-merged into `main` AND `docs/plans/next-session-kickoff.md` is up-to-date with the final remediation recommendation. If A2 surfaces a CF-side incident requiring user action (e.g. zone paused for billing), the wave halts after the report lands and the session-prep doc flags the user action.

## 8. Kickoff request (same-session)

Say **kickoff** (or *go* / *fire* / *run it* / *ship it*) to launch this plan. I will not fire any agent until you do.

## 9. Next-session kickoff phrase

````
next-session kickoff:
> "Resume the plan at `docs/plans/riftroot-unreachable-triage.md`. Execute all 6 agents per that doc in parallel — A1/A5 as haiku, A2/A3/A4/A6 as sonnet. Kickoff."
````
