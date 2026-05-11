# A4 — noscript-regression-verify

**Date:** 2026-05-11  
**Branch:** `triage/noscript-verify`  
**Commit under test:** `d83c17a` — "Add crawler-visible noscript fallback to riftroot.com index.html"  
**Verdict: PASS**

---

## Summary

Commit `d83c17a` added a `<noscript>` block inside `#root` in `site/public/index.html` as a
crawler-visible fallback. The concern was whether this block breaks React 18 hydration across
browser engines. It does not.

**Chromium (Chrome):** PASS — React fully replaced `#root` children; `<noscript>` gone; no hydration errors.  
**Firefox:** PASS — React fully replaced `#root` children; `<noscript>` gone; no hydration errors.  
**WebKit (Safari):** ENVIRONMENT-BLOCKED — Playwright WebKit headless networking is non-functional
on this macOS machine (XPC networking process fails to establish any TCP/TLS connections in headless
mode — reproducible on even `https://example.com`). This is a test environment limitation, not a
site failure. See §4 for details and mitigation.

No rollback is required. `site/public/index.html` is unchanged.

---

## 1. What was tested

The `<noscript>` block at `d83c17a` sits as a direct child of `<div id="root">`:

```html
<div id="root">
  <noscript>
    <style>...</style>
    <main class="nojs-shell">...</main>
  </noscript>
</div>
```

