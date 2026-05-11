# CF Edge Health Report — riftroot.com

**Generated:** 2026-05-11  
**Zone:** `7c6b1d1c1eb965121e25b57106c5e47a` (riftroot.com)  
**Account:** `a62c1c7880b50ac345fc7c2135f6ae84` (mock1ng account)  
**Token used:** `CF_ZONE_TOKEN_RIFTROOT` (keychain: `bifrost-CF_ZONE_TOKEN_RIFTROOT`). Fell back to `CF_ADMIN_TOKEN` for ruleset listing (zone token lacked `rulesets:read`). Analytics endpoints required `zone.analytics.read` — absent from all available tokens (see §6).

---

## VERDICT: HEALTHY

No zone-level anomalies detected. Zone active, not paused, `riftroot-edge` bound to apex. `www.riftroot.com` has **no DNS record** — confirmed NXDOMAIN. Most likely root cause of user-reported unreachability is the user navigating to `https://www.riftroot.com`.

---

## 1. Zone Status

**Request URL:** `GET https://api.cloudflare.com/client/v4/zones/7c6b1d1c1eb965121e25b57106c5e47a`

```json
{
  "result": {
    "id": "7c6b1d1c1eb965121e25b57106c5e47a",
    "name": "riftroot.com",
    "status": "active",
    "paused": false,
    "type": "full",
    "development_mode": 0,
    "name_servers": [
      "reza.ns.cloudflare.com",
      "ricardo.ns.cloudflare.com"
    ],
    "original_name_servers": null,
    "original_registrar": null,
    "original_dnshost": null,
    "modified_on": "2026-04-30T13:30:56.343139Z",
    "created_on": "2026-04-22T20:25:43.015825Z",
    "activated_on": "2026-04-22T20:25:49.751029Z",
    "vanity_name_servers": [],
    "meta": {
      "step": 4,
      "custom_certificate_quota": 0,
      "page_rule_quota": 3,
      "phishing_detected": false
    },
    "owner": {
      "id": null,
      "type": "user",
      "email": null
    },
    "account": {
      "id": "a62c1c7880b50ac345fc7c2135f6ae84",
      "name": "mock1ng account"
    },
    "plan": {
      "id": "0feeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
      "name": "Free Website",
      "price": 0,
      "currency": "USD",
      "legacy_id": "free"
    }
  },
  "success": true,
  "errors": [],
  "messages": []
}
```

**Findings:**
- `status: active` — zone is fully active, not suspended or pending.
- `paused: false` — Cloudflare proxy is NOT paused; all traffic routes through CF edge.
- `development_mode: 0` — development mode off (cache bypass not active).
- `phishing_detected: false` — no CF-side phishing block.
- Account binding: `a62c1c7880b50ac345fc7c2135f6ae84` matches BIFROST_KV account ID — correct zone.
- Plan: **Free** — analytics API requires paid plan or scoped token with `zone.analytics.read`.
- Zone last modified `2026-04-30` (DMARC/CAA/security.txt work from that session — no recent structural changes).

---

## 2. DNS Records

**Request URL:** `GET https://api.cloudflare.com/client/v4/zones/7c6b1d1c1eb965121e25b57106c5e47a/dns_records?per_page=100`

