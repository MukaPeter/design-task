# Tokenizer — Product Vision

A design token management tool. Personal project — built to learn, to avoid paying for Token Studio, and to have something that works exactly the way it should.

---

## What is a design token

Design tokens are design decisions captured as name/value pairs. They substitute hardcoded values with meaningful names and act as a shared vocabulary between humans — mostly designers and engineers — and LLMs supporting humans in building solutions.

---

## What it is

A UI for designers and token managers to create, organise, and maintain design tokens — with an open, engineering-friendly consumption layer so developers can use tokens without knowing anything about the tool.

---

## Why not just build your own?

Nothing stops you. A JSON file, a vibe-coded UI, and Obsidian for docs — you have a token system. For a solo designer who can build, that works.

**The DIY stack breaks when:**
- Your team grows — someone else needs to edit tokens without touching code
- You have more than one platform — your custom UI doesn't push to Webflow, iOS, and Framer simultaneously
- You have more than one brand — managing variants becomes a maintenance burden
- Figma updates — your sync breaks and you fix it manually
- You need versioning — rolling back to last week's token set is not trivial

**Who Tokenizer is really for:**
The designer who knows what tokens should do but can't build the infrastructure. The team where designer and engineer need a shared tool neither has to maintain.

**And the LLM angle changes the calculus entirely.**

A solo designer now has a reason to use Tokenizer even without a team. The MCP server makes tokens available to every AI tool you use — Claude, Cursor, Copilot — without any engineering work. Your tokens become machine-queryable, structured, and always up to date.

A vibe-coded UI doesn't have an MCP server. Obsidian MDs are not structured enough for an LLM to query reliably. Tokenizer is.

---

## Positioning

> The only token management tool where the token store is also an API — consumable by code, by design tools, and by AI agents natively.

Every other tool is built for humans reading a UI. Tokenizer is built for humans **and** LLMs.

> **USP: Serve your organisation on all levels** — from the PM who doesn't know what a token is, to the engineer who knows exactly what they need. Same token store. Same MCP server. The right context served to whoever is asking.

---

## The real problem: LLMs building without guardrails

In most organisations today, PMs and non-technical stakeholders are vibe-coding solutions with AI tools and shopping them around internally. They prompt "give me a dashboard" and the LLM produces something that looks decent. C-level sees it, loves it. Engineering inherits a trainwreck — wrong colors, wrong spacing, hardcoded values, random component library, zero relation to the design system. Not scalable. Not on-brand. Nothing to do with the product portfolio.

The problem isn't the PM. The problem is the LLM had no guardrails.

Tokenizer's MCP server fixes this invisibly. The PM still prompts "give me a dashboard." But now the LLM has the full token context injected automatically — values, types, descriptions, usage rules. The output uses the right colors, the right spacing, the right typography. Not because the PM knew to ask. Because the guardrails were already there.

---

## LLM use cases — a spectrum

The same problem exists at every level of technical knowledge. What changes is how much context the LLM needs to make the right call.

**Zero knowledge — the PM**
No understanding of tokens, design systems, or libraries. The LLM must do all the decision-making. Token descriptions are critical — not just `#0066FF` but "primary action color, use for buttons, links, focus rings, not decorative elements." The LLM reads intent and applies it.

**Partial knowledge — the library user**
Someone using a component library (shadcn, MUI, Tailwind) but unsure how to theme it. The LLM needs both: what the tokens mean, and how they map to that library's theming system (`color/brand/primary` → `--primary`). Tokenizer provides both through the MCP server and platform mapping layer.

**Full knowledge — the engineer**
Knows exactly what they're doing. Just needs tokens mapped to the right variable names for their stack. The LLM consumes the mapping and gets out of the way.

One system covers all three. The depth of context consumed varies by who's asking — Tokenizer always has the right answer ready.

---

## Two capabilities that enable this

**1. Structured token context**
Each token carries meaning — name, type, description, usage rules — not just a value. The MCP server serves this context to any LLM that asks. The richer the description, the better the LLM's decisions.

**2. Token-to-library mapping**
Tokenizer maps your tokens to the theming vocabulary of specific libraries and platforms. When an LLM generates code using shadcn, it uses your `--primary`. When it generates iOS, it uses your `UIColor`. The output is on-brand at the code level, not just the visual level.

---

## AI-assisted prototyping use case

