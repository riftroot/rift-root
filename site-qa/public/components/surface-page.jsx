/* global React, Nav, Footer */
const { useState, useMemo } = React;

// ─── DATA ────────────────────────────────────────────────────────────────────
const SURFACE_DATA = [
  {
    id: 'hostile',
    label: 'Hostile Network Enablement',
    accent: 'violet',
    desc: 'What lets the system operate inside firewalled / corporate-controlled networks where outbound traffic is restricted and most AI tooling fails.',
    groups: [
      {
        name: 'Cloud Vault (KV-backed secrets store)',
        entries: [
          { name: 'List vault keys',          method: 'POST',   path: '/v1/admin/secrets/status',   ref: 'route-warden.ts:124', myth: null },
          { name: 'Read individual secret',    method: 'GET',    path: '/v1/admin/secrets/read/:key',ref: 'route-warden.ts:127', myth: null },
          { name: 'Dump MCP keys',             method: 'GET',    path: '/v1/admin/secrets/mcp-keys', ref: 'route-warden.ts:126', myth: null },
          { name: 'Hot-reload secrets',        method: 'fn',     path: 'enrichConfigFromKV()',        ref: 'router-do.ts:96',    myth: null },
        ],
      },
      {
        name: 'Zero-Trust Auth (Cloudflare Access)',
        entries: [
          { name: 'CF Access service-to-service auth', method: 'env', path: 'CF_ACCESS_CLIENT_ID / CF_ACCESS_CLIENT_SECRET', ref: 'crypt-core:73', myth: null },
          { name: 'Internal Flycast routing',          method: 'net', path: 'http://bifrost-runner.flycast',                  ref: 'crypt-core:17', myth: null },
          { name: 'Proxy bearer-token auth',           method: 'env', path: 'PROXY_API_KEY',                                  ref: 'wrangler secret', myth: null },
        ],
      },
      {
        name: 'Webhook Ingest (one-way pull-through)',
        entries: [
          { name: 'GitHub push receiver', method: 'POST', path: '/webhooks/github',  ref: 'route-warden.ts:1747', myth: null },
          { name: 'Linear issue receiver',method: 'POST', path: '/webhooks/linear',  ref: 'route-warden.ts:1745', myth: null },
          { name: 'Codex events receiver',method: 'POST', path: '/webhooks/codex',   ref: 'route-warden.ts:1744', myth: null },
          { name: 'CI webhook (PR check ingest)', method: 'POST', path: '/webhook',  ref: 'bifrost-runner:5109', myth: null },
          { name: 'Webhook deduplication (5-min TTL)', method: 'KV', path: 'rune-relay', ref: '', myth: 'Rune-Relay' },
        ],
      },
      {
        name: 'Provider Keys (server-side only, never reach client)',
        entries: [
          { name: 'Anthropic / DeepSeek / Gemini / Perplexity', method: 'env', path: '*_API_KEY', ref: 'crypt-core:70', myth: null },
          { name: 'GitHub App auth (signed JWT)', method: 'env', path: 'GITHUB_APP_ID / GITHUB_PRIVATE_KEY', ref: 'crypt-core:66-68', myth: null },
          { name: 'Sprites microVM token', method: 'env', path: 'SPRITE_TOKEN', ref: 'sprite-forge:9', myth: null },
          { name: 'Grafana ingest key',    method: 'env', path: 'GRAFANA_API_KEY', ref: 'log-shipper', myth: null },
        ],
      },
    ],
  },
  {
    id: 'lifecycle',
    label: 'Task Lifecycle & Execution',
    accent: 'cyan',
    desc: 'How work enters the system, gets stored, gets routed, gets executed, and gets completed. The agentic spine.',
    groups: [
      {
        name: 'Control Plane — Task Store API (crypt-core)',
        entries: [
          { name: 'Create task',          method: 'POST',  path: '/v1/sluagh/tasks',              ref: 'route-warden.ts:97',  myth: null },
          { name: 'Search tasks',         method: 'GET',   path: '/v1/sluagh/tasks/search',       ref: 'route-warden.ts:98',  myth: null },
          { name: 'Worker poll for work', method: 'POST',  path: '/v1/worker/poll',               ref: 'route-warden.ts:106', myth: null },
          { name: 'Single-task fetch',    method: 'POST',  path: '/v1/sluagh/next',               ref: 'route-warden.ts:99',  myth: null },
          { name: 'Task state update',    method: 'PATCH', path: '/v1/sluagh/update',             ref: 'route-warden.ts:105', myth: null },
          { name: 'Worker register',      method: 'POST',  path: '/v1/worker/register',           ref: 'route-warden.ts:107', myth: null },
          { name: 'Worker heartbeat',     method: 'POST',  path: '/v1/worker/heartbeat',          ref: 'route-warden.ts:109', myth: null },
          { name: 'Worker attention (pause/run)', method: 'POST', path: '/v1/worker/attention',   ref: 'route-warden.ts:110', myth: null },
          { name: 'Fleet readiness query',method: 'POST',  path: '/v1/sluagh/ready',              ref: 'route-warden.ts:142', myth: null },
          { name: 'Worker telemetry ingest', method: 'POST', path: '/v1/sluagh/telemetry',        ref: 'route-warden.ts:165', myth: null },
          { name: 'Mark task complete',   method: 'POST',  path: '/v1/queue/complete',            ref: 'route-warden.ts:114', myth: null },
          { name: 'Stale-task GC (>30d)', method: 'POST',  path: '/v1/admin/tasks/gc',            ref: 'route-warden.ts:157', myth: null },
        ],
      },
      {
        name: 'Task Manager DurableObjects',
        entries: [
          { name: 'Task manager DO',           method: 'DO', path: 'v11 migration', ref: 'crypt-core', myth: 'WyrdWeaver' },
          { name: 'Task coordinator (Mac↔MSI)',method: 'DO', path: 'v12 migration', ref: 'crypt-core', myth: 'WyrdTether' },
          { name: 'MicroVM pool allocator',    method: 'DO', path: 'v13 migration', ref: 'crypt-core', myth: 'SpritePool' },
        ],
      },
      {
        name: 'Execution Plane — Fly.io Worker Fleet (sluagh-swarm)',
        entries: [
          { name: 'Push-job receiver',  method: 'POST', path: '/v1/push/job',      ref: 'sluagh-swarm/index.ts', myth: null },
          { name: 'Job dispatch',       method: 'POST', path: '/v1/job',           ref: 'bifrost-runner:4864', myth: null },
          { name: 'PR-check enqueue',   method: 'POST', path: '/v1/gate/enqueue',  ref: 'bifrost-runner:5040', myth: null },
          { name: 'Liveness probe',     method: 'GET',  path: '/health',           ref: 'bifrost-runner:4842', myth: null },
        ],
      },
      {
        name: 'Worker Fleet — Task Handlers',
        entries: [
          { name: 'Code-analysis handler',    method: 'handler', path: 'sluagh-swarm/handlers', ref: '', myth: 'Cairn-Coder' },
          { name: 'Architecture decomposer',  method: 'handler', path: 'arch-decomposer.ts',    ref: '', myth: null },
          { name: 'Shell-command runner',     method: 'handler', path: 'run-command-handler.ts',ref: '', myth: null },
          { name: 'URL fetch + parse',        method: 'handler', path: 'fetch-url-handler.ts',  ref: '', myth: null },
          { name: 'Test/lint verifier',       method: 'handler', path: 'verify-handler.ts',     ref: '', myth: null },
          { name: 'PR-review analyzer',       method: 'handler', path: 'review-handler.ts',     ref: '', myth: null },
          { name: 'Multi-task orchestrator',  method: 'handler', path: 'orchestrator-handler.ts',ref: '', myth: null },
          { name: 'Resource-cleanup worker',  method: 'handler', path: 'sluagh-swarm/handlers', ref: '', myth: 'Ritual-Reaper' },
          { name: 'Asset-generation bridge',  method: 'handler', path: 'sluagh-swarm/handlers', ref: '', myth: 'Forge-Phantasm' },
        ],
      },
      {
        name: 'MicroVM Sandbox — Per-task Isolated Execution (sprite-forge)',
        entries: [
          { name: 'Allocate microVM',   method: 'POST',   path: '/v1/dispatch/sprite', ref: 'route-warden.ts:780', myth: null },
          { name: 'Create instance',    method: 'POST',   path: '/create',             ref: 'sprite-forge', myth: null },
          { name: 'Lifecycle status',   method: 'GET',    path: '/:id/status',         ref: 'sprite-forge', myth: null },
          { name: 'State checkpoint',   method: 'POST',   path: '/:id/checkpoint',     ref: 'sprite-forge', myth: null },
          { name: 'Terminate instance', method: 'DELETE', path: '/:id',                ref: 'sprite-forge', myth: null },
          { name: 'Hourly orphan reaper', method: 'cron', path: '30 * * * *',          ref: 'sprite-forge:16', myth: null },
        ],
      },
      {
        name: 'Executor Dispatch — Capability Matching',
        entries: [
          { name: 'Executor inventory',      method: 'GET/POST', path: '/v1/geas/executors',      ref: 'route-warden.ts:915', myth: null },
          { name: 'Capability lookup',       method: 'GET',      path: '/v1/geas/capable',        ref: 'route-warden.ts:916', myth: null },
          { name: 'Executor telemetry',      method: 'POST',     path: '/v1/geas/observations',   ref: 'route-warden.ts:917', myth: null },
          { name: 'Circuit breaker',         method: 'GET/POST', path: '/v1/geas/breaker',        ref: 'route-warden.ts:918', myth: null },
          { name: 'Pre-dispatch validation', method: 'POST',     path: '/v1/geas/dispatch-check', ref: 'route-warden.ts:919', myth: null },
        ],
      },
    ],
  },
  {
    id: 'learning',
    label: 'Learning & Intelligence',
    accent: 'lime',
    desc: 'The MAB stack, prompt evolution, semantic indexing, alignment gating, cross-project learning. The part that compounds.',
    groups: [
      {
        name: 'Multi-Armed Bandit — LinUCB Router Admin',
        entries: [
          { name: 'Bandit state snapshot',       method: 'POST', path: '/v1/admin/bandit/status',         ref: 'route-warden.ts:168', myth: 'Void-Vein-driven' },
          { name: 'Per-arm performance',          method: 'POST', path: '/v1/admin/bandit/arm-stats',      ref: 'route-warden.ts:169', myth: null },
          { name: 'Reset individual arm',         method: 'POST', path: '/v1/admin/bandit/reset-arm',      ref: 'route-warden.ts:170', myth: null },
          { name: 'Revive dead arm',              method: 'POST', path: '/v1/admin/bandit/revive-arm',     ref: 'route-warden.ts:172', myth: null },
          { name: 'Learning analysis',            method: 'POST', path: '/v1/admin/bandit/insights',       ref: 'route-warden.ts:167', myth: null },
          { name: 'Calibration report',           method: 'POST', path: '/v1/admin/bandit/calibration',    ref: 'route-warden.ts:185', myth: null },
          { name: 'Prompt-variant A/B status',    method: 'POST', path: '/v1/admin/bandit/prompt-variants',ref: 'route-warden.ts:192', myth: null },
        ],
      },
      {
        name: 'LLM Routing & Proxy',
        entries: [
          { name: 'Chat endpoint',              method: 'POST', path: '/v1/llm/chat',                    ref: 'route-warden.ts:122', myth: 'Void-Vein' },
          { name: 'Prompt-variant generator',   method: 'proxy', path: '/v1/seed-storm/*',              ref: '', myth: 'Seed-Storm' },
          { name: 'Queue-backpressure consumer',method: 'queue', path: 'bifrost-llm-dispatch',          ref: '', myth: 'Queue-Sentinel' },
        ],
      },
      {
        name: 'Alignment Gating (NorthGate)',
        entries: [
          { name: 'Alignment validator service',method: 'proxy', path: '/v1/true-north/*',               ref: '', myth: 'True-North' },
          { name: 'Layer-1 deterministic gate', method: 'env',   path: 'NORTH_GATE_ENABLED',             ref: 'crypt-core:44', myth: null },
          { name: 'Shadow-mode logging',        method: 'env',   path: 'NORTH_GATE_SHADOW_MODE',         ref: 'crypt-core:41', myth: null },
          { name: 'Canary-task seeder',         method: 'cron',  path: '*/30 * * * *',                   ref: 'crypt-core:361', myth: null },
          { name: 'Canary validation',          method: 'POST',  path: '/v1/admin/canary/validate',       ref: 'route-warden.ts:930', myth: null },
          { name: 'Gate decision metrics',      method: 'POST',  path: '/v1/admin/gate-metrics',          ref: 'route-warden.ts:162', myth: null },
        ],
      },
      {
        name: 'Semantic Search & Vector Indices',
        entries: [
          { name: 'Episodic-memory index (768-dim cosine)',   method: 'vec', path: 'Vectorize', ref: 'crypt-core:227', myth: "Mimir's Well" },
          { name: 'Code-semantic index (384-dim cosine)',     method: 'vec', path: 'Vectorize', ref: 'crypt-core:233', myth: 'SigilSentinel' },
          { name: 'Cross-project doc index (1024-dim cosine)',method: 'vec', path: 'Vectorize', ref: 'crypt-core:239', myth: 'Tome' },
          { name: 'Doc search',            method: 'POST', path: '/v1/docs/search',         ref: 'route-warden.ts:116', myth: null },
          { name: 'Doc retrieval',         method: 'GET',  path: '/v1/docs/get',            ref: 'route-warden.ts:117', myth: null },
          { name: 'Doc inventory',         method: 'GET',  path: '/v1/docs/list',           ref: 'route-warden.ts:118', myth: null },
          { name: 'Doc ingest',            method: 'POST', path: '/v1/docs/ingest',         ref: 'route-warden.ts:119', myth: null },
          { name: 'Embedding-based query', method: 'POST', path: '/v1/docs/semantic-search',ref: 'route-warden.ts:120', myth: null },
          { name: 'Bulk doc upload',       method: 'POST', path: '/v1/admin/docs/upload',   ref: 'route-warden.ts:121', myth: null },
        ],
      },
      {
        name: 'Ingest Pipelines',
        entries: [
          { name: 'Bulk codex ingest',             method: 'POST', path: '/v1/admin/ingest',                ref: 'route-warden.ts:133', myth: null },
          { name: 'Define ingest scope',           method: 'POST', path: '/v1/admin/ingest/scope',          ref: 'route-warden.ts:132', myth: null },
          { name: 'Ingest completeness check',     method: 'POST', path: '/v1/admin/ingest/coverage',       ref: 'route-warden.ts:135', myth: null },
          { name: 'Web-research sync (Perplexity)',method: 'POST', path: '/v1/ingest/perplexity',           ref: 'route-warden.ts:136', myth: null },
          { name: 'Streaming web-research',        method: 'POST', path: '/v1/ingest/perplexity/stream',    ref: 'route-warden.ts:137', myth: null },
        ],
      },
      {
        name: 'Failure-Learning & Metacognition',
        entries: [
          { name: 'Failure-learning coach',   method: 'svc',  path: 'service binding',  ref: '', myth: 'Sage-Counsel' },
          { name: 'Weekly pattern digest',    method: 'cron', path: '0 3 * * SUN',       ref: '', myth: null },
          { name: 'Self-improvement replay',  method: 'loop', path: 'internal',          ref: '', myth: 'KarpathyLoop' },
          { name: 'Meta-cognitive engine',    method: 'svc',  path: 'internal',          ref: '', myth: 'MetaCognitor' },
          { name: 'Anti-pattern detector',    method: 'svc',  path: 'internal',          ref: '', myth: 'PatternPilgrim' },
          { name: 'Dump training data',       method: 'GET',  path: '/v1/admin/training-export', ref: 'route-warden.ts:890', myth: null },
        ],
      },
    ],
  },
  {
    id: 'observability',
    label: 'Event Sourcing & Observability',
    accent: 'amber',
    desc: 'Append-only ledger, log shipping, drift detection, telemetry. The audit trail and convergence-graph data.',
    groups: [
      {
        name: 'Event Store (Fly.io, SQLite append-only ledger)',
        entries: [
          { name: 'Event ingest',           method: 'POST', path: '/v1/events',        ref: 'annals-of-ankou:fly', myth: 'Annals-of-Ankou' },
          { name: 'Historical query',       method: 'GET',  path: '/v1/events/query',  ref: 'annals-of-ankou:fly', myth: null },
          { name: 'Monthly archival',       method: 'cron', path: '0 0 1 * *',         ref: 'annals-of-ankou:wrangler:40', myth: null },
          { name: 'MSI heartbeat relay',    method: 'POST', path: '/v1/events/relay',  ref: 'handlers/events-relay.ts:9', myth: null },
        ],
      },
      {
        name: 'Trace & Log Shipping',
        entries: [
          { name: 'CF Trace Tail consumer', method: 'worker', path: 'tail consumer',  ref: '', myth: 'Specter-Spout' },
          { name: 'OTLP transformation',    method: 'worker', path: 'index.ts',       ref: '', myth: 'Specter-Spout' },
          { name: 'Grafana Cloud publish',  method: 'worker', path: 'Grafana push',   ref: '', myth: 'Specter-Spout' },
          { name: 'Metrics collector',      method: 'sidecar',path: 'Grafana-Alloy',  ref: '', myth: 'Grafana-Alloy' },
        ],
      },
      {
        name: 'Drift Detection',
        entries: [
          { name: 'CLAUDE.md lifecycle manager', method: 'proxy', path: '/v1/context-keepr/*', ref: '', myth: 'Context-Keepr' },
          { name: 'Drift-detection cron',        method: 'cron',  path: '0 */6 * * *',         ref: '', myth: null },
          { name: 'Dependency intelligence',     method: 'cron',  path: '0 */6 * * *',         ref: '', myth: 'Lore-Watcher' },
          { name: 'Breaking-change risk API',    method: 'GET',   path: '/v1/admin/lore-sentinel/risks', ref: 'route-warden.ts:884', myth: 'LoreSentinel' },
          { name: 'Test-flake detector',         method: 'svc',   path: 'internal',             ref: '', myth: 'Drift-Warden' },
        ],
      },
      {
        name: 'Cost & Efficiency Telemetry',
        entries: [
          { name: 'Reward/cost ledger',        method: 'DO',       path: 'D1 bifrost-db',              ref: 'crypt-core:220', myth: 'Doom-Dealer' },
          { name: 'Efficiency report',         method: 'POST',     path: '/v1/admin/efficiency',       ref: 'route-warden.ts:181', myth: null },
          { name: 'Provider health uptime',    method: 'GET/POST', path: '/v1/admin/providers/health', ref: 'route-warden.ts:146', myth: null },
          { name: 'Health-probe reset',        method: 'POST',     path: '/v1/admin/providers/health/reset', ref: 'route-warden.ts:147', myth: null },
          { name: 'Active health poll',        method: 'POST',     path: '/v1/admin/providers/health/poll',  ref: 'route-warden.ts:148', myth: null },
          { name: 'DO storage stats',          method: 'POST',     path: '/v1/admin/do-storage-stats',  ref: 'route-warden.ts:941', myth: null },
        ],
      },
      {
        name: 'Headless Rendering (visual capture for audit)',
        entries: [
          { name: 'Rendering consumer',     method: 'worker', path: 'headless consumer', ref: '', myth: 'Scry-Loom' },
          { name: 'PDF capture worker',     method: 'worker', path: 'pdf output',        ref: '', myth: 'Veil-PDFCaster' },
          { name: 'Screenshot worker',      method: 'worker', path: 'png output',        ref: '', myth: 'Veil-Screenshotter' },
          { name: 'Media-analysis cache',   method: 'DO',     path: 'DurableObject',     ref: '', myth: 'VisionCache' },
          { name: 'Media metadata index',   method: 'DO',     path: 'DurableObject',     ref: '', myth: 'VisionIndexer' },
        ],
      },
    ],
  },
  {
    id: 'operator',
    label: 'Operator Console',
    accent: 'rose',
    desc: 'Admin endpoints, CLI scripts, dashboards, governance, project onboarding, recovery tooling. Everything a human reaches for.',
    groups: [
      {
        name: 'Governance & Policy (NemesisDO + access control)',
        entries: [
          { name: 'Policy DO (rate limit + ACL)', method: 'DO',       path: 'DO binding',                ref: 'crypt-core', myth: 'NemesisDO' },
          { name: 'Policy rules',                method: 'GET/POST',  path: '/v1/admin/nemesis/rules',   ref: 'route-warden.ts:798', myth: null },
          { name: 'Rule-set evaluation',         method: 'POST',      path: '/v1/admin/nemesis/evaluate',ref: 'route-warden.ts:799', myth: null },
        ],
      },
      {
        name: 'Worker Fleet Controls',
        entries: [
          { name: 'Mode (run/pause/drain)',  method: 'POST', path: '/v1/admin/swarm/mode',    ref: 'route-warden.ts:144', myth: null },
          { name: 'Fleet health snapshot',  method: 'POST', path: '/v1/admin/swarm/status',  ref: 'route-warden.ts:145', myth: null },
          { name: 'Pending-work depth',     method: 'POST', path: '/v1/admin/swarm/capacity',ref: 'route-warden.ts:166', myth: null },
        ],
      },
      {
        name: 'Stuck-Task Recovery',
        entries: [
          { name: 'Re-enqueue stuck tasks',    method: 'POST', path: '/v1/admin/attention/recycle',    ref: 'route-warden.ts:158', myth: null },
          { name: 'Restore from snapshot',     method: 'POST', path: '/v1/admin/attention/rehydrate',  ref: 'route-warden.ts:159', myth: null },
          { name: 'Pause processing',          method: 'POST', path: '/v1/admin/attention/freeze',     ref: 'route-warden.ts:160', myth: null },
          { name: 'Resume processing',         method: 'POST', path: '/v1/admin/attention/thaw',       ref: 'route-warden.ts:161', myth: null },
          { name: 'Real-time orphan watchdog', method: 'svc',  path: 'real-time listener',             ref: '', myth: 'MorriganMidnight' },
          { name: 'Orphan detector',           method: 'svc',  path: 'internal',                       ref: '', myth: 'WraithHunter' },
          { name: 'Orphan reaper',             method: 'svc',  path: 'internal',                       ref: '', myth: 'WraithGrim' },
          { name: 'Stuck-task recycler',       method: 'svc',  path: 'internal',                       ref: '', myth: 'AttentionRecycler' },
        ],
      },
      {
        name: 'Architecture Decomposition',
        entries: [
          { name: 'Ingest repo architecture',   method: 'POST', path: '/v1/admin/arch/ingest',           ref: 'route-warden.ts:805', myth: null },
          { name: 'List approved plans',        method: 'GET',  path: '/v1/admin/arch/plans',            ref: 'route-warden.ts:806', myth: null },
          { name: 'Approve plan (human review)',method: 'POST', path: '/v1/admin/arch/approve',          ref: 'route-warden.ts:807', myth: null },
          { name: 'Plan-refinement feedback',   method: 'POST', path: '/v1/admin/arch/feedback',         ref: 'route-warden.ts:808', myth: null },
          { name: 'Pending decompose work',     method: 'GET',  path: '/v1/admin/arch/pending-decompose',ref: 'route-warden.ts:809', myth: null },
        ],
      },
      {
        name: 'Project Onboarding',
        entries: [
          { name: 'Wire new repo',          method: 'POST', path: '/v1/admin/project/onboard', ref: 'route-warden.ts:802', myth: null },
          { name: 'List registered projects', method: 'GET',path: '/v1/admin/project/list',   ref: 'route-warden.ts:803', myth: null },
        ],
      },
      {
        name: 'Batch Jobs & Manual Operations',
        entries: [
          { name: 'Batch create',          method: 'POST', path: '/v1/admin/batch',        ref: 'route-warden.ts:123', myth: null },
          { name: 'Batch progress',        method: 'POST', path: '/v1/admin/batch/status', ref: 'route-warden.ts:180', myth: null },
          { name: 'Task review escalation',method: 'POST', path: '/v1/manual-review',      ref: 'route-warden.ts:938', myth: null },
          { name: 'Archived-task purge',   method: 'POST', path: '/v1/admin/grim-sweep',   ref: 'route-warden.ts:182', myth: null },
        ],
      },
    ],
  },
];

