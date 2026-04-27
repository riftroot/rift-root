// erebus edge · live demo
//
// Consumes a structured event stream and animates the compositor pipeline.
// Reward is composition-based, not time-based: it surfaces batch-queue lane
// share, own-cache hits, provider prompt-cache hits, max stack depth, and
// the resulting savings on billed tokens — that's how the compositor
// actually scores work.

// Pricing in USD per 1M tokens (input/output) — fresh as of April 2026.
// Quality is a coarse benchmark composite (1.0 = state of the art).
const ARMS = [
  { name: "gemini-2.5-flash",  tier: "cheap",     in: 0.15, out: 0.60, q: 0.74 },
  { name: "qwen-local-7b",     tier: "local",     in: 0,    out: 0,    q: 0.62 },
  { name: "deepseek-v3",       tier: "cheap",     in: 0.27, out: 1.10, q: 0.78 },
  { name: "claude-haiku-4-5",  tier: "mid",       in: 1,    out: 5,    q: 0.84 },
  { name: "claude-sonnet-4-6", tier: "mid",       in: 3,    out: 15,   q: 0.92 },
  { name: "claude-opus-4-7",   tier: "reasoning", in: 5,    out: 25,   q: 0.96 }
];


const stages = {
  ingest:    document.getElementById("stage-ingest"),
  decompose: document.getElementById("stage-decompose"),
  route:     document.getElementById("stage-route"),
  reward:    document.getElementById("stage-reward"),
  complete:  document.getElementById("stage-complete")
};
const connectors  = document.querySelectorAll(".connector");
const eventList   = document.getElementById("event-list");
const armsRow     = document.getElementById("arms-row");
const dagBranches = document.getElementById("dag-branches");
const execLog     = document.getElementById("exec-log");
const swuEl       = document.getElementById("swu-indicator");
const savingsFill = document.getElementById("savings-fill");
const savingsLbl  = document.getElementById("savings-label");
const qualityLbl  = document.getElementById("quality-label");
const rejectedEl  = document.getElementById("rejected-line");
const clockEl     = document.getElementById("clock");
const clockBtn    = document.getElementById("btn-clock");
const btnReplay   = document.getElementById("btn-replay");

let timers = [];
let paused = false;
let pauseAt = 0;
let startedAt = 0;
let clockTicker = null;

// Viewport-driven clock pause. The displayed timer represents elapsed
// *animation* time, so it freezes whenever events are queued waiting on a
// stage to scroll into view, and resumes once every queue drains.
let queueDepth = 0;
let viewportPausedAt = 0;
let viewportPausedAccum = 0;

// Per-stage gating: stage-bound events queue here until ≥66% of the stage
// is in the viewport, so users who scroll past don't miss the animation.
const VISIBILITY_THRESHOLD = 0.66;
const stageQueues = new Map(); // stage element → [evt, evt, …]
const stageVisible = new Map(); // stage element → bool
const eventToStage = {
  ingest: stages.ingest,
  decompose: stages.decompose,
  route: stages.route,
  execute: stages.route,    // execute renders inside the route stage
  reward: stages.reward,
  complete: stages.complete
};

const visibilityObserver = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    const wasVisible = stageVisible.get(entry.target) === true;
    const isVisible = entry.intersectionRatio >= VISIBILITY_THRESHOLD;
    stageVisible.set(entry.target, isVisible);
    if (isVisible && !wasVisible) drainQueue(entry.target);
  }
}, { threshold: [0, VISIBILITY_THRESHOLD, 1] });

for (const stage of Object.values(stages)) {
  stageQueues.set(stage, []);
  stageVisible.set(stage, false);
  visibilityObserver.observe(stage);
}

// Track whether the event-stream sidecar is on-screen. If it is, the user
// can see the demo advancing through the event log even when individual
// pipeline stages are off-screen — so the clock keeps ticking and we still
// fire (don't queue) stage events. Only when the sidecar is *also* hidden
// does the queue + clock-freeze behaviour kick in.
const sidecarEl = document.querySelector(".sidecar");
let sidecarVisible = true;
if (sidecarEl) {
  new IntersectionObserver((entries) => {
    for (const e of entries) sidecarVisible = e.intersectionRatio > 0.05;
    if (sidecarVisible) viewportResume();
  }, { threshold: [0, 0.05, 0.5, 1] }).observe(sidecarEl);
}

function drainQueue(stage) {
  const q = stageQueues.get(stage);
  if (!q || q.length === 0) return;
  const evts = q.splice(0, q.length);
  for (const evt of evts) {
    queueDepth = Math.max(0, queueDepth - 1);
    dispatchToStage(evt);
  }
  if (queueDepth === 0) viewportResume();
}

