/* global React, Nav, Footer */
/* ErebusPage — dedicated /erebus architecture page for Rift Root.
   Mounted when window.location.pathname === '/erebus'.
   No router library — plain pathname check in app.jsx.
*/

const { useState, useEffect, useRef } = React;

/* ---- Layer definitions ---- */
const LAYERS = [
  {
    id: 'perimeter',
    label: 'Perimeter',
    index: '01',
    accent: 'violet',
    nodes: ['Cloudflare Access', 'KV Vault', 'Webhook Ingest', 'Zero-Trust Auth'],
    reward: false,
  },
  {
    id: 'control',
    label: 'Control Plane',
    index: '02',
    accent: 'cyan',
    nodes: ['Task Store (Durable Object)', 'Scheduler', 'Worker Registry', 'Coordinator'],
    reward: false,
  },
  {
    id: 'intelligence',
    label: 'Intelligence',
    index: '03',
    accent: 'violet',
    nodes: ['LinUCB MAB Router', 'LLM Proxy', 'Prompt Evolution', 'Vector Indices', 'Alignment Gate'],
    reward: true, /* reward signal arrow terminates here */
  },
  {
    id: 'execution',
    label: 'Execution',
    index: '04',
    accent: 'lime',
    nodes: ['Worker Fleet (Fly.io)', 'MicroVM Sandbox', 'Task Handlers', 'Circuit Breaker'],
    reward: false,
  },
  {
    id: 'observability',
    label: 'Observability',
    index: '05',
    accent: 'amber',
    nodes: ['Event Store', 'Trace + Log Shipping', 'Drift Detection', 'Cost Ledger'],
    reward: false,
  },
];