### The problem
PMs and non-technical stakeholders prototype with AI tools (Claude, Cursor, Lovable, v0). The output looks decent but has nothing to do with the design system — wrong colors, wrong spacing, hardcoded values, random component libraries. It diverges from the system before engineering even sees it.

### The solution
The Tokenizer MCP server runs in the background of any agentic IDE or AI tool. When someone prompts "build me a dashboard", the LLM automatically has the full token context — values, types, usage rules. The guardrails are invisible. The PM doesn't need to know they're there.

- **Tokens** — enforced via MCP context. Always injected, always available.
- **Components** — guided, not enforced. Provided as context, but not a hard wall.

Even if the component library isn't perfectly followed, the colors, spacing, and typography will be correct. The output is on-brand at the value level.

### Why raw tokens aren't enough
A CSS variable like `--color-brand-500` means nothing to an LLM without context. It doesn't know what the color looks like, when to use it, or what role it plays in the system. The MCP server provides not just values but **meaning**.

### Token anatomy for LLM context
Each token has:

| Field | Example | Purpose |
|---|---|---|
| **Value** | `#0066FF` | The actual value |
| **Type** | `color` | DTCG type |
| **Class / category** | `brand`, `semantic`, `neutral` | Helps LLM navigate — "I need a background color" → looks at `background` class |
| **Description** | "Primary action color. Use for buttons, links, focus rings. Not for decorative elements." | Semantic intent — what the LLM reads to make decisions |

The description field is part of the token definition, editable in the detail panel, and included in the MCP context payload.

---

## Token type system

Figma exports tokens in 4 primitive types:

| Figma type | Covers |
|---|---|
| `color` | Color values — unambiguous |
| `number` | Dimensions, durations, unitless numbers — unit not stored |
| `string` | Font family, any text |
| `boolean` | Show/hide, on/off |

The Tokenizer enriches these into a DTCG-aligned internal type system:

| DTCG type | Example |
|---|---|
| `color` | `#009CFF` |
| `dimension` | `16px`, `1rem` |
| `duration` | `200ms` |
| `fontFamily` | `"Inter"` |
| `fontWeight` | `700` |
| `number` | `1.5` (unitless) |
| `string` | any text |
| `boolean` | true/false |
| `cubicBezier` | `[0.4, 0, 0.2, 1]` |
| `shadow` | composite |
| `typography` | composite |
| `border` | composite |
| `gradient` | composite |
| `transition` | composite |

When importing from Figma, the user fine-tunes the type — e.g. `number` → `dimension/rem`. The mapping is stored so re-imports don't need reconfiguration.

---

## Import / export model

### Three layers

**1. Import (Figma → Tokenizer)**
Tokens arrive as-is using Figma's 4 primitive types. Lossless — no transformation at import time.

**2. Enrichment (inside Tokenizer)**
Optionally, the user tells the Tokenizer what a token really is: "this `number` is a `dimension`". The canonical store holds the enriched DTCG type. The mapping is stored so re-imports don't require reconfiguration. Enrichment is optional — tokens can stay as Figma's 4 types if no mapping is needed.

**3. Push / Sync (Tokenizer → platform)**
Each platform has its own independent mapping config. The adapter looks at the canonical store and translates to whatever the platform can handle. Configured once per platform, stored, reused on every sync.

The mapping is: **token type × platform = output rule**. Platforms don't share mapping configs.

---

## Architecture

### 1. Canonical store
Internal token representation. DTCG-aligned, fully typed with units. Single source of truth.

### 2. Import adapters
Per source platform. Stored mapping so it only needs to be configured once.

- **Figma** → optionally enrich 4 types → DTCG. User assigns units and sub-types if needed.
- *(others can be added)*

### 3. Platform export adapters
Per target platform. Stored mapping rules — define once, push many times.

- **→ Figma** — collapse back to 4 types, strip units from numbers
- **→ Webflow** — map to CSS custom properties, apply rem/px rules
- **→ Framer** — map to Framer variable format
- **→ Code** — full DTCG JSON, CSS custom properties, JS/TS objects

### Known platform constraints

**Aliases / references**
Platforms handle token references differently. Where a platform can't resolve aliases (e.g. Framer), the adapter flattens the reference to its raw value before pushing. The mapping config per platform specifies whether to keep or resolve aliases.

**Color models**
The canonical store holds colors in a lossless format. Each platform adapter outputs the color model that platform supports:

