/* global React */
const { useState, useEffect } = React;

/* ==============================
   LOGO MARK — small wordmark for nav and footer
   Canonical neon-violet variant (rift-root-logo.svg).
   ============================== */
function LogoGlyph({ size = 28 }) {
  return (
    <img
      src="assets/rift-root-logo.svg"
      alt="rift root"
      width={size}
      height={size}
      decoding="async"
      fetchpriority="high"
      style={{ height: size, width: size, display: 'block', objectFit: 'contain' }}
      className="nav-logo-img"
    />
  );
}

/* ==============================
   NAV
   mode="home"  → in-page anchor links for the marketing page (default)
   mode="page"  → reserved for future sub-pages (currently only Home)
   Auto-detects from window.location.pathname when no mode prop is passed.
   ============================== */
function Nav({ mode }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Auto-detect mode from pathname if not explicitly passed
  const resolvedMode = mode || (window.location.pathname === '/' ? 'home' : 'page');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // home mode: in-page anchor links
  const homeLinks = [
    { href: '#thesis',  label: 'Thesis',          num: '01' },
    { href: '#hostile', label: 'Hostile Network', num: '02' },
    { href: '#erebus',  label: 'Erebus Edge',     num: '03' },
    { href: '#surface', label: 'Surface',         num: '04' },
    { href: '#demo',    label: 'Demo',            num: '05' },
    { href: '#beyond',  label: 'Beyond Gen',      num: '06' },
    { href: '#why',     label: 'Why',             num: '07' },
    { href: '#about',   label: 'About',           num: '08' },
    { href: '#ask',     label: 'The Ask',         num: '09' },
    { href: '#contact', label: 'Contact',         num: '10' },
  ];

  // page mode: top-level page links
  const pageLinks = [
    { href: '/',        label: 'Home',         num: '01' },
  ];

  const links = resolvedMode === 'page' ? pageLinks : homeLinks;

  // Logo href: always go to root
  const logoHref = resolvedMode === 'page' ? '/' : '#top';

  return (
    <header className={`nav ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="nav-inner container">
        <a href={logoHref} className="nav-mark" aria-label="Rift Root home">
          <LogoGlyph size={32} />
          <span className="nav-wordmark">
            <span>rift</span><span className="dim">/</span><span>root</span>
          </span>
          <span className="nav-llc">LLC</span>
        </a>

        <nav className="nav-links" aria-label="Primary">
          {links.map(l => (
            <a key={l.href} href={l.href} className="nav-link">
              <span className="nav-link-num">{l.num}</span>
              <span className="nav-link-label">{l.label}</span>
            </a>
          ))}
        </nav>

        <a
          href="#demo"
          className="nav-cta"
        >
          <span className="dot" />
          demo
        </a>

        <button
          className={`nav-burger ${open ? 'is-open' : ''}`}
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen(o => !o)}
        >
          <span /><span /><span />
        </button>
      </div>

      {open && (
        <div className="nav-mobile">
          {links.map(l => (
            <a key={l.href} href={l.href} className="nav-mobile-link" onClick={() => setOpen(false)}>
              <span className="num">{l.num}</span>
              <span>{l.label}</span>
              <span className="arrow">↗</span>
            </a>
          ))}
          <a
            href="#demo"
            className="nav-mobile-cta"
            onClick={() => setOpen(false)}
          >
            <span className="dot" />
            demo ↓
          </a>
        </div>
      )}
    </header>
  );
}

/* ==============================
   HERO
   ============================== */
function Hero() {
  return (
    <section id="top" className="hero">
      <div className="hero-grid grid-bg" aria-hidden="true" />

      <div className="container hero-inner">
        <div className="hero-meta">
          <span className="mono-label"><span className="dot" />EST. 2026 · NORTHERN COLORADO</span>
          <span className="mono-label hero-meta-right">v0.1 · BOOTSTRAP · NOT SEEKING VC</span>
        </div>

        <div className="hero-body">
          <h1 className="display hero-title">
            Near-infinite velocity<br />
            for teams without<br />
            <em>large-firm resources.</em>
          </h1>

          <div className="hero-side">
            <p className="hero-lede">
              Erebus Edge is operating infrastructure for a one-person systems shop —
              a cost-optimized, model-agnostic execution mesh built
              <span className="hl-cyan"> agentic-first</span> by Rift Root LLC, so the
              operator stays at the level where humans matter: decisions, taste, and direction.
            </p>

            <div className="hero-actions">
              <a href="#why" className="btn btn-primary">
                Why this exists
                <span className="arrow">→</span>
              </a>
              <a
                href="#demo"
                className="btn"
                style={{ borderColor: 'var(--cyan)', color: 'var(--cyan)' }}
              >
                Compositor economics
                <span className="arrow">↓</span>
              </a>
            </div>
          </div>
        </div>

        <div className="hero-stats">
          <Stat k="∞" v="velocity ceiling" sub="bounded by horizontal scale, not headcount" accent="violet" />
          <Stat k="MAB" v="reward shaping" sub="multi-armed bandits stacked on E2E SWU" accent="cyan" />
          <Stat k="$0" v="outside capital" sub="bootstrapped — not a VC pitch" accent="lime" />
          <Stat k="1" v="operator" sub="Adam — sole founder, Northern Colorado" accent="grey" />
        </div>
      </div>
    </section>
  );
}

function Stat({ k, v, sub, accent = 'violet' }) {
  return (
    <div className={`stat stat-${accent}`}>
      <div className="stat-k display">{k}</div>
      <div className="stat-v mono-label">{v}</div>
      <div className="stat-sub">{sub}</div>
    </div>
  );
}

/* ==============================
   MARQUEE — seamless loop
   ============================== */
function Marquee() {
  const items = [
    { t: 'HORIZONTAL SCALE',         c: 'cyan' },
    { t: 'AGENTIC-FIRST',            c: 'violet' },
    { t: 'STACKED MAB',              c: 'lime' },
    { t: 'SOVEREIGN EXECUTION MESH', c: 'grey' },
    { t: 'LinUCB ROUTING',           c: 'cyan' },
    { t: 'SHADOW OPS',               c: 'violet' },
    { t: 'ZERO-TRUST GATEWAYS',      c: 'lime' },
    { t: 'COST-OPTIMIZED',           c: 'grey' },
    { t: 'MODEL-AGNOSTIC',           c: 'cyan' },
    { t: 'COMPOSITOR BANDITS',       c: 'violet' },
    { t: 'SELF-HEALING',             c: 'lime' },
    { t: 'CREDS PULL AT RUNTIME',   c: 'grey' },
    { t: 'THIN-SLICED TASKS',        c: 'cyan' },
    { t: 'X-DRIVEN INGEST',          c: 'violet' },
    { t: 'SPECULATIVE INFERENCE',    c: 'lime' },
    { t: 'CACHE TOPOLOGY',           c: 'grey' },
    { t: 'STATELESS WORKERS',        c: 'cyan' },
    { t: 'SWU-WEIGHTED REWARD',      c: 'violet' },
    { t: 'SCALE-TO-ZERO',            c: 'lime' },
    { t: 'PIXEL-DIFF VALIDATION',    c: 'grey' },
    { t: 'CONVERGENCE TELEMETRY',    c: 'cyan' },
    { t: 'NORTHERN COLORADO',        c: 'grey' },
  ];
  // Render the items list TWICE side-by-side. Animate the track from 0 → -50%
  // — at exactly -50% the second copy is in the position the first started in,
  // producing a perfect seamless loop with no flash.
  const renderCopy = (key) => (
    <div key={key} className="marquee-copy">
      {items.map((it, i) => (
        <span key={i} className="marquee-item">
          <span className={`glyph glyph-${it.c}`} aria-hidden="true">◇</span>
          {it.t}
        </span>
      ))}
    </div>
  );
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        {renderCopy('a')}
        {renderCopy('b')}
      </div>
    </div>
  );
}

Object.assign(window, { Nav, Hero, Marquee, LogoGlyph });
