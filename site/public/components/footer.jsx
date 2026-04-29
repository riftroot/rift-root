/* global React, LogoGlyph */

// Mount inside <App/> after <Contact/> when app.jsx is next edited.

/* ==============================
   FOOTER — shared global footer
   Appears on the home page (sub-pages no longer exist).
   Dark + violet aesthetic, mono font, compact.
   ============================== */
function Footer() {
  return (
    <footer className="site-footer">
      <div className="container site-footer-inner">

        <a href="/" className="site-footer-mark" aria-label="Rift Root home">
          <LogoGlyph size={20} />
          <span className="site-footer-wordmark">
            <span>rift</span><span className="dim">/</span><span>root</span>
          </span>
          <span className="site-footer-llc">LLC</span>
        </a>

        <span className="site-footer-copy">
          &copy; 2026 Rift Root LLC &middot; Fort Collins, Colorado
        </span>

        <nav className="site-footer-links" aria-label="Footer links">
          <a
            href="https://github.com/riftroot"
            className="site-footer-link"
            target="_blank"
            rel="noopener"
          >
            GitHub
          </a>
          <span className="site-footer-sep" aria-hidden="true">&middot;</span>
          <a
            href="mailto:adam@riftroot.com"
            className="site-footer-link"
          >
            Contact
          </a>
          <span className="site-footer-sep" aria-hidden="true">&middot;</span>
          <a
            href="#demo"
            className="site-footer-link"
          >
            Compositor economics ↓
          </a>
        </nav>

      </div>
    </footer>
  );
}

Object.assign(window, { Footer });
