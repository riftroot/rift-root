# Rift Root GitHub Org: Build Plan

## Completed

- ✓ Phase 0 — Org setup (riftroot org created, avatar set, website linked)
- ✓ Phase 1 — erebus-edge repo created, pinned, topics set, closed-source
- ✓ Phase 2 — README sections 1-7 written and live
- ✓ Phase 3 — Mermaid diagram implemented
- ✓ Org profile repo `.github/profile/README.md` deployed

---

## Phase 0 — Org Setup (completed 2026-04-28)

### Create the org
- Username: `riftroot`
- Display name: `Rift Root LLC`
- Avatar: your logo (same as riftroot.com)
- Website: `https://riftroot.com`
- Description: `Sovereign AI execution infrastructure. Bootstrapped. Northern Colorado.`

### Create the org profile repo
Repo name must be exactly `.github`. Inside it, create `profile/README.md`.

Contents of `profile/README.md`:

```markdown
## Rift Root LLC

Building Erebus Edge — sovereign AI execution infrastructure for hostile networks.  
Agentic-first. MAB-optimized. Bootstrapped from Northern Colorado.

[riftroot.com](https://riftroot.com)
```

Nothing else. No badges, no shields, no contribution graphs.

---

## Phase 1 — The `erebus-edge` Repo (the real work)

### Repo settings
- Name: `erebus-edge`
- Description: `Sovereign AI execution mesh. Agentic-first. MAB-optimized routing. Closed-source.`
- Website: `https://riftroot.com`
- Topics: `ai-infrastructure`, `multi-armed-bandit`, `agentic`, `llm-routing`, `edge-computing`
- No wiki. No issues (disable). No discussions. No packages.
- Pin this repo to the org profile.

---

## Phase 2 — README.md Structure (in full)

### Section 1: Header block

```markdown
# Erebus Edge

Sovereign AI execution infrastructure for environments that resist it.

> Secrets bootstrap at runtime, live in-memory, and die with the process.  
> The right system absorbs the friction so the operator does not have to.
```

One H1. Two pull quotes. No badges. No shields. No "build passing" widgets.

---

### Section 2: What It Is (one paragraph)

```markdown
## What it is

Erebus Edge is an autonomous execution mesh that operates inside firewalled,
restricted, or hostile networks — corporate environments where outbound traffic
is locked down and most AI tooling fails before it starts. It bridges isolated
networks to the global LLM ecosystem through a decentralized mesh of edge
workers and high-compute execution tiers, driven by an agentic spine that plans,
routes, executes, heals, and reports without a human in the loop.
```

---

### Section 3: The Diagram

See full diagram specification below. Insert here as a fenced code block
using standard ASCII, or as an embedded SVG if you want it to render on GitHub.

---

### Section 4: How It Works (five pipeline stages)

```markdown
## How it works

**Ingest** — A plan, spec, README, domain model, or API schema enters the system.
The compositor bandit selects the driven approach for the task class and
decomposes the work into thin-sliced tasks with explicit schema: relationships,
priorities, and blockers resolved before anything executes.

**Store** — Tasks live in a purpose-built agentic task store, not a ticketing tool.
Self-healing and automatic failover minimize human-in-the-loop escalation.
The store is the system of record for every active and historical workstream.

**Route** — A LinUCB multi-armed bandit selects the model and prompt path for
each task type. Cheap-tier first-pass success earns maximum reward. Escalation
is penalized. Winners reinforce. The system learns which intelligence to apply
to which problem and gets measurably better at that decision with every run.

**Execute** — Stateless serverless workers, edge runtimes, and sandboxed
containers run the work horizontally. Scale-to-zero on idle. Scale-to-thousands
on demand. A stall detection watchdog reaps hung processes before they burn
compute. Crash context carries forward into retries so the system learns from
failure, not just success.

**Cache** — Right-sized context with no bloat and no rot. Nothing is computed
twice. Feeds back into ingest so the system remembers what it already knows.
```

---

### Section 5: What Makes It Different

```markdown
## What makes it different

Generation alone is not enough. RAG and CAG solve retrieval and context
management — they make generation better-informed. They do not solve
orchestration, cost optimization, failure recovery, or cross-task learning.
A system that generates well but routes naively, retries dumbly, and forgets
everything between runs is still expensive and fragile.

The MAB stack operates at a different layer. It is not a smarter prompt router.
It is a learning system that accumulates reward signal across every task class,
every model arm, and every cost tier, then uses that history to make better
dispatch decisions over time. RAG improves what the model knows. The MAB
improves which model you ask and what you pay for the answer. Those compound
differently.

The north star metric is SWU cost — Successful Work Unit cost. A SWU is a task
that completes end-to-end, on the first attempt, at the cheapest tier the
bandit selected, with no retries, no escalations, and no human intervention.
As Erebus Edge matures, SWU cost trends downward and SWU rate trends toward one.
That trajectory is the convergence graph that makes the system's intelligence
legible. It is also what separates this from vibe coding: Erebus Edge is not
generating and hoping. It is learning which intelligence to apply to which
problem and getting measurably better at that decision with every run.
```

