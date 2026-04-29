/* global React */

function SectionHead({ num, name, meta }) {
  return (
    <header className="section-head">
      <span className="num">{num} /</span>
      <h2 className="name">{name}</h2>
      <span className="meta">{meta}</span>
    </header>
  );
}

/* ==============================
   THESIS — horizontal scale + agentic-first
   ============================== */
function Thesis() {
  return (
    <section id="thesis" className="section section-thesis">
      <div className="container">
        <SectionHead num="01" name="The thesis" meta="HORIZONTAL SCALE · AGENTIC-FIRST" />


        <div className="thesis-hero">
          <h2 className="display thesis-title">
            Velocity is unlocked by <em className="cyan">horizontal scale</em>,<br/>
            shaped by an <em>agentic-first</em> spine.
          </h2>
          <p className="thesis-lede">
            Big firms throw headcount at the problem. Rift Root deploys stateless workers,
            edge runtimes, and ephemeral containers — Fly.io placement, Cloudflare workers,
            sandboxed execution — and lets the agentic spine do the coordination work that
            headcount was covering.
          </p>
        </div>

        <ol className="thesis-stack">
          <StackStep idx={0} n="01" tag="INGEST" color="cyan"
            lines={[
              "Plan or spec enters. Thin-sliced into tasks with explicit schema:",
              "relationships, priorities, blockers. No ambiguity reaches the executor."
            ]} />
          <StackStep idx={1} n="02" tag="STORE" color="violet"
            lines={[
              "Agentic-first task store. Not a ticketing tool.",
              "Self-healing. HITL escalation trends toward zero."
            ]} />
          <StackStep idx={2} n="03" tag="ROUTE" color="lime"
            lines={[
              "MAB selects model × prompt path per task type.",
              "Cheap-tier first. Winners reinforce. Losers prune."
            ]}
            metric={{ label: 'cheap-tier first-pass · last 1,000 tasks', value: 94, suffix: '%' }} />
          <StackStep idx={3} n="04" tag="EXECUTE" color="cyan"
            lines={[
              "Stateless workers. Edge runtimes. Sandboxed containers.",
              "Scale-to-zero on idle. Scale-to-thousands on demand.",
              "No warm-up cost. No idle billing."
            ]} />
          <StackStep idx={4} n="05" tag="CACHE" color="violet"
            lines={[
              "Right-sized context. No bloat. No rot.",
              "Nothing computed twice. Feeds back into ingest so the system remembers."
            ]} />
        </ol>

        <div className="thesis-callout">
          <span className="chip lime">AGENTIC-FIRST</span>
          <p className="thesis-callout-body display">
            The whole project is agentic-first — <em>no tacking on solutions
            geared toward micromanaged HITL</em>. The operator is freed to make
            decisions that matter and define the vision.
          </p>
        </div>

        <XDrivenTable />
      </div>
    </section>
  );
}

/* ==============================
   X-DRIVEN — Compositor bandit fluidity diagram
   ============================== */
