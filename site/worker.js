// rift-root-site · static assets only
//
// No secrets. No auth. The Turnstile gate is purely client-side (see
// public/index.html). The worker just serves files, sets sensible cache
// headers, and stamps a deploy version.

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const version = env.VERSION || "dev";

    if (url.pathname === "/healthz") {
      return new Response("ok", {
        headers: { "Content-Type": "text/plain", "Cache-Control": "no-store" }
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
      // HTML must not stick — a deploy needs to land instantly.
      headers.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
      headers.set("Pragma", "no-cache");
      headers.set("Expires", "0");
    } else {
      // Everything else (CSS, JS, fonts, images) is content-addressed via
      // VERSION header; cache aggressively at the edge + browser. CSS/JS
      // get a 5-min browser TTL (not immutable — we don't fingerprint
      // filenames yet) but a long edge TTL via s-maxage.
      const isStatic = /\.(css|js|svg|png|jpg|jpeg|webp|woff2?|ttf|otf)$/i.test(url.pathname);
      if (isStatic) {
        headers.set("Cache-Control", "public, max-age=300, s-maxage=86400, stale-while-revalidate=604800");
      }
    }

    headers.set("X-App-Version", version);
    return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
  }
};