---

### Section 6: Status

```markdown
## Status

**Active development · Private implementation**

Core routing intelligence and execution mesh are operational. This repository
documents architecture and design decisions. Implementation is closed-source.

Seeking compute credits, inference budgets, hardware diversity, and design
partnerships that accelerate maturation of the MAB convergence data.
[riftroot.com](https://riftroot.com)
```

---

### Section 7: Resource Partnerships

```markdown
## Resource partnerships

Rift Root is bootstrapped by design. Cash dilutes; resources compound.

Compute credits, inference budgets across multi-vendor model arms, hardware
diversity (silicon variety enriches MAB convergence data), storage, egress
allowance, and design partners with real workloads — anything that shortens
the loop between hypothesis and validated output. The resulting workloads
stay where they run.

Developer programs, infrastructure credit programs, and hardware access
inquiries: [contact@riftroot.com](mailto:contact@riftroot.com)
```

---

## Phase 3 — The Diagram Specification

### What it must show

The diagram communicates three things in one image:
1. Work enters in multiple shapes (spec, model, README, schema)
2. A learning intelligence layer selects approach and routes to the right model
3. The reward signal closes the loop back into the intelligence layer

### ASCII version (renders in any markdown)

```
                    ┌─────────────────────────────────────────┐
                    │           EREBUS EDGE                   │
                    └─────────────────────────────────────────┘

  WORK ARRIVES                    INTELLIGENCE                  OUTPUT
  ───────────                    ─────────────                  ──────

  spec doc ──────┐
  domain model ──┤          ┌─────────────────┐
  README ────────┼─────────▶│  COMPOSITOR     │
  API schema ────┤          │  BANDIT         │──── task graph ────┐
  failing tests ─┤          │                 │                    │
  feature list ──┘          │  approach select│                    ▼
                            │  shadow ops     │           ┌────────────────┐
                            │  MAB variants   │           │    EXECUTE     │
                            └────────┬────────┘           │                │
                                     │                    │  stateless     │
                            ┌────────▼────────┐           │  workers       │
                            │  ROUTING MAB    │           │  edge runtimes │
                            │                 │           │  sandboxed     │
                            │  arm 1 cheap ◀──│──select   │  containers    │
                            │  arm 2 mid      │           └───────┬────────┘
                            │  arm 3 frontier │                   │
                            │  arm 4 local    │                   ▼
                            │  arm 5 ...      │           ┌────────────────┐
                            └─────────────────┘           │   VALIDATE     │
                                     ▲                    │   + SHIP       │
                                     │                    └───────┬────────┘
                            ┌────────┴────────┐                   │
                            │  REWARD LAYER   │◀──────────────────┘
                            │                 │
                            │  SWU cost ──────│──▶ convergence
                            │  first-pass rate│    graph
                            │  escalation log │
                            └─────────────────┘
```

### SVG version guidance (renders as image on GitHub)

If you want it to render as a proper visual rather than ASCII:
- Use a dark background (`#0d1117` -- GitHub dark mode surface)
- Three columns: inputs left, intelligence center, output right
- Compositor bandit and routing MAB as two distinct rounded rect nodes
  in the center column, connected vertically
- Reward layer at the bottom with an upward arrow back to routing MAB
- Input types as small pill labels on the left, connected by lines
- Output stages (Execute, Validate, Ship) stacked on the right
- Primary color for active/selected elements: teal (`#4f98a3`)
- Muted color for inactive arms: `#393836`
- Arrow from reward layer back up to routing MAB should be a different
  color (gold `#e8af34`) to signal it is the learning loop, not the
  execution path

Tools to build the SVG: Excalidraw (export as SVG), Mermaid (GitHub
renders natively), or hand-write the SVG if you want full control.

### Mermaid version (zero tooling, GitHub renders natively)

```
graph TD
    A[spec / model / README / schema] --> B[COMPOSITOR BANDIT
selects approach · runs shadow ops]
    B --> C[ROUTING MAB
cheap-tier first · UCB selection]
    C --> D[EXECUTE
stateless workers · edge · sandboxed]
    D --> E[VALIDATE + SHIP]
    E --> F[REWARD LAYER
SWU cost · first-pass rate · escalation log]
    F -->|learning loop| C
```

Wrap in triple backtick mermaid fences and GitHub renders it as a diagram
automatically. No image file needed.

---

## Phase 4 — Sequencing

| Task | Time estimate | Blocks |
|------|--------------|--------|
| Create org + avatar | 15 min | everything |
| `.github` profile README | 15 min | org landing page |
| Create `erebus-edge` repo, set topics | 10 min | README |
| Write README sections 1-2 | 30 min | diagram |
| Build Mermaid diagram | 20 min | section 3 |
| Write README sections 4-7 | 45 min | nothing |
| Pin repo, verify org page | 10 min | site link |
| Update riftroot.com GitHub link | 5 min | done |

Total: under 3 hours to a credible, complete org presence.
