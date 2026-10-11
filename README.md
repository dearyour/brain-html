# Brain HTML

**An agent skill that turns your content into interactive graph HTML — five visual systems, one self-contained file.**

Concentric knowledge graphs, layered radar diagnostics, moving funnel orbits, an inertia-spinning globe, and persona org charts. Not static pictures: nodes focus, filter, rotate, and switch layers in the browser.

[한국어 안내](README.ko.md) · [Live style gallery](skills/brain-html/assets/examples/style-gallery.html) (download and open locally)

| Brain | Doctor | Funnel |
|---|---|---|
| <img src="skills/brain-html/assets/previews/brain.jpg" alt="Brain: concentric knowledge graph with a particle core"> | <img src="skills/brain-html/assets/previews/doctor.jpg" alt="Doctor: layered radar with diagnostic core and meters"> | <img src="skills/brain-html/assets/previews/funnel.jpg" alt="Funnel: staged orbits with individual journeys"> |

| AdPilot | Personas |
|---|---|
| <img src="skills/brain-html/assets/previews/adpilot.jpg" alt="AdPilot: rotating globe with city pins and performance matrix"> | <img src="skills/brain-html/assets/previews/personas.jpg" alt="Personas: role-based org chart and knowledge graph"> |

## Five modes

| Mode | Graph & motion | Good for |
|---|---|---|
| **1 · Brain** | Concentric nodes, particle knowledge core, focus transitions, neural view | Concept relations, system structure, knowledge maps |
| **2 · Doctor** | Multi-layer radar, diagnostic core, meters, stepped trends | Health checks, capability or performance comparison, coverage |
| **3 · Funnel** | Stage-by-stage orbits, flow/radial toggle, per-node detail | Customer journeys, conversion, pipelines |
| **4 · AdPilot** | Inertia-rotating globe, city pins, red light source, metrics matrix | Regional/global distribution, campaigns, reach |
| **5 · Personas** | Role org charts, persona switching, color-coded knowledge graph | Teams, roles, user types, operating models |

If you don't pick one, the skill chooses from what you're trying to learn: relations → Brain, multi-axis status → Doctor, sequential progress → Funnel, real coordinates → AdPilot, role structure → Personas. It adds a secondary mode only when the request needs one, and never invents fake cities for a globe.

## Install

```sh
npx skills add dearyour/brain-html --skill brain-html --global --copy --yes
```

Uses the open-source [Skills CLI](https://github.com/vercel-labs/skills). Add `--agent codex` or `--agent claude-code` to target one agent. Restart the agent or start a new session afterwards.

Manual install for Codex (refuses to overwrite an existing folder and verifies SHA-256 of every file):

```sh
git clone https://github.com/dearyour/brain-html.git
python3 brain-html/skills/brain-html/scripts/install.py
```

For Claude Code, copy `skills/brain-html` into `~/.claude/skills/`.

Then ask:

> $brain-html Map our product's feature areas, owners, and dependencies as an interactive graph.

## Render without an agent

The runtime is prebuilt. Generating HTML needs only Python's standard library — no Node, CDN, or server.

```sh
cd skills/brain-html
python3 scripts/render.py --mode brain --data content.json --output out/index.html
python3 scripts/render.py --mode brain --sections doctor --data content.json --output out/overview.html
python3 scripts/render.py --showcase --output out/styles.html
```

- Without `--data`, output is clearly labeled **sample data**. With `--data`, samples are never merged in.
- Themes: `--theme mono|dark|midnight|ember|mono-light`. Title: `--title`.
- Existing output files are never overwritten.
- Data shape for each mode: [data contract](skills/brain-html/references/data-contract.md).

`python3 scripts/verify.py` runs the quick self-check: five mode outputs, supplied-data isolation, script escaping, no-overwrite, and install integrity.

## Modifying the engines

Editable sources live in `skills/brain-html/assets/runtime/` (React 18, d3-force, Tailwind 3, esbuild). Copy the package to a working folder before changing it, then rebuild with `scripts/build.mjs`. See [reuse & build](skills/brain-html/references/reuse.md) and [tree framing](skills/brain-html/references/tree-framing.md) for the camera regression test.

## Accessibility & scope

- All CSS, SVG, and `requestAnimationFrame` motion respects `prefers-reduced-motion`.
- Every graph node is also reachable from named buttons/lists; the canvas globe has a text region summary.
- The bundled adapters make **no network calls**. Business actions from the original app (agent runs, ad spend, saving documents, live data APIs) are intentionally not included.

## Origin & license

The five visual engines are extracted from [dearyour/command-center](https://github.com/dearyour/command-center) at commit `f367aff`; per-file SHA-256 hashes are in [source-manifest.json](skills/brain-html/references/source-manifest.json). Server-side data producers were replaced with standalone adapters, and original names/branding with neutral shapes.

[MIT](LICENSE). Bundled dependency notices (React, d3, lucide, zod): [dependencies.txt](skills/brain-html/assets/licenses/dependencies.txt).