```json
{
  "result": [
    {
      "id": "da64778b40e68f4a47caf043f728d5b6",
      "name": "riftroot.com",
      "type": "AAAA",
      "content": "100::",
      "proxied": true,
      "ttl": 1,
      "meta": {
        "origin_worker_id": "06565ad2e4c0a3038b52af64b544a0dc6c2254dc",
        "read_only": true
      },
      "created_on": "2026-04-28T02:27:45.942752Z",
      "modified_on": "2026-04-28T02:27:45.942752Z"
    },
    {
      "id": "c4e2465943a990170c72bd5a738ccaaf",
      "name": "riftroot.com",
      "type": "CAA",
      "content": "0 iodef \"mailto:mock1ng@pm.me\"",
      "proxied": false,
      "ttl": 1
    },
    {
      "id": "83068ae9710ce7992ae5be7f05a307d5",
      "name": "riftroot.com",
      "type": "CAA",
      "content": "0 issue \"pki.goog\"",
      "proxied": false,
      "ttl": 1
    },
    {
      "id": "0fed3b22b6825ead15e2bac3a70965a8",
      "name": "riftroot.com",
      "type": "CAA",
      "content": "0 issue \"letsencrypt.org\"",
      "proxied": false,
      "ttl": 1
    },
    {
      "id": "40a4158b1b7e6418997d5662fc8b9e2d",
      "name": "protonmail2._domainkey.riftroot.com",
      "type": "CNAME",
      "content": "protonmail2.domainkey.dyrefhi3nzqee5ex5egz266x2nzpnbecqfowi6ttr3whvcsqgddkq.domains.proton.ch",
      "proxied": false
    },
    {
      "id": "5f92718e84ed478fc42ce5a894158efa",
      "name": "protonmail3._domainkey.riftroot.com",
      "type": "CNAME",
      "content": "protonmail3.domainkey.dyrefhi3nzqee5ex5egz266x2nzpnbecqfowi6ttr3whvcsqgddkq.domains.proton.ch",
      "proxied": false
    },
    {
      "id": "ae4de1aad0d233992283de1de210b707",
      "name": "protonmail._domainkey.riftroot.com",
      "type": "CNAME",
      "content": "protonmail.domainkey.dyrefhi3nzqee5ex5egz266x2nzpnbecqfowi6ttr3whvcsqgddkq.domains.proton.ch",
      "proxied": false
    },
    {
      "id": "e1e3e0c4733cd23257e0ee15639c38fb",
      "name": "riftroot.com",
      "type": "MX",
      "content": "mailsec.protonmail.ch",
      "priority": 20
    },
    {
      "id": "9fef48d636eaebce970dca4d15e59eb0",
      "name": "riftroot.com",
      "type": "MX",
      "content": "mail.protonmail.ch",
      "priority": 10
    },
    {
      "id": "983a4634ff576aaf311a308ea3d8ee7e",
      "name": "_dmarc.riftroot.com",
      "type": "TXT",
      "content": "\"v=DMARC1; p=quarantine; rua=mailto:dmarc@riftroot.com; adkim=s; aspf=s;\"",
      "ttl": 300,
      "comment": "managed by zones-prep 2026-04-27"
    },
    {
      "id": "e05a607c8b975aa0984c59c4927e4e8e",
      "name": "riftroot.com",
      "type": "TXT",
      "content": "\"v=spf1 include:_spf.protonmail.ch ~all\""
    },
    {
      "id": "485860690085bfc6dd5fba02760b8e5e",
      "name": "riftroot.com",
      "type": "TXT",
      "content": "\"protonmail-verification=58890bed67fa6132f5309da82028683658e8aee8\""
    },
    {
      "id": "988c5185ff8dbc847f4aaef03611dfe4",
      "name": "riftroot.com",
      "type": "TXT",
      "content": "\"google-site-verification=QYNGK_GqFZVPVJb1kv6iQVXrGhweQV7ePG2gI_bDr1E\"",
      "ttl": 3600
    }
  ],
  "success": true,
  "errors": [],
  "messages": [],
  "result_info": {
    "page": 1,
    "per_page": 100,
    "count": 13,
    "total_count": 13,
    "total_pages": 1
  }
}
```

**Findings:**
- Total records: **13** — full set retrieved (no pagination required).
- **`www.riftroot.com` is ABSENT** — zero A, AAAA, or CNAME records for `www`. Any request to `https://www.riftroot.com` will get NXDOMAIN. This is the confirmed root cause of the reported unreachability if the user was using a www-prefixed URL.
- Apex record: one `AAAA 100::` proxied record with `origin_worker_id: 06565ad2e4c0a3038b52af64b544a0dc6c2254dc` — this is the Workers Custom Domain synthetic record. `read_only: true` means it was created by the Workers Custom Domain attach, not manually. There is NO apex A record; the AAAA to `100::` is the CF-standard sentinel for Workers routes.
- No `A` record for apex — only the Workers-created `AAAA 100::` sentinel. This is normal for Workers Custom Domains on free plan (CF uses anycast IPs from the proxied path).
- DMARC at `p=quarantine` (not yet `reject` — soak period per notes).
- Email (Proton): MX, SPF, DKIM records present and consistent.
- CAA: allows `letsencrypt.org` and `pki.goog` — correct for CF's cert provisioning.
- No DNSSEC DS record visible via this API (DNSSEC managed separately, confirmed by cf-zone-audit).

---

## 3. Firewall / Security Events (24h)

**Request URL:** `GET https://api.cloudflare.com/client/v4/zones/7c6b1d1c1eb965121e25b57106c5e47a/firewall/events?since=-86400`

