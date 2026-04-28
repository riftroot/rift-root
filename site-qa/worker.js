// rift-root-site · static assets only
//
// No secrets. No auth. The Turnstile gate is purely client-side (see
// public/index.html). The worker just serves files, sets sensible cache
// headers, and stamps a deploy version.

// Appends ?v=<version> to a same-origin attribute on matching elements.
// Skips absolute URLs (CDN scripts already have their own version pins).
class VersionTag {
  constructor(version, attr) { this.v = version; this.attr = attr; }
  element(el) {
    const u = el.getAttribute(this.attr);
    if (!u || /^(https?:|data:|\/\/|#)/i.test(u)) return;
    const sep = u.includes("?") ? "&" : "?";
    el.setAttribute(this.attr, u + sep + "v=" + this.v);
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const version = env.VERSION || "dev";

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
      // HTML never sticks. Rewrite same-origin script/link srcs to carry
      // ?v=<version> so a deploy invalidates browser-cached JS/CSS for
      // free without any client-side trickery.
      headers.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
      headers.set("Pragma", "no-cache");
      headers.set("Expires", "0");
      headers.set("X-App-Version", version);
      const rewriter = new HTMLRewriter()
        .on('script[src]', new VersionTag(version, "src"))
        .on('link[rel="stylesheet"][href]', new VersionTag(version, "href"))
        .on('link[rel="preload"][href]', new VersionTag(version, "href"));
      return rewriter.transform(new Response(res.body, { status: res.status, statusText: res.statusText, headers }));
    }

    // Static assets: short browser TTL + long edge TTL with SWR. The HTML
    // versioning above means even cached browsers fetch fresh URLs after
    // a deploy; this just keeps repeat visits within a session fast.
    const isStatic = /\.(css|js|svg|png|jpg|jpeg|webp|woff2?|ttf|otf)$/i.test(url.pathname);
    if (isStatic) {
      headers.set("Cache-Control", "public, max-age=300, s-maxage=86400, stale-while-revalidate=604800");
    }
    headers.set("X-App-Version", version);
    return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
  }
};
