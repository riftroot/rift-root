---
marp: true
theme: erebus
paginate: true
---

<!-- _class: title -->

### RIFT ROOT LLC · FORT COLLINS, COLORADO · EST. 2026

# *Erebus Edge*

### NVIDIA INCEPTION · MAY 2026

---

**Bootstrapped. Privately held. No outside capital.**
`V0.1 · PRODUCTION ACTIVE · NORTHERN COLORADO`

---

### 01 / THE PROBLEM

## AI tooling breaks where real teams work.

Most AI execution stacks assume three things that real enterprise environments do not provide.

**Unconstrained outbound access.** You cannot call Anthropic from inside a regulated or firewalled network. The assumption that provider APIs are always reachable is the first thing that fails.

**Cheap-by-default routing.** Every call goes to the most capable model regardless of whether the task needs it. Opus fires on tasks Gemini Flash handles at 48x lower cost. Nobody measures this. Nobody fixes it.

**Durable orchestration.** Vibe coding and RAG produce outputs. They do not produce validated, deployed artifacts with logged reward signal, failure records, and cross-task learning baked in. That loop is missing from every generation-only tool.

> The gap is not smarter generation. It is the execution infrastructure around generation.

---

### 02 / THE PRODUCT

## Erebus Edge

**Model-agnostic AI execution mesh for lean operators and enterprise teams.**

Erebus Edge thin-slices work into tasks with explicit schema, routes each task to the cheapest capable model arm using stacked multi-armed bandits trained on end-to-end SWU cost, executes through stateless workers and isolated sandboxes, and writes reward signal back into routing. The system learns. It heals. It does not require a team to operate.

| Layer | What it does |
|---|---|
| **Ingest** | Plans and specs thin-sliced into tasks. Relationships, priorities, blockers made explicit. No ambiguity reaches the executor. |
| **Store** | Agentic-first task store. Self-healing. HITL escalation trends toward zero. |
| **Route** | LinUCB MAB selects model × prompt path per task type. Cheap-tier first. Winners reinforce. Losers prune. |
| **Execute** | Stateless workers. Edge runtimes. MicroVM sandboxes. Scale-to-zero on idle. Scale-to-thousands on demand. |
| **Observe** | Event store, trace and log shipping, reward and cost ledger feeding back into routing. |

---

### 03 / ARCHITECTURE

## Five layers. Hostile-network-first.

Erebus Edge is built for the network that blocks everything.

**Perimeter** — Cloudflare Access on every surface. Zero-trust auth before any request reaches application logic. KV vault for server-side key custody. Webhook-only inbound with HMAC-SHA256 verification and 5-minute dedup TTL. No outbound provider calls from client processes.

**Control Plane** — Durable Object task store. Scheduler. Cron fleet for drift detection and maintenance. 15 scheduled jobs, 6+ Durable Objects.

**Intelligence** — LinUCB MAB router. LLM proxy behind the perimeter. Compositor bandits that run shadow operations across x-driven approach variants before committing to a strategy.

**Execution** — Fly.io worker fleet, microVM sandbox allocation, stateless handlers with zero shared mutable state. 40+ task handlers. Scale-to-zero. Scale-to-thousands.

**Observability** — Event ingest, reward/cost ledger, convergence telemetry. Every output validated before promotion.

```
~100 HTTP endpoints  ·  35+ workers  ·  6+ Durable Objects  ·  3 vector indices  ·  40+ task handlers
```

---

### 04 / DIFFERENTIATORS

## Why Erebus Edge wins where others stall.

**Hostile-network-first** — Keys server-side in KV vault. Zero-trust on every surface. Webhook-only ingress. Runs in air-gapped, regulated, or firewalled environments where most AI tooling cannot operate at all.

**Stacked MAB reward shaping** — Six reward signals compound: α reward shaping, β cache topology, γ compositor bandits, δ sandbox validation, ε horizontal scale, ζ model-agnostic routing. Each reinforces the others. Each task run sharpens the next.

**SWU-optimized routing** — Reward signal is end-to-end Successful Work Units at the lowest cost tier that delivers the required quality. Not tokens. Not latency alone. Total cost per completed unit of work.

**Compositor bandits with shadow ops** — X-driven approach variants (spec-driven, model-driven, domain-driven, contract-driven, test-driven) compete in shadow operations before the dominant strategy commits. No approach is privileged. Convergence decides.

**Horizontal scale, not headcount** — Stateless workers, edge runtimes, and ephemeral containers mean velocity ceiling is bounded by infrastructure, not people. One operator runs workloads that look like a forty-person engineering org.

---

### 05 / COMPOSITOR ECONOMICS

## 48.3× cheaper than the naive baseline.

Live evidence from a representative 5-task replay routed through Erebus Edge in April 2026.