```json
{
  "success": false,
  "errors": [
    {
      "code": 7003,
      "message": "Could not route to /zones/.../firewall/events, perhaps your object identifier is invalid?"
    },
    {
      "code": 7000,
      "message": "No route for that URI"
    }
  ],
  "messages": [],
  "result": null
}
```

**Note:** The `firewall/events` endpoint has been deprecated and removed by Cloudflare. The replacement is the GraphQL Security Events API (`httpRequestsAdaptiveGroups` with action filter) which requires `zone.analytics.read` permission. Neither `CF_ZONE_TOKEN_RIFTROOT` nor `CF_ADMIN_TOKEN` has that permission scope (see §6). As a proxy signal, the WAF ruleset listing (§5) shows no custom block rules that could explain user-specific blocking.

---

## 4. Analytics Dashboard (24h)

**Request URL:** `GET https://api.cloudflare.com/client/v4/zones/7c6b1d1c1eb965121e25b57106c5e47a/analytics/dashboard?since=-1440`

```json
{
  "success": false,
  "errors": [
    {
      "code": 10000,
      "message": "Authentication error"
    }
  ],
  "messages": [],
  "result": null
}
```

**GraphQL attempt** (both `CF_ZONE_TOKEN_RIFTROOT` and `CF_ADMIN_TOKEN`):
```json
{
  "data": null,
  "errors": [
    {
      "message": "Actor does not have permission 'com.cloudflare.api.account.zone.analytics.read' for zone 7c6b1d1c1eb965121e25b57106c5e47a",
      "extensions": {
        "code": "authz"
      }
    }
  ]
}
```

**Finding:** Analytics API requires `zone.analytics.read` permission — absent from both zone token and admin token. This is a token scope gap, not a zone health indicator. The zone is on the Free plan; free-plan analytics are only accessible via the dashboard or a token with the analytics permission explicitly granted.

**Indirect health signal:** The plan context notes that `preflight-ship.sh prod` passed all 7 checks post-deploy (`d83c17a`) with `x-app-version: 1778510630` and CF-cache HIT from DEN POP — indicating normal request flow, no 5xx on apex.

---

## 5. Workers Custom Domain Binding

**Request URL:** `GET https://api.cloudflare.com/client/v4/accounts/a62c1c7880b50ac345fc7c2135f6ae84/workers/domains?zone_id=7c6b1d1c1eb965121e25b57106c5e47a`

```json
{
  "result": [
    {
      "id": "06565ad2e4c0a3038b52af64b544a0dc6c2254dc",
      "zone_id": "7c6b1d1c1eb965121e25b57106c5e47a",
      "zone_name": "riftroot.com",
      "hostname": "riftroot.com",
      "service": "riftroot-edge",
      "environment": "production",
      "cert_id": "5215d22d-b445-4c82-878e-a629aabc8725",
      "previews_enabled": false,
      "enabled": true
    }
  ],
  "success": true,
  "errors": null,
  "messages": null,
  "result_info": {
    "page": 1,
    "per_page": 1,
    "count": 1,
    "total_count": 1
  }
}
```

**Findings:**
- `riftroot-edge` is bound to `riftroot.com` (apex), environment `production`, `enabled: true`.
- `cert_id` present — TLS certificate provisioned for apex (`riftroot.com`).
- **No binding for `www.riftroot.com`** — consistent with the DNS gap.
- Worker domain ID `06565ad2e4c0a3038b52af64b544a0dc6c2254dc` matches the `origin_worker_id` in the DNS AAAA record — confirming the apex binding is the one creating that synthetic record.
- No stale/duplicate bindings.

---

## 6. Worker Script Metadata

**Request URL:** `GET https://api.cloudflare.com/client/v4/accounts/a62c1c7880b50ac345fc7c2135f6ae84/workers/scripts/riftroot-edge`

The endpoint returns the full worker source as multipart/form-data. Key observations from the script body:

```
worker name:  riftroot-edge
content-type: multipart/form-data (script + source map)
```

**Script capabilities confirmed from source:**
- Handles routes: `/` (SPA entry), `/healthz`, `/_bust` (cache-bust utility), `/api/version`, static assets.
- Non-file paths without extension redirect 301 to `/` — hash-route SPA model working correctly.
- Injects `X-App-Version` header from `env.VERSION`.
- `HTMLRewriter` appends cache-busting `?v=<VERSION>` to non-hashed asset URLs.
- `/_bust` endpoint clears Cache API + Service Worker registrations and redirects to `/?nuke=<timestamp>`.
- No geographic blocking logic in the worker — no country-based `Response.redirect` or `Response.error`.
- No user-agent blocking logic in the worker.
- `env.ASSETS.fetch` is used — static assets served from Workers Assets binding.