function viewportPause() {
  if (paused || viewportPausedAt) return;
  viewportPausedAt = performance.now();
}

function viewportResume() {
  if (viewportPausedAt) {
    viewportPausedAccum += performance.now() - viewportPausedAt;
    viewportPausedAt = 0;
  }
  // Always restore visual running state on resume so the timer never gets
  // stuck dim. Manual pause wins; complete state wins; otherwise running.
  if (paused) return;
  if (!clockTicker) return; // already stopped (complete fired)
  setClockState("running");
}

renderArms(null);

btnReplay.addEventListener("click", () => start());
clockBtn.addEventListener("click", () => togglePause());

start();

async function start() {
  reset();
  const events = await loadEvents();
  startedAt = performance.now();
  startClock();
  setClockState("running");
  for (const evt of events) {
    timers.push(setTimeout(() => handleEvent(evt), evt.ts));
  }
}

function reset() {
  timers.forEach(clearTimeout);
  timers = [];
  paused = false;
  pauseAt = 0;
  queueDepth = 0;
  viewportPausedAt = 0;
  viewportPausedAccum = 0;
  setClockState("idle");
  stopClock();
  clockEl.textContent = "00:00.000";

  for (const stage of Object.values(stages)) {
    stage.classList.remove("active", "complete");
    stage.querySelector(".stage-status").textContent = "idle";
    stage.querySelectorAll("[data-field]").forEach(el => (el.textContent = "—"));
    stageQueues.set(stage, []);
  }
  connectors.forEach(c => c.classList.remove("active"));
  eventList.innerHTML = "";
  dagBranches.innerHTML = "";
  execLog.innerHTML = "";
  swuEl.textContent = "—";
  swuEl.className = "v swu";
  if (savingsFill) savingsFill.style.width = "0%";
  if (savingsLbl)  savingsLbl.textContent = "savings —";
  if (qualityLbl)  qualityLbl.textContent = "quality —";
  if (rejectedEl)  rejectedEl.textContent = "—";
  armsRow.classList.remove("scored");
  renderArms(null);
}

function setClockState(state) {
  clockBtn.classList.remove("running", "paused", "paused-viewport", "done", "idle");
  if (state) clockBtn.classList.add(state);
}

async function loadEvents() {
  try {
    const res = await fetch("events.json", { cache: "no-store" });
    return await res.json();
  } catch (e) {
    console.error("could not load events.json", e);
    return [];
  }
}

function togglePause() {
  if (!paused) {
    paused = true;
    pauseAt = performance.now() - startedAt;
    timers.forEach(clearTimeout);
    timers = [];
    setClockState("paused");
    stopClock();
  } else {
    paused = false;
    setClockState("running");
    loadEvents().then(events => {
      const remaining = events.filter(e => e.ts >= pauseAt);
      startedAt = performance.now() - pauseAt;
      startClock();
      for (const evt of remaining) {
        timers.push(setTimeout(() => handleEvent(evt), evt.ts - pauseAt));
      }
    });
  }
}

function startClock() {
  stopClock();
  clockTicker = setInterval(() => {
    const now = performance.now();
    const viewportFreeze = viewportPausedAt ? (now - viewportPausedAt) : 0;
    const elapsed = (now - startedAt) - viewportPausedAccum - viewportFreeze;
    clockEl.textContent = formatClock(elapsed);
  }, 50);
}

function stopClock() {
  if (clockTicker) { clearInterval(clockTicker); clockTicker = null; }
}

function formatClock(ms) {
  const total = Math.max(0, ms);
  const s = Math.floor(total / 1000);
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  const mss = String(Math.floor(total % 1000)).padStart(3, "0");
  return `${mm}:${ss}.${mss}`;
}

function handleEvent(evt) {
  // Sidecar log always fires immediately so the event stream stays accurate
  // regardless of viewport position.
  appendEventToSidecar(evt);
  // Stage-bound effects are queued until the target stage is ≥66% visible.
  const stage = eventToStage[evt.event];
  if (!stage) return;
  // Dispatch immediately when the target stage is visible OR when the
  // event-stream sidecar is visible (the user is following the demo via
  // the live event log even if the stage card is off-screen).
  if (stageVisible.get(stage) || sidecarVisible) {
    dispatchToStage(evt);
  } else {
    stageQueues.get(stage).push(evt);
    queueDepth += 1;
    viewportPause();
    setClockState("paused-viewport");
  }
}

