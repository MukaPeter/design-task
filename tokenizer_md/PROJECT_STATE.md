# Project State — Tokenizer UI

Last updated: 2026-06-04 (session 13)

---

## What this project is

A UI prototype for Tokenizer — a design token management tool.

**Location:** `/Users/mukapeter/Desktop/Tokenizer`
**Local:** `npm run dev` → http://localhost:3000 (redirects to `/tokenizer-demo-01`)
**Vercel:** https://tokenizer-peach.vercel.app
**GitHub:** https://github.com/MukaPeter/tokenizer

Product vision: `tokenizer_md/PRODUCT_VISION.md`
UI architecture: `tokenizer_md/ARCHITECTURE_UI.md`
System architecture: `tokenizer_md/ARCHITECTURE_SYSTEM.md`
Backend architecture: `tokenizer_md/ARCHITECTURE_BACKEND.md`
Build + design roadmap: `tokenizer_md/ROADMAP.md`

---

## Stack

| Layer | Library | Version |
|---|---|---|
| Framework | Next.js (App Router) | 16 |
| UI components | shadcn/ui + Tailwind v4 (base-ui primitives) | — |
| Drag and drop | @dnd-kit/core | — |
| Resizable panels | react-resizable-panels | v4 |
| Tree list | react-arborist | 3.8.0 |
| Token grid | @tanstack/react-table | — |
| Flow/canvas | @xyflow/react | — |

**Note on base-ui:** shadcn v4 uses base-ui (not Radix) under the hood. base-ui is still in beta — known issue: `AccordionContent` causes JSX parse errors in Turbopack. Using hand-rolled collapsibles instead. Decision: stay on base-ui, log bugs as they appear.

**Note on token grid:** shadcn `<Table>` was replaced with `@tanstack/react-table` + div-based rendering. See `learnings_tanstack_table.md` for full rationale.

---

## Data hierarchy (agreed)

| Level | What it does | Relation |
|---|---|---|
| **Organization** | Top-level account. Billing and users live here. | One org → many Repositories |
| **Repository** | The release unit. Versioned and published as an npm package. | One repo → many Collections |
| **Collection** | Semantic grouping of tokens (e.g. `color-primitives`, `typescale`). Modes defined here. All names are user-defined. | One collection → many Groups |
| **Group** | Folders within a collection. Pure organisation. All names are user-defined. | One group → many Tokens |
| **Token** | The smallest unit. Name (user-defined), DTCG type, description. | One token → many Mode values |
| **Mode value** | Value in a specific mode. Dimension types carry a unit (`px`, `rem`, `%`, `em`). Duration types carry a unit (`ms`, `s`). Color format is an export concern — stored canonically, converted on output. | Many per token |

---

## Current layout

```
page.tsx                     ← layout only (~22 lines)
  ├── Sidebar                ← nav rail
  └── AppShell               ← fills remaining space
        ├── AppHeader        ← repo selector dropdown
        └── TokensView       ← owns all shared state
              ├── Panel A: CollectionsTree (23%, collapsible)
              ├── Panel B: TokenGrid (77%, breadcrumb header, + Create token footer)
              └── Panel C: TokenDetailPanel (35%, conditional on row selection)
```

All panels use `WorkspacePanel` shell (header/content/footer).
`TokensView` owns: `selectedPath`, `selectedRow`, `numberIntent`.

---

## Key files

