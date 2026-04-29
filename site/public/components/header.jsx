/* global React */
const { useState, useEffect } = React;

function switchTab(name) {
  window.location.hash = name;
}

/* ==============================
   LOGO MARK — small wordmark for nav and footer
   Uses the tinted SVG (light plaque + dark wordmark + violet dot).
   Replaces all prior abstract glyphs.
   ============================== */
function LogoGlyph({ size = 28 }) {
  return (
    <img
      src="assets/riftroot-logo-tinted.svg"
      alt="rift root"
      width={size}
      height={size}
      style={{ height: size, width: size, display: 'block', objectFit: 'contain' }}
      className="nav-logo-img"
    />
  );
}

/* ==============================
   NAV
   ============================== */
function Nav({ tab = 'home' }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    { href: '#thesis',  label: 'Thesis',      num: '01' },
    { href: '#erebus',  label: 'Erebus Edge', num: '02' },
    { href: '#beyond',  label: 'Beyond Gen',  num: '03' },
    { href: '#why',     label: 'Why',         num: '04' },
    { href: '#about',   label: 'About',       num: '05' },
    { href: '#ask',     label: 'The Ask',     num: '06' },
    { href: '#contact', label: 'Contact',     num: '07' },
  ];

  return (
    <header className={`nav ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="nav-inner container">
        <a href="#top" className="nav-mark" aria-label="Rift Root home">
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

        <nav className="nav-tabs" aria-label="Site tabs">
          <button
            className={`nav-tab${tab === 'home' ? ' is-active' : ''}`}
            onClick={() => switchTab('home')}
          >
            {tab === 'home' && <span className="dot" aria-hidden="true" />}
            home
          </button>
          <button
            className={`nav-tab${tab === 'demo' ? ' is-active' : ''}`}
            onClick={() => switchTab('demo')}
          >
            {tab === 'demo' && <span className="dot" aria-hidden="true" />}
            demo
          </button>
          <button
            className={`nav-tab${tab === 'architecture' ? ' is-active' : ''}`}
            onClick={() => switchTab('architecture')}
          >
            {tab === 'architecture' && <span className="dot" aria-hidden="true" />}
            architecture
          </button>
        </nav>

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
          <div className="nav-mobile-tabs">
            <button
              className={`nav-mobile-tab${tab === 'home' ? ' is-active' : ''}`}
              onClick={() => { setOpen(false); switchTab('home'); }}
            >
              <span className="dot" aria-hidden="true" />
              home
            </button>
            <button
              className={`nav-mobile-tab${tab === 'demo' ? ' is-active' : ''}`}
              onClick={() => { setOpen(false); switchTab('demo'); }}
            >
              <span className="dot" aria-hidden="true" />
              live demo
            </button>
            <button
              className={`nav-mobile-tab${tab === 'architecture' ? ' is-active' : ''}`}
              onClick={() => { setOpen(false); switchTab('architecture'); }}
            >
              <span className="dot" aria-hidden="true" />
              architecture
            </button>
          </div>
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
            The standard playbook<br />
            doesn&apos;t produce<br />
            <em>near-infinite velocity.</em>
          </h1>

          <div className="hero-side">
            <p className="hero-lede">
              Academic rigor, RAG-first, VC-scale assumptions — none of that gets a one-person shop
              shipping at the pace of a forty-person org. Erebus Edge is the
              <span className="hl-cyan"> execution mesh</span> built because the standard
              playbook didn&apos;t work. One operator. The system does the composition.
            </p>

            <div className="hero-actions">
              <a href="#why" className="btn btn-primary">
                Why this exists
                <span className="arrow">→</span>
              </a>
              <a href="#erebus" className="btn">
                Erebus Edge
              </a>
              <a
                href="#demo"
                className="btn"
                aria-label="Open Erebus Edge live demo"
                style={{ borderColor: 'var(--cyan)', color: 'var(--cyan)' }}
                onClick={(e) => {
                  e.preventDefault();
                  switchTab('demo');
                }}
              >
                Watch it route
                <span className="arrow">→</span>
              </a>
            </div>
          </div>
        </div>

        <div className="hero-stats">
          <Stat k="∞" v="velocity ceiling" sub="bounded by horizontal scale, not headcount" accent="violet" />
          <Stat k="MAB" v="reward shaping" sub="every decision teaches the system — cost drops as it learns" accent="cyan" />
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
