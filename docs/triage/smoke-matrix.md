# Smoke Test Matrix: riftroot.com across User-Agents

**Test date:** 2026-05-11  
**Scope:** Apex + www subdomain, 5 user-agents, headless curl smoke tests  
**Test environment:** macOS, curl/8.7.1

## Test Results

| URL | User-Agent | Status | Content-Type | CF-Ray | x-app-version | CF-Cache-Status | Size (bytes) | Body Preview (first 200 chars) | Notes |
|---|---|---|---|---|---|---|---|---|---|
| https://riftroot.com | Chrome desktop | 200 | text/html | 9fa246c9bdd2eda9-DEN | 1778510630 | HIT | 14688 | `<!doctype html><html lang="en"><head>  <meta charset="utf-8" />  <meta name="viewport" content=...` | ✓ Success |
| https://riftroot.com | Safari iOS | 200 | text/html | 9fa246cb6d0351f5-DEN | 1778510630 | HIT | 14688 | `<!doctype html><html lang="en"><head>  <meta charset="utf-8" />  <meta name="viewport" content=...` | ✓ Success |
| https://riftroot.com | Firefox desktop | 200 | text/html | 9fa246cd3fac5521-DEN | 1778510630 | HIT | 14688 | `<!doctype html><html lang="en"><head>  <meta charset="utf-8" />  <meta name="viewport" content=...` | ✓ Success |
| https://riftroot.com | Googlebot/2.1 | 200 | text/html | 9fa246cebe18859e-DEN | 1778510630 | HIT | 14688 | `<!doctype html><html lang="en"><head>  <meta charset="utf-8" />  <meta name="viewport" content=...` | ✓ Success |
| https://riftroot.com | curl/8.7.1 | 200 | text/html | 9fa246d02fe7e669-DEN | 1778510630 | HIT | 14688 | `<!doctype html><html lang="en"><head>  <meta charset="utf-8" />  <meta name="viewport" content=...` | ✓ Success |
| https://www.riftroot.com | Chrome desktop | **NXDOMAIN** | — | — | — | — | — | `curl: (6) Could not resolve host: www.riftroot.com` | ⚠️ DNS failure (expected) |
| https://www.riftroot.com | Safari iOS | **NXDOMAIN** | — | — | — | — | — | `curl: (6) Could not resolve host: www.riftroot.com` | ⚠️ DNS failure (expected) |
| https://www.riftroot.com | Firefox desktop | **NXDOMAIN** | — | — | — | — | — | `curl: (6) Could not resolve host: www.riftroot.com` | ⚠️ DNS failure (expected) |
| https://www.riftroot.com | Googlebot/2.1 | **NXDOMAIN** | — | — | — | — | — | `curl: (6) Could not resolve host: www.riftroot.com` | ⚠️ DNS failure (expected) |
| https://www.riftroot.com | curl/8.7.1 | **NXDOMAIN** | — | — | — | — | — | `curl: (6) Could not resolve host: www.riftroot.com` | ⚠️ DNS failure (expected) |

## Summary

### Apex (https://riftroot.com)
- **Status:** ✓ All 5 user-agents return HTTP 200
- **Content-Type:** All return `text/html` (correct)
- **Cache:** All hits on CF cache (HIT status)
- **Version:** All serve `x-app-version: 1778510630` (commit d83c17a)
- **CF-Ray:** All in DEN POP (Denver), consistent across requests
- **Payload:** 14,688 bytes, consistent across all UAs

### www subdomain (https://www.riftroot.com)
- **Status:** ⚠️ All 5 user-agents return **NXDOMAIN** (curl error code 6)
- **Reason:** No DNS record exists for `www.riftroot.com` in the zone
- **Expected:** This is the expected state per the triage plan. The subdomain currently has no DNS entry.

## Anomalies Detected

None on the apex. The www subdomain failure is expected per the plan — A3 (www-subdomain-fix) will remediate this by adding a DNS record or redirect rule.

## Conclusion

The riftroot.com apex is **healthy and reachable** from all user-agents. The www subdomain requires DNS setup (pending A3 remediation). User reports of unreachability are **not explained by an apex-level HTTP failure** — likely causes remain: (a) user typed www prefix, (b) browser cache/service-worker issue, (c) ISP DNS.
