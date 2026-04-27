// rift-root-site · static assets only
//
// No secrets. No auth. The Turnstile gate is purely client-side (see
// public/index.html) — the widget appears, the user solves it, JS reveals
// the page. The worker just serves files and stamps a deploy version.

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const version = env.VERSION || "dev";

    if (url.pathname === "/healthz") {
      return new Response("ok", {
        headers: { "Content-Type": "text/plain", "Cache-Control": "no-store" }
      });
    }

    const res = await env.ASSETS.fetch(request);
    const headers = new Headers(res.headers);
    // HTML must never be cached so a deploy is picked up immediately.
    const ct = headers.get("Content-Type") || "";
    if (ct.startsWith("text/html")) {
      headers.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
      headers.set("Pragma", "no-cache");
      headers.set("Expires", "0");
    }
    headers.set("X-App-Version", version);
    return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
  }
};
