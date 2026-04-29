/* global React, SectionHead, LogoGlyph */

/* ==============================
   WHY — operating infrastructure framing
   ============================== */
function Why() {
  return (
    <section id="why" className="section section-why">
      <div className="container">
        <SectionHead num="07" name="Why this exists" meta="OPERATING INFRASTRUCTURE · NOT A PRODUCT" />

        <div className="why-hero">
          <div className="why-frame">
            <div className="chip violet why-chip">THE HONEST FRAME</div>
            <h2 className="display why-title">
              Erebus Edge is not for sale.<br/>
              It is the <em className="cyan">substrate I use</em><br/>
              to do my own work faster<br/>
              than anyone else can.
            </h2>
            <p className="why-lede">
              I&apos;m not academic. I&apos;m not running research. I&apos;m not (yet) open-source.
              Rift Root is a one-person systems shop, and Erebus Edge is the operating
              infrastructure I run my engagements on. The MAB stack is the intelligence
              layer that learns across every engagement, every pipeline run, every
              codebase it touches.
            </p>
            <p className="why-lede">
              The compounding asset is the <em>system of MAB data</em> — real-world,
              production-hardened evidence of what works and what doesn&apos;t, sliced by
              task type, model, provider, and x-driven approach. One day that gets
              open-sourced; today it earns its keep.
            </p>
          </div>

          <div className="why-pitch card">
            <span className="corner tl" /><span className="corner tr" />
            <span className="corner bl" /><span className="corner br" />
            <div className="why-pitch-head">
              <span className="chip cyan">VENDOR PITCH</span>
              <span className="why-pitch-meta mono-label">DATA-FOR-COMPUTE</span>
            </div>
            <p className="why-pitch-body">
              A private AI execution mesh that routes LLM workloads across multi-vendor
              hardware using multi-armed bandit optimization. It is the operational
              backbone for systems work — not a product for sale, but infrastructure
              I run myself.
            </p>
            <p className="why-pitch-body">
              Compute access accelerates the learning cycles of the MAB, which directly
              improves the intelligence of the system over time. More hardware diversity
              in the backend pool means richer convergence data and faster maturation
              of the routing priors.
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
          </div>
        </div>

        <div className="why-grid">
          {[
            { k: "Not academic",          v: "No paper. No grant cycle. Production-first.", c: "cyan" },
            { k: "Not research",          v: "The system has to ship work today.", c: "violet" },
            { k: "Not open-source — yet", v: "Code stays private; the data compounds. OSS comes when the experience-bank is worth releasing.", c: "lime" },
            { k: "Not seeking VC",        v: "No dilution. No board. Resources, not capital.", c: "grey" }
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
        <SectionHead num="08" name="About the operator" meta="ADAM · NORTHERN COLORADO" />

        <div className="rail-grid">
          <div className="rail-prose about-prose">
            <p className="about-lede display">
              The thesis behind Rift Root is simple: the right system
              <em className="cyan"> absorbs the friction</em> so the operator does not have to.
            </p>

            <p className="about-text">
              That idea was formed in an Army S6 shop — sole IT support for a battalion of
              soldiers who needed their accounts, networks, and workstations working,
              especially at <span className="hl-mono">0200</span> before a training event.
              Nobody there cared about elegance. They cared about uptime. That is still the
              only metric that matters.
            </p>

            <p className="about-text">
              The years since have run through process improvement, dev coordination as a
              translation layer between contractors and operations, cloud infrastructure
              engineering, and cross-domain system-of-systems architecture. The through-line
              is not the job titles. It is the same problem in different clothes: how do
              you make a complex system reliable for people who cannot afford to think
              about its complexity? The answer is always the same — solve the full problem
              once, at the gate, before it becomes someone else&apos;s emergency.
            </p>

            <p className="about-text">
              Erebus Edge is that question applied to AI execution infrastructure. It is
              being built, run, and broken by one person in Northern Colorado before it
              touches anyone else&apos;s environment. That is not a limitation. That is the
              methodology.
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
   ASK
   ============================== */
function Ask() {
  const lines = [
    { k: 'Compute credits',          v: 'edge runtimes, serverless workers, sandbox burst', c: 'cyan' },
    { k: 'Inference credits',        v: 'across multi-vendor model arms',                   c: 'violet' },
    { k: 'Bare-metal inference',     v: 'silicon diversity the cloud abstracts away',       c: 'lime' },
    { k: 'Hardware diversity',       v: 'enriches MAB convergence data across the pool',    c: 'cyan' },
    { k: 'Storage + queue',          v: 'cache topology + batch ingestion',                 c: 'violet' },
    { k: 'Egress allowance',         v: 'cross-cloud compositor traffic',                   c: 'lime' },
    { k: 'Design partners',          v: 'real workloads that stress-test Erebus Edge against production conditions', c: 'cyan' },
  ];
  return (
    <section id="ask" className="section section-ask">
      <div className="container">
        <SectionHead num="09" name="The ask" meta="RESOURCES THAT ACCELERATE" />

        <div className="ask-wrap">
          <div className="ask-pitch">
            <h2 className="display ask-title">
              Not seeking VC.<br/>
              Seeking <em className="cyan">resources that accelerate.</em>
            </h2>
            <p className="ask-text">
              Rift Root is bootstrapped by design. <em className="violet">Cash dilutes; resources compound.</em>{' '}
              Compute credits, inference budgets, bare-metal access, storage, tooling, and
              design partners — anything that shortens the loop between hypothesis and
              validated output. The resulting workloads stay where they run.
            </p>
            <p className="ask-text ask-text-dim">
              Open to any form of resource partnership that increases hardware diversity
              in the backend pool. If your program has access tiers not listed publicly,
              that conversation is welcome.
            </p>
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
function Contact({ email = 'adam@riftroot.com' }) {
  return (
    <section id="contact" className="section section-contact">
      <div className="container">
        <SectionHead num="10" name="Get in touch" meta="OPEN TO PARTNERS" />

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
              If you run a developer program or want to see what
              <em> Erebus Edge </em>
              does on your hardware, the address is on the left.
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
