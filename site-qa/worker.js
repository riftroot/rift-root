// rift-root-site · static assets only
//
// No secrets. No auth. The Turnstile gate is purely client-side (see
// public/index.html). The worker just serves files, sets sensible cache
// headers, and stamps a deploy version.
//
// Cache strategy (post-Vite-hashed-filenames):
//   /app-[hash].js  → public, max-age=31536000, immutable    (content-hash in name = safe to pin)
//   /                → public, max-age=3600, stale-while-revalidate=86400
//   *.html          → public, max-age=3600, stale-while-revalidate=86400
//   other static    → public, max-age=300, s-maxage=86400, swr=604800   (legacy CSS/SVG/etc.)
//
// HTML responses also carry a Link: rel=preload header for the hashed
// app bundle and the React CDN scripts. This is the safer fallback for
// "103 Early Hints" — Workers does support emitting a real 103 status,
// but it requires the request reach the worker first (a measurable
// fraction of the Time-to-103 win disappears at our edge), and most
// browsers honor `Link: rel=preload` on the 200 nearly as well. See
// preflight-config + commit message for full rationale.

// Appends ?v=<version> to a same-origin attribute on matching elements.
// Skips absolute URLs (CDN scripts already have their own version pins)
// AND skips already-hashed app-*.js (content hash already busts cache).
class VersionTag {
  constructor(version, attr) { this.v = version; this.attr = attr; }
  element(el) {
    const u = el.getAttribute(this.attr);
    if (!u) return;
    if (/^(https?:|data:|\/\/|#)/i.test(u)) return;
    // Skip hashed app bundles — the [hash] in the filename is already the
    // cache-bust token. Adding ?v= would defeat the immutable cache.
    if (/\/app-[A-Za-z0-9_-]+\.js$/.test(u)) return;
    const sep = u.includes("?") ? "&" : "?";
    el.setAttribute(this.attr, u + sep + "v=" + this.v);
  }
}

// Capture the hashed app.js path from the HTML so we can set a precise
// Link: rel=preload header on the response. The HTMLRewriter runs as a
// stream, but because we transform-then-return we can hook the script
// tag, store the hashed path on a closure-shared object, and append
// the Link header to a SECOND copy of the HTML body. Simpler: do the
// preload Link statically — we know the hash via a regex on the body.
// But scanning the body twice is cheap and avoids state coupling.

const REACT_VERSION = "18.3.1";
const REACT_PRELOAD = `<https://unpkg.com/react@${REACT_VERSION}/umd/react.production.min.js>; rel=preload; as=script; crossorigin`;
const REACT_DOM_PRELOAD = `<https://unpkg.com/react-dom@${REACT_VERSION}/umd/react-dom.production.min.js>; rel=preload; as=script; crossorigin`;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const version = env.VERSION || "dev";

    // 301 any extension-less non-root path to /. The site is a single
    // page; URLs like /erebus, /surface, /demo are not real routes — only
    // section anchors (#erebus, #surface) on the home page. Without this,
    // not_found_handling="single-page-application" silently serves the
    // SPA shell on any path, leaving /erebus visible as if it were valid.
    if (
      url.pathname !== "/" &&
      !/\.[a-z0-9]+$/i.test(url.pathname) &&
      url.pathname !== "/healthz" &&
      url.pathname !== "/_bust" &&
      url.pathname !== "/api/version"
    ) {
      return Response.redirect(url.origin + "/" + url.search, 301);
    }

    if (url.pathname === "/healthz") {
      return new Response("ok", {
        headers: { "Content-Type": "text/plain", "Cache-Control": "no-store" }
      });
    }

    // Manual escape hatch for iOS Safari pinned-shell scenarios. Visit
    // /_bust from the address bar; an inline script clears Cache Storage
    // and any service workers, then redirects home with a unique query.
    // Works even when app.js is broken — no React, no external assets.
    if (url.pathname === "/_bust") {
      const html = `<!doctype html><meta charset=utf-8><title>busting cache…</title>
<style>body{background:#0A0A0B;color:#d8b4fe;font:13px ui-monospace,monospace;display:grid;place-items:center;height:100vh;margin:0;letter-spacing:.12em;text-transform:uppercase}</style>
<body>busting cache…
<script>
(async()=>{
  try{if('caches' in window){const k=await caches.keys();await Promise.all(k.map(x=>caches.delete(x)))}}catch(e){}
  try{if('serviceWorker' in navigator){const r=await navigator.serviceWorker.getRegistrations();await Promise.all(r.map(x=>x.unregister()))}}catch(e){}
  try{sessionStorage.clear()}catch(e){}
  location.replace('/?nuke='+Date.now());
})();
</script>`;
      return new Response(html, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0"
        }
      });
    }

    // Version probe — drives the in-page cache-bust toast that hard-
    // reloads iPhone Safari out of a pinned stale shell.
    if (url.pathname === "/api/version") {
      return new Response(JSON.stringify({ version }), {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
          "Pragma": "no-cache",
          "Expires": "0"
        }
      });
    }

    const res = await env.ASSETS.fetch(request);
    const headers = new Headers(res.headers);
    const ct = headers.get("Content-Type") || "";

    if (ct.startsWith("text/html")) {
      // HTML never sticks for the document itself, but allow a short
      // stale-while-revalidate window so navigation back-forward feels
      // instant. The hashed app bundle invalidates by name, so HTML can
      // be slightly looser than the previous "no-store everywhere".
      headers.set("Cache-Control", "public, max-age=3600, stale-while-revalidate=86400");
      headers.delete("Pragma");
      headers.delete("Expires");
      headers.set("X-App-Version", version);

      // Build a Link: rel=preload header for the hashed app bundle +
      // React CDN. APP_BUNDLE is stamped at deploy time (scripts/deploy-qa.sh
      // discovers the hashed filename from disk and passes it via --var).
      // Fallback: scan the response body for the /app-*.js reference.
      const linkValues = [REACT_PRELOAD, REACT_DOM_PRELOAD];
      let appBundle = env.APP_BUNDLE || "";
      if (!appBundle) {
        try {
          const bodyText = await res.clone().text();
          const m = bodyText.match(/\/app-[A-Za-z0-9_-]+\.js/);
          if (m) appBundle = m[0].slice(1);
        } catch {}
      }
      if (appBundle) {
        linkValues.unshift(`</${appBundle}>; rel=preload; as=script`);
      }
      headers.set("Link", linkValues.join(", "));

      const rewriter = new HTMLRewriter()
        .on('script[src]', new VersionTag(version, "src"))
        .on('link[rel="stylesheet"][href]', new VersionTag(version, "href"))
        .on('link[rel="preload"][href]', new VersionTag(version, "href"));
      return rewriter.transform(new Response(res.body, { status: res.status, statusText: res.statusText, headers }));
    }

    // Hashed app bundle: pin for a year. Filename changes on every build
    // (vite content hash), so this is safe and gets us repeat-visit FCP
    // wins from disk cache hits with zero conditional GETs.
    if (/^\/app-[A-Za-z0-9_-]+\.js$/.test(url.pathname)) {
      headers.set("Cache-Control", "public, max-age=31536000, immutable");
      headers.set("X-App-Version", version);
      return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
    }

    // Other static assets: short browser TTL + long edge TTL with SWR.
    const isStatic = /\.(css|js|svg|png|jpg|jpeg|webp|woff2?|ttf|otf)$/i.test(url.pathname);
    if (isStatic) {
      headers.set("Cache-Control", "public, max-age=300, s-maxage=86400, stale-while-revalidate=604800");
    }
    headers.set("X-App-Version", version);
    return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
  }
};