function XDrivenTable() {
  // Inputs feed in from left; resolved approaches light up on the right.
  const inputs = [
    { label: 'spec doc',      delay: '0s',   color: 'cyan'   },
    { label: 'domain model',  delay: '0.6s', color: 'amber'  },
    { label: 'README',        delay: '1.2s', color: 'grey'   },
    { label: 'API schema',    delay: '1.8s', color: 'violet' },
    { label: 'failing tests', delay: '2.4s', color: 'rose'   },
  ];
  const outputs = [
    { label: 'spec-driven',     delay: '0s',   color: 'cyan'   },
    { label: 'model-driven',    delay: '0.6s', color: 'violet' },
    { label: 'domain-driven',   delay: '1.2s', color: 'amber'  },
    { label: 'contract-driven', delay: '1.8s', color: 'lime'   },
    { label: 'test-driven',     delay: '2.4s', color: 'rose'   },
  ];

  const W = 760, H = 380;
  const cx = W / 2, cy = H / 2;
  const r = 56; // bandit radius

  return (
    <div className="xdriven">
      <div className="xdriven-pullquote display">
        Shape work arrives in.
      </div>
      <p className="xdriven-lede">
        A spec, a domain model, a README, an API schema — Erebus Edge treats each as
        a source of truth and shapes the task graph accordingly. The
        <em className="violet"> compositor bandit </em>
        does not assume an approach. It selects one, runs
        <em className="lime"> shadow operations </em>
        with stacked-MAB variants to explore alternatives, then commits the dominant
        strategy.
      </p>

      <div className="xdriven-stage">
        <svg viewBox={`0 0 ${W} ${H}`} className="xdriven-svg" preserveAspectRatio="xMidYMid meet">
          <defs>
            <radialGradient id="bandit-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(168,85,247,0.55)" />
              <stop offset="60%" stopColor="rgba(168,85,247,0.10)" />
              <stop offset="100%" stopColor="rgba(168,85,247,0)" />
            </radialGradient>
            <marker id="xd-arrow" viewBox="0 0 8 8" refX="7" refY="4"
                    markerWidth="6" markerHeight="6" orient="auto">
              <path d="M0,0 L8,4 L0,8 z" fill="#5A5A63" />
            </marker>
            {/* per-input dash flow */}
            <style>{`
              @keyframes xd-dash { to { stroke-dashoffset: -240; } }
              @keyframes xd-pulse { 0%,100% { opacity: 0.5; transform: scale(1); }
                                    50% { opacity: 1; transform: scale(1.15); } }
              @keyframes xd-out { 0%, 70% { opacity: 0.35; }
                                  85% { opacity: 1; }
                                  100% { opacity: 0.6; } }
              @keyframes xd-shadow {
                0%, 60% { opacity: 0; }
                70%     { opacity: 0.7; }
                90%     { opacity: 0.7; }
                100%    { opacity: 0; }
              }
              .xd-flow {
                stroke-dasharray: 4 6;
                animation: xd-dash 6s linear infinite;
              }
              .xd-input-pulse { transform-origin: center; transform-box: fill-box;
                animation: xd-pulse 3s ease-in-out infinite; }
              .xd-output-card { animation: xd-out 6s ease-in-out infinite; }
              .xd-shadow-line { animation: xd-shadow 6s ease-in-out infinite; }
            `}</style>
          </defs>

          {/* Bandit glow halo */}
          <circle cx={cx} cy={cy} r="120" fill="url(#bandit-glow)" />

          {/* Input flow lines: from left input cards into the bandit */}
          {inputs.map((inp, i) => {
            const y = 40 + i * (H - 80) / (inputs.length - 1);
            const x1 = 132, x2 = cx - r;
            return (
              <g key={`in-${i}`}>
                <path
                  d={`M ${x1} ${y} C ${x1 + 100} ${y}, ${x2 - 80} ${cy}, ${x2} ${cy}`}
                  fill="none" stroke={inputColor(inp.color)} strokeOpacity="0.55"
                  strokeWidth="1" className="xd-flow"
                  style={{ animationDelay: inp.delay }}
                />
              </g>
            );
          })}

          {/* Output flow: from bandit into right approach cards */}
          {outputs.map((out, i) => {
            const y = 60 + i * (H - 120) / (outputs.length - 1);
            const x1 = cx + r, x2 = W - 170;
            return (
              <path key={`out-${i}`}
                d={`M ${x1} ${cy} C ${x1 + 60} ${cy}, ${x2 - 80} ${y}, ${x2} ${y}`}
                fill="none" stroke={inputColor(out.color)} strokeOpacity="0.5"
                strokeWidth="1" className="xd-flow"
                style={{ animationDelay: out.delay }}
              />
            );
          })}

          {/* Shadow operation: brief fork-and-collapse from bandit going down */}
          <g className="xd-shadow-line">
            <path d={`M ${cx} ${cy + r} Q ${cx - 60} ${cy + 90}, ${cx - 80} ${cy + 130}`}
                  fill="none" stroke="#A3E635" strokeOpacity="0.7"
                  strokeWidth="1" strokeDasharray="2 4" />
            <path d={`M ${cx} ${cy + r} Q ${cx + 60} ${cy + 90}, ${cx + 80} ${cy + 130}`}
                  fill="none" stroke="#A3E635" strokeOpacity="0.3"
                  strokeWidth="1" strokeDasharray="2 4" />
            <text x={cx} y={cy + 160} textAnchor="middle"
                  fontFamily="JetBrains Mono, monospace" fontSize="10"
                  style={{ fill: 'var(--lime)' }} letterSpacing="2">SHADOW OPS · MAB VARIANTS</text>
          </g>

          {/* Input cards on the left */}
          {inputs.map((inp, i) => {
            const y = 40 + i * (H - 80) / (inputs.length - 1);
            const c = inputColor(inp.color);
            return (
              <g key={`ic-${i}`} transform={`translate(0, ${y})`}>
                <rect x="14" y="-13" width="118" height="26" className="xd-card-fill"
                      stroke={c} strokeOpacity="0.6" />
                <text x="22" y="4" fontFamily="JetBrains Mono, monospace" fontSize="11"
                      className="xd-text-bright" letterSpacing="0.4">{inp.label}</text>
                <circle cx="132" cy="0" r="3" fill={c} className="xd-input-pulse"
                        style={{ animationDelay: inp.delay }} />
              </g>
            );
          })}

          {/* Bandit node */}
          <g>
            <circle cx={cx} cy={cy} r={r} className="xd-card-fill" stroke="#A855F7" strokeWidth="1.5" />
            <circle cx={cx} cy={cy} r={r - 8} fill="none" stroke="#A855F7"
                    strokeOpacity="0.35" strokeDasharray="2 3" />
            <text x={cx} y={cy - 8} textAnchor="middle"
                  fontFamily="JetBrains Mono, monospace" fontSize="10"
                  className="xd-text-dim" letterSpacing="2">COMPOSITOR</text>
            <text x={cx} y={cy + 8} textAnchor="middle"
                  fontFamily="JetBrains Mono, monospace" fontSize="13" fontWeight="600"
                  className="xd-text-violet" letterSpacing="2.5">BANDIT</text>
            <text x={cx} y={cy + 24} textAnchor="middle"
                  fontFamily="JetBrains Mono, monospace" fontSize="9"
                  className="xd-text-meta" letterSpacing="1.5">stacked-MAB</text>
          </g>

          {/* Output cards on the right */}
          {outputs.map((out, i) => {
            const y = 60 + i * (H - 120) / (outputs.length - 1);
            const c = inputColor(out.color);
            return (
              <g key={`oc-${i}`} transform={`translate(0, ${y})`}
                 className="xd-output-card" style={{ animationDelay: out.delay }}>
                <rect x={W - 170} y="-14" width="140" height="28" className="xd-card-fill"
                      stroke={c} strokeWidth="1" />
                <text x={W - 100} y="-1" textAnchor="middle"
                      fontFamily="JetBrains Mono, monospace" fontSize="11" fontWeight="600"
                      className={`xd-text-${out.color}`} letterSpacing="1.5">{out.label}</text>
                <text x={W - 100} y="9" textAnchor="middle"
                      fontFamily="JetBrains Mono, monospace" fontSize="8"
                      className="xd-text-dim" letterSpacing="1.2">approach</text>
              </g>
            );
          })}

          {/* "and others" hint below the output stack */}
          <text x={W - 100} y={H - 20} textAnchor="middle"
                fontFamily="JetBrains Mono, monospace" fontSize="10"
                className="xd-text-meta" letterSpacing="2">+ AND OTHERS</text>

          {/* Side labels */}
          <text x="14" y="22" fontFamily="JetBrains Mono, monospace" fontSize="10"
                className="xd-text-meta" letterSpacing="2">SOURCES OF TRUTH</text>
          <text x={W - 170} y="22" fontFamily="JetBrains Mono, monospace" fontSize="10"
                className="xd-text-meta" letterSpacing="2">RESOLVED APPROACH</text>
        </svg>
      </div>

      <p className="xdriven-foot">
        The bandit tries every approach for which the inputs supply enough signal.
        No approach is privileged. Convergence — not preference — decides what gets
        committed for a given task class.
      </p>
    </div>
  );
}

