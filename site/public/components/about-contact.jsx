/* global React, SectionHead, LogoGlyph */

/* ==============================
   WHY — the operator as forcing function; MAB data as compounding asset
   ============================== */
function Why() {
  return (
    <section id="why" className="section section-why">
      <div className="container">
        <SectionHead num="04" name="Why this exists" meta="OPERATOR AS FORCING FUNCTION · DATA COMPOUNDS" />

        <div className="why-hero">
          <div className="why-frame">
            <div className="chip violet why-chip">THE HONEST FRAME</div>
            <h2 className="display why-title">
              I built Erebus Edge because<br/>
              the <em className="cyan">standard playbook</em><br/>
              didn&apos;t work.
            </h2>
            <p className="why-lede">
              A one-person shop is a forcing function: every engagement runs on the mesh —
              no team to absorb bad tooling, no headcount buffer for slow routing. The MAB
              stack learns across every pipeline run, every codebase it touches, every model
              arm it dispatches. The demo shows that learning loop in motion.
            </p>
            <p className="why-lede">
              The compounding asset is the MAB data itself — production-hardened evidence
              of what works, sliced by task type, model, provider, and x-driven approach.
              Not for sale. Not for licensing. OSS comes when the bank is worth releasing.
              Section 05 is who builds and runs this.
            </p>
          </div>

          <div className="why-pitch card">
            <span className="corner tl" /><span className="corner tr" />
            <span className="corner bl" /><span className="corner br" />
            <div className="why-pitch-head">
              <span className="chip cyan">TRANSPARENCY LAYER</span>
              <span className="why-pitch-meta mono-label">DEMO · NOT DOCS</span>
            </div>
            <p className="why-pitch-body">
              The routing priors, reward histories, and convergence telemetry are the
              experience bank — releasing them before they represent real breadth dilutes
              their value. OSS comes when the bank is worth releasing, not before.
            </p>
            <p className="why-pitch-body">
              Until then: the demo is the transparency layer. Every routing decision
              visible, every reward shape logged, every self-heal recorded. The architecture
              tab is the layer-by-layer explanation of what you just watched.
            </p>
          </div>
        </div>

        <div className="why-grid">
          {[
            { k: "Not academic",          v: "No paper. No grant cycle. Ships work today.", c: "cyan" },
            { k: "Not research",          v: "Failure costs real time. That is the discipline.", c: "violet" },
            { k: "Not open-source — yet", v: "Data compounds first. OSS comes when the bank is worth releasing.", c: "lime" },
            { k: "Not seeking VC",        v: "No dilution. No board. Resources, not capital — section 06.", c: "grey" }
          ].map((p, i) => <Posture key={p.k} idx={i} {...p} />)}
        </div>
      </div>
    </section>
  );
}

function Posture({ k, v, c, idx = 0 }) {
  return (
    <div
      className={`posture posture-${c}`}
      data-fade
      style={{ '--fade-delay': (idx * 100) + 'ms' }}
    >
      <span className={`posture-mark mark-${c}`} />
      <div>
        <div className="posture-k">{k}</div>
        <div className="posture-v">{v}</div>
      </div>
    </div>
  );
}

/* ==============================
   ABOUT
   ============================== */
