# System Architecture

Last updated: 2026-06-03

FigJam diagram: https://www.figma.com/board/8lJPhSSTQRq1m0QkjT2kp9

---

## Overview

Tokenizer is a hub. One canonical store, multiple output paths. Every integration reads from or writes to the registry — nothing talks directly to anything else.

```
External tools (Figma, Framer, Webflow)
        │
        ▼
Token Registry / CRUD          ← canonical source of truth
        │
        ▼
Version snapshot               ← all outputs read from a snapshot, not the live store
        │
   ┌────┼────────────┬──────────────┐
   ▼    ▼            ▼              ▼
Mappers  Raw exporter  MCP server  Platform add-ons
```

---

## Core hub

### Token Registry / CRUD

The canonical store. DTCG-aligned, fully typed. Single source of truth for all tokens across all modes, collections, and groups. Nothing bypasses it.

### Version snapshot

All output paths (mappers, exporters, MCP) read from a version snapshot — not the live store. This means:
- Platforms can be pinned to specific versions
- Production and staging can run different token sets simultaneously
- A publish action creates a snapshot; outputs are always deterministic

---

## Output paths

### Mappers (opinionated output)

Translate the canonical store into a specific library's theming vocabulary. Each mapper knows the target library's variable names, format requirements, and constraints.

| Mapper | Output |
|---|---|
| shadcn theme mapper | CSS custom properties aligned with shadcn's theming system |
| MUI theme mapper | MUI theme object |

Output delivery: npm package. Versioned and importable as `import tokens from '@org/tokens'`.

### Raw exporter (faithful output)

Exports the token store as-is, with no library-specific transformation.

| Format | Notes |
|---|---|
| JSON | DTCG-aligned |
| TOON | Tokenizer's own format |

Output delivery: ZIP with timestamp.

### MCP server (AI consumption layer)

Not just a JSON endpoint. The MCP server exposes the full token context — values, types, semantic descriptions, and usage rules — so AI agents can make decisions, not just look up values.

A token with only a value (`#0066FF`) is ambiguous to an LLM. A token with a description ("primary action color, use for buttons and focus rings, not decorative elements") is actionable.

The richer the description field in the token, the better every AI tool consuming this MCP will perform.

---

## Platform add-ons (optional)

Install only what you use. Each add-on is an optional Tokenizer module for a specific external platform. Not installing Framer's add-on has no effect on anything else.

Each add-on handles bidirectional sync between the Token Registry and its platform.

---

## Figma integration (three functions)

Figma is the primary external tool. Its integration has three distinct functions:

### 1. Import (Figma → Tokenizer)

The Figma plugin reads Figma variables and pushes them to the Token Registry. **Lossless — no transformation at import.** Figma's 4 primitive types (color, number, string, boolean) arrive as-is. Enrichment to DTCG types happens inside Tokenizer, manually, after import.

The plugin stores the mapping so re-imports don't require reconfiguration.

### 2. Push back (Tokenizer → Figma)

The Figma mapper add-on translates DTCG tokens back to Figma's constraints:
- Collapses enriched DTCG types back to Figma's 4 primitives
- Strips units from dimension values
- Converts colors to Figma-supported formats (hex, rgb, rgba)
- Resolves aliases that Figma cannot handle natively

The mapper hands the result to the plugin. The plugin **stages a pending update** in the Figma file — it does not write variables directly.

### 3. Accept (manual, on the Figma side)

The designer sees a "Token updates available" notification in Figma (using Figma's native library update pattern). They review the diff and accept. On accept, Figma variables are updated.

**Tokenizer is always the source of truth.** There is no conflict resolution — Tokenizer wins. The accept step exists so designers are never surprised by silent overwrites of their Figma file.

### Sync status

The Tokenizer UI shows sync status per connected Figma file: "up to date" or "N versions behind." Drift is always visible. The designer decides when to accept — there is no forced push.

---

## AI-native SDLC layer

Two distinct components, both downstream of MCP. Easy to conflate — they serve different purposes.

### Pipeline integration (push-based, automated)

Connects token publish events to the engineering pipeline. Tokenizer always wins — no human in the loop.

| Component | Function |
|---|---|
| Webhooks | Fire on token publish, trigger downstream systems |
| CLI (`tokenizer pull`) | Pull latest token files in CI/CD scripts |
| CI/CD integration | Auto-regenerate token files on publish, open PR with updated values |

This is not AI-native — it is load-bearing infrastructure that the AI-native layer depends on.

### Agentic validation (AI-powered, event-driven)

An AI agent with full token context (via MCP) that watches the codebase and flags deviations.

| Function | Description |
|---|---|
| PR review agent | Reviews pull requests for token compliance |
| Hardcoded value detection | Flags values that match a token but aren't using it (e.g. `#0066FF` instead of `var(--color-brand-primary)`) |
| Token compliance flagging | Flags spacing, typography, or color values that have no corresponding token |

No tool does this today. It is only possible because the token store is structured, queryable, and carries semantic descriptions — not just values.

---

## Key principles

- **Tokenizer is always the source of truth.** No conflict resolution. External tools sync to Tokenizer, not the other way around.
- **Version snapshot as the output gate.** No live-store reads from outputs. Publish creates a snapshot; everything downstream is deterministic.
- **MCP carries meaning, not just values.** The semantic description field is part of the token definition and is critical for AI agent quality.
- **Add-ons are opt-in.** Platform connectors are installed per need. Core hub has no knowledge of specific external platforms.
- **Pipeline integration is infrastructure. Agentic validation is product.** Both sit downstream of MCP but serve different audiences and timescales.
