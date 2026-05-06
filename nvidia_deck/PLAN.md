# Marp Resources

## Core repos

- **github.com/marp-team/marp** — The entrance repo. Not where you install anything, but where roadmap discussions, the website source, and the awesome list link all live. Start here for orientation.
- **github.com/marp-team/marp-cli** — The tool you actually run. Everything about CLI flags, Docker image (`ghcr.io/marp-team/marp-cli`), config files (`marp.config.mjs`), and the `--theme` flag is documented in this README. Current stable is v4.x, requires Node 18+.
- **github.com/marp-team/marp-core** — The converter under the CLI. Adds math, auto-scaling, syntax highlighting, and built-in themes on top of Marpit. Useful if you ever want to control script injection mode or tweak rendering behavior.
- **github.com/marp-team/marpit** — The base framework that marp-core builds on. This is where all CSS theme authoring rules live. The `/* @theme name */` declaration, how `section` maps to a slide, how `_class` directives work, background shorthand syntax, all of it. The docs at marpit.marp.app are the canonical reference for writing themes.

## Documentation

- **marpit.marp.app** — Theme authoring, slide directives (`<!-- _class: -->`, `<!-- _backgroundColor: -->`), image syntax (`![bg]`, `![w:500]`), fragmented lists (`* item`), all of it. This is the page you tab back to while writing the CSS.
- **marpit.marp.app/directives** — Direct link to the directives reference. The two directive types are global (set in frontmatter, apply to whole deck) and local (set in HTML comments, apply per-slide). `_class` is a local directive. `paginate`, `theme`, `size` are global.
- **github.com/marp-team/marp-cli/releases** — Release notes. Worth checking if a PDF export breaks; Chromium path issues and `--browser` flag changes appear here first.

## Community themes and examples

- **github.com/marp-team/awesome-marp** — Curated list. Most useful entries for your use case: Cybertopia (dark, high-contrast, good reference for how a custom dark theme wires together), marpstyle (multiple themes, well-structured CSS, good to read source), Neobeam (modern LaTeX Beamer look, useful if you ever need an academic variant).
- **awesome.ecosyste.ms/lists/marp-team/awesome-marp** — Browsable version of the same list with ecosystem metadata. Use this to find repos that are still actively maintained.
- **chris-ayers.com/posts/customizing-marp** — The clearest external writeup of built-in theme structure (Default, Gaia, Uncover), how to override them with `@theme`, and per-slide class overrides. Good first read before touching theme CSS.

## VS Code

**Marp for VS Code** — `ext install marp-team.marp-vscode` in the extensions panel. Gives you live preview as you type the `.md` file. The fastest feedback loop for layout debugging. You can also export to PDF directly from the command palette without touching the CLI.

---

# The Plan, End to End, in Words

The goal of this deck is a single PDF artifact that you attach to the NVIDIA Inception application. That is the only deliverable that matters. Everything else, the HTML, the PPTX, the live preview, is scaffolding.

The audience is one program manager at NVIDIA who is reading dozens of applications. They are not going to read your website. They are going to open this PDF, spend maybe ninety seconds on it, and decide whether you understand what you are building well enough to belong in their program. The job of the deck is to answer three questions fast: what is this, why does it matter, and why does NVIDIA specifically help.

The deck answers those three questions across nine slides. The opening slide establishes the company, the name, and the context, so the reviewer knows immediately this is an Inception application from a real, registered company. The second slide states the problem in plain language without academic framing, because your problem is concrete and operational and does not need abstraction. You cannot call Anthropic from inside a regulated network. That is a sentence a program manager understands in half a second. The third slide describes the product as a system, not a product listing, because Erebus Edge is infrastructure and should be introduced the way infrastructure people introduce things: here are the layers, here is what each one does, here is how they connect. The fourth slide goes one level deeper into the architecture, not to impress anyone with complexity, but to demonstrate that this is a real, production-deployed system with actual component counts, not a prototype or a pitch for something that will be built later.

The fifth slide is the differentiators slide and it earns its position by being specific. The six MAB pillars are named with Greek letters and described in operational terms, not marketing language. Hostile-network-first is named first because it is the most immediately legible differentiator and it separates Erebus Edge from every SaaS AI tool immediately. The sixth slide is the most important one in the deck for Inception purposes. It contains real numbers from a real production replay. 48.3x, 78%, 0.91 quality delta, zero Opus selections. These numbers are not projections. They are logged output from your own event store. A reviewer reading this slide sees a system that is already generating evidence, not promising it.

The seventh slide is the NVIDIA fit slide and it is written to be unambiguous about what you want from the program and what NVIDIA gets in return. You are not asking for money. You are asking for compute, inference credits, hardware diversity, and access to NIM. In exchange, NVIDIA gets real production workloads running through their inference stack with full reward telemetry at the task level, which is genuinely more useful to them than a synthetic benchmark. NIM slots into the MAB arm pool without any architectural changes because Erebus Edge treats inference endpoints as interchangeable arms. That is a clean, credible integration story. The eighth slide states the traction facts, meaning current system surface counts, and the founder background, framed through the S6 uptime-first methodology rather than job titles. The ninth slide is a clean close with contact details.

The visual language throughout is deliberately consistent with your public website: black field, warm off-white type, Cormorant Garamond for display headers, JetBrains Mono for everything else, purple-to-cyan gradient rule on every slide, lime callouts for key evidence, a green rule swap on the NVIDIA slide to signal fit without being heavy-handed about it. The design is not trying to look like a pitch deck. It is trying to look like the documentation of a system built by someone who takes craft seriously, which is exactly what you are.

The CSS theme you have handles all of that without any additional work. The only decisions left are whether any slide is overloaded with text and needs splitting, and whether you want to drop the logo in on the title slide. Everything else is already written. You run the Marp CLI, you get a PDF, you attach it to the form.