function dispatchToStage(evt) {
  switch (evt.event) {
    case "ingest":    return onIngest(evt);
    case "decompose": return onDecompose(evt);
    case "route":     return onRoute(evt);
    case "execute":   return onExecute(evt);
    case "reward":    return onReward(evt);
    case "complete":  return onComplete(evt);
  }
}

function activate(stage, statusText = "running") {
  stage.classList.add("active");
  stage.querySelector(".stage-status").textContent = statusText;
}

function complete(stage, statusText = "done") {
  stage.classList.remove("active");
  stage.classList.add("complete");
  stage.querySelector(".stage-status").textContent = statusText;
}

function fillFields(stage, evt) {
  for (const el of stage.querySelectorAll("[data-field]")) {
    const key = el.dataset.field;
    if (evt[key] !== undefined && evt[key] !== null) el.textContent = String(evt[key]);
  }
}

function pulseConnector(idx) {
  const c = connectors[idx];
  if (c) c.classList.add("active");
}

function onIngest(evt) {
  activate(stages.ingest, "ingesting");
  fillFields(stages.ingest, evt);
  pulseConnector(0);
  setTimeout(() => complete(stages.ingest, "ingested"), 1200);
}

function onDecompose(evt) {
  activate(stages.decompose, "decomposing");
  fillFields(stages.decompose, evt);
  dagBranches.innerHTML = "";
  (evt.nodes || []).forEach((name, i) => {
    const node = document.createElement("div");
    node.className = "dag-node";
    node.textContent = name;
    node.style.animationDelay = `${i * 120}ms`;
    dagBranches.appendChild(node);
  });
  pulseConnector(1);
  setTimeout(() => complete(stages.decompose, "decomposed"), 1400);
}

function onRoute(evt) {
  activate(stages.route, "routing");
  fillFields(stages.route, evt);
  if (rejectedEl) {
    const rej = evt.rejected && evt.rejected[0];
    rejectedEl.textContent = rej ? `${rej.arm} — ${rej.why}` : "—";
  }
  renderArms(evt);
  pulseConnector(2);
}

function onExecute(evt) {
  const lane = evt.lane || "live";
  const reused = evt.reused_tokens || 0;
  const billed = Math.max(0, (evt.tokens_in || 0) + (evt.tokens_out || 0) - reused);
  const line = document.createElement("div");
  line.className = "exec-line";
  line.innerHTML = `
    <span class="ok">${evt.status === "success" ? "✓" : "✗"}</span>
    <span class="name">${escapeHtml(evt.subtask)}<span class="lane-pill ${lane}">${lane}</span></span>
    <span class="meta">${formatTokens(billed)}b · ${formatTokens(reused)}r</span>
  `;
  execLog.appendChild(line);
  execLog.scrollTop = execLog.scrollHeight;

  const node = [...dagBranches.querySelectorAll(".dag-node")]
    .find(n => n.textContent === evt.subtask);
  if (node) node.classList.add("done");

  // Route stage's work is done as soon as the last subtask executes —
  // drop the per-arm highlight immediately so the lingering "Sonnet wins"
  // visual goes away before the reward stage even starts scoring.
  const allNodes = dagBranches.querySelectorAll(".dag-node");
  const doneNodes = dagBranches.querySelectorAll(".dag-node.done");
  if (allNodes.length > 0 && allNodes.length === doneNodes.length) {
    armsRow.classList.add("scored");
    complete(stages.route, "executed");
  }
}

