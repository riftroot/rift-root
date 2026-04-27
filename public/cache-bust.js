// rift-bifrost-demo · cache-bust + update notifier
//
// iPhone Safari is aggressive about caching the SPA shell, especially when
// added to home screen. This script:
//   1. Registers a network-first service worker (/sw.js) that never serves
//      stale shell HTML/CSS/JS — it always tries network first and falls
//      back to cache only when offline.
//   2. Polls /api/version every 60s (and on every visibility change). When
//      the worker reports a new VERSION than the one baked into this page
//      load, shows a toast and hard-reloads after 4s — clearing the
//      Cache Storage and unregistering the service worker so the next
//      navigation gets a clean shell.
//
// Pattern lifted from the MSI dashboard worker (see msi-host/workers/dashboard/src/worker.js).

(() => {
  let appVersion = null;        // version reported by /api/version on first hit
  let upgradeFlagged = false;
  const toast = () => document.getElementById("update-toast");

  async function fetchVersion() {
    try {
      const r = await fetch("/api/version", { cache: "no-store", credentials: "same-origin" });
      if (!r.ok) return null;
      const j = await r.json();
      return j.version || null;
    } catch {
      return null;
    }
  }

  function flagUpgrade() {
    if (upgradeFlagged) return;
    upgradeFlagged = true;
    const t = toast();
    if (t) t.classList.add("show");
    setTimeout(hardReload, 4000);
  }

  async function hardReload() {
    try {
      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map(k => caches.delete(k)));
      }
      if ("serviceWorker" in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map(r => r.unregister()));
      }
    } catch {}
    // Append a cache-buster so even Safari's memory cache misses.
    const sep = location.search ? "&" : "?";
    location.replace(location.pathname + location.search + sep + "v=" + Date.now());
  }

  async function checkVersion() {
    const v = await fetchVersion();
    if (!v) return;
    if (appVersion === null) { appVersion = v; return; }
    if (v !== appVersion) flagUpgrade();
  }

  // Toast tap → reload immediately
  document.addEventListener("DOMContentLoaded", () => {
    const t = toast();
    if (t) t.addEventListener("click", hardReload);
  });

  // Service worker — network-first for the shell
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js", { updateViaCache: "none" }).then(reg => {
      reg.addEventListener("updatefound", () => {
        const nw = reg.installing;
        if (!nw) return;
        const wasActive = !!reg.active;
        nw.addEventListener("statechange", () => {
          if (nw.state === "activated" && wasActive) flagUpgrade();
        });
      });
      // Probe for SW updates every 2 min
      setInterval(() => reg.update().catch(() => {}), 120_000);
    }).catch(() => {});
    navigator.serviceWorker.addEventListener("message", e => {
      if (e.data && e.data.type === "sw-activated" && appVersion && e.data.version !== appVersion) {
        flagUpgrade();
      }
    });
  }

  // Initial version probe + periodic checks + visibility-driven check
  checkVersion();
  setInterval(checkVersion, 60_000);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) checkVersion();
  });
  // pageshow fires when Safari restores from bfcache — prime spot for stale detection
  window.addEventListener("pageshow", (e) => {
    if (e.persisted) checkVersion();
  });
})();