// ─── HEADLINE STATS ────────────────────────────────────────────────────────
const STATS = [
  { label: 'HTTP endpoints', value: '~100' },
  { label: 'Workers / Fly machines', value: '35+' },
  { label: 'Durable Objects', value: '6+' },
  { label: 'Cron schedules', value: '15' },
  { label: 'Task handlers', value: '40+' },
  { label: 'Vectorize indices', value: '3' },
  { label: 'Service bindings', value: '12+' },
  { label: 'CLI scripts', value: '40+' },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────
function methodBadge(method) {
  const cls = {
    GET: 'badge-get', POST: 'badge-post', PATCH: 'badge-patch',
    DELETE: 'badge-delete', 'GET/POST': 'badge-getpost',
    cron: 'badge-cron', DO: 'badge-do', KV: 'badge-kv',
    vec: 'badge-vec', env: 'badge-env', svc: 'badge-svc',
    handler: 'badge-handler', queue: 'badge-queue',
    worker: 'badge-worker', sidecar: 'badge-sidecar',
    proxy: 'badge-proxy', fn: 'badge-fn', net: 'badge-net',
    loop: 'badge-svc',
  }[method] || 'badge-default';
  return React.createElement('span', { className: `surface-badge ${cls}` }, method);
}

function entryMatches(e, q) {
  if (!q) return true;
  const hay = [e.name, e.path, e.ref, e.myth || '', e.method].join(' ').toLowerCase();
  return hay.includes(q);
}

function groupMatches(g, q) {
  if (!q) return true;
  if (g.name.toLowerCase().includes(q)) return true;
  return g.entries.some(e => entryMatches(e, q));
}

function categoryMatches(cat, q) {
  if (!q) return true;
  if (cat.label.toLowerCase().includes(q) || cat.desc.toLowerCase().includes(q)) return true;
  return cat.groups.some(g => groupMatches(g, q));
}

// ─── COMPONENTS ──────────────────────────────────────────────────────────

function EntryRow({ entry }) {
  return React.createElement('tr', { className: 'surface-row' },
    React.createElement('td', { className: 'surface-cell-name' },
      React.createElement('span', { className: 'entry-name' }, entry.name),
      entry.myth && React.createElement('span', { className: 'entry-myth' }, ` (${entry.myth})`),
    ),
    React.createElement('td', { className: 'surface-cell-method' }, methodBadge(entry.method)),
    React.createElement('td', { className: 'surface-cell-path' },
      React.createElement('code', { className: 'entry-path' }, entry.path)
    ),
    React.createElement('td', { className: 'surface-cell-ref' },
      React.createElement('span', { className: 'entry-ref' }, entry.ref)
    ),
  );
}

function SubGroup({ group, query }) {
  const visibleEntries = query
    ? group.entries.filter(e => entryMatches(e, query))
    : group.entries;

  if (visibleEntries.length === 0) return null;

  return React.createElement('div', { className: 'surface-subgroup' },
    React.createElement('h4', { className: 'subgroup-title' }, group.name),
    React.createElement('div', { className: 'surface-table-wrap' },
      React.createElement('table', { className: 'surface-table' },
        React.createElement('tbody', null,
          visibleEntries.map((e, i) =>
            React.createElement(EntryRow, { key: i, entry: e })
          )
        )
      )
    )
  );
}

function CategorySection({ cat, query }) {
  const [open, setOpen] = React.useState(true);

  const visibleGroups = query
    ? cat.groups.filter(g => groupMatches(g, query))
    : cat.groups;

  if (query && !categoryMatches(cat, query)) return null;

  const totalEntries = cat.groups.reduce((s, g) => s + g.entries.length, 0);

  return React.createElement('section', { className: `surface-category accent-${cat.accent}`, id: cat.id },
    React.createElement('button', {
      className: 'category-header',
      onClick: () => setOpen(o => !o),
      'aria-expanded': open,
    },
      React.createElement('div', { className: 'category-header-left' },
        React.createElement('span', { className: `category-dot dot-${cat.accent}` }),
        React.createElement('h3', { className: 'category-title' }, cat.label),
      ),
      React.createElement('div', { className: 'category-header-right' },
        React.createElement('span', { className: 'category-count' }, `${totalEntries} surfaces`),
        React.createElement('span', { className: `category-chevron ${open ? 'is-open' : ''}` }, open ? '▲' : '▼'),
      ),
    ),
    open && React.createElement('div', { className: 'category-body' },
      React.createElement('p', { className: 'category-desc' }, cat.desc),
      visibleGroups.map((g, i) =>
        React.createElement(SubGroup, { key: i, group: g, query })
      )
    )
  );
}

function SurfacePage() {
  const [query, setQuery] = React.useState('');
  const q = query.trim().toLowerCase();

  const totalEntries = SURFACE_DATA.reduce(
    (s, cat) => s + cat.groups.reduce((gs, g) => gs + g.entries.length, 0), 0
  );

  return React.createElement('div', { className: 'surface-page' },
    React.createElement(Nav, { mode: 'page' }),

    React.createElement('div', { className: 'surface-hero' },
      React.createElement('div', { className: 'surface-hero-inner' },
        React.createElement('p', { className: 'surface-eyebrow' }, 'Erebus Edge'),
        React.createElement('h1', { className: 'surface-title' }, 'Surface'),
        React.createElement('p', { className: 'surface-lede' },
          'What runs Erebus Edge — every endpoint, worker, DO, cron, handler. ',
          React.createElement('strong', null, `${totalEntries} entries`),
          ' across 5 layers.'
        ),
        React.createElement('div', { className: 'surface-stats' },
          STATS.map(s =>
            React.createElement('div', { key: s.label, className: 'stat-chip' },
              React.createElement('span', { className: 'stat-value' }, s.value),
              React.createElement('span', { className: 'stat-label' }, s.label),
            )
          )
        ),
      ),
    ),

    React.createElement('div', { className: 'surface-search-bar' },
      React.createElement('div', { className: 'surface-search-inner' },
        React.createElement('span', { className: 'search-icon' }, '⌕'),
        React.createElement('input', {
          type: 'search',
          className: 'surface-search',
          placeholder: 'Filter by name, path, ref, or category…',
          value: query,
          onChange: e => setQuery(e.target.value),
          spellCheck: false,
          autoComplete: 'off',
        }),
        q && React.createElement('button', {
          className: 'search-clear',
          onClick: () => setQuery(''),
          'aria-label': 'Clear search',
        }, '×'),
      ),
    ),

    React.createElement('div', { className: 'surface-body' },
      SURFACE_DATA.map(cat =>
        React.createElement(CategorySection, { key: cat.id, cat, query: q })
      ),
      q && !SURFACE_DATA.some(cat => categoryMatches(cat, q)) &&
        React.createElement('p', { className: 'surface-no-results' },
          `No results for "${query}". Try a path fragment or myth name.`
        )
    ),

    typeof Footer !== 'undefined' && React.createElement(Footer, null)
  );
}
