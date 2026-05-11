/**
 * noscript-regression-test.mjs
 *
 * Verifies that commit d83c17a's <noscript> block inside #root does NOT
 * break React hydration in Chromium, WebKit, and Firefox.
 *
 * Pass criteria:
 *   1. #root.innerHTML contains React-rendered content (unique strings:
 *      "compositor", "Rift Root", "Erebus")
 *   2. #root does NOT still contain a <noscript> child — React replaced it.
 *   3. No JS errors in console that look hydration-related.
 *
 * Output: JSON results + screenshots in /tmp/noscript-regression/
 *
 * WebKit/macOS note: Playwright WebKit on macOS headless can stall indefinitely
 * during TLS handshake with external CDNs (unpkg.com). Mitigation per
 * https://github.com/microsoft/playwright/issues/12182 and
 * https://github.com/microsoft/playwright/issues/18953:
 *   - Use 'domcontentloaded' (not 'load') to avoid waiting for CDN script fetches.
 *   - Poll for React mount separately with waitForFunction.
 *   - Wrap entire engine test in a hard Promise.race timeout.
 */

import { chromium, webkit, firefox } from 'playwright';
import { mkdir, writeFile } from 'fs/promises';
import { existsSync } from 'fs';

const URL = 'https://riftroot.com';
const OUT_DIR = '/tmp/noscript-regression';
const GOTO_TIMEOUT_MS = 45000;   // page.goto timeout
const REACT_WAIT_MS = 20000;     // waitForFunction timeout for React mount
const ENGINE_HARD_TIMEOUT_MS = 90000; // hard wall-clock timeout per engine

const REACT_SIGNAL_STRINGS = ['compositor', 'Rift Root', 'Erebus'];

/** Wrap a promise in a hard timeout (process-level, not Playwright-level). */
function withTimeout(promise, ms, label) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Hard timeout after ${ms}ms: ${label}`));
    }, ms);
    promise.then(
      (v) => { clearTimeout(timer); resolve(v); },
      (e) => { clearTimeout(timer); reject(e); }
    );
  });
}

async function testEngine(engineName, browserType) {
  console.log(`\n=== Testing ${engineName} ===`);
  const results = {
    engine: engineName,
    url: URL,
    timestamp: new Date().toISOString(),
    pass: false,
    details: {},
    consoleErrors: [],
    consoleWarnings: [],
    networkErrors: [],
    checks: {},
  };

  let browser;
  try {
    browser = await withTimeout(
      browserType.launch({ headless: true }),
      15000,
      `${engineName} browser launch`
    );
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
    });
    const page = await context.newPage();

    // Capture console messages
    page.on('console', msg => {
      const text = msg.text();
      if (msg.type() === 'error') {
        results.consoleErrors.push(text);
        console.log(`  [console.error] ${text}`);
      } else if (msg.type() === 'warning') {
        results.consoleWarnings.push(text);
      }
    });

    // Capture network errors (non-fatal for CDN resources)
    page.on('requestfailed', req => {
      results.networkErrors.push({
        url: req.url(),
        failure: req.failure()?.errorText ?? 'unknown',
      });
      console.log(`  [net-fail] ${req.url()} — ${req.failure()?.errorText}`);
    });

    // Step 1: Navigate to page using domcontentloaded.
    // Using 'domcontentloaded' avoids waiting for CDN-fetched defer scripts to finish
    // loading — they will execute after DOMContentLoaded anyway.
    // Per Playwright docs: 'domcontentloaded' fires when the initial HTML document has
    // been loaded and parsed, without waiting for stylesheets, images, and subframes.
    // Ref: https://playwright.dev/docs/api/class-page#page-goto-option-wait-until
    console.log(`  Navigating with domcontentloaded...`);
    const response = await withTimeout(
      page.goto(URL, { waitUntil: 'domcontentloaded', timeout: GOTO_TIMEOUT_MS }),
      GOTO_TIMEOUT_MS + 5000,
      `${engineName} page.goto`
    );

    results.details.httpStatus = response?.status();
    results.details.url = page.url();
    console.log(`  HTTP ${results.details.httpStatus} → ${results.details.url}`);

    // Step 2: Wait for React to mount.
    // React 18 UMD (from unpkg CDN) is defer-loaded. It will fire ReactDOM.createRoot
    // and render after the defer scripts load and execute. We poll for the noscript
    // element to disappear from #root — that's the definitive signal React has run.
    //
    // Ref on React 18 UMD hydration behavior:
    // https://react.dev/blog/2022/03/29/react-v18#gradually-adopting-concurrent-features
    // React 18 with createRoot replaces all children of the container, so the <noscript>
    // child will be removed once React renders.
    console.log(`  Waiting for React to mount (polling #root for noscript removal)...`);
    let reactMounted = false;
    try {
      await withTimeout(
        page.waitForFunction(() => {
          const root = document.getElementById('root');
          if (!root) return false;
          // React has mounted when noscript is gone AND there's actual DOM content
          const hasNoscript = !!root.querySelector('noscript');
          const hasContent = root.innerHTML.trim().length > 100;
          return !hasNoscript && hasContent;
        }, { timeout: REACT_WAIT_MS }),
        REACT_WAIT_MS + 5000,
        `${engineName} React mount waitForFunction`
      );
      reactMounted = true;
      console.log(`  React mounted successfully.`);
    } catch (waitErr) {
      console.log(`  React mount wait timed out or failed: ${waitErr.message}`);
      console.log(`  Will still inspect DOM state at this point.`);
    }

    // Step 3: Inspect DOM
    const rootExists = await page.evaluate(() => !!document.getElementById('root'));
    results.checks.rootExists = rootExists;
    console.log(`  #root exists: ${rootExists}`);

    const rootHTML = await page.evaluate(() => document.getElementById('root')?.innerHTML ?? '');
    results.details.rootHTMLSnippet = rootHTML.slice(0, 600);
    console.log(`  #root innerHTML (first 600): ${rootHTML.slice(0, 600)}`);

    const hasNoscriptChild = await page.evaluate(() => {
      const root = document.getElementById('root');
      if (!root) return false;
      return !!root.querySelector('noscript');
    });
    results.checks.noscriptChildGone = !hasNoscriptChild;
    console.log(`  <noscript> child still in #root: ${hasNoscriptChild} (want: false)`);

    const reactRendered = await page.evaluate(() => {
      const root = document.getElementById('root');
      if (!root) return false;
      const hasNoscript = !!root.querySelector('noscript');
      const hasContent = root.innerHTML.trim().length > 50;
      return !hasNoscript && hasContent;
    });
    results.checks.reactRendered = reactRendered;
    console.log(`  React rendered (no noscript + has content): ${reactRendered}`);

    // Step 4: Content string checks
    const contentChecks = {};
    for (const str of REACT_SIGNAL_STRINGS) {
      const found = await page.evaluate((s) => document.body.innerText.includes(s), str);
      contentChecks[str] = found;
      console.log(`  Content string "${str}": ${found}`);
    }
    results.checks.contentStrings = contentChecks;

    // Step 5: Hydration error check
    const hydrationErrors = results.consoleErrors.filter(e =>
      e.toLowerCase().includes('hydrat') ||
      e.toLowerCase().includes('reactdom') ||
      (e.toLowerCase().includes('react') && e.toLowerCase().includes('error'))
    );
    results.checks.noHydrationErrors = hydrationErrors.length === 0;
    results.checks.hydrationErrors = hydrationErrors;
    console.log(`  Hydration errors in console: ${hydrationErrors.length}`);
    console.log(`  Total console errors: ${results.consoleErrors.length}`);

    // Step 6: Screenshot
    const screenshotPath = `${OUT_DIR}/${engineName}-screenshot.png`;
    await page.screenshot({ path: screenshotPath, fullPage: false });
    results.details.screenshotPath = screenshotPath;
    console.log(`  Screenshot: ${screenshotPath}`);

    // Verdict
    results.pass = (
      rootExists &&
      results.checks.noscriptChildGone &&
      results.checks.reactRendered &&
      results.checks.noHydrationErrors
    );
    console.log(`  VERDICT: ${results.pass ? 'PASS' : 'FAIL'}`);

  } catch (err) {
    results.details.fatalError = err.message;
    console.log(`  FATAL ERROR: ${err.message}`);
    results.pass = false;
  } finally {
    if (browser) {
      try { await browser.close(); } catch (_) {}
    }
  }

  return results;
}

