// rift-bifrost-demo · Cloudflare Worker
//
// No auth gate — purely cache-bust + version-stamping in front of the
// static assets binding. Bypassed Cloudflare Access app on
// bifrost-demo.mock1ngbb.com lets this serve to anyone.
//
// Bindings (wrangler.toml):
//   ASSETS    static assets (./public)
//   VERSION   deploy-time epoch stamp injected by scripts/deploy.sh

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const version = env.VERSION || "dev";

    if (url.pathname === "/api/version") return jsonNoStore({ version });
    if (url.pathname === "/sw.js") return swResponse(version);
    if (url.pathname === "/manifest.webmanifest") return manifestResponse();

    // Pull from static assets, then strip CDN/browser caching so iPhone
    // Safari (and home-screen PWAs) can't pin a stale shell.
    const assetRes = await env.ASSETS.fetch(request);
    return wrapNoStore(assetRes, version);
  }
};

function jsonNoStore(obj) {
  return new Response(JSON.stringify(obj), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      "Pragma": "no-cache",
      "Expires": "0"
    }
  });
}

function wrapNoStore(res, version) {
  const headers = new Headers(res.headers);
  headers.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
  headers.set("Pragma", "no-cache");
  headers.set("Expires", "0");
  headers.set("X-App-Version", version);
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
}

function manifestResponse() {
  const m = {
    name: "rift · erebus edge",
    short_name: "rift",
    start_url: "/",
    display: "standalone",
    background_color: "#100f10",
    theme_color: "#100f10",
    icons: [
      { src: "/brand/logo/make-this-connection-more-organic-like-roots-or-kn.svg",
        sizes: "any", type: "image/svg+xml", purpose: "any maskable" }
    ]
  };
  return new Response(JSON.stringify(m), {
    headers: {
      "Content-Type": "application/manifest+json",
      "Cache-Control": "no-cache"
    }
  });
}

function swResponse(version) {
  // Network-first service worker. Never serves stale shell — always tries
  // network first, falls back to cache only when offline. On activation it
  // wipes every prior cache and notifies open clients of the new version.
  const body = `// rift-bifrost-demo service worker · version ${version}
const VERSION = ${JSON.stringify(version)};
const CACHE = 'rift-bifrost-' + VERSION;
const SHELL = ['/', '/styles.css', '/app.js', '/cache-bust.js', '/events.json', '/manifest.webmanifest'];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).catch(() => {}));
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
    await self.clients.claim();
    const clients = await self.clients.matchAll({ type: 'window' });
    for (const c of clients) c.postMessage({ type: 'sw-activated', version: VERSION });
  })());
});

self.addEventListener('fetch', (e) => {
  const u = new URL(e.request.url);
  if (u.pathname.startsWith('/api/')) return;
  if (e.request.method !== 'GET') return;
  e.respondWith((async () => {
    try {
      const fresh = await fetch(e.request, { cache: 'no-store' });
      const c = await caches.open(CACHE);
      c.put(e.request, fresh.clone());
      return fresh;
    } catch {
      const cached = await caches.match(e.request);
      return cached || new Response('offline', { status: 503 });
    }
  })());
});
`;
  return new Response(body, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "no-cache, must-revalidate",
      "Service-Worker-Allowed": "/",
      "X-App-Version": version
    }
  });
}
