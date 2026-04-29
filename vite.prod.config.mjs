// vite.prod.config.mjs
// Vite build for site/ (production riftroot.com). Mirror of
// vite.qa.config.mjs but targets site/public/ instead of site-qa/public/.
// See vite.qa.config.mjs for full rationale on IIFE format, hashed
// filenames, and the post-build index.html rewrite.

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { readFileSync, writeFileSync, readdirSync, unlinkSync } from 'node:fs';

const PUBLIC_DIR = resolve(process.cwd(), 'site/public');

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

      const entryKey = Object.keys(manifest).find(k => manifest[k].isEntry);
      if (!entryKey) {
        throw new Error('[rift-root] no entry chunk found in manifest');
      }
      const hashedFile = manifest[entryKey].file;
      const hashedPath = '/' + hashedFile;

      const indexPath = resolve(PUBLIC_DIR, 'index.html');
      let html = readFileSync(indexPath, 'utf8');
      html = html.replace(/\/app(?:-[A-Za-z0-9_-]+)?\.js/g, hashedPath);
      writeFileSync(indexPath, html);

      for (const f of readdirSync(PUBLIC_DIR)) {
        if (/^app(?:-[A-Za-z0-9_-]+)?\.js$/.test(f) && f !== hashedFile) {
          try { unlinkSync(resolve(PUBLIC_DIR, f)); } catch {}
        }
        if (/^app(?:-[A-Za-z0-9_-]+)?\.js\.map$/.test(f) && f !== hashedFile + '.map') {
          try { unlinkSync(resolve(PUBLIC_DIR, f)); } catch {}
        }
      }

      try { unlinkSync(manifestPath); } catch {}
      try {
        const viteDir = resolve(PUBLIC_DIR, '.vite');
        if (readdirSync(viteDir).length === 0) {
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
    react({ jsxRuntime: 'classic' }),
    rewriteIndexHtml(),
  ],

  server: {
    port: 5174,
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