| Platform | Supported color models |
|---|---|
| **Figma** | hex, rgb, rgba |
| **Webflow** | hex, rgb, rgba, hsl, hsla |
| **Framer** | hex, rgb, rgba |
| **CSS / code** | all — hex, rgb, hsl, oklch, lab, lch, color() |
| **iOS** | float RGB (UIColor / SwiftUI Color) |
| **Android** | hex (ARGB) |

`oklch` and `lab` are code-only today — design tools haven't caught up yet.

### 4. Consumption layer (engineering-friendly)
The token store is a platform, not just a UI. Multiple ways to consume:

| Method | Use case |
|---|---|
| **npm package** | Typed tokens in code projects, versioned. `import tokens from '@org/tokens'` |
| **REST / GraphQL API** | Any tool, any language can query the token store |
| **MCP server** | AI agents (Claude, Cursor, Copilot) query tokens live. "Use the correct spacing token" → answered from the store |
| **CLI** | `tokenizer pull` in CI/CD pipelines, generates token files on build |
| **Webhooks** | Push updates downstream when tokens change |

---

## Data hierarchy

| Level | What it does | Relation |
|---|---|---|
| **Organization** | Top-level account. Billing and users live here. | One org → many Repositories |
| **Repository** | The release unit. Versioned and published as an npm package. | One repo → many Collections |
| **Collection** | Semantic grouping of tokens (e.g. `color-primitives`, `typescale`). Modes are defined here (e.g. light/dark). Organisational only — no versioning. | One collection → many Groups |
| **Group** | Folders within a collection. Pure organisation. | One group → many Tokens |
| **Token** | The smallest unit. Has a name, DTCG type, and description. | One token → many Mode values |
| **Mode value** | The token's value in a specific mode. Dimension types carry a unit (`px`, `rem`, `%`, `em`, `pt`). Colors stored in one canonical format internally — output format resolved at export. | Many per token |

### Notes on naming
- The smallest unit is called **Token** (not Variable). Variable is Figma's term — Token is the industry/DTCG standard and the right term for an engineering-facing tool.
- **Color format is an export concern, not a mode concern.** A color token has one canonical value per mode (e.g. `#0066FF` in light mode). The output adapter converts it to the format the target platform requires (hex, rgb, hsl, oklch, etc.). You don't store multiple representations — you store once, convert on export.
- **Modes are defined at the Collection level.** All tokens in a collection share the same set of modes.
- **Units live on the Mode value, not the Token.** A dimension token could theoretically use `16px` in one mode and `1rem` in another. The model allows it even if it's unusual.

### On B2B2C
If Tokenizer ever becomes a white-label platform (businesses reselling or embedding it for their own users), a Tenant level above Organization would be needed. Not built for now — it's an additive change when the time comes.

---

## Structure in the UI

**Tree (left panel)** — collection structure. Tokens are organised into Collections → Groups → sub-Groups. Groups are organisational — they contain tokens, not aggregate them numerically.

**Grid (main panel)** — the tokens themselves. Each row = one token.

**Columns:**
- `Name` — token name / path
- `Type` — DTCG type
- `Mode 1`, `Mode 2`, ... — token value per mode (e.g. light/dark, brand A/brand B)

**Detail panel (right)** — opens on row click. Shows full token detail and edit surface.

**Modes** — same token, different value per mode. Modes are defined per collection.

---

## What Tokenizer is

Four roles in one tool:

- **Storage** — canonical source of truth for all tokens
- **Organiser** — collections, groups, modes, naming structure, versioning
- **Mapper** — enrichment (Figma types → DTCG) and per-platform output rules
- **Syncer** — pull from sources, push to platforms, pin platforms to specific versions

CRUD is the foundation all four roles depend on — not a role itself, but the basic operation set underneath everything.

---

## Versioning

Versions are snapshots of the organised token state (v1.0, v1.1, etc.). They live in the organiser layer. The syncer references versions — you can pin a platform to a specific version, so production and staging can run different token sets simultaneously.

---

## Key principle

One source of truth. Many ways to consume it. The UI is the management interface for what is essentially a token API.

---

## Planned features

### Lock / unlock mode
The grid has a lock toggle.
- **Locked** — everything is read-only. No editing of names, values, or structure.
- **Unlocked** — names and values are fully editable.

Toggle location on the grid panel TBD.