| Metric | Compositor-routed | All-Opus baseline |
|---|---|---|
| **Total cost** | `$0.013` | `$0.642` |
| **Cost ratio** | **48.3× cheaper** | — |
| **Token savings** | **78%** — 5,610 reused, 1,850 billed | — |
| **Mean quality score** | 0.91 | 0.95 |
| **Quality delta** | −4% | baseline |
| **First-pass SWU** | 5 / 5 · 100% | — |
| **Opus selections** | 0 / 5 | 5 / 5 |

> 48× cost reduction for a 4% quality delta. The MAB rejected Opus on every routing decision in the sample.

**MAB arm roster (April 2026 pricing):** `gemini-2.5-flash` at $0.15/$0.60 per 1M, `qwen-local-7b` free, `deepseek-v3` at $0.27/$1.10 per 1M, `claude-sonnet-4-6` at $3/$15 per 1M as escalation path. Opus available but UCB-rejected in this sample. 60% of subtasks dispatched to batch queue. 75% token reuse rate across own-cache and provider prompt-cache.

---

### 06 / NVIDIA FIT

## *NVIDIA NIM slots directly into the execution mesh.*

Erebus Edge routes tasks to inference endpoints as interchangeable arms in the MAB pool. NVIDIA NIM provides containerized, GPU-backed inference that integrates without architectural changes.

**Planned use inside Erebus Edge:**

- **NIM endpoints as routing arms** — GPU-backed NIM containers registered as high-performance arms in the LinUCB pool alongside cloud API and local model arms. The MAB selects NIM when quality-per-cost reward signal favors it.
- **Prompt optimization across silicon** — Real-world reward data (SWU cost, quality score, latency) collected per NIM model arm per task class. Reward shaping trains routing priors on actual NVIDIA hardware profiles, not synthetic benchmarks.
- **On-prem and air-gapped deployment** — NIM's containerized posture is compatible with Erebus Edge's hostile-network-first architecture. Inference stays inside the perimeter. Keys never cross the boundary.
- **DGX Cloud for fine-tuning** — Longer-term: use accumulated SWU and quality data as training signal for domain-specific model fine-tuning on DGX infrastructure.
- **Hardware diversity enriches convergence** — More silicon diversity in the backend pool means richer MAB convergence data, faster routing prior maturation, and more empirical inference profiles on real NVIDIA hardware.

> The resulting workloads are not synthetic benchmarks. They are production AI execution tasks with full reward telemetry.

---
<!-- _class: nvidia -->

### 07 / TRACTION

## Production-active. Privately held. Building in the open.

**System surface (live, May 2026)**

```
~100  HTTP endpoints across control + execution tiers
 35+  Workers and Fly.io machines
  6+  Durable Objects
  15  Cron schedules
 40+  Task handlers, zero shared mutable state
  3   Vectorize indices for semantic retrieval
 12+  Service bindings
 40+  CLI scripts
```

**Public repo:** `github.com/riftroot/erebus-edge`

**Founding status:** Rift Root LLC · Fort Collins, Colorado · bootstrapped · no outside capital · no investors · no incubator · founder-led.

**Operator:** Adam — prior S6 battalion IT, process improvement, cloud infrastructure engineering, cross-domain system-of-systems architecture. The methodology is: solve the full problem once, at the gate, before it becomes someone else's emergency.

---

### 08 / THE ASK

## Resources that accelerate the learning loop.

Rift Root is bootstrapped by design. Cash dilutes. Resources compound. The ask is anything that shortens the loop between hypothesis and validated output.

| What accelerates us | Why it matters |
|---|---|
| **Compute credits** | Edge runtimes, serverless workers, sandbox burst capacity |
| **NVIDIA inference credits** | NIM arms in the MAB pool — real workloads, real reward signal |
| **Bare-metal inference access** | Silicon diversity the cloud abstracts away; enriches MAB convergence priors |
| **Storage + queue** | Cache topology and batch ingestion at scale |
| **Egress allowance** | Cross-cloud compositor traffic as the pool grows |
| **Technical partnership** | Design partners running real workloads against Erebus Edge in production |

> Rift Root LLC is a privately held, bootstrapped company with no outside capital, no investors, and no incubator. Erebus Edge is production-first AI execution infrastructure built and operated in-house by the founder. Compute access accelerates MAB learning cycles — more hardware diversity means richer convergence data and faster routing prior maturation.

**contact@riftroot.com · github.com/riftroot/erebus-edge · riftroot.com**

---
<!-- _class: title -->

### RIFT ROOT LLC · NORTHERN COLORADO · 2026

# *Erebus Edge*

### OPERATING INFRASTRUCTURE FOR NEAR-INFINITE VELOCITY

---

`contact@riftroot.com`
`github.com/riftroot/erebus-edge`
`riftroot.com`

**All systems nominal.**
