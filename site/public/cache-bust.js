// rift-root-site · iPhone Safari cache-bust
//
// Polls /api/version every 60s, on visibility change, and after Safari
// restores from bfcache (pageshow.persisted). When the worker reports a
// VERSION different from the one the page loaded with, shows a toast and
// hard-reloads after 4s — clearing Cache Storage and busting the URL with
// a timestamp so even Safari's memory cache misses.

(function () {
  var loadedVersion = null;
  var flagged = false;

  function $toast() { return document.getElementById("rr-update-toast"); }

  function fetchVersion() {
    return fetch("/api/version", { cache: "no-store", credentials: "same-origin" })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) { return j && j.version || null; })
      .catch(function () { return null; });
  }

  function flagUpgrade() {
    if (flagged) return;
    flagged = true;
    var t = $toast();
    if (t) t.classList.add("show");
    setTimeout(hardReload, 4000);
  }

  function hardReload() {
    var done = function () {
      var sep = location.search ? "&" : "?";
      location.replace(location.pathname + location.search + sep + "v=" + Date.now());
    };
    var jobs = [];
    if ("caches" in window) {
      jobs.push(caches.keys().then(function (keys) {
        return Promise.all(keys.map(function (k) { return caches.delete(k); }));
      }));
    }
    if ("serviceWorker" in navigator) {
      jobs.push(navigator.serviceWorker.getRegistrations().then(function (regs) {
        return Promise.all(regs.map(function (r) { return r.unregister(); }));
      }));
    }
    Promise.all(jobs).then(done, done);
  }

  function check() {
    fetchVersion().then(function (v) {
      if (!v) return;
      if (loadedVersion === null) { loadedVersion = v; return; }
      if (v !== loadedVersion) flagUpgrade();
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var t = $toast();
    if (t) t.addEventListener("click", hardReload);
  });

  check();
  setInterval(check, 60000);
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) check();
  });
  window.addEventListener("pageshow", function (e) {
    if (e.persisted) check();
  });
})();
