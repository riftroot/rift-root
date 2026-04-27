// erebus edge · live demo
//
// consumes a structured event stream and animates the compositor pipeline.
// uses a replay of events.json by default; swap `replay()` for an EventSource
// against /api/erebus/stream when wired to annals-of-ankou.

const ARMS = [
  { name: "gemini-flash-1.5", tier: "cheap" },
  { name: "qwen-local-7b",    tier: "cheap" },
  { name: "deepseek-v3",      tier: "cheap" },
  { name: "claude-haiku-4-5", tier: "mid"   },
  { name: "claude-sonnet-4-6", tier: "mid"  },
  { name: "claude-opus-4-7",  tier: "reasoning" }
];

const stages = {
  ingest:    document.getElementById("stage-ingest"),
  decompose: document.getElementById("stage-decompose"),
  route:     document.getElementById("stage-route"),
  reward:    document.getElementById("stage-reward"),
  complete:  document.getElementById("stage-complete")
};
const connectors = document.querySelectorAll(".connector");
const eventList  = document.getElementById("event-list");
const armsRow    = document.getElementById("arms-row");
const dagBranches = document.getElementById("dag-branches");
const execLog    = document.getElementById("exec-log");
const swuEl      = document.getElementById("swu-indicator");
const clockEl    = document.getElementById("clock");
const btnReplay  = document.getElementById("btn-replay");
const btnPause   = document.getElementById("btn-pause");

let timers = [];
let paused = false;
let pauseAt = 0;
let resumeOffset = 0;
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
    const t = setTimeout(() => handleEvent(evt), evt.ts);
    timers.push(t);
  }
}

function reset() {
  timers.forEach(clearTimeout);
  timers = [];
  paused = false;
  pauseAt = 0;
  resumeOffset = 0;
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
  swuEl.className = "swu";
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
  // demo replay is fire-and-forget timeouts; pause snapshots remaining and reschedules
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
      const adjustedStart = performance.now();
      startedAt = adjustedStart - pauseAt;
      startClock();
      for (const evt of remaining) {
        const delay = evt.ts - pauseAt;
        const t = setTimeout(() => handleEvent(evt), delay);
        timers.push(t);
      }
    });
  }
}

function startClock() {
  stopClock();
  clockTicker = setInterval(() => {
    const ms = performance.now() - startedAt;
    clockEl.textContent = formatClock(ms);
  }, 33);
}

function stopClock() {
  if (clockTicker) {
    clearInterval(clockTicker);
    clockTicker = null;
  }
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
    case "ingest":     return onIngest(evt);
    case "decompose":  return onDecompose(evt);
    case "route":      return onRoute(evt);
    case "execute":    return onExecute(evt);
    case "reward":     return onReward(evt);
    case "complete":   return onComplete(evt);
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
    if (evt[key] !== undefined) el.textContent = String(evt[key]);
  }
}

function onIngest(evt) {
  activate(stages.ingest, "ingesting");
  fillFields(stages.ingest, evt);
  pulseConnector(0);
  setTimeout(() => complete(stages.ingest, "ingested"), 600);
}

function onDecompose(evt) {
  activate(stages.decompose, "decomposing");
  fillFields(stages.decompose, evt);
  dagBranches.innerHTML = "";
  (evt.nodes || []).forEach((name, i) => {
    const node = document.createElement("div");
    node.className = "dag-node";
    node.textContent = name;
    node.style.animationDelay = `${i * 60}ms`;
    dagBranches.appendChild(node);
  });
  pulseConnector(1);
  setTimeout(() => complete(stages.decompose, "decomposed"), 800);
}

function onRoute(evt) {
  activate(stages.route, "routing");
  fillFields(stages.route, evt);
  renderArms(evt);
  pulseConnector(2);
}

function onExecute(evt) {
  const line = document.createElement("div");
  line.className = "exec-line";
  line.innerHTML = `
    <span class="ok">${evt.status === "success" ? "✓" : "✗"} ${evt.status}</span>
    <span class="name">${evt.subtask}</span>
    <span class="lat">${evt.latency_ms}ms · ${evt.tokens}t</span>
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
    cost_usd: `$${evt.cost_usd.toFixed(4)}`,
    escalations: evt.escalations,
    retries: evt.retries,
    reward_score: evt.reward_score.toFixed(2)
  });
  if (evt.swu) {
    swuEl.textContent = "✓ SWU";
    swuEl.className = "swu success";
  } else {
    swuEl.textContent = `✗ ${evt.escalations} esc`;
    swuEl.className = "swu escalated";
  }
  pulseConnector(3);
  setTimeout(() => complete(stages.reward, "scored"), 600);
  // route stage also closes once reward arrives
  complete(stages.route, "executed");
}

function onComplete(evt) {
  activate(stages.complete, "complete");
  fillFields(stages.complete, evt);
  setTimeout(() => complete(stages.complete, "done"), 400);
  setTimeout(() => connectors.forEach(c => c.classList.remove("active")), 800);
}

function pulseConnector(idx) {
  const c = connectors[idx];
  if (!c) return;
  c.classList.add("active");
}

function renderArms(evt) {
  armsRow.innerHTML = "";
  for (const arm of ARMS) {
    const div = document.createElement("div");
    div.className = "arm" + (evt && arm.name === evt.arm ? " selected" : "");
    const score = evt && arm.name === evt.arm
      ? evt.ucb_score
      : 0.4 + Math.random() * 0.4;
    div.innerHTML = `
      <div class="arm-head">
        <span class="arm-name">${arm.name}</span>
        <span class="arm-tier">${arm.tier}</span>
      </div>
      <div class="ucb-bar"><div class="ucb-fill"></div></div>
      <span class="arm-tier" style="text-align:right">ucb ${score.toFixed(2)}</span>
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
  const ts = `+${String(evt.ts).padStart(5, "0")}ms`;
  const body = summarize(evt);
  li.innerHTML = `<span class="ev-ts">${ts}</span><span class="ev-body">${body}</span>`;
  eventList.appendChild(li);
  eventList.scrollTop = eventList.scrollHeight;
}

function summarize(evt) {
  switch (evt.event) {
    case "ingest":    return `<b>ingest</b> · ${evt.task} (${evt.subtasks} subtasks)`;
    case "decompose": return `<b>decompose</b> · depth ${evt.dag_depth} · ${evt.parallel_branches} parallel`;
    case "route":     return `<b>route</b> · ${evt.subtask} → <i>${evt.arm}</i> [${evt.tier}] ucb ${evt.ucb_score}`;
    case "execute":   return `<b>execute</b> · ${evt.subtask} · ${evt.status} · ${evt.latency_ms}ms · ${evt.tokens}t`;
    case "reward":    return `<b>reward</b> · ${evt.swu ? "SWU" : "non-SWU"} · $${evt.cost_usd.toFixed(4)} · score ${evt.reward_score}`;
    case "complete":  return `<b>complete</b> · ${evt.artifact}`;
    default:          return `<b>${evt.event}</b>`;
  }
}
