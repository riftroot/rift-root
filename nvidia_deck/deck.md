---
marp: true
theme: erebus
paginate: true
size: 16:9
title: Erebus Edge — NVIDIA Inception
description: Rift Root LLC — operating infrastructure for the one-person systems shop
author: Adam — Rift Root LLC
---

<!-- _class: title -->

![bg right:38% w:360](assets/rift-root-logo.svg)

### Rift Root LLC · Northern Colorado · 2026

# *Erebus Edge*

#### Operating infrastructure for the one-person systems shop

NVIDIA Inception application — May 2026

---

### the problem

# You can't call Anthropic from inside a regulated network.

Most teams who would benefit from agentic AI **work behind firewalls**: hospitals, banks, defense contractors, government, OT environments. Their networks egress only to vetted vendors. The hostable LLM endpoints are blocked, the SaaS chat tools are blocked, and credentials cannot leave.

The current options are:

- **Wait** for procurement to approve a single SaaS vendor (12–18 months).
- **Self-host one model** on whatever GPU is available — and lose every other model.
- **Operate a personal stack** outside the firewall and reach back through it.

Erebus Edge is the third option, productized.

---

### the system

# Erebus Edge is a five-layer execution mesh.

| Layer | What it does |
|---|---|
| **Edge access** | Cloudflare Workers + Tunnel — egress-only from hostile networks, no inbound holes, no VPN. |
| **Control plane** | `crypt-core` — request routing, governance, secrets resolution, event sourcing (`annals-of-ankou`). |
| **Routing** | Stacked Multi-Armed Bandit over a unified pool of inference arms — providers, models, regions, and self-hosted endpoints all compete on observed reward. |
| **Execution plane** | `sluagh-swarm` on Fly.io — handler registry, push/poll hybrid, machine-level autoscale. |
| **Local LLM host** | MSI / RTX node on Tailscale — same arm interface as cloud providers. |

The user gets one URL through their work browser. Everything else is mesh.

---

### the architecture

# Production today, not a prototype.

- ~**100 endpoints** across the control + execution planes.
- **35+ Cloudflare Workers**, **6 Durable Objects**, **15 cron triggers**, **40+ handlers**.
- Event-sourced audit log: every routing decision, every reward, every governance check is replayable.
- Zero-local-secrets architecture — secrets resolve from a KV vault per-request, never written to disk.
- Pre-push gates: lint, type, secret scan, dry-run deploy. Nothing ships untested.

> Erebus Edge is **already deployed and serving traffic**. The Inception ask is about scaling what works — not building from scratch.

---

<!-- _class: two-col -->

### why this is different

# Six pillars — operational, not aspirational.

| Pillar | Operational definition |
|---|---|
| **Α — Hostile-network-first** | Egress-only architecture; deploys behind any firewall that allows HTTPS. The default for regulated work, not an enterprise add-on. |
| **Β — Provider-agnostic**     | Every model is an *arm*. Anthropic, OpenAI, Google, DeepSeek, Groq, Fireworks, NIM, local — same interface, same reward signal. |
| **Γ — Observed cost discipline** | Routing optimizes on **logged reward per dollar**, not list price or vibe. The bandit kills its own bad bets. |
| **Δ — Event-sourced governance** | Every decision is replayable. Audits, regressions, and counterfactuals are queries, not investigations. |
| **Ε — One-person operable**   | Designed for a sole operator with a tmux session and a keychain. No on-call rotation, no Kubernetes. |
| **Ζ — Reward-driven exploration** | Thompson Sampling with cold-start priors and circuit breakers. New models earn traffic by performing, not by marketing budget. |

---

<!-- _class: stats -->

### the evidence — production replay

# *48.3×*

cost reduction vs. always-Opus baseline · **78%** of traffic absorbed by smaller arms · **0.91** posterior-mean quality on the dominant arm · **zero** Opus selections under the trained policy

These are logged outputs from `annals-of-ankou`, not projections. The replay window covered real production tasks — coding, research, routing, governance — with the bandit choosing arms blind to provider identity.

---

<!-- _class: nvidia -->

### the NVIDIA fit

# What we want · what NVIDIA gets.

**The ask** — *not money*

- **DGX Cloud or NIM credits** — promote NIM endpoints into the arm pool; let the bandit decide where they win.
- **Hardware diversity** — a small RTX-class node loan to deepen the local-arm story for hostile-network customers who can colocate.
- **Inception network access** — enterprise + government pilots inside regulated networks.

**The exchange** — *real telemetry, not benchmarks*

- Per-task reward, latency, cost, and quality logs flowing back, scoped to NIM arms.
- A drop-in integration: NIM slots into the MAB arm pool with **zero architectural changes** — Erebus Edge already treats inference endpoints as interchangeable arms.
- A field-deployed reference for "NVIDIA inference inside a hostile network."

---

### traction · founder

# The system, the operator, the method.

| Dimension | Today |
|---|---|
| **Surface**     | ~100 endpoints · 35+ Workers · 6 DOs · 15 crons · 40+ handlers — all live, observable, event-sourced. |
| **Throughput**  | Production routing across 6+ providers and a local RTX node. Replay shows 48.3× cost reduction at parity quality. |
| **Operator**    | Adam — sole founder, Rift Root LLC. **S6** uptime-first methodology: every change is reversible, every system is observable, every decision is logged. |
| **Background**  | Years operating production systems where downtime is the only metric that matters. Built Erebus Edge to do agentic AI under those same constraints. |
| **Company**     | Rift Root LLC — Northern Colorado, founded 2026, bootstrapped, no outside capital sought. |

---

<!-- _class: title -->

![bg right:38% w:360](assets/rift-root-logo.svg)

### thank you

# *Let's run real workloads.*

#### Adam · Rift Root LLC

`mock1ng@pm.me` · `riftroot.com` · `github.com/riftroot`

Erebus Edge is ready to take NIM arms today.
