// erebus edge demo · turnstile gate worker
//
// Flow:
//   GET any path        → if cookie ok, ASSETS.fetch; else serve gate page
//   POST /verify         → verify Turnstile token, set signed cookie, redirect /
//
// Bindings (wrangler.toml):
//   ASSETS                  static assets (./public)
// Vars:
//   TURNSTILE_SITEKEY       public sitekey (injected into gate page)
// Secrets:
//   TURNSTILE_SECRET_KEY    server-side Turnstile secret
//   GATE_SIGNING_KEY        HMAC key for the auth cookie

const COOKIE = "rift_gate";
const TTL_SECONDS = 60 * 60 * 12; // 12h

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const version = env.VERSION || "dev";

    if (request.method === "POST" && url.pathname === "/verify") {
      return verify(request, env);
    }

    if (request.method === "POST" && url.pathname === "/logout") {
      return new Response(null, {
        status: 302,
        headers: {
          "Set-Cookie": `${COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`,
          "Location": "/"
        }
      });
    }

    // Public, never-cached: version probe (drives the SPA's reload toast)
    if (url.pathname === "/api/version") {
      return jsonNoStore({ version });
    }

    // Service worker — must be served scoped at root, never cached
    if (url.pathname === "/sw.js") {
      return swResponse(version);
    }

    if (url.pathname === "/manifest.webmanifest") {
      return manifestResponse();
    }

    const ok = await isAuthed(request, env);
    if (!ok) {
      return new Response(gateHtml(env.TURNSTILE_SITEKEY), {
        status: 401,
        headers: noStoreHtml(version)
      });
    }

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

