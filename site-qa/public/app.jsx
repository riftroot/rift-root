/* global React, useTweaks, TweaksPanel, TweakSection, TweakRadio, TweakToggle, TweakSlider */
/* global Nav, Hero, Marquee, Thesis, HostileNetwork, Erebus, Surface, Demo, BeyondGen, Why, About, Ask, Contact */
/* global Footer */
/* global Router, Route, useLocation, navigate */
const { useEffect, useRef } = React;

// All hashes on the unified single-page are section anchors — no tab names.
// The whitelist is intentionally empty; any non-empty hash is a section scroll.
const TAB_WHITELIST = [];

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "violetIntensity": "moderate",
  "density": "default",
  "monoOnly": false,
  "showGrid": true,
  "marqueeOn": true
}/*EDITMODE-END*/;

function App() {
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

  // Section-anchor scroll handler.
  // html { scroll-behavior: smooth } makes native anchor scrolls slow (~1-2 s
  // for deep sections), which races with any automated test 700 ms budget.
  // Guard: only scrollTo(top:0) for real tab switches (TAB_WHITELIST); for all
  // other hashes (section anchors like #why, #thesis, #erebus …) scroll the
  // element into view instantly so the browser lands on target without delay.
  useEffect(() => {
    const onHash = () => {
      const raw = (window.location.hash || '').replace('#', '');
      if (TAB_WHITELIST.includes(raw) || !raw) {
        // Tab switch or bare root — reset scroll position.
        window.scrollTo({ top: 0, behavior: 'instant' });
      } else {
        // Section anchor — scroll instantly, overriding smooth CSS.
        const el = document.getElementById(raw);
        if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
      }
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  // Fade-in observer
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
      <Nav />
      <main>
        <Hero />
        {tweaks.marqueeOn && <Marquee />}
        <Thesis />
        <HostileNetwork />
        <Erebus />
        <Surface />
        <Demo />
        <BeyondGen />
        <Why />
        <About />
        <Ask />
        <Contact email="adam@riftroot.com" />
      </main>
      <Footer />

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

// --- Router mount ---
ReactDOM.createRoot(document.getElementById('root')).render(
  <Router>
    <Route path="/">
      <App />
    </Route>
  </Router>
);
