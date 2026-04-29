/* global React, useTweaks, TweaksPanel, TweakSection, TweakRadio, TweakToggle, TweakSlider */
/* global Nav, Hero, Marquee, Thesis, Erebus, BeyondGen, Why, About, Ask, Contact */
/* global ErebusPage */
const { useState, useEffect, useRef } = React;

/* ---- Tab routing ---- */
const TAB_WHITELIST = ['home', 'demo', 'architecture'];

function useTab() {
  function resolveTab() {
    const raw = (window.location.hash || '').replace('#', '') || 'home';
    return TAB_WHITELIST.includes(raw) ? raw : 'home';
  }

  const [tab, setTab] = useState(resolveTab);

  useEffect(() => {
    // On initial load, if the hash is a section anchor (not a tab), scroll to it
    const raw = (window.location.hash || '').replace('#', '');
    if (raw && !TAB_WHITELIST.includes(raw)) {
      requestAnimationFrame(() => {
        const el = document.getElementById(raw);
        if (el) el.scrollIntoView({ behavior: 'instant' });
      });
    }

    const onHash = () => {
      const t = resolveTab();
      setTab(t);
      window.scrollTo({ top: 0, behavior: 'instant' });
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  return tab;
}

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "violetIntensity": "moderate",
  "density": "default",
  "monoOnly": false,
  "showGrid": true,
  "marqueeOn": true
}/*EDITMODE-END*/;

/* ---- Tab: Home ---- */
function HomeTab({ tweaks, setTweak }) {
  useEffect(() => {
    const els = document.querySelectorAll('[data-fade]');
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <>
      <main>
        <Hero />
        {tweaks.marqueeOn && <Marquee />}
        <Thesis />
        <Erebus />
        <BeyondGen />
        <Why />
        <About />
        <Ask />
        <Contact email="contact@riftroot.com" />
      </main>

      <TweaksPanel title="Tweaks">
        <TweakSection title="Violet">
          <TweakRadio
            label="Intensity"
            value={tweaks.violetIntensity}
            onChange={v => setTweak('violetIntensity', v)}
            options={[
              { value: 'sparing',  label: 'Sparing'  },
              { value: 'moderate', label: 'Moderate' },
              { value: 'heavy',    label: 'Heavy'    },
            ]}
          />
        </TweakSection>

        <TweakSection title="Density">
          <TweakRadio
            label="Section padding"
            value={tweaks.density}
            onChange={v => setTweak('density', v)}
            options={[
              { value: 'tight',   label: 'Tight'   },
              { value: 'default', label: 'Default' },
              { value: 'loose',   label: 'Loose'   },
            ]}
          />
        </TweakSection>

        <TweakSection title="Type">
          <TweakToggle
            label="Mono only (drop the serif)"
            value={tweaks.monoOnly}
            onChange={v => setTweak('monoOnly', v)}
          />
        </TweakSection>

        <TweakSection title="Atmosphere">
          <TweakToggle
            label="Hero grid backdrop"
            value={tweaks.showGrid}
            onChange={v => setTweak('showGrid', v)}
          />
          <TweakToggle
            label="Marquee strip"
            value={tweaks.marqueeOn}
            onChange={v => setTweak('marqueeOn', v)}
          />
        </TweakSection>
      </TweaksPanel>
    </>
  );
}

/* ---- Tab: Demo ---- */
function DemoTab() {
  return (
    <main className="tab-frame">
      <div className="tab-meta">
        <span className="dot" aria-hidden="true" />
        EREBUS EDGE · COMPOSITOR REPLAY · each stage maps to a layer in the architecture tab →
      </div>
      <iframe
        src="https://demo.riftroot.com"
        title="Erebus Edge compositor replay — five stages, live reward signal"
        className="tab-iframe"
        allow="clipboard-write"
        loading="lazy"
      />
    </main>
  );
}

/* ---- Tab: Architecture ---- */
function ArchitectureTab() {
  return (
    <main className="tab-architecture">
      <ErebusPage />
    </main>
  );
}

/* ---- App root ---- */
function App() {
  const tab = useTab();
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // Apply tweak attributes to <body>
  useEffect(() => {
    const b = document.body;
    b.toggleAttribute('data-violet-low',   tweaks.violetIntensity === 'sparing');
    b.toggleAttribute('data-violet-heavy', tweaks.violetIntensity === 'heavy');
    b.toggleAttribute('data-density-tight', tweaks.density === 'tight');
    b.toggleAttribute('data-density-loose', tweaks.density === 'loose');
    b.toggleAttribute('data-mono', !!tweaks.monoOnly);
    b.toggleAttribute('data-no-grid', !tweaks.showGrid);
  }, [tweaks]);

  return (
    <>
      <Nav tab={tab} />
      {tab === 'home'         && <HomeTab tweaks={tweaks} setTweak={setTweak} />}
      {tab === 'demo'         && <DemoTab />}
      {tab === 'architecture' && <ArchitectureTab />}
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