function noStoreHtml(version) {
  return {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
    "Pragma": "no-cache",
    "Expires": "0",
    "X-App-Version": version
  };
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
      { src: "/brand/logo/edit-only-the--oo--letterforms-in--root---all-othe.svg",
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
  // wipes every prior cache and notifies open clients of the new version,
  // which the page uses to flag an upgrade and hard-reload.
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
  if (u.pathname.startsWith('/api/') || u.pathname === '/verify' || u.pathname === '/logout') return;
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

async function verify(request, env) {
  const form = await request.formData();
  const token = form.get("cf-turnstile-response");
  if (!token) return new Response("missing token", { status: 400 });

  const ip = request.headers.get("CF-Connecting-IP") || "";
  const body = new FormData();
  body.append("secret", env.TURNSTILE_SECRET_KEY);
  body.append("response", token);
  if (ip) body.append("remoteip", ip);

  const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body
  });
  const data = await r.json();
  if (!data.success) {
    return new Response(
      gateHtml(env.TURNSTILE_SITEKEY, `verification failed: ${(data["error-codes"] || []).join(", ") || "unknown"}`),
      { status: 401, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }

  const cookie = await mintCookie(env.GATE_SIGNING_KEY, TTL_SECONDS);
  return new Response(null, {
    status: 302,
    headers: {
      "Set-Cookie": `${COOKIE}=${cookie}; Path=/; Max-Age=${TTL_SECONDS}; HttpOnly; Secure; SameSite=Lax`,
      "Location": "/"
    }
  });
}

async function isAuthed(request, env) {
  const cookie = readCookie(request.headers.get("Cookie") || "", COOKIE);
  if (!cookie) return false;
  return verifyCookie(env.GATE_SIGNING_KEY, cookie);
}

function readCookie(header, name) {
  for (const part of header.split(/;\s*/)) {
    const eq = part.indexOf("=");
    if (eq < 0) continue;
    if (part.slice(0, eq) === name) return part.slice(eq + 1);
  }
  return null;
}

async function hmac(key, msg) {
  const enc = new TextEncoder();
  const k = await crypto.subtle.importKey(
    "raw", enc.encode(key), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", k, enc.encode(msg));
  return b64url(new Uint8Array(sig));
}

function b64url(buf) {
  let s = btoa(String.fromCharCode(...buf));
  return s.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function mintCookie(key, ttl) {
  const exp = Math.floor(Date.now() / 1000) + ttl;
  const payload = `v1.${exp}`;
  const sig = await hmac(key, payload);
  return `${payload}.${sig}`;
}

async function verifyCookie(key, cookie) {
  const parts = cookie.split(".");
  if (parts.length !== 3) return false;
  const [v, exp, sig] = parts;
  if (v !== "v1") return false;
  const expNum = parseInt(exp, 10);
  if (!expNum || expNum < Math.floor(Date.now() / 1000)) return false;
  const expected = await hmac(key, `${v}.${exp}`);
  return timingSafeEqual(expected, sig);
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let acc = 0;
  for (let i = 0; i < a.length; i++) acc |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return acc === 0;
}

function gateHtml(sitekey, errorMsg = "") {
  return `<!doctype html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>rift · gate</title>
<link rel="icon" href="/brand/logo/edit-only-the--oo--letterforms-in--root---all-othe.svg">
<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
<style>
  :root { --bg:#100f10; --fg:#fbfbfb; --mute:#8a8590; --accent:#7a18a0; --deep:#4d0861; --soft:#b558d8; }
  * { box-sizing: border-box; }
  html, body { margin:0; height:100%; background:var(--bg); color:var(--fg);
    font-family:-apple-system,BlinkMacSystemFont,Inter,system-ui,sans-serif; }
  body {
    display:flex; flex-direction:column; align-items:center; justify-content:center; gap:24px;
    background:
      radial-gradient(900px 500px at 80% -10%, color-mix(in oklch, var(--accent) 22%, transparent), transparent 60%),
      radial-gradient(700px 400px at -10% 110%, color-mix(in oklch, var(--deep) 28%, transparent), transparent 60%),
      var(--bg);
  }
  .card {
    background: rgba(31,29,32,0.85);
    border: 1px solid rgba(122,24,160,0.4);
    border-radius: 18px;
    padding: 40px;
    max-width: 420px;
    width: calc(100% - 32px);
    box-shadow: 0 24px 80px rgba(77,8,97,0.35), 0 0 0 1px rgba(181,88,216,0.15);
    text-align: center;
    animation: rise 600ms cubic-bezier(0.16,1,0.3,1);
  }
  @keyframes rise { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
  .mark { width:64px; height:64px; margin:0 auto 16px; display:block; border-radius:12px; }
  h1 { margin: 0 0 4px; font-size:20px; font-weight:600; letter-spacing:-0.01em; }
  .sub { color: var(--mute); font-size:12px; text-transform:uppercase; letter-spacing:0.14em; margin-bottom:28px; }
  .err { color:#ff6f7a; font-size:13px; margin-bottom:16px; min-height:18px; }
  .turnstile { display:flex; justify-content:center; margin: 16px 0; min-height: 70px; }
  .foot { color: var(--mute); font-size:11px; text-transform:uppercase; letter-spacing:0.12em; margin-top:24px; }
  form { margin: 0; }
</style></head>
<body>
  <form class="card" method="POST" action="/verify">
    <img class="mark" src="/brand/logo/edit-only-the--oo--letterforms-in--root---all-othe.svg" alt="rift">
    <h1>erebus edge</h1>
    <div class="sub">bifrost compositor demo</div>
    ${errorMsg ? `<div class="err">${escapeHtml(errorMsg)}</div>` : `<div class="err"></div>`}
    <div class="turnstile">
      <div class="cf-turnstile"
           data-sitekey="${sitekey}"
           data-theme="dark"
           data-callback="onVerified"></div>
    </div>
    <noscript><p style="color:#ff6f7a">javascript required.</p></noscript>
    <div class="foot">turnstile · cloudflare</div>
  </form>
  <script>
    function onVerified() { document.querySelector('form').submit(); }
  </script>
</body></html>`;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[c]));
}
