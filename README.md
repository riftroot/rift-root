# rift · erebus edge demo

Live event-stream visualization of the **erebus edge compositor** — the
LLM routing / MAB execution layer in the [bifrost-bridge](https://github.com/) ecosystem.

This is a **vanilla HTML/CSS/JS** surface (no build step) that consumes a
structured event stream from the compositor and animates the five-stage
pipeline:

```
ingest → decompose → route + execute → reward → complete
```

Each stage lights up as its event lands. The `route` stage shows the MAB
arms with live UCB scores; the selected arm highlights and its UCB bar
fills via the golden easing curve.

## Running

```bash
# any static server works
python3 -m http.server 8000
# then open http://localhost:8000
```

The demo replays `events.json` via `setTimeout` chains spaced by the real
`ts` deltas. To wire to a live stream from `annals-of-ankou`, swap the
`loadEvents()` / replay loop in `app.js` for an `EventSource` against
`/api/erebus/stream`. The DOM contract is identical.

## Files

| File | Role |
|---|---|
| `index.html` | Five pipeline stages + sidecar event log |
| `styles.css` | Design tokens, golden easing, oklch-mixed surfaces |
| `app.js`     | Event consumer (replay or SSE) |
| `events.json` | Sample event stream (replay source) |

## Event shape

```json
{ "ts": 1714175400123, "event": "route",
  "subtask": "synthesize:matrix",
  "arm": "claude-sonnet-4-6", "tier": "mid", "ucb_score": 0.91 }
```

Supported events: `ingest`, `decompose`, `route`, `execute`, `reward`,
`complete`. See `events.json` for a full demo trace.

## Brand

Logo and palette derived from the rift mark in `brand/logo/`.
Accent colors: `#4d0861` (deep) / `#7a18a0` (primary) / `#d8b4fe` (soft).
