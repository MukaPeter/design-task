# Project State — Tokenizer UI

Last updated: 2026-06-03 (session 6 — end)

---

## What this project is

A UI prototype for Tokenizer — a design token management tool.

**Location:** `/Users/mukapeter/Desktop/Tokenizer`
**Local:** `npm run dev` → http://localhost:3000 (redirects to `/tokenizer-demo-01`)
**Vercel:** https://tokenizer-peach.vercel.app
**GitHub:** https://github.com/MukaPeter/tokenizer

Product vision: `tokenizer_md/PRODUCT_VISION.md`
Architecture decisions: `tokenizer_md/ARCHITECTURE.md`
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
| Table | shadcn/ui Table | — |
| Flow/canvas | @xyflow/react | — |

**Note on base-ui:** shadcn v4 uses base-ui (not Radix) under the hood. base-ui is still in beta — known issue: `AccordionContent` causes JSX parse errors in Turbopack. Using hand-rolled collapsibles instead. Decision: stay on base-ui, log bugs as they appear.

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
    tokenizer-demo-01/page.tsx                  ← layout only: Sidebar + AppShell + AppHeader + TokensView
  components/
    app-shell.tsx                               ← flex wrapper filling space after sidebar
    app-header.tsx                              ← repo selector dropdown + actions slot
    workspace.tsx                               ← Workspace component (DndContext + ResizablePanelGroup)
    workspace-panel.tsx                         ← WorkspacePanel shell (header/content/footer)
    tokens-view.tsx                             ← 3-panel layout + shared state (selectedPath, selectedRow, numberIntent)
    collections-tree.tsx                        ← CollectionsTree + TreeItem type + TREE_DATA mock
    token-grid.tsx                              ← TokenGrid + ROWS mock data
    sidebar.tsx                                 ← 3-state nav rail
    panel.tsx                                   ← DEAD — to be deleted
    token-detail-panel/
      index.tsx                                 ← panel shell (to be stripped — becomes pure content)
      types.ts                                  ← DtcgType, Token, ColorFormat, COLOR_FORMATS, TOKEN_TYPE_ICONS, toDisplayName
      color-utils.ts                            ← hexToRgb, convertColor and helpers
      token-type-content.tsx                    ← type switcher (to be replaced by config-driven model)
      sections/
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
      table.tsx                                 ← modified: hover colour, header exclusion
      resizable.tsx                             ← modified: hover highlight
      button.tsx                                ← icon-sm variant added
      accordion.tsx                             ← installed, not used (base-ui bug)
      breadcrumb.tsx                            ← used in TokensView grid panel header

tokenizer_md/
  PRODUCT_VISION.md                             ← what Tokenizer is, why, positioning, LLM use cases
  PROJECT_STATE.md                              ← this file
  ARCHITECTURE.md                               ← full layout system, component model, token grid spec, detail panel composition model, collections tree behaviour
  ROADMAP.md                                    ← what needs design, what is ready to build, separation of concerns
  LIBRARIES.md                                  ← available libraries and when to use them
  registry_learnings.md                         ← index of all docs and library learnings
  learnings_*.md                                ← per-library learnings
CLAUDE.md                                       ← session bootstrap + working rules
```

---

## Key decisions / learnings

- **base-ui accordion bug**: `AccordionContent` causes JSX parse errors in Turbopack. Using hand-rolled collapsibles. Will extract a shared `DetailSection` wrapper.
- **`group-hover` copy icon**: only works reliably with shadcn `TableRow`. Plain HTML `<tr>` does not trigger group-hover correctly.
- **DropdownMenuTrigger**: do not use `asChild` with a `<span>` — the `asChild` prop leaks to the DOM.
- **Color format**: stored as canonical hex, converted on render via `convertColor()`.
- **Tailwind v4 scanning**: arbitrary utility classes are NOT reliably generated for new component files outside `src/app/`. Use plain HTML elements with `colgroup` / inline `style` for layout-critical column widths.
- **Button**: Radix-based shadcn implementation. `icon-sm` size variant added.
- **TOKEN_TYPE_ICONS**: defined with `React.createElement` (not JSX) in `types.ts` so the file stays a `.ts` module.
- **SectionTable alignment**: `pl-[12px]` indent, `table-fixed`, first-column width `92px` via `colgroup` inline style.
- **Breadcrumb**: selection path from tree passed as `string[]`. Repo name excluded — repo is the active context.
- **WorkspacePanel content area**: uses `flex flex-col` so that `flex-1` children (like CollectionsTree) fill available height correctly.

---

## What's next (priority order)

### Immediate — ready to build
1. **Delete `panel.tsx`** — dead file, no longer imported anywhere
2. **Detail panel refactor**
   - Extract `DetailSection` collapsible wrapper (replaces 6 hand-rolled accordions in sections/)
   - Config-driven composition model (`token-configs.tsx` + `token-detail-content.tsx`)
   - Strip shell from `TokenDetailPanel` — make it pure content, let `WorkspacePanel` own the header
3. **Grid refactor**
   - Extract `useColumnResize` hook from `token-grid.tsx`
   - Config-driven cell renderers per token type
4. **Separation of concerns**
   - Shared types file (`DimensionUnit`, `DurationUnit`, `ColorFormat`, `NumberIntent`, `DtcgType`)
   - CSS custom properties for repeated layout values

### Needs design first
- Alias indicator in a cell
- Add mode column
- Column header rename
- Breadcrumb as navigation
- Re-opening a closed panel
- Lock / unlock mode toggle

See `tokenizer_md/ROADMAP.md` for full list.