```
src/
  app/
    page.tsx                                    ← redirects to /tokenizer-demo-01
    globals.css                                 ← imports primitives + typescale, wires shadcn semantic tokens to --tok-* primitives
    tokenizer-demo-01/page.tsx                  ← layout only: Sidebar + AppShell + AppHeader + TokensView
  styles/
    primitives.css                              ← ALL raw values: --tok-* colors, typography, layout, radius
    typescale.css                               ← semantic role classes: .tok-panel-title, .tok-nav-label, .tok-ui-label, .tok-section-title, .tok-meta-label, .tok-code
  types/
    tokens.ts                                   ← shared TS types: DtcgType, ColorFormat, DimensionUnit, DurationUnit, NumberIntent (incl. angle) + their constants
  hooks/
    use-column-resize.ts                        ← generic column resize hook (kept, not used by token grid anymore)
  components/
    app-shell.tsx                               ← flex wrapper filling space after sidebar
    app-header.tsx                              ← repo selector dropdown + actions slot
    workspace.tsx                               ← Workspace component (DndContext + ResizablePanelGroup)
    workspace-panel.tsx                         ← WorkspacePanel shell (header/content/footer)
    tokens-view.tsx                             ← 3-panel layout + shared state (selectedPath, selectedRow, numberIntent)
    collections-tree.tsx                        ← CollectionsTree + TreeItem type + TREE_DATA mock (Collection A, B, C)
    token-grid.tsx                              ← TokenGrid — TanStack Table + div rendering, MOCK_TOKENS, ALL_MODE1_VALUES, getGroupedRows
    cell-renderers.tsx                          ← config-driven cell renderers per DtcgType (renderCell dispatch)
    sidebar.tsx                                 ← 3-state nav rail
    token-detail-panel/
      index.tsx                                 ← re-exports TokenDetailContent only
      types.ts                                  ← Token, TOKEN_TYPE_ICONS, toDisplayName (re-exports DtcgType/ColorFormat from @/types/tokens)
      color-utils.ts                            ← hexToRgb, convertColor and helpers
      token-configs.tsx                         ← config map per DtcgType (description + sections factory)
      token-detail-content.tsx                  ← dumb renderer: reads config, renders TokenMeta + Description + sections
      sections/
        detail-section.tsx                      ← shared collapsible wrapper (used by all value/syntax/alias sections)
        token-meta.tsx
        description.tsx
        color-swatch.tsx
        values-color.tsx
        values-duration.tsx
        values-dimension.tsx
        values-number.tsx
        code-syntax.tsx
        aliases.tsx
        section-table.tsx
    ui/
      table.tsx                                 ← modified: hover colour, header exclusion, overflow-x-clip
      resizable.tsx                             ← modified: hover highlight
      button.tsx                                ← icon-sm variant added
      accordion.tsx                             ← installed, not used (base-ui bug)
      breadcrumb.tsx                            ← used in TokensView grid panel header

tokenizer_md/
  PRODUCT_VISION.md                             ← what Tokenizer is, why, positioning, LLM use cases, composite token model, platform comparison table
  PROJECT_STATE.md                              ← this file
  ARCHITECTURE_UI.md                            ← full layout system, component model, token grid spec, detail panel composition model, collections tree behaviour
  ROADMAP.md                                    ← what needs design, what is ready to build, separation of concerns
  LIBRARIES.md                                  ← available libraries and when to use them
  registry_learnings.md                         ← index of all docs and library learnings
  learnings_*.md                                ← per-library learnings
  learnings_tanstack_table.md                   ← TanStack Table setup, column sizing, div rendering, hover state, border constant
CLAUDE.md                                       ← session bootstrap + working rules
```

---

## Token layer architecture

Three-layer system. Change a primitive → cascades through every layer below it.

```
primitives.css        --tok-blue-500: #009CFF
      ↓
globals.css           --primary: var(--tok-blue-500)        ← shadcn semantic layer
      ↓
components            bg-primary / text-primary              ← Tailwind utilities
```

### `src/styles/primitives.css` — raw values only, no semantics

| Group | Variables |
|---|---|
| Brand | `--tok-blue-500` |
| Dirty blues (blue-shifted surfaces) | `--tok-dirtyblue-50/100/150/900` |
| Grays | `--tok-white`, `--tok-gray-50` → `--tok-gray-950` |
| Destructive | `--tok-red-400`, `--tok-red-500` |
| Typography | `--tok-font-size-xs/sm`, `--tok-line-height-xs/sm`, `--tok-font-weight-normal/medium/semibold` |
| Layout | `--tok-panel-header`, `--tok-panel-padding-x`, `--tok-panel-padding` |
| Radius | `--tok-radius-base` |

### `src/styles/typescale.css` — role classes, values from primitives

| Class | Size | Weight | Notes |
|---|---|---|---|
| `.tok-panel-title` | sm | semibold | Panel headers, sidebar title, grid group titles |
| `.tok-nav-label` | sm | medium | App header nav items |
| `.tok-ui-label` | xs | normal | Grid cells, dropdowns, most UI text |
| `.tok-section-title` | xs | semibold | Detail panel section headers |
| `.tok-meta-label` | xs | medium | Token meta rows |
| `.tok-code` | xs | normal | Mono font — values, aliases, syntax |

### Layout tokens → Tailwind utilities (registered in `@theme`)

| Token | Tailwind utility |
|---|---|
| `--tok-panel-header` | `h-panel-header` |
| `--tok-panel-padding-x` | `px-panel-padding-x` |
| `--tok-panel-padding` | `p-panel-padding` |

---

## Key decisions / learnings