function inputColor(c) {
  switch (c) {
    case 'cyan':   return '#22D3EE';
    case 'violet': return '#C084FC';
    case 'lime':   return '#A3E635';
    case 'amber':  return '#F5A524';
    case 'rose':   return '#F07178';
    default:       return '#8B8B95';
  }
}

function StackStep({ n, tag, color, lines, metric, idx = 0 }) {
  return (
    <li
      className={`stack stack-${color}`}
      data-fade
      style={{ '--fade-delay': (idx * 100) + 'ms' }}
    >
      <div className="stack-anchor">
        <span className="stack-num display">{n}</span>
        <span className={`stack-tag chip ${color}`}>{tag}</span>
      </div>
      <div className="stack-body">
        {lines.map((l, i) => <p key={i} className="stack-line">{l}</p>)}
        {metric && (
          <div className={`stack-metric metric-${color}`}>
            <span className="metric-bracket">[</span>
            <span className="metric-tag mono-label">LIVE</span>
            <span className="metric-value display">{metric.value}{metric.suffix}</span>
            <span className="metric-label">{metric.label}</span>
            <span className="metric-bracket">]</span>
          </div>
        )}
      </div>
    </li>
  );
}

/* ==============================
   ARCH LAYER DEFINITIONS (inlined from erebus-page.jsx)
   ============================== */
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

