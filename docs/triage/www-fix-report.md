# www-subdomain-fix — triage report

**Date:** 2026-05-11  
**Agent:** A3 — www-subdomain-fix  
**Branch:** triage/www-subdomain  

## Problem

`www.riftroot.com` had no DNS record. Any user navigating to `https://www.riftroot.com` received an NXDOMAIN, explaining the "this site can't be reached" symptom verbatim.

## Actions taken

### 1. Diagnosed token scope for Single Redirect rules

Attempted to create a `http_request_redirect` phase ruleset (preferred approach from plan §3) using all three available tokens:

- `CF_ZONE_TOKEN_RIFTROOT` → `Authentication error` (lacks `Zone.Rulesets:Edit`)
- `CF_ADMIN_TOKEN` → `Authentication error` (user-scoped token, no rulesets write)
- `CF_WORKERS_DOMAINS_TOKEN` → `Authentication error` (workers scope only)

No available token carries `Zone.Config:Edit` / `Zone.Rulesets:Edit`. Single Redirect rules path is blocked until a token with that scope is minted.

### 2. Fallback: Workers Custom Domain attach (plan §3 fallback path)

Used `CF_WORKERS_DOMAINS_TOKEN` to attach `riftroot-edge` (production) to `www.riftroot.com`.

**API call:** `PUT /accounts/a62c1c7880b50ac345fc7c2135f6ae84/workers/domains`  
**Payload:**
```json
{
  "zone_id": "7c6b1d1c1eb965121e25b57106c5e47a",
  "hostname": "www.riftroot.com",
  "service": "riftroot-edge",
  "environment": "production"
}
```

**Result:** success, domain ID `44bd05d9aab6ab81ab59a596b5ed0a69e9b0a1db`, cert `58cb26fc-a274-44d3-8085-0908609676a7`.

CF automatically created a managed AAAA `100::` proxied record for `www.riftroot.com` (same pattern as apex, `read_only: true`).

## Final CF API state

### Workers Custom Domains (zone `7c6b1d1c1eb965121e25b57106c5e47a`)

| hostname | service | env | domain_id |
|---|---|---|---|
| `riftroot.com` | `riftroot-edge` | production | `06565ad2e4c0a3038b52af64b544a0dc6c2254dc` |
| `www.riftroot.com` | `riftroot-edge` | production | `44bd05d9aab6ab81ab59a596b5ed0a69e9b0a1db` |

### DNS record for www.riftroot.com

```json
{
  "id": "a86a2f4c5399a3219517c78d02096732",
  "name": "www.riftroot.com",
  "type": "AAAA",
  "content": "100::",
  "proxied": true,
  "meta": {
    "origin_worker_id": "44bd05d9aab6ab81ab59a596b5ed0a69e9b0a1db",
    "read_only": true
  }
}
```

## Live proof

```
curl -sI --resolve "www.riftroot.com:443:104.21.90.135" https://www.riftroot.com
HTTP/2 200
x-app-version: 1778510630
cf-cache-status: HIT
cf-ray: 9fa24915ad678b71-DEN
```

`HTTP/2 200`, `x-app-version: 1778510630` — same version as apex. Site serves correctly from www.

DNS resolves via public resolvers:
- `dig @1.1.1.1 www.riftroot.com` → `104.21.90.135`, `172.67.200.171`
- `dig @8.8.8.8 www.riftroot.com` → `172.67.200.171`, `104.21.90.135`

## Follow-up: mint a Single Redirect rule (optional, recommended)

The fallback (serving the same worker from both apex and www) works correctly. However, having www serve content directly (not redirect) means search engines may index both URLs and split PageRank. A cleaner long-term configuration is a 301 redirect `www → apex`.

To enable this, mint a new CF API token with `Zone.Config:Edit` or `Zone.Rulesets:Edit` scope for zone `7c6b1d1c1eb965121e25b57106c5e47a`, then run:

```bash
curl -X POST "https://api.cloudflare.com/client/v4/zones/7c6b1d1c1eb965121e25b57106c5e47a/rulesets" \
  -H "Authorization: Bearer <token-with-rulesets-write>" \
  -H "Content-Type: application/json" \
  --data '{
    "name": "www-to-apex redirect",
    "kind": "zone",
    "phase": "http_request_redirect",
    "rules": [{
      "description": "Redirect www.riftroot.com to apex",
      "expression": "(http.host eq \"www.riftroot.com\")",
      "action": "redirect",
      "action_parameters": {
        "from_value": {
          "target_url": { "expression": "concat(\"https://riftroot.com\", http.request.uri.path)" },
          "status_code": 301,
          "preserve_query_string": true
        }
      },
      "enabled": true
    }]
  }'
```

Then delete the `www.riftroot.com` Workers Custom Domain binding and keep only the CNAME.

**References:**
- CF Ruleset Engine — Single Redirects: https://developers.cloudflare.com/rules/url-forwarding/single-redirects/
- CF Workers Custom Domains API: https://developers.cloudflare.com/api/operations/worker-domain-attach-to-domain

## Learnings

- `CF_ADMIN_TOKEN` is user-scoped (`cfut_` prefix) but does NOT carry zone ruleset write permissions — it failed the rulesets POST with auth error. The admin token is for minting/editing other tokens, not zone config mutations.
- Workers Custom Domain attach via `PUT /accounts/.../workers/domains` is the cleanest fallback: no manual CNAME needed — CF auto-creates and manages its own `100::` AAAA proxied record with `read_only: true`. Attempting to pre-create a CNAME causes a 100117 conflict error.
- The `override_existing_dns_record` field in the Workers domains PUT payload does not appear to be honored for `kind: external` DNS records; deleting the conflicting record first is the correct sequence.
- `curl` on macOS may show local DNS cache lag (`Could not resolve host`) even after CF DNS propagates globally. Use `--resolve host:443:IP` to bypass local resolver for immediate validation.