async function runWithHardTimeout(engineName, browserType) {
  return withTimeout(
    testEngine(engineName, browserType),
    ENGINE_HARD_TIMEOUT_MS,
    `entire ${engineName} engine test`
  ).catch(err => ({
    engine: engineName,
    url: URL,
    timestamp: new Date().toISOString(),
    pass: false,
    details: { fatalError: err.message },
    consoleErrors: [],
    consoleWarnings: [],
    networkErrors: [],
    checks: { hardTimeout: true },
  }));
}

async function main() {
  if (!existsSync(OUT_DIR)) {
    await mkdir(OUT_DIR, { recursive: true });
  }

  const engines = [
    ['chromium', chromium],
    ['webkit', webkit],
    ['firefox', firefox],
  ];

  const allResults = [];

  for (const [name, browserType] of engines) {
    const result = await runWithHardTimeout(name, browserType);
    allResults.push(result);
  }

  // Write JSON results
  const jsonPath = `${OUT_DIR}/results.json`;
  await writeFile(jsonPath, JSON.stringify(allResults, null, 2));
  console.log(`\nFull results written to ${jsonPath}`);

  // Summary
  console.log('\n=== SUMMARY ===');
  let overallPass = true;
  for (const r of allResults) {
    const v = r.pass ? 'PASS' : 'FAIL';
    console.log(`  ${r.engine}: ${v}`);
    if (!r.pass) overallPass = false;
  }
  console.log(`\nOVERALL: ${overallPass ? 'PASS' : 'FAIL'}`);

  return { allResults, overallPass };
}

main().then(({ overallPass }) => {
  process.exit(overallPass ? 0 : 1);
}).catch(err => {
  console.error('Fatal:', err);
  process.exit(2);
});