function onReward(evt) {
  activate(stages.reward, "scoring");
  const costSplit = evt.cost_actual_usd != null && evt.cost_baseline_all_opus_usd != null
    ? `$${evt.cost_actual_usd.toFixed(4)}  ·  baseline $${evt.cost_baseline_all_opus_usd.toFixed(4)}`
    : "—";
  fillFields(stages.reward, {
    batch_share: pct(evt.batch_share),
    stack_depth_max: evt.stack_depth_max,
    own_cache_hits: evt.own_cache_hits,
    provider_cache_hits: evt.provider_cache_hits,
    reward_score: (evt.reward_score ?? 0).toFixed(2),
    cost_split: costSplit,
    tokens_split: `${formatTokens(evt.tokens_reused)} reused · ${formatTokens(evt.tokens_billed)} billed`
  });
  if (evt.swu) {
    swuEl.textContent = "✓ SWU";
    swuEl.className = "v swu success";
  } else {
    swuEl.textContent = "non-SWU";
    swuEl.className = "v swu escalated";
  }
  if (savingsFill) {
    const savings = (evt.savings_pct != null) ? evt.savings_pct
      : (evt.cost_baseline_all_opus_usd ? 1 - (evt.cost_actual_usd / evt.cost_baseline_all_opus_usd) : 0);
    requestAnimationFrame(() => {
      savingsFill.style.width = `${savings * 100}%`;
    });
  }
  if (savingsLbl) {
    const x = evt.cost_savings_x != null
      ? `${evt.cost_savings_x.toFixed(1)}× cheaper than all-Opus`
      : `savings ${pct(evt.savings_pct)} vs baseline`;
    savingsLbl.textContent = x;
  }
  if (qualityLbl) {
    if (evt.quality_actual != null && evt.quality_baseline_all_opus != null) {
      qualityLbl.textContent = `quality ${evt.quality_actual.toFixed(2)}  ·  Opus ${evt.quality_baseline_all_opus.toFixed(2)}  ·  −${pct(evt.quality_drop_pct)} for the win`;
    } else {
      qualityLbl.textContent = "quality —";
    }
  }

  pulseConnector(3);
  setTimeout(() => complete(stages.reward, "scored"), 1200);
  // Route stage already closed itself + cleared the arm highlight when its
  // last execute fired (see onExecute). Belt-and-braces in case decompose
  // didn't seed any dag-node markers for some run.
  if (!armsRow.classList.contains("scored")) {
    armsRow.classList.add("scored");
    complete(stages.route, "executed");
  }
}

function onComplete(evt) {
  activate(stages.complete, "complete");
  fillFields(stages.complete, evt);
  setTimeout(() => complete(stages.complete, "done"), 800);
  setTimeout(() => connectors.forEach(c => c.classList.remove("active")), 1600);

  // Stop the running clock so the timer doesn't tick up forever. No auto
  // replay — the user replays manually with the replay button.
  stopClock();
  setClockState("done");
}

function renderArms(evt) {
  armsRow.innerHTML = "";
  // If this route event lists rejected arms, surface their UCB so users see
  // the bandit downranking the expensive options.
  const rejMap = new Map();
  if (evt && evt.rejected) {
    for (const r of evt.rejected) rejMap.set(r.arm, r.ucb);
  }
  for (const arm of ARMS) {
    const isSel = !!(evt && arm.name === evt.arm);
    const rejUcb = rejMap.get(arm.name);
    const score = isSel ? evt.ucb_score
      : rejUcb != null ? rejUcb
      : 0.4 + Math.random() * 0.4;
    const costLabel = arm.in === 0 && arm.out === 0
      ? "free · local"
      : `$${arm.in}/${arm.out}·1M`;
    const costClass = arm.in >= 5 ? "expensive" : arm.in <= 0.3 ? "cheap" : "";
    const div = document.createElement("div");
    div.className = "arm" + (isSel ? " selected" : "");
    div.innerHTML = `
      <div class="arm-head">
        <span class="arm-name">${escapeHtml(arm.name)}</span>
        <span class="arm-tier">${arm.tier}</span>
      </div>
      <div class="ucb-bar"><div class="ucb-fill"></div></div>
      <div class="arm-foot">
        <span class="arm-cost ${costClass}">${costLabel}</span>
        <span>q ${arm.q.toFixed(2)} · ucb ${score.toFixed(2)}</span>
      </div>
    `;
    armsRow.appendChild(div);
    requestAnimationFrame(() => {
      div.querySelector(".ucb-fill").style.width = `${score * 100}%`;
    });
  }
}

function appendEventToSidecar(evt) {
  const li = document.createElement("li");
  li.dataset.event = evt.event;
  const ts = `+${(evt.ts / 1000).toFixed(1)}s`;
  li.innerHTML = `<span class="ev-ts">${ts}</span><span class="ev-body">${summarize(evt)}</span>`;
  eventList.appendChild(li);
  eventList.scrollTop = eventList.scrollHeight;
}

function summarize(evt) {
  switch (evt.event) {
    case "ingest":    return `<b>ingest</b> · ${escapeHtml(evt.task)} (${evt.subtasks})`;
    case "decompose": return `<b>decompose</b> · depth ${evt.dag_depth} · ${evt.parallel_branches} parallel`;
    case "route": {
      const cache = evt.cache_hit ? ` · <i>${escapeHtml(evt.cache_hit)}</i>` : "";
      return `<b>route</b> · ${escapeHtml(evt.subtask)} → ${escapeHtml(evt.arm)} [${evt.lane || "live"}]${cache}`;
    }
    case "execute": {
      const stack = (evt.stack || []).length ? ` · stack ${evt.stack.length}` : "";
      return `<b>execute</b> · ${escapeHtml(evt.subtask)} · ${evt.lane || "live"}${stack}`;
    }
    case "reward":   return `<b>reward</b> · ${evt.swu ? "SWU" : "non-SWU"} · batch ${pct(evt.batch_share)} · save ${pct(evt.savings_pct)}`;
    case "complete": return `<b>complete</b> · ${escapeHtml(evt.artifact)}`;
    default:         return `<b>${evt.event}</b>`;
  }
}

