// erebus edge · live demo
//
// Consumes a structured event stream and animates the compositor pipeline.
// Reward is composition-based, not time-based: it surfaces batch-queue lane
// share, own-cache hits, provider prompt-cache hits, max stack depth, and
// the resulting savings on billed tokens — that's how the compositor
// actually scores work.

const ARMS = [
  { name: "gemini-flash-1.5",  tier: "cheap" },
  { name: "qwen-local-7b",     tier: "cheap" },
  { name: "deepseek-v3",       tier: "cheap" },
  { name: "claude-haiku-4-5",  tier: "mid"   },
  { name: "claude-sonnet-4-6", tier: "mid"   },
  { name: "claude-opus-4-7",   tier: "reasoning" }
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
const clockEl     = document.getElementById("clock");
const btnReplay   = document.getElementById("btn-replay");
const btnPause    = document.getElementById("btn-pause");

let timers = [];
let paused = false;
let pauseAt = 0;
let startedAt = 0;
let clockTicker = null;

renderArms(null);

btnReplay.addEventListener("click", () => start());
btnPause.addEventListener("click", () => togglePause());

start();

async function start() {
  reset();
  const events = await loadEvents();
  startedAt = performance.now();
  startClock();
  for (const evt of events) {
    timers.push(setTimeout(() => handleEvent(evt), evt.ts));
  }
}

function reset() {
  timers.forEach(clearTimeout);
  timers = [];
  paused = false;
  pauseAt = 0;
  btnPause.textContent = "pause";
  stopClock();
  clockEl.textContent = "00:00.000";

  for (const stage of Object.values(stages)) {
    stage.classList.remove("active", "complete");
    stage.querySelector(".stage-status").textContent = "idle";
    stage.querySelectorAll("[data-field]").forEach(el => (el.textContent = "—"));
  }
  connectors.forEach(c => c.classList.remove("active"));
  eventList.innerHTML = "";
  dagBranches.innerHTML = "";
  execLog.innerHTML = "";
  swuEl.textContent = "—";
  swuEl.className = "v swu";
  if (savingsFill) savingsFill.style.width = "0%";
  if (savingsLbl)  savingsLbl.textContent = "savings —";
  renderArms(null);
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
    btnPause.textContent = "resume";
    stopClock();
  } else {
    paused = false;
    btnPause.textContent = "pause";
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
    clockEl.textContent = formatClock(performance.now() - startedAt);
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
  appendEventToSidecar(evt);
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
}

function onReward(evt) {
  activate(stages.reward, "scoring");
  fillFields(stages.reward, {
    batch_share: pct(evt.batch_share),
    stack_depth_max: evt.stack_depth_max,
    own_cache_hits: evt.own_cache_hits,
    provider_cache_hits: evt.provider_cache_hits,
    reward_score: (evt.reward_score ?? 0).toFixed(2),
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
    requestAnimationFrame(() => {
      savingsFill.style.width = `${(evt.savings_pct || 0) * 100}%`;
    });
  }
  if (savingsLbl) savingsLbl.textContent = `savings ${pct(evt.savings_pct)} vs no-stack baseline`;

  pulseConnector(3);
  setTimeout(() => complete(stages.reward, "scored"), 1200);
  complete(stages.route, "executed");
}

function onComplete(evt) {
  activate(stages.complete, "complete");
  fillFields(stages.complete, evt);
  setTimeout(() => complete(stages.complete, "done"), 800);
  setTimeout(() => connectors.forEach(c => c.classList.remove("active")), 1600);
}

function renderArms(evt) {
  armsRow.innerHTML = "";
  for (const arm of ARMS) {
    const isSel = !!(evt && arm.name === evt.arm);
    const score = isSel ? evt.ucb_score : 0.4 + Math.random() * 0.4;
    const div = document.createElement("div");
    div.className = "arm" + (isSel ? " selected" : "");
    div.innerHTML = `
      <div class="arm-head">
        <span class="arm-name">${escapeHtml(arm.name)}</span>
        <span class="arm-tier">${arm.tier}</span>
      </div>
      <div class="ucb-bar"><div class="ucb-fill"></div></div>
      <div class="arm-foot">
        <span>ucb ${score.toFixed(2)}</span>
        <span>${isSel && evt.lane ? evt.lane : ""}</span>
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