function About() {
  return (
    <section id="about" className="section section-about">
      <div className="container">
        <SectionHead num="05" name="About the operator" meta="SAME PERSON WHO BUILDS IT RUNS IT" />

        <div className="rail-grid">
          <div className="rail-prose about-prose">
            <p className="about-lede display">
              Same operator who builds it
              <em className="cyan"> runs it</em> on real work.
            </p>

            <p className="about-text">
              That constraint was formed in an Army S6 shop — sole IT support for a battalion
              of soldiers who needed accounts, networks, and workstations working, especially at
              <span className="hl-mono"> 0200</span> before a training event. Nobody cared about
              elegance. They cared about uptime. That is still the only metric that matters.
            </p>

            <p className="about-text">
              The years since: process improvement, dev coordination as translation layer
              between contractors and operations, cloud infrastructure, cross-domain
              system-of-systems architecture. Same problem in different clothes — how do
              you make a complex system reliable for people who cannot afford to think
              about its complexity? Solve it at the gate, before it becomes someone
              else&apos;s emergency.
            </p>

            <p className="about-text">
              Erebus Edge is that question applied to AI execution infrastructure — built,
              run, and broken by one person in Northern Colorado before it touches anyone
              else&apos;s environment. Section 06 is how outside resources fit into it.
            </p>

            <div className="about-sig">
              <span className="mono-label"><span className="dot" />ADAM</span>
              <span className="about-sig-meta mono-label">FOUNDER · RIFT ROOT LLC · NORTHERN COLORADO · 2026</span>
            </div>
          </div>

          <SideRail
            index="05"
            caption="OPERATOR / ADAM"
            data={[
              { k: 'ROLE',     v: 'FOUNDER · SOLE OPERATOR' },
              { k: 'LOCUS',    v: 'NORTHERN COLORADO · 40.5°N' },
              { k: 'DOMAIN',   v: 'EXECUTION INFRA · MAB ROUTING' },
              { k: 'STACK',    v: 'EDGE RUNTIMES · STATELESS · SANDBOX' },
              { k: 'PRIOR',    v: 'S6 · DEV-COORD · CLOUD · SOS-ARCH' },
              { k: 'POSTURE',  v: 'BOOTSTRAPPED · NO VC · NO BOARD' },
            ]}
            stamp="BUILD · 2026.001 · ALL SYSTEMS NOMINAL"
            accent="cyan"
          />
        </div>
      </div>
    </section>
  );
}

/* SideRail — recurring system motif on half-width sections.
   Vertical caption + datum table + build stamp. Carries the brutalist
   info-density vocabulary into otherwise empty real estate. */
function SideRail({ index, caption, data = [], stamp, accent = 'violet' }) {
  return (
    <aside className={`side-rail rail-${accent}`} aria-hidden="true">
      <div className="rail-head">
        <span className="rail-index display">{index}</span>
        <span className="rail-caption">{caption}</span>
      </div>

      <dl className="rail-data">
        {data.map((row, i) => (
          <div key={i} className="rail-row">
            <dt className="rail-k">{row.k}</dt>
            <dd className="rail-v">{row.v}</dd>
          </div>
        ))}
      </dl>

      <div className="rail-foot">
        <span className={`rail-pulse pulse-${accent}`} />
        <span className="rail-stamp">{stamp}</span>
      </div>

      {/* tick marks down the left edge — like a measuring rule */}
      <svg className="rail-ticks" viewBox="0 0 4 200" preserveAspectRatio="none" aria-hidden="true">
        {Array.from({ length: 21 }).map((_, i) => (
          <line key={i} x1="0" x2={i % 5 === 0 ? 4 : 2} y1={i * 10} y2={i * 10}
                stroke="currentColor" strokeWidth="0.5" />
        ))}
      </svg>
    </aside>
  );
}

/* ==============================
   ASK — resources that compound the MAB; not capital
   ============================== */