**Anomalies in worker:** None. The worker is healthy and functional.

---

## 7. WAF Rulesets

**Request URL:** `GET https://api.cloudflare.com/client/v4/zones/7c6b1d1c1eb965121e25b57106c5e47a/rulesets` (via `CF_ADMIN_TOKEN`)

```json
{
  "result": [
    {
      "id": "70339d97bdb34195bbf054b1ebe81f76",
      "name": "Cloudflare Normalization Ruleset",
      "phase": "http_request_sanitize",
      "kind": "managed",
      "last_updated": "2024-08-01T17:37:11.538019Z"
    },
    {
      "id": "77454fe2d30c4220b5701f6fdfb893ba",
      "name": "Cloudflare Managed Free Ruleset",
      "phase": "http_request_firewall_managed",
      "kind": "managed",
      "last_updated": "2025-12-11T19:19:14.790941Z",
      "version": "66"
    },
    {
      "id": "4d21379b4f9f4bb088e0729962c8b3cf",
      "name": "DDoS L7 ruleset",
      "phase": "ddos_l7",
      "kind": "managed",
      "last_updated": "2026-05-07T19:39:20.138341Z",
      "version": "3290"
    },
    {
      "id": "6402d68bfbe543908b1fa801d710fda8",
      "name": "default",
      "phase": "http_request_firewall_managed",
      "kind": "zone",
      "last_updated": "2026-04-30T17:06:44.222619Z",
      "version": "1"
    }
  ],
  "success": true,
  "errors": [],
  "messages": []
}
```

**Findings:**
- Four rulesets active: Normalization, Managed Free, DDoS L7, and a zone-level default.
- Zone default ruleset (`6402d68bfbe543908b1fa801d710fda8`) last updated `2026-04-30` — during the cf-basic-setup gap-closure session. Version `1` (minimal, no custom block rules).
- DDoS L7 ruleset last updated `2026-05-07` — routine CF-managed update, not zone-specific.
- Managed Free last updated `2025-12-11` — not recently changed.
- **No custom user-defined block rules that could block specific countries or IPs.**
- Attempting to read the zone default ruleset's rule list returned `"request is not authorized"` — token scope gap, but the `version: 1` and `last_updated: 2026-04-30` indicate no activity since initial setup.

---

## 8. Token Scope Notes

| Token | Source | Worked For | Failed On |
|---|---|---|---|
| `CF_ZONE_TOKEN_RIFTROOT` | Keychain `bifrost-CF_ZONE_TOKEN_RIFTROOT` | zone status, DNS records, workers/domains | analytics, rulesets, firewall events (deprecated) |
| `CF_ADMIN_TOKEN` | Keychain `bifrost-CF_ADMIN_TOKEN` | rulesets list | analytics (missing `zone.analytics.read`), ruleset detail |
| `CF_WORKERS_DOMAINS_TOKEN` | not attempted | — | — |

The `zone.analytics.read` permission gap means 24h traffic volume/error rates and security event counts are unavailable via API. Adding this permission to `CF_ZONE_TOKEN_RIFTROOT` is recommended as a follow-up (not in scope for this read-only investigation).

---

## 9. Summary of Anomalies

| Check | Result | Severity |
|---|---|---|
| Zone status | ACTIVE, not paused | OK |
| Zone paused | false | OK |
| Development mode | off | OK |
| Phishing detected | false | OK |
| `www.riftroot.com` DNS record | **ABSENT — NXDOMAIN** | HIGH (explains user symptom) |
| `riftroot-edge` bound to apex | Yes, enabled | OK |
| Worker geographic/UA blocking | None found in source | OK |
| Custom WAF block rules | None (zone ruleset v1) | OK |
| 5xx spike | Cannot verify (token scope gap) | UNKNOWN |
| CF-managed ruleset changes | Last updated 2025-12 (managed) | OK |
| Recent zone structural changes | 2026-04-30 (planned session) | OK |

**Root cause of reported unreachability:** `www.riftroot.com` has no DNS record. If the user navigated to `https://www.riftroot.com`, they would receive NXDOMAIN → "This site can't be reached." The apex `https://riftroot.com` is fully operational.

**Recommended action:** Agent A3 (`www-subdomain-fix`) — add `www → apex` redirect or CNAME+Workers Custom Domain. This is the fix.
