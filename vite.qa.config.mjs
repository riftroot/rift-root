// vite.qa.config.mjs
// Vite build for site-qa/. Produces site-qa/public/app.js as a single
// self-executing IIFE bundle. React + ReactDOM are externalized — they
// load via <script> tags in index.html (CDN) and are read as globals.
//
// Why IIFE format: components publish their public API via
//   Object.assign(window, { Nav, Hero, ... })
// at module bottom. App.jsx then references those names as bare globals.
// IIFE format keeps every component's top-level `function Foo` inside the
// bundle's closure, while the explicit Object.assign side-effects expose
// only the intended names to window — same shape the previous esbuild
// concat-with-IIFE pipeline produced.
//
// Dev server: `npm run dev` serves from site-qa/public/ with HMR. The dev
// HTML (index.dev.html) loads `entry.js` as type=module so each .jsx file
// is a real ES module, fast-refresh wired via @vitejs/plugin-react.
// Production HTML loads `app.js` as a classic script (unchanged).

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

const PUBLIC_DIR = resolve(process.cwd(), 'site-qa/public');

export default defineConfig({
  root: PUBLIC_DIR,
  publicDir: false,
  plugins: [
    react({
      // Classic transform → React.createElement. React 18 is on the CDN as a
      // global; we do NOT want jsx-runtime imports leaking into the bundle.
      jsxRuntime: 'classic',
    }),
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
    rollupOptions: {
      input: resolve(PUBLIC_DIR, 'entry.js'),
      external: ['react', 'react-dom', 'react-dom/client'],
      output: {
        format: 'iife',
        entryFileNames: 'app.js',
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