- **Token grid replaced**: shadcn `<Table>` replaced with `@tanstack/react-table` + div-based rendering. Sticky header border now works correctly — `border-bottom` on a `<div>` travels with `position: sticky`. See `learnings_tanstack_table.md`.
- **Token grid BORDER constant**: `const BORDER = '1px solid var(--tok-gray-200)'` — used for all grid borders. Do not use Tailwind border classes in token-grid.tsx (scanning issue).
- **Token grid row height**: fixed at `height: 40, overflow: hidden` — prevents editing state from expanding row.
- **Token grid hover**: managed via `hoveredRow` state + `onMouseEnter`/`onMouseLeave` — cannot use Tailwind `group-hover` on divs in this file.
- **Grouped grid rendering**: `GridRow` type (`spacer | token`). `getGroupedRows()` walks tree from selected path. Spacer rows show group title (`tok-panel-title`). See `project_grouped_grid.md` in memory.
- **Number intent `angle`**: added to `NumberIntent` type. Displays value with `°` suffix in the cell. Export adapter appends `deg`.
- **base-ui accordion bug**: `AccordionContent` causes JSX parse errors in Turbopack. Using hand-rolled collapsibles.
- **DropdownMenuTrigger**: do not use `asChild` with a `<span>` — the `asChild` prop leaks to the DOM.
- **Color format**: stored as canonical hex, converted on render via `convertColor()`.
- **Tailwind v4 scanning**: arbitrary utility classes are NOT reliably generated for new component files outside `src/app/`. Use inline styles for all layout-critical values in component files.
- **Button**: Radix-based shadcn implementation. `icon-sm` size variant added.
- **TOKEN_TYPE_ICONS**: defined with `React.createElement` (not JSX) in `types.ts` so the file stays a `.ts` module.
- **CollectionsTree split click**: chevron → `node.toggle()`, label → `node.select()`. react-arborist fires `onSelect` only on explicit `node.select()`.
- **CollectionsTree expand/collapse all**: `forwardRef` + `useImperativeHandle` (`expandAll`, `collapseAll`).
- **`--accent` remapped**: `--tok-gray-100`. **`--muted` remapped**: `--tok-gray-100`.
- **Icon button hover**: `.tok-icon-btn` class (`hover:bg-[--tok-gray-100]`).
- **`--tok-gray-300`** added to primitives: `oklch(0.820 0 0)`.
- **Supabase anon access requires two things**: (1) RLS policy `USING (true)` and (2) `GRANT SELECT ON table TO anon`. RLS alone is not enough — table privileges must also be granted explicitly.

---

## Backend — current state

Supabase project: `tokenizer` (MukaPeterOrg, Central EU Frankfurt)

### Done
- Supabase project created (MukaPeterOrg, Central EU Frankfurt)
- Full schema created and live (7 tables: organizations, repositories, collections, modes, tokens, mode_values, import_mappings)
- Seed data inserted — one org, one repo, Collection A + B + C with all groups, 52 tokens, mode values for all color and dimension tokens
- Schema visualizer verified — all foreign key relationships correct
- Supabase MCP connected — authenticated via terminal, config lives in `.mcp.json`
- RLS: permissive anon read policies + `GRANT SELECT TO anon` added to all 7 tables (prototype only — must be replaced with auth-scoped policies before production). Note: RLS policies alone are not enough — table-level GRANT is also required.
- `@supabase/supabase-js` installed, `.env.local` created, `src/lib/supabase.ts` client created (typed with `Database`)
- TypeScript types generated → `src/types/database.ts`
- **AppHeader wired** — live repo query replaces hardcoded mock names; `page.tsx` converted to async server component
- **CollectionsTree wired** — `src/lib/tree-utils.ts` builds `TreeItem[]` from collections + token paths; `TREE_DATA` mock no longer used
- **TokenGrid wired** — `MOCK_TOKENS` + `ALL_MODE1_VALUES` removed; `LiveToken[]` + `modeValues` fetched in `page.tsx` and passed down; `getGroupedRows` now filters by collection name + path prefix
- **TokenDetailPanel** — no changes needed; receives real mode values via `modeValues[selectedRow.id]` from `TokensView`

### Decisions needed before wiring

- **RLS policies** — ✅ decided: permissive anon read policies added for all tables (prototype only). **Must be replaced with proper auth-scoped policies before any real user data or multi-tenant use.** Production policy should scope reads to the authenticated user's org.
- **Loading states** — stub with a spinner/skeleton, or skip for prototype?
- **Error states** — handle gracefully or skip for prototype?

### Next steps (in order)
1. ✅ RLS — permissive anon read policies added
2. ✅ Install client + env
3. ✅ Generate TypeScript types
4. ✅ Wire AppHeader
5. ✅ Wire CollectionsTree
6. ✅ Wire TokenGrid
7. ✅ Wire TokenDetailPanel
8. ✅ Verified in browser — live data renders end-to-end (collections tree + token grid + detail panel all showing real Supabase data)
9. **Delete remaining mock data** — `TREE_DATA` constant still exported from `collections-tree.tsx` but no longer used
10. **Edge Function** — write `import-figma` to receive plugin payload and upsert into the schema
11. **Plugin push** — add `MSG.PUSH` to the Figma plugin, POST to the Edge Function

See `tokenizer_md/ARCHITECTURE_BACKEND.md` for full schema and data flow.

---

## Known type errors (build fails, dev runs fine)

- `workspace.tsx:69` — `ref` prop doesn't exist on `BasePanelAttributes` (resizable panel + dnd-kit `setNodeRef` conflict)
- `token-detail-panel/sections/values-number.tsx:20` — `formatValue` switch missing `angle` case and default — **fixed in session 13**

---

## What's next — UI (priority order)

### Needs design first
- Alias indicator in a cell
- Add mode column
- Column header rename
- Breadcrumb as navigation
- Re-opening a closed panel
- Lock / unlock mode toggle

See `tokenizer_md/ROADMAP.md` for full list.