function Ask() {
  const lines = [
    { k: 'Compute credits',      v: 'more runs → more reward signal → tighter routing priors', c: 'cyan' },
    { k: 'Inference credits',    v: 'each new model arm widens what the bandit can explore',   c: 'violet' },
    { k: 'Bare-metal inference', v: 'silicon diversity the cloud abstracts away — the demo shows what your fleet actually does to a routing prior', c: 'lime' },
    { k: 'Storage + queue',      v: 'cache topology depth + batch ingestion throughput',        c: 'violet' },
    { k: 'Egress allowance',     v: 'cross-cloud compositor traffic at scale',                  c: 'lime' },
    { k: 'Design partners',      v: 'real workloads stress-test Erebus Edge against conditions the operator alone cannot generate', c: 'cyan' },
  ];
  return (
    <section id="ask" className="section section-ask">
      <div className="container">
        <SectionHead num="06" name="The ask" meta="RESOURCES · NOT CAPITAL" />

        <div className="ask-wrap">
          <div className="ask-pitch">
            <h2 className="display ask-title">
              Not capital.<br/>
              <em className="cyan">Resources that compound</em><br/>
              the MAB data.
            </h2>
            <p className="ask-text">
              The architecture tab shows the five layers. Every line item below maps
              to a layer that gets richer with more data — hardware diversity expands
              routing priors, bare-metal inference reveals silicon-level variance the
              cloud abstracts away.
              <em className="violet"> Cash dilutes; resources compound.</em>{' '}
              The workloads stay where they run.
            </p>
            <p className="ask-text ask-text-dim">
              Open to any form of resource partnership that increases hardware diversity
              in the backend pool. If your program has access tiers not listed publicly,
              that conversation is welcome.
            </p>
            <div className="exchange">
              <div className="ex-side">
                <span className="mono-label">YOU PROVIDE</span>
                <ul>
                  <li>Compute / inference credits</li>
                  <li>Hardware diversity in the pool</li>
                  <li>Storage + queue + egress</li>
                </ul>
              </div>
              <div className="ex-arrow">⇌</div>
              <div className="ex-side">
                <span className="mono-label">YOU GET</span>
                <ul>
                  <li>Empirical inference profiles on your silicon</li>
                  <li>Real workloads, not synthetic benchmarks</li>
                  <li>Convergence telemetry from production routing</li>
                </ul>
              </div>
            </div>
            <a href="#contact" className="btn btn-primary">
              Get in touch <span className="arrow">→</span>
            </a>
          </div>

          <div className="ask-list card">
            <span className="corner tl" /><span className="corner tr" />
            <span className="corner bl" /><span className="corner br" />
            <div className="ask-list-head"><span className="chip violet">WHAT MOVES THE NEEDLE</span></div>
            <ul>
              {lines.map((l,i) => (
                <li
                  key={i}
                  className="ask-line"
                >
                  <span className={`ask-bullet bullet-${l.c}`} />
                  <span className="ask-k">{l.k}</span>
                  <span className="ask-dots" />
                  <span className="ask-v">{l.v}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ==============================
   CONTACT + FOOTER
   ============================== */
function Contact({ email = 'contact@riftroot.com' }) {
  return (
    <section id="contact" className="section section-contact">
      <div className="container">
        <SectionHead num="07" name="Get in touch" meta="OPEN TO PARTNERS" />

        <div className="contact-wrap">
          <div className="contact-channels">
            <ContactRow label="Email"    value={email} href={`mailto:${email}`} live />
            <ContactRow label="GitHub"   value="github.com/riftroot" href="https://github.com/riftroot" live />
          </div>

          <div className="contact-prose">
            <p className="contact-prose-line">
              The right conversation shortens the loop.
            </p>
            <p className="contact-prose-body">
              If you run a developer program, have hardware to put in the pool, or
              want real workloads stress-testing your inference stack — the address
              is on the left. Watch the demo first. Read the architecture tab.
              Then bring the resources from section 06.
            </p>
          </div>
        </div>
      </div>

      <footer className="footer">
        <div className="container footer-inner">
          <div className="footer-mark">
            <LogoGlyph size={20} />
            <span>RIFT ROOT LLC</span>
            <span className="dim">· NORTHERN COLORADO · 2026</span>
          </div>
          <div className="footer-meta mono-label">
            ALL SYSTEMS · NOMINAL <span className="dot" style={{marginLeft: 8}} />
          </div>
        </div>
      </footer>
    </section>
  );
}

function ContactRow({ label, value, href, live, placeholder }) {
  return (
    <a
      href={href}
      className={`contact-row ${placeholder ? 'is-placeholder' : ''}`}
    >
      <span className="contact-label mono-label">{label}</span>
      <span className="contact-value">
        {value}
        {placeholder && <span className="placeholder-pill">PLACEHOLDER</span>}
        {live && <span className="live-pill">LIVE</span>}
      </span>
      <span className="contact-arrow">{placeholder ? '·' : '↗'}</span>
    </a>
  );
}

Object.assign(window, { Why, About, Ask, Contact, SideRail });