/* ---- ArchDiagram: interactive 5-layer diagram ---- */
function ArchDiagram() {
  const { useState } = React;
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

/* ---- DeepCard: hostile-network deep dive card ---- */
function DeepCard({ num, title, children }) {
  return (
    <article className="ep-deep-card">
      <div className="ep-deep-card-num">{num}</div>
      <h3 className="ep-deep-card-title">{title}</h3>
      <p className="ep-deep-card-body">{children}</p>
    </article>
  );
}

/* ==============================
   HOSTILE NETWORK — architecture + hostile-network-first deep dive
   ============================== */
function HostileNetwork() {
  return (
    <section id="hostile" className="section section-hostile">
      <div className="container">
        <SectionHead num="02" name="Hostile Network" meta="ARCHITECTURE · HOSTILE-NETWORK-FIRST" />

        {/* Lead */}
        <div className="ep-lead">
          <div className="ep-eyebrow">
            <span className="chip violet">EREBUS EDGE</span>
            <span className="chip cyan">ARCHITECTURE</span>
            <span className="chip grey">HOSTILE-NETWORK-FIRST</span>
          </div>

          <h2 className="ep-title">
            Built for the network<br />
            that <em>blocks everything.</em>
          </h2>

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

        {/* KPI row */}
        <div className="ep-kpi-row" aria-labelledby="ep-kpi-title">
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

        {/* Architecture diagram */}
        <div className="ep-arch" aria-labelledby="ep-arch-title">
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

        {/* Deep dive */}
        <div className="ep-deep" aria-labelledby="ep-deep-title">
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

      </div>
    </section>
  );
}

/* ==============================
   EREBUS EDGE
   ============================== */
function Erebus() {
  return (
    <section id="erebus" className="section section-erebus">
      <div className="container">
        <SectionHead num="03" name="Design pillars" meta="EREBUS EDGE · SYSTEM PRINCIPLES" />

        <div className="erebus-hero">
          <div className="erebus-hero-text">
            <div className="erebus-tag"><span className="chip lime">ACTIVE PROJECT</span></div>
            <h2 className="display erebus-title">
              Six pillars.<br/>
              <em>The principles</em> that<br/>
              shape every decision.
            </h2>
            <p className="erebus-lede">
              Stacked multi-armed bandit systems reward against total
              end-to-end SWU. Each task type and model is trained on prompt
              optimization, batch queueing, layered caches, compositors, and
              x-driven approaches — all tuned and reinforced for quality,
              self-healing, and capability expansion.
            </p>
          </div>
        </div>

        <div className="erebus-grid">
          {[
            { n: "α", color: "violet", title: "Reward Shaping",
              body: "Stacked MABs train on E2E SWU. Every task type, every model, every prompt path competes — the winners get reinforced, the losers get pruned.",
              tags: ["MAB", "E2E SWU", "prompt-opt"] },
            { n: "β", color: "cyan", title: "Cache Topology",
              body: "Cache-in-model, local cache, queue cache. Batch-queued API calls with deduped fingerprints. The right answer never gets computed twice.",
              tags: ["cache-in-model", "local", "batch-queue"] },
            { n: "γ", color: "lime", title: "Compositor Bandits",
              body: "X-driven work flows through compositor bandits that pick the best driven approach for each task class — and run shadow operations to explore variants before committing.",
              tags: ["compositors", "x-driven", "shadow-ops"] },
            { n: "δ", color: "cyan", title: "Sandbox Validation",
              body: "Every output runs through an isolated sandbox before promotion. Self-healing kicks in on failure — re-route, re-prompt, re-decompose.",
              tags: ["sandbox", "self-healing", "isolated"] },
            { n: "ε", color: "violet", title: "Horizontal Scale",
              body: "Cloud-native serverless workers, edge runtimes, ephemeral containers. Scale-to-zero on idle, scale to thousands on demand.",
              tags: ["serverless", "edge", "∞-scale"] },
            { n: "ζ", color: "lime", title: "Model-Agnostic",
              body: "No vendor lock. The bandit chooses what's cheapest-per-quality this minute. Tomorrow's model plugs in as a new arm.",
              tags: ["multi-vendor", "cost-opt", "pluggable"] }
          ].map((p, i) => <Pillar key={p.title} idx={i} {...p} />)}
        </div>

        <div className="erebus-callout card">
          <span className="corner tl" /><span className="corner tr" />
          <span className="corner bl" /><span className="corner br" />
          <div className="callout-label"><span className="chip violet">WHY IT MATTERS</span></div>
          <p className="callout-body display">
            One operator running Erebus Edge ships work that <em className="cyan">looks like</em> a forty-person engineering org —
            because the system, not the headcount, is doing the composition.
          </p>
        </div>

        <div className="erebus-explore-row">
          <a href="#demo" className="explore-cta explore-cta-lime">Compositor economics ↓</a>
        </div>
      </div>
    </section>
  );
}

function Pillar({ n, title, body, tags, color = 'violet' }) {
  // Intentionally NOT animated — the Erebus pillar grid stays static and
  // always visible. These cards are the spec sheet, not a reveal.
  return (
    <article className={`pillar card pillar-${color}`}>
      <div className="pillar-head">
        <span className={`pillar-glyph display glyph-${color}`}>{n}</span>
        <h3 className="pillar-title">{title}</h3>
      </div>
      <p className="pillar-body">{body}</p>
      <div className="pillar-tags">
        {tags.map(t => <span key={t} className="tag">{t}</span>)}
      </div>
    </article>
  );
}

/* ==============================
   SURFACE — operational inventory preview
   ============================== */

const SURFACE_STATS = [
  { label: 'HTTP endpoints',       value: '~100' },
  { label: 'Workers / Fly machines', value: '35+'  },
  { label: 'Durable Objects',      value: '6+'   },
  { label: 'Cron schedules',       value: '15'   },
  { label: 'Task handlers',        value: '40+'  },
  { label: 'Vectorize indices',    value: '3'    },
  { label: 'Service bindings',     value: '12+'  },
  { label: 'CLI scripts',          value: '40+'  },
];

const SURFACE_CATS = [
  {
    accent: 'violet',
    label: 'Hostile Network Enablement',
    count: 16,
    samples: [
      { name: 'List vault keys',              method: 'POST',   path: '/v1/admin/secrets/status' },
      { name: 'GitHub push receiver',         method: 'POST',   path: '/webhooks/github' },
      { name: 'CF Access service-to-service', method: 'env',    path: 'CF_ACCESS_CLIENT_ID / …SECRET' },
    ],
  },
  {
    accent: 'cyan',
    label: 'Task Lifecycle & Execution',
    count: 39,
    samples: [
      { name: 'Create task',          method: 'POST',    path: '/v1/sluagh/tasks' },
      { name: 'Worker poll for work', method: 'POST',    path: '/v1/worker/poll' },
      { name: 'Allocate microVM',     method: 'POST',    path: '/v1/dispatch/sprite' },
    ],
  },
  {
    accent: 'lime',
    label: 'Learning & Intelligence',
    count: 36,
    samples: [
      { name: 'Chat endpoint (Void-Vein)',  method: 'POST',  path: '/v1/llm/chat' },
      { name: 'Bandit state snapshot',      method: 'POST',  path: '/v1/admin/bandit/status' },
      { name: 'Embedding-based query',      method: 'POST',  path: '/v1/docs/semantic-search' },
    ],
  },
  {
    accent: 'amber',
    label: 'Event Sourcing & Observability',
    count: 24,
    samples: [
      { name: 'Event ingest (Annals-of-Ankou)', method: 'POST',   path: '/v1/events' },
      { name: 'Reward/cost ledger (Doom-Dealer)',method: 'DO',     path: 'D1 bifrost-db' },
      { name: 'Drift-detection cron',            method: 'cron',   path: '0 */6 * * *' },
    ],
  },
  {
    accent: 'rose',
    label: 'Operator Console',
    count: 25,
    samples: [
      { name: 'Re-enqueue stuck tasks',    method: 'POST',    path: '/v1/admin/attention/recycle' },
      { name: 'Fleet health snapshot',     method: 'POST',    path: '/v1/admin/swarm/status' },
      { name: 'Ingest repo architecture',  method: 'POST',    path: '/v1/admin/arch/ingest' },
    ],
  },
];

const ACCENT_VARS = {
  violet: 'var(--violet-bright)',
  cyan:   'var(--cyan)',
  lime:   'var(--lime)',
  amber:  'var(--amber)',
  rose:   'var(--rose)',
};

function SurfaceBadge({ method }) {
  const cls = {
    GET: 'sbadge-get', POST: 'sbadge-post', PATCH: 'sbadge-patch',
    DELETE: 'sbadge-delete', cron: 'sbadge-cron', DO: 'sbadge-do',
    env: 'sbadge-env', svc: 'sbadge-svc', handler: 'sbadge-handler',
    proxy: 'sbadge-proxy',
  }[method] || 'sbadge-default';
  return <span className={`sbadge ${cls}`}>{method}</span>;
}

function Surface() {
  return (
    <section id="surface" className="section section-surface">
      <div className="container">
        <SectionHead num="04" name="The surface" meta="OPERATIONAL INVENTORY · PRODUCTION SCALE" />

        <div className="surface-head">
          <h2 className="display surface-title">
            The surface area, made legible.
          </h2>
          <p className="surface-lede">
            The system runs roughly <strong>100 HTTP endpoints</strong> across 35+ workers,
            six Durable Objects, fifteen scheduled crons, and forty-plus task handlers.
            Below is a condensed preview by category — five layers that map directly
            to the architecture described above.
          </p>
        </div>

        {/* 8-cell stat strip */}
        <div className="surface-stat-strip" role="list" aria-label="System scale metrics">
          {SURFACE_STATS.map(s => (
            <div key={s.label} className="surface-stat-cell" role="listitem">
              <span className="surface-stat-value">{s.value}</span>
              <span className="surface-stat-label">{s.label}</span>
            </div>
          ))}
        </div>

        {/* 5-category table */}
        <div className="surface-cat-grid" role="list" aria-label="Surface inventory by category">
          {SURFACE_CATS.map(cat => (
            <div
              key={cat.label}
              className="surface-cat-row"
              role="listitem"
              style={{ '--cat-accent': ACCENT_VARS[cat.accent] }}
            >
              <div className="surface-cat-header">
                <span className="surface-cat-dot" aria-hidden="true" />
                <span className="surface-cat-name">{cat.label}</span>
                <span className="surface-cat-count">{cat.count} surfaces</span>
              </div>
              <div className="surface-cat-samples" aria-label={`Sample entries for ${cat.label}`}>
                {cat.samples.map((s, i) => (
                  <div key={i} className="surface-sample">
                    <SurfaceBadge method={s.method} />
                    <code className="surface-sample-path">{s.path}</code>
                    <span className="surface-sample-name">{s.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer line */}
        <p className="surface-foot mono-label">
          <span className="dot" aria-hidden="true" />
          Full inventory in repo ·{' '}
          <a
            href="https://github.com/riftroot"
            className="surface-foot-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            github.com/riftroot
          </a>
        </p>
      </div>
    </section>
  );
}

/* ==============================
   DEMO — Compositor economics (static infographic)
   Extracted from events.json replay (5-task representative run):
     cost_actual_usd: $0.0133 · baseline all-Opus: $0.642 · savings: 48.3×
     tokens_reused: 5,610 · tokens_billed: 1,850 · batch_share: 60%
     5/5 first-pass success · 0/5 Opus selections · 3/5 cheap-tier
   ============================== */
const DEMO_ARMS = [
  { name: "gemini-2.5-flash",  tier: "cheap",     priceIn: 0.15, priceOut: 0.60,  q: 0.74, selPct: 20 },
  { name: "qwen-local-7b",     tier: "local",     priceIn: 0,    priceOut: 0,     q: 0.62, selPct: 20 },
  { name: "deepseek-v3",       tier: "cheap",     priceIn: 0.27, priceOut: 1.10,  q: 0.78, selPct: 20 },
  { name: "claude-haiku-4-5",  tier: "mid",       priceIn: 1,    priceOut: 5,     q: 0.84, selPct: 0  },
  { name: "claude-sonnet-4-6", tier: "mid",       priceIn: 3,    priceOut: 15,    q: 0.92, selPct: 40 },
  { name: "claude-opus-4-7",   tier: "reasoning", priceIn: 5,    priceOut: 25,    q: 0.96, selPct: 0  },
];

function DemoArmTier({ tier }) {
  const colors = { cheap: 'lime', local: 'cyan', mid: 'violet', reasoning: 'amber' };
  return <span className={`chip ${colors[tier] || 'grey'} demo-tier-chip`}>{tier}</span>;
}

function Demo() {
  // Inline SVG bar: compare all-Opus baseline vs compositor actual cost
  const BAR_W = 500, BAR_H = 120;
  const opusCost   = 0.642;
  const actualCost = 0.0133;
  const maxVal     = opusCost;
  const opusBarW   = Math.round((opusCost   / maxVal) * (BAR_W - 80));
  const actualBarW = Math.round((actualCost / maxVal) * (BAR_W - 80));

  return (
    <section id="demo" className="section section-demo">
      <div className="container">
        <SectionHead num="05" name="Compositor economics" meta="MAB ROUTING · COST SAVINGS · LIVE EVIDENCE" />

        <div className="demo-hero">
          <h2 className="display demo-title">
            What the compositor <em>saves.</em>
          </h2>
          <p className="demo-lede">
            The MAB router picks the cheapest-capable arm first and escalates only when reward
            signal demands it — Opus never fires when Gemini Flash or a local 7B will do.
            The numbers below come from a representative 5-task replay: a real event stream
            routed live through the compositor, logged to{' '}
            <code className="demo-mono">events.json</code>.
          </p>
        </div>

        {/* ── HEADLINE METRICS ── */}
        <div className="demo-headline-row">
          <div className="stat stat-lime demo-headline-stat">
            <span className="stat-k">48.3×</span>
            <span className="stat-v">cheaper than all-Opus baseline</span>
            <span className="stat-sub">$0.013 actual · $0.642 baseline · same 5-task workload</span>
          </div>
          <div className="stat stat-violet demo-headline-stat">
            <span className="stat-k">78%</span>
            <span className="stat-v">token savings vs baseline</span>
            <span className="stat-sub">5,610 tokens reused · 1,850 billed · own-cache + provider-cache</span>
          </div>
          <div className="stat stat-cyan demo-headline-stat">
            <span className="stat-k">0.91</span>
            <span className="stat-v">quality vs 0.95 all-Opus</span>
            <span className="stat-sub">−4% quality delta · SWU confirmed · reward score 0.86</span>
          </div>
        </div>

        {/* ── SAVINGS BAR ── */}
        <div className="demo-savings-wrap">
          <span className="mono-label" style={{display: 'flex', alignItems: 'center', marginBottom: '14px'}}>
            <span className="dot" aria-hidden="true" />
            &nbsp;Cost comparison · same 5-task workload
          </span>
          <div className="demo-savings-bar" aria-label="Cost comparison chart">
            <svg viewBox={`0 0 ${BAR_W} ${BAR_H}`} className="demo-savings-svg" preserveAspectRatio="xMinYMid meet">
              <defs>
                <linearGradient id="demo-opus-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgba(240,113,120,0.9)" />
                  <stop offset="100%" stopColor="rgba(240,113,120,0.45)" />
                </linearGradient>
                <linearGradient id="demo-actual-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgba(163,230,53,0.9)" />
                  <stop offset="100%" stopColor="rgba(163,230,53,0.55)" />
                </linearGradient>
              </defs>
              {/* All-Opus baseline bar */}
              <text x="4" y="22" fontFamily="JetBrains Mono, monospace" fontSize="10"
                    fill="rgba(139,139,149,0.85)" letterSpacing="2">ALL-OPUS BASELINE</text>
              <rect x="4" y="28" width={opusBarW} height="22" fill="url(#demo-opus-grad)" />
              <text x={opusBarW + 10} y="44" fontFamily="JetBrains Mono, monospace" fontSize="12"
                    fill="rgba(240,113,120,0.9)" fontWeight="600">$0.642</text>
              {/* Compositor actual bar */}
              <text x="4" y="76" fontFamily="JetBrains Mono, monospace" fontSize="10"
                    fill="rgba(139,139,149,0.85)" letterSpacing="2">COMPOSITOR · MAB ROUTED</text>
              <rect x="4" y="82" width={actualBarW} height="22" fill="url(#demo-actual-grad)" />
              <text x={actualBarW + 10} y="98" fontFamily="JetBrains Mono, monospace" fontSize="12"
                    fill="rgba(163,230,53,0.9)" fontWeight="600">$0.013</text>
            </svg>
          </div>
        </div>

        {/* ── ARMS TABLE ── */}
        <div className="demo-arms-wrap">
          <span className="mono-label" style={{display: 'flex', alignItems: 'center', marginBottom: '16px'}}>
            <span className="dot" aria-hidden="true" />
            &nbsp;MAB arm roster · UCB selection · April 2026 pricing (USD / 1M tokens)
          </span>
          <div className="demo-arms" role="table" aria-label="Model arm selection table">
            <div className="demo-arm-row demo-arm-header" role="row">
              <span role="columnheader">Model</span>
              <span role="columnheader">Tier</span>
              <span role="columnheader">$/1M in</span>
              <span role="columnheader">$/1M out</span>
              <span role="columnheader">Quality</span>
              <span role="columnheader">Selected</span>
            </div>
            {DEMO_ARMS.map(arm => (
              <div
                key={arm.name}
                className={`demo-arm-row${arm.selPct > 0 ? ' demo-arm-selected' : ' demo-arm-rejected'}`}
                role="row"
              >
                <span className="demo-arm-name" role="cell">
                  {arm.name}
                  {arm.selPct === 0 && <span className="demo-arm-rej-label">&nbsp;· rejected</span>}
                </span>
                <span role="cell"><DemoArmTier tier={arm.tier} /></span>
                <span className="demo-arm-price" role="cell">
                  {arm.priceIn === 0
                    ? <em className="demo-free">free</em>
                    : `$${arm.priceIn}`}
                </span>
                <span className="demo-arm-price" role="cell">
                  {arm.priceOut === 0 ? '—' : `$${arm.priceOut}`}
                </span>
                <span className="demo-arm-q" role="cell">{arm.q.toFixed(2)}</span>
                <span className="demo-arm-sel" role="cell">
                  {arm.selPct > 0
                    ? <span className="demo-sel-bar-wrap">
                        <span className="demo-sel-bar" style={{width: `${arm.selPct * 2}%`}} />
                        <span className="demo-sel-pct">{arm.selPct}%</span>
                      </span>
                    : <span className="demo-arm-zero">0%</span>}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── KEY METRICS GRID ── */}
        <div className="demo-metrics-grid">
          {[
            { label: 'TOKENS CACHED',      value: '5,610',  sub: 'own-cache + provider prompt-cache · 75% reuse rate' },
            { label: 'BATCH LANE SHARE',   value: '60%',    sub: '3/5 subtasks dispatched to batch queue · lower cost tier' },
            { label: 'FIRST-PASS SUCCESS', value: '100%',   sub: '5/5 subtasks succeeded · zero escalations to fallback' },
            { label: 'OPUS SELECTIONS',    value: '0 / 5',  sub: 'claude-opus-4-7 UCB-rejected on every routing decision' },
            { label: 'MEAN QUALITY',       value: '0.91',   sub: 'vs 0.95 all-Opus baseline · −4% for 48× cost saving' },
          ].map(m => (
            <div key={m.label} className="demo-metric">
              <span className="mono-label demo-metric-label">{m.label}</span>
              <span className="demo-metric-value display">{m.value}</span>
              <span className="demo-metric-sub">{m.sub}</span>
            </div>
          ))}
        </div>

        {/* ── FOOTER LINE ── */}
        <div className="demo-footer-line">
          <span className="mono-label">Full event replay in repo</span>
          <span className="demo-footer-sep">·</span>
          <a
            href="https://github.com/riftroot"
            className="demo-footer-link"
            target="_blank"
            rel="noopener noreferrer"
          >github.com/riftroot</a>
          <span className="demo-footer-sep">·</span>
          <code className="demo-footer-path">public/events.json</code>
        </div>

      </div>
    </section>
  );
}

/* ==============================
   BEYOND GENERATION — Erebus vs vibe coding / RAG / CAG
   ============================== */
function BeyondGen() {
  return (
    <section id="beyond" className="section section-beyond">
      <div className="container">
        <SectionHead num="06" name="Beyond generation" meta="NOT VIBE CODING · NOT RAG · INFRASTRUCTURE" />

        <div className="beyond-wrap">
          <h2 className="display beyond-title">
            Erebus Edge is not <em>generation</em>.<br/>
            It is the <em className="cyan">execution loop</em> around generation.
          </h2>

          <div className="beyond-cols">
            <article className="beyond-col">
              <span className="chip violet">01 / WHY GENERATION ALONE ISN&apos;T ENOUGH</span>
              <p>
                RAG and CAG solve retrieval and context management. They make
                generation better-informed. They do not solve orchestration, cost
                optimization, failure recovery, or cross-task learning. A system
                that generates well but routes naively, retries dumbly, and forgets
                everything between runs is still expensive and fragile.
              </p>
            </article>
            <article className="beyond-col">
              <span className="chip cyan">02 / WHAT THE MAB STACK ADDS</span>
              <p>
                The bandit is not a smarter prompt router. It is a learning system
                that accumulates reward signal across every task class, every model
                arm, every cost tier — and uses that history to make better dispatch
                decisions over time. RAG improves what the model knows. The MAB
                improves which model you ask and what you pay for the answer. Those
                operate at different layers and compound differently.
              </p>
            </article>
            <article className="beyond-col">
              <span className="chip lime">03 / SELF-HEALING + SWU IN PRACTICE</span>
              <p>
                Vibe coding produces an output. Erebus produces a validated, deployed
                artifact with a logged reward signal and a record of what failed and
                why. The system is not done when code is generated — it is done when
                the output is verified in production and the learning is written
                back. That loop is what makes it infrastructure rather than tooling.
              </p>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { Thesis, HostileNetwork, Erebus, Surface, Demo, BeyondGen, SectionHead, XDrivenTable });