function pct(n) {
  if (n == null || isNaN(n)) return "—";
  return `${Math.round(n * 100)}%`;
}

function formatTokens(n) {
  if (n == null) return "0";
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[c]));
}

// ───────────────────────────────────────────── mobile sidecar pin
//
// On mobile the event-stream sidecar lives as a small peek panel pinned
// to the viewport bottom (no title visible — just a handle + a few event
// lines bleeding through). It only starts growing once stage 05's bottom
// crosses into the viewport, expanding in lockstep with scroll. The
// title fades in alongside growth. Once the sidecar's natural document
// slot scrolls into view, the panel switches from fixed → static so it
// drops smoothly into the page rather than sliding off and leaving black
// space behind it.
//
// A sibling spacer reserves the matching height in flow while pinned and
// is removed once the sidecar takes its natural place.
(function setupSidecarPin() {
  const sidecar = document.querySelector(".sidecar");
  const stage5  = document.getElementById("stage-complete");
  if (!sidecar || !stage5) return;

  const spacer = document.createElement("div");
  spacer.className = "sidecar-spacer";
  sidecar.parentNode.insertBefore(spacer, sidecar);

  const PEEK_H = 132;  // peek height: handle + a couple of event lines
  const mq = window.matchMedia("(max-width: 1023px)");
  let raf = 0;

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  function update() {
    raf = 0;
    if (!mq.matches) {
      sidecar.classList.remove("pinned-bottom");
      sidecar.style.cssText = "";
      sidecar.style.removeProperty("--title-opacity");
      spacer.style.display = "none";
      return;
    }

    const vh      = window.innerHeight;
    const scrollY = window.scrollY || window.pageYOffset || 0;
    const maxH    = Math.min(vh * 0.62, 460);

    spacer.style.display = "block";
    spacer.style.height  = maxH + "px";

    // Anchor 0: scrollY at which stage 05's bottom first touches viewport
    //           bottom (growth starts here).
    // Anchor 1: scrollY at which the spacer's bottom touches viewport
    //           bottom — at this moment a fixed panel of height maxH at
    //           bottom of viewport overlays the spacer exactly, so we
    //           can swap fixed → static without a visual jump.
    const stage5Top    = stage5.getBoundingClientRect().top + scrollY;
    const stage5Bottom = stage5Top + stage5.offsetHeight;
    const spacerTopAbs = spacer.getBoundingClientRect().top + scrollY;
    const anchor0      = stage5Bottom - vh;
    const anchor1      = spacerTopAbs + maxH - vh;

    if (scrollY >= anchor1) {
      // Phase D: hand off to natural flow. The fixed panel and the static
      // panel coincide at this exact scrollY, so the swap is invisible.
      sidecar.classList.remove("pinned-bottom");
      sidecar.style.position = "";
      sidecar.style.left = "";
      sidecar.style.right = "";
      sidecar.style.bottom = "";
      sidecar.style.height = maxH + "px";
      sidecar.style.removeProperty("--title-opacity");
      spacer.style.display = "none";
    } else {
      sidecar.classList.add("pinned-bottom");
      sidecar.style.position = "fixed";
      sidecar.style.left   = "var(--pad-page)";
      sidecar.style.right  = "var(--pad-page)";
      sidecar.style.bottom = "0";

      let progress;
      if (scrollY <= anchor0) {
        progress = 0;
      } else {
        progress = clamp((scrollY - anchor0) / Math.max(1, anchor1 - anchor0), 0, 1);
      }
      const h = PEEK_H + (maxH - PEEK_H) * progress;
      sidecar.style.height = h + "px";
      sidecar.style.setProperty("--title-opacity", String(progress));
    }

    // The spacer (maxH) already reserves the room the pinned panel
    // needs above the footer — no extra layout padding required.
  }

  function schedule() {
    if (raf) return;
    raf = requestAnimationFrame(update);
  }

  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
  if (mq.addEventListener) mq.addEventListener("change", schedule);
  else mq.addListener(schedule);
  schedule();
  setTimeout(schedule, 100);
  setTimeout(schedule, 600);
})();
