/* global React */

function SectionHead({ num, name, meta }) {
  return (
    <header className="section-head">
      <span className="num">{num} /</span>
      <span className="name">{name}</span>
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
                  style={{ fill: 'rgb(163,230,53)' }} letterSpacing="2">SHADOW OPS · MAB VARIANTS</text>
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
   EREBUS EDGE
   ============================== */
function Erebus() {
  return (
    <section id="erebus" className="section section-erebus">
      <div className="container">
        <SectionHead num="02" name="Project · Codename" meta="EREBUS EDGE / IN DEVELOPMENT" />

        <div className="erebus-hero">
          <div className="erebus-hero-text">
            <div className="erebus-tag"><span className="chip lime">ACTIVE PROJECT</span></div>
            <h2 className="display erebus-title">
              <em>Erebus Edge.</em><br/>
              A self-tuning fabric<br/>
              for software work.
            </h2>
            <p className="erebus-lede">
              Stacked multi-armed bandit systems reward against total
              end-to-end SWU. Each task type and model is trained on prompt
              optimization, batch queueing, layered caches, compositors, and
              x-driven approaches — all tuned and reinforced for quality,
              self-healing, and capability expansion.
            </p>
          </div>
          <ErebusDiagram />
        </div>

        <div className="erebus-rule" />

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

function ErebusDiagram() {
  // Rebuilt as plain HTML cards — accessible, readable, no SVG-fill overrides,
  // no out-of-bounds pathing. Each stage is a real DOM node with proper contrast.
  const stages = [
    { tag: '01 / INGEST',    accent: 'cyan',
      title: 'Plan / spec ingest',
      body:  'Plan or spec enters. Thin-sliced into tasks with explicit schema: relationships, priorities, blockers. No ambiguity reaches the executor.' },
    { tag: '02 / DECOMPOSE', accent: 'cyan',
      title: 'Task decomposition · DAG',
      body:  'Topology-aware. Parallel dispatch where the graph allows. Critical-path scoring decides what runs first.' },
    { tag: '03 / ROUTE',     accent: 'violet',
      title: 'Routing intelligence',
      body:  'Cheap-tier first. UCB selection across model × prompt-path arms. Speculative paired inference for high-stakes branches.',
      kind:  'arms' },
    { tag: '04 / CACHE',     accent: 'cyan',
      title: 'Dynamic cache · local inference · queue',
      body:  'In-model context cache, on-prem LAN inference, edge fallback. Nothing computed twice.' },
    { tag: '05 / EXECUTE',   accent: 'lime',
      title: 'Execution mesh · horizontal scale',
      body:  'Stateless workers. Serverless containers. Stall detection. Self-heal — crash context carries forward into retry.' },
    { tag: '06 / GATE',      accent: 'amber',
      title: 'Preflight validation',
      body:  'Gate failures here, not downstream. Spec-conformance, contract checks, type guards before anything ships.' },
    { tag: '07 / SHIP',      accent: 'lime',
      title: 'Validated output ships',
      kind:  'ship' },
    { tag: '08 / REWARD',    accent: 'violet',
      title: 'SWU reward layer',
      body:  'First-pass + cheap-tier + no HITL + cost-delta. Retry penalties applied. Escalation labels failure events for the next pass.',
      kind:  'reward' },
    { tag: 'Δ / LEARN',      accent: 'violet',
      title: 'Learning writes back',
      body:  'Convergence tightens. HITL rate trends down. SWU cost trends down. SWU rate trends to 1.' },
  ];

  return (
    <div className="erebus-diagram-v2">
      <ol className="ed-stack">
        {stages.map((s, i) => (
          <li
            key={i}
            className={`ed-stage ed-${s.accent} ${s.kind ? 'ed-' + s.kind : ''}`}
            data-fade
            style={{ '--fade-delay': (i * 60) + 'ms' }}
          >
            <div className="ed-tag">{s.tag}</div>
            <div className="ed-card">
              <h4 className="ed-title">{s.title}</h4>
              {s.body && <p className="ed-body">{s.body}</p>}
              {s.kind === 'arms' && (
                <div className="ed-arms">
                  {[1,2,3,4,5].map(k => (
                    <div key={k} className="ed-arm">
                      <span className="ed-arm-label">ARM</span>
                      <span className="ed-arm-num">{k}</span>
                      <span className="ed-arm-dot" style={{ animationDelay: `${k * 0.3}s` }} />
                    </div>
                  ))}
                </div>
              )}
              {s.kind === 'reward' && (
                <div className="ed-charts">
                  <div className="ed-chart">
                    <div className="ed-chart-label">SWU cost per task ↓</div>
                    <svg className="ed-chart-svg" viewBox="0 0 200 50" preserveAspectRatio="none">
                      <line x1="0" y1="44" x2="200" y2="44" stroke="rgb(38,38,44)" strokeWidth="0.6" />
                      <polyline className="ed-chart-line ed-chart-lime"
                        points="0,12 20,16 40,20 60,24 80,28 100,32 120,35 140,37 160,39 180,40 200,41"
                        fill="none" strokeWidth="1.5" />
                    </svg>
                  </div>
                  <div className="ed-chart">
                    <div className="ed-chart-label">First-time E2E success ↑</div>
                    <svg className="ed-chart-svg" viewBox="0 0 200 50" preserveAspectRatio="none">
                      <line x1="0" y1="44" x2="200" y2="44" stroke="rgb(38,38,44)" strokeWidth="0.6" />
                      <polyline className="ed-chart-line ed-chart-cyan"
                        points="0,40 20,38 40,34 60,30 80,26 100,22 120,18 140,15 160,13 180,11 200,10"
                        fill="none" strokeWidth="1.5" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>
      <div className="ed-loop-note">
        <span className="ed-loop-arrow">↺</span>
        <span className="ed-loop-text">Reward signal writes back into routing — every task tightens the loop.</span>
      </div>
    </div>
  );
}

/* ==============================
   BEYOND GENERATION — Erebus vs vibe coding / RAG / CAG
   ============================== */
function BeyondGen() {
  return (
    <section id="beyond" className="section section-beyond">
      <div className="container">
        <SectionHead num="03" name="Beyond generation" meta="NOT VIBE CODING · NOT RAG · INFRASTRUCTURE" />

        <div className="beyond-wrap">
          <h2 className="display beyond-title">
            Erebus is not <em>generation</em>.<br/>
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

Object.assign(window, { Thesis, Erebus, BeyondGen, SectionHead, XDrivenTable });
