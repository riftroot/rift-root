// entry.js — Vite/Rollup bundle entrypoint for site-qa.
//
// Each component file publishes its public API via `Object.assign(window, {...})`
// at module bottom. Importing them here as side-effect modules in the same
// order as the previous build.sh concat sequence ensures every global is
// attached BEFORE app.jsx mounts the React root.
//
// React + ReactDOM are externalized (see vite.qa.config.mjs) — they're loaded
// via CDN <script> tags in index.html and live on window.React / window.ReactDOM.

// Side-effect imports in original concat order from site-qa/build.sh:
import './tweaks-panel.jsx';
import './components/header.jsx';
import './components/footer.jsx';
import './components/sections.jsx';
import './components/about-contact.jsx';
import './components/router.jsx';
import './app.jsx';