React 18's `ReactDOM.createRoot(root).render(<App />)` **replaces all children** of the container
element when it mounts. From the React 18 source and docs
(https://react.dev/blog/2022/03/29/react-v18): createRoot takes ownership of the container's DOM
and replaces its contents on the first render. The `<noscript>` child is therefore always removed
by React before any user sees it — it is only visible to crawlers (Googlebot, etc.) which render
without JS or with limited JS execution.

---

## 2. Test methodology

Tool: Playwright 1.59.1  
URL: `https://riftroot.com` (live production — commit `d83c17a` deployed as `riftroot-edge v1778510630`)

**Navigation strategy:** `waitUntil: 'domcontentloaded'` — avoids waiting for CDN-fetched defer
scripts (React UMD from unpkg.com), which can hang WebKit headless. After DOM load, poll with
`page.waitForFunction` until `#root.querySelector('noscript')` returns null AND `#root.innerHTML`
length > 100 chars (proof of React content). Hard 90s process-level timeout per engine (wraps
Playwright's timeout which may not interrupt stalled XPC connections).

**Pass criteria (all must be true):**
1. `document.getElementById('root')` exists.
2. `#root.querySelector('noscript')` is null — React replaced children.
3. `#root.innerHTML` contains actual DOM content (length > 50 chars).
4. Zero console errors matching `hydrat|reactdom|(react.*error)`.

**Fail criteria (any = rollback):**
- `<noscript>` still present in `#root` after React mount — React failed to replace children.
- Hydration mismatch errors in console.
- HTTP non-200 on page load.

---

## 3. Results

| Engine | HTTP | #root exists | noscript gone | React rendered | Hydration errors | Verdict |
|---|---|---|---|---|---|---|
| Chromium 147 | 200 | true | true | true | 0 | **PASS** |
| WebKit 26.4 | — | — | — | — | — | ENV-BLOCKED |
| Firefox 148 | 200 | true | true | true | 0 | **PASS** |

### Chromium — `#root` innerHTML snippet (first 600 chars post-React)

```
<header class="nav "><div class="nav-inner container"><a href="#top" class="nav-mark"
aria-label="Rift Root home"><img src="assets/rift-root-logo.svg" alt="rift root" width="32"
height="32" decoding="async" fetchpriority="high" class="nav-logo-img" style="height: 32px;
width: 32px; display: block; object-fit: contain;"><span class="nav-wordmark"><span>rift</span>
<span class="dim">/</span><span>root</span></span><span class="nav-llc">LLC</span></a>
<nav class="nav-links" aria-label="Primary"><a href="#thesis" class="nav-link">
<span class="nav-link-num">01</span><span class="nav-link-label">Thesis...
```

React-generated `<header class="nav">` — not the `<main class="nojs-shell">` noscript content.

### Content strings found in rendered page body

| String | Chromium | Firefox |
|---|---|---|
| "compositor" | true | true |
| "Rift Root" | true | true |
| "Erebus" | true | true |

### Console errors

Chromium: 0 console errors  
Firefox: 0 console errors  
No hydration warnings in either engine.

### Screenshots

- Chromium: `/tmp/noscript-regression/chromium-screenshot.png` (126 KB, 1280×800 PNG)
- Firefox: `/tmp/noscript-regression/firefox-screenshot.png` (189 KB, 1280×800 PNG)

Both screenshots show the fully-rendered React app (dark neon-violet theme, rift/root logo,
navigation bar, hero section visible).

---

## 4. WebKit test environment block — diagnosis

**Symptom:** Playwright WebKit v2272 (`webkit-2272/Playwright.app`) hangs indefinitely on
`page.goto()` with any URL, including `https://example.com`. The browser process launches
successfully but the XPC networking subprocess (`com.apple.WebKit.Networking.xpc`) fails to
establish any TCP/TLS connections. Even `page.goto` timeout and the process-level `Promise.race`
timeout (90s) are required to unblock the test harness. The `page.goto` Playwright timeout does
not interrupt a stalled XPC socket in macOS.

**Root cause (per Playwright issues [#18953](https://github.com/microsoft/playwright/issues/18953),
[#12182](https://github.com/microsoft/playwright/issues/12182), [#9811](https://github.com/microsoft/playwright/issues/9811)):**
Playwright WebKit headless on macOS can fail to make network connections when system network
extensions (VPNs, DNS proxies, security agents) intercept or block XPC process traffic. The
Playwright WebKit process runs in an isolated XPC sandbox and cannot use the user's normal
network stack in some configurations. This is a machine-level environment issue.

**Is this a site regression?** No. The failure is reproducible with `https://example.com` (a
third-party URL with no relation to riftroot.com). The noscript change at `d83c17a` has no bearing
on WebKit's ability to open a TCP connection.

**Mitigation for future WebKit testing:**
1. Run WebKit tests from a Linux CI environment (Playwright WebKit on Linux does not use XPC).
2. Or use `npx playwright test` with `--project=webkit` in a GitHub Actions job (ubuntu-latest).
3. Or use BrowserStack / Sauce Labs for live Safari testing.

---

## 5. React 18 hydration semantics — why the noscript block is safe

React 18 `createRoot` (used via the UMD bundle: `ReactDOM.createRoot(root).render(<App />)`)
replaces all children of the mount container unconditionally. This is different from React 16/17's
`hydrate()` which attempted to preserve server-rendered HTML. Since riftroot.com uses
**client-side rendering** (not SSR), there is no hydration mismatch risk — React simply discards
the static `<noscript>` content and renders fresh.

From the React 18 upgrade guide (https://react.dev/blog/2022/03/29/react-v18):
> `createRoot` replaces the container's contents when you first call `render`.

The `<noscript>` tag is also semantically correct: browsers with JS enabled never render
`<noscript>` content in the DOM (it's parsed but not rendered). React removing it is belt-and-
suspenders confirmation that the JS path is working.

---

## 6. Verdict

**PASS** — No rollback required. `site/public/index.html` is unchanged.

The noscript fallback at `d83c17a` does not break React hydration in any testable engine on the
live production URL. The WebKit non-result is an environment-level test infrastructure limitation,
not a site regression.

---

## 7. Sources

- Playwright `waitUntil` options: https://playwright.dev/docs/api/class-page#page-goto-option-wait-until
- React 18 `createRoot` semantics: https://react.dev/blog/2022/03/29/react-v18
- Playwright issue — WebKit timeout macOS setup: https://github.com/microsoft/playwright/issues/18953
- Playwright issue — goto no load/DCL event: https://github.com/microsoft/playwright/issues/12182
- Playwright issue — WebKit macOS Monterey networking: https://github.com/microsoft/playwright/issues/9811
- Currents.dev — Debugging Playwright Timeouts: https://currents.dev/posts/debugging-playwright-timeouts
