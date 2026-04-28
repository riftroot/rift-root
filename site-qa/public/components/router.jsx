/* Custom hash/pushState router — wouter has no UMD build; this is ~40 lines */
/* global React */

(function () {
  const { useState, useEffect, useCallback } = React;

  // --- internal state ---
  let _listeners = [];
  function _notify() { _listeners.forEach(fn => fn(window.location.pathname)); }

  // Public navigate helper — use this to drive links programmatically
  function navigate(path) {
    history.pushState(null, '', path);
    _notify();
  }

  // Intercept unmodified clicks on same-origin <a href="/..."> tags
  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest('a[href]');
    if (!a) return;
    const url = new URL(a.href, location.origin);
    if (url.origin !== location.origin) return;
    if (a.target && a.target !== '_self') return;
    e.preventDefault();
    navigate(url.pathname + url.search + url.hash);
  });

  window.addEventListener('popstate', _notify);

  // useLocation hook — returns [pathname, navigate]
  function useLocation() {
    const [path, setPath] = useState(window.location.pathname);
    useEffect(() => {
      function handler(p) { setPath(p); }
      _listeners.push(handler);
      return () => { _listeners = _listeners.filter(fn => fn !== handler); };
    }, []);
    return [path, navigate];
  }

  // <Router> — wraps the app; no DOM output
  function Router({ children }) {
    return children;
  }

  // <Route path="/foo"> — renders children only when pathname matches
  // Supports exact strings. Pass path="*" as a catch-all.
  function Route({ path, children }) {
    const [current] = useLocation();
    if (path !== '*' && current !== path) return null;
    return children;
  }

  // Export to window so UMD-style globals work in app.jsx
  window.Router     = Router;
  window.Route      = Route;
  window.useLocation = useLocation;
  window.navigate   = navigate;
})();