/* ---- ArchLayer: single toggleable layer row ---- */
function ArchLayer({ layer, isOpen, onToggle }) {
  const headerId = `ep-layer-hdr-${layer.id}`;
  const bodyId   = `ep-layer-body-${layer.id}`;
  const previewText = layer.nodes.slice(0, 2).join(' · ') + (layer.nodes.length > 2 ? ' …' : '');

  return (
    <div
      className={`ep-layer ep-layer-${layer.id}${isOpen ? ' is-open' : ''}`}
      role="listitem"
    >
      <div className="ep-layer-bar" aria-hidden="true" />

      <button
        id={headerId}
        className="ep-layer-hdr"
        aria-expanded={isOpen}
        aria-controls={bodyId}
        onClick={onToggle}
      >
        <span className="ep-layer-index">{layer.index}</span>
        <span className="ep-layer-name">{layer.label}</span>
        <span className="ep-layer-nodes-preview" aria-hidden="true">{previewText}</span>
        <em className="ep-layer-chevron" aria-hidden="true">›</em>
      </button>

      <div
        id={bodyId}
        className="ep-layer-body"
        role="region"
        aria-labelledby={headerId}
      >
        <div className="ep-nodes" role="list">
          {layer.nodes.map((node) => (
            <span key={node} className="ep-node" role="listitem">{node}</span>
          ))}
        </div>
        {layer.reward && (
          <div className="ep-reward-note" aria-label="Reward signal returns here from Observability">
            <span className="ep-reward-dot" aria-hidden="true" />
            <span className="ep-reward-text">↺ reward signal from observability terminates here</span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---- ArchDiagram: the interactive 5-layer diagram ---- */
function ArchDiagram() {
  const [openLayer, setOpenLayer] = useState(null);

  function toggle(id) {
    setOpenLayer(prev => (prev === id ? null : id));
  }

  return (
    <div className="ep-diagram" aria-label="Erebus Edge architecture diagram — five interactive layers">
      <div className="ep-diagram-inner">

        {/* Left arrow column */}
        <div className="ep-arrow-col" aria-hidden="true">
          <div className="ep-arrow-track">
            <div className="ep-main-line" />
            <div className="ep-reward-line" />
            <div className="ep-arrow-tip-down" />
            <div className="ep-arrow-tip-up" />
            <div className="ep-pulse-dot" />
            <div className="ep-pulse-dot-reward" />
          </div>
        </div>

        {/* Layer stack */}
        <div className="ep-layers" role="list" aria-label="Architecture layers">
          {LAYERS.map((layer) => (
            <ArchLayer
              key={layer.id}
              layer={layer}
              isOpen={openLayer === layer.id}
              onToggle={() => toggle(layer.id)}
            />
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="ep-diagram-legend" aria-label="Diagram legend">
        <div className="ep-legend-item">
          <div className="ep-legend-line violet" aria-hidden="true" />
          Request flow · Perimeter → Observability
        </div>
        <div className="ep-legend-item">
          <div className="ep-legend-line cyan" aria-hidden="true" />
          Reward signal · Observability → Intelligence
        </div>
      </div>
    </div>
  );
}

/* ---- Deep dive subsection card ---- */
function DeepCard({ num, title, children }) {
  return (
    <article className="ep-deep-card">
      <div className="ep-deep-card-num">{num}</div>
      <h3 className="ep-deep-card-title">{title}</h3>
      <p className="ep-deep-card-body">{children}</p>
    </article>
  );
}

/* ---- Partner cell ---- */
function PartnerCell({ name, desc }) {
  return (
    <div className="ep-partner-cell">
      <div className="ep-partner-name">{name}</div>
      <p className="ep-partner-desc">{desc}</p>
      <a href="mailto:adam@riftroot.com" className="ep-partner-cta">
        adam@riftroot.com ↗
      </a>
    </div>
  );
}

/* ---- ErebusPage root ---- */
function ErebusPage() {
  /* Re-run the fade-in observer that app.jsx sets up on marketing page */
  useEffect(() => {
    const els = document.querySelectorAll('[data-fade]');
    const io = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); }),
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="erebus-page">
      {/* Shared global nav — page mode shows top-level page links */}
      <Nav mode="page" />

      <main id="main-content">

        {/* ──────────────────── LEAD ──────────────────── */}
        <section className="ep-lead" aria-labelledby="ep-lead-title">
          <div className="container">
            <div className="ep-eyebrow">
              <span className="chip violet">EREBUS EDGE</span>
              <span className="chip cyan">ARCHITECTURE</span>
              <span className="chip grey">HOSTILE-NETWORK-FIRST</span>
            </div>

            <h1 id="ep-lead-title" className="ep-title">
              Built for the network<br />
              that <em>blocks everything.</em>
            </h1>

            <div className="ep-hostile-block">
              <p className="ep-hostile-text">
                Most AI tooling assumes unconstrained outbound access to provider APIs.
                In a firewalled enterprise, air-gapped environment, or regulated network,
                that assumption breaks completely — you literally cannot call Anthropic
                from inside the perimeter. <em>Erebus Edge is built for exactly that
                condition</em>: keys stay server-side in a KV vault, zero-trust auth
                through Cloudflare Access gates every surface, and the only traffic
                crossing the perimeter is webhook ingest.
              </p>
            </div>
          </div>
        </section>

        {/* ──────────────────── KPI CARDS ──────────────────── */}
        <section className="ep-kpi-row" aria-labelledby="ep-kpi-title">
          <div className="container">
            <h2 id="ep-kpi-title" className="mono-label" style={{marginBottom: '0'}}>
              <span className="dot" aria-hidden="true" />
              System shape
            </h2>
            <div className="ep-kpi-grid" style={{marginTop: '20px'}} role="list" aria-label="System metrics">
              {[
                { value: '100+ HTTP', label: 'endpoints across control + execution tiers' },
                { value: '5-layer',   label: 'architecture — perimeter through observability' },
                { value: '3 vector · 2 SQL', label: 'indices and stores for retrieval + audit' },
                { value: '11 handlers · stateless', label: 'task handlers, zero shared mutable state' },
              ].map((kpi, i) => (
                <div key={i} className="ep-kpi-cell" role="listitem" data-fade style={{'--fade-delay': (i * 80) + 'ms'}}>
                  <span className="ep-kpi-value">{kpi.value}</span>
                  <span className="ep-kpi-label">{kpi.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ──────────────────── ARCHITECTURE DIAGRAM ──────────────────── */}
        <section className="ep-arch" aria-labelledby="ep-arch-title">
          <div className="container">
            <div className="ep-arch-head">
              <span className="mono-label">
                <span className="dot" aria-hidden="true" />
                System layers
              </span>
              <h2 id="ep-arch-title" className="ep-arch-title">
                Five layers. Click any to expand.
              </h2>
            </div>
            <ArchDiagram />
          </div>
        </section>

        {/* ──────────────────── HOSTILE NETWORK DEEP DIVE ──────────────────── */}
        <section className="ep-deep" aria-labelledby="ep-deep-title">
          <div className="container">
            <span className="mono-label">
              <span className="dot" aria-hidden="true" />
              Hostile-network design
            </span>
            <h2 id="ep-deep-title" className="ep-arch-title" style={{marginTop: '16px'}}>
              Three constraints.<br />Every design decision follows from them.
            </h2>

            <div className="ep-deep-grid" role="list">
              <DeepCard num="01" title="No outbound provider calls from client processes.">
                LLM provider keys — Anthropic, DeepSeek, Gemini, Perplexity — live
                exclusively in a server-side KV vault scoped to the control plane worker.
                The execution tier never receives, caches, or transmits credentials. A
                task handler dispatched into a MicroVM sandbox has no route to any
                external provider; it receives only the resolved output piped from the
                LLM Proxy, which itself runs inside the perimeter. An operator running
                inside a regulated network can audit the full credential surface without
                touching execution code.
              </DeepCard>

              <DeepCard num="02" title="Cloudflare Access on every surface.">
                Admin endpoints, webhook receivers, the coordinator API, and operator
                dashboards all sit behind Cloudflare Access policies enforced at the
                edge — before any request reaches application logic. There is no
                unauthenticated surface area beyond the public documentation and
                marketing site. Zero-trust auth means that even a fully compromised
                host inside the network cannot laterally reach the control plane without
                a valid identity token. Session tokens are short-lived; no standing
                access is granted to service accounts.
              </DeepCard>

              <DeepCard num="03" title="Webhook-only inbound.">
                The only path into the system from external sources is signed webhooks
                from an allowlist of approved sources: GitHub, Linear, and CI providers.
                Every payload is verified with HMAC-SHA256 before any parsing occurs.
                A 5-minute deduplication TTL prevents replay attacks. There is no
                polling loop, no long-lived inbound TCP connection, and no agent that
                periodically reaches outward to check for work. The perimeter only
                opens when a signed event arrives; everything else is default-deny.
              </DeepCard>
            </div>
          </div>
        </section>

        {/* ──────────────────── RESOURCE PARTNERSHIPS ──────────────────── */}
        <section className="ep-partners" aria-labelledby="ep-partners-title">
          <div className="container">
            <span className="mono-label">
              <span className="dot" aria-hidden="true" />
              Resource partnerships
            </span>
            <h2 id="ep-partners-title" className="ep-arch-title" style={{marginTop: '16px'}}>
              Programs that accelerate this work.
            </h2>
            <p style={{
              fontFamily: 'var(--font-mono)', fontSize: '14px',
              color: 'var(--grey-3)', lineHeight: '1.7',
              maxWidth: '60ch', marginTop: '16px', marginBottom: '0',
            }}>
              Rift Root is not seeking venture capital. Compute credits, inference
              budgets, hardware access, and design partnerships compound the MAB
              learning cycles. The contact for all program inquiries is{' '}
              <a href="mailto:adam@riftroot.com" style={{color: 'var(--violet-bright)', borderBottom: '1px solid var(--violet)'}}>adam@riftroot.com</a>.
            </p>

            <div className="ep-partners-grid" style={{marginTop: '32px'}} role="list">
              <PartnerCell
                name="AWS Activate"
                desc="Cloud compute and infrastructure credits to expand the execution pool and reduce cold-start latency in the worker fleet."
              />
              <PartnerCell
                name="Google for Startups"
                desc="GCP compute and Vertex AI inference credits that add hardware diversity to the MAB backend pool, improving routing priors."
              />
              <PartnerCell
                name="Cloudflare for Startups"
                desc="The perimeter layer of Erebus Edge runs on Cloudflare Workers, Durable Objects, and KV. Extended limits accelerate the control plane."
              />
              <PartnerCell
                name="NVIDIA Inception"
                desc="Bare-metal GPU inference access that the cloud abstracts away. Silicon-level diversity is the empirical input the MAB optimizer needs most."
              />
            </div>
          </div>
        </section>

      </main>

      {/* Shared global footer */}
      <Footer />
    </div>
  );
}

Object.assign(window, { ErebusPage });
