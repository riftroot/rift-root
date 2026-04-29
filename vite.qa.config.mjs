// vite.qa.config.mjs
// Vite build for site-qa/. Produces site-qa/public/app-[hash].js as a
// single self-executing IIFE bundle. React + ReactDOM are externalized —
// they load via <script> tags in index.html (CDN) and are read as globals.
//
// Why IIFE format: components publish their public API via
//   Object.assign(window, { Nav, Hero, ... })
// at module bottom. App.jsx then references those names as bare globals.
// IIFE format keeps every component's top-level `function Foo` inside the
// bundle's closure, while the explicit Object.assign side-effects expose
// only the intended names to window — same shape the previous esbuild
// concat-with-IIFE pipeline produced.
//
// Hashed filenames: emit app-[hash].js + manifest.json, then a tiny
// post-build plugin rewrites the literal "/app.js" reference in
// index.html to the hashed path. Old un-hashed app-*.js files in the
// outDir are pruned so wrangler only ships the current bundle.
//
// Dev server: `npm run dev` serves from site-qa/public/ with HMR. The dev
// HTML (index.dev.html) loads `entry.js` as type=module so each .jsx file
// is a real ES module, fast-refresh wired via @vitejs/plugin-react.

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { readFileSync, writeFileSync, readdirSync, unlinkSync } from 'node:fs';

const PUBLIC_DIR = resolve(process.cwd(), 'site-qa/public');

/**
 * Post-build plugin:
 *   1. Read manifest.json to find the hashed entry filename.
 *   2. Rewrite index.html: every literal `/app.js` (script src + preload)
 *      becomes `/app-[hash].js`.
 *   3. Delete any stale app-*.js files older than the new one.
 *   4. Remove manifest.json from the published output (we don't need it
 *      at runtime; it leaks build internals if shipped).
 */
function rewriteIndexHtml() {
  return {
    name: 'rift-root-rewrite-index-html',
    apply: 'build',
    closeBundle() {
      const manifestPath = resolve(PUBLIC_DIR, '.vite/manifest.json');
      let manifest;
      try {
        manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
      } catch (err) {
        throw new Error(`[rift-root] manifest.json not found at ${manifestPath}: ${err.message}`);
      }

      // Find the entry chunk for entry.js
      const entryKey = Object.keys(manifest).find(k => manifest[k].isEntry);
      if (!entryKey) {
        throw new Error('[rift-root] no entry chunk found in manifest');
      }
      const hashedFile = manifest[entryKey].file; // e.g. "app-A1B2C3D4.js"
      const hashedPath = '/' + hashedFile;

      // Rewrite index.html.
      const indexPath = resolve(PUBLIC_DIR, 'index.html');
      let html = readFileSync(indexPath, 'utf8');
      // Replace BOTH the preload link and the script tag.
      // Use a regex that matches /app.js OR /app-[hash].js so re-runs are idempotent.
      html = html.replace(/\/app(?:-[A-Za-z0-9_-]+)?\.js/g, hashedPath);
      writeFileSync(indexPath, html);

      // Prune stale app-*.js files (keep only the current hashed file +
      // legacy app.js if a deploy needs a rollback path … no, kill it
      // — the worker only references the rewritten name).
      for (const f of readdirSync(PUBLIC_DIR)) {
        if (/^app(?:-[A-Za-z0-9_-]+)?\.js$/.test(f) && f !== hashedFile) {
          try { unlinkSync(resolve(PUBLIC_DIR, f)); } catch {}
        }
        // Also prune source maps if any leak through.
        if (/^app(?:-[A-Za-z0-9_-]+)?\.js\.map$/.test(f) && f !== hashedFile + '.map') {
          try { unlinkSync(resolve(PUBLIC_DIR, f)); } catch {}
        }
      }

      // Drop the manifest from the shipped output.
      try { unlinkSync(manifestPath); } catch {}
      // Best-effort remove the .vite dir if empty.
      try {
        const viteDir = resolve(PUBLIC_DIR, '.vite');
        if (readdirSync(viteDir).length === 0) {
          // rmdir would need fs.rmdirSync; ignore otherwise — empty dirs are harmless.
          require('node:fs').rmdirSync(viteDir);
        }
      } catch {}

      // eslint-disable-next-line no-console
      console.log(`[rift-root] index.html → ${hashedPath}`);
    },
  };
}

export default defineConfig({
  root: PUBLIC_DIR,
  publicDir: false,
  plugins: [
    react({
      // Classic transform → React.createElement. React 18 is on the CDN as a
      // global; we do NOT want jsx-runtime imports leaking into the bundle.
      jsxRuntime: 'classic',
    }),
    rewriteIndexHtml(),
  ],

  server: {
    port: 5173,
    open: '/index.dev.html',
  },

  build: {
    outDir: PUBLIC_DIR,
    emptyOutDir: false,
    minify: 'esbuild',
    cssCodeSplit: false,
    target: 'es2020',
    sourcemap: false,
    manifest: true,
    rollupOptions: {
      input: resolve(PUBLIC_DIR, 'entry.js'),
      external: ['react', 'react-dom', 'react-dom/client'],
      output: {
        format: 'iife',
        entryFileNames: 'app-[hash].js',
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react-dom/client': 'ReactDOM',
        },
        name: 'RiftRoot',
      },
    },
  },
});
