# Project State — Tokenizer UI

Last updated: 2026-06-03 (session 6)

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
Sidebar | AppHeader (repo selector)
          └─ Workspace
               ├─ Panel A: Collections tree (23%)
               ├─ Panel B: Token grid (77%) + breadcrumb header
               └─ Panel C: Token detail panel (35%, conditional)
```

This layout is correctly structured but not yet refactored into the planned component architecture. Everything currently lives in `tokenizer-demo-01/page.tsx`.

---

## Key files

```
src/
  app/
    page.tsx                                    ← redirects to /tokenizer-demo-01
    tokenizer-demo-01/page.tsx                  ← ALL layout + logic (needs splitting — see ROADMAP)
  components/
    sidebar.tsx                                 ← 3-state nav rail
    panel.tsx                                   ← repo selector header + panel wrapper (to be replaced by Workspace)
    token-detail-panel/
      index.tsx                                 ← panel shell (to be stripped — becomes pure content)
      types.ts                                  ← DtcgType, Token, ColorFormat, COLOR_FORMATS, TOKEN_TYPE_ICONS, toDisplayName
      color-utils.ts                            ← hexToRgb, convertColor and helpers
      token-type-content.tsx                    ← type switcher (to be replaced by config-driven model)
      sections/
        token-meta.tsx                          ← Type/DTCG/Name rows
        description.tsx                         ← description block
        color-swatch.tsx                        ← swatch + format/mode dropdowns
        values-color.tsx                        ← color formats × modes table
        values-duration.tsx                     ← ms/s conversion table
        values-dimension.tsx                    ← px/rem/em/%/pt conversion table
        values-number.tsx                       ← intent dropdown + formatted value
        code-syntax.tsx                         ← collapsible name/value table, editable
        aliases.tsx                             ← collapsible token path list
        section-table.tsx                       ← shared table wrapper
    ui/
      table.tsx                                 ← modified: hover colour, header exclusion
      resizable.tsx                             ← modified: hover highlight
      button.tsx                                ← icon-sm variant added
      accordion.tsx                             ← installed, not used (base-ui bug)
      breadcrumb.tsx                            ← installed, used in grid header

tokenizer_md/                                   ← all project docs
  PRODUCT_VISION.md                             ← what Tokenizer is and why
  PROJECT_STATE.md                              ← this file
  ARCHITECTURE.md                               ← layout system, component model, data model decisions
  ROADMAP.md                                    ← what needs design, what is ready to build
  LIBRARIES.md                                  ← available libraries and when to use them
  registry_learnings.md                         ← index of library-specific learnings
  learnings_*.md                                ← per-library learnings
CLAUDE.md                                       ← session bootstrap + working rules
```

---

## Key decisions / learnings

- **`group-hover` copy icon**: only works reliably with shadcn `TableRow`. Plain HTML `<tr>` does not trigger group-hover correctly.
- **Accordion**: base-ui's `AccordionContent` caused JSX parse errors in Turbopack. Using plain `useState` + `ChevronDown` collapsible instead.
- **DropdownMenuTrigger**: do not use `asChild` with a `<span>` — the `asChild` prop leaks to the DOM.
- **Color format**: stored as canonical hex, converted on render via `convertColor()`.
- **`toDisplayName()`**: converts camelCase DTCG type names to human-readable lowercase.
- **Tailwind v4 scanning**: arbitrary utility classes (e.g. `grid-cols-[5rem_1rem_1fr]`, `w-[84px]`) are NOT reliably generated for new component files outside `src/app/`. Use plain HTML elements with `colgroup` / inline `style` for layout-critical column widths.
- **Button**: project's shadcn config uses base-ui primitives by default. Manually replaced with standard Radix-based implementation and installed `@radix-ui/react-slot`. `icon-sm` size variant added.
- **TOKEN_TYPE_ICONS**: defined with `React.createElement` (not JSX) in `types.ts` so the file stays a `.ts` module.
- **SectionTable alignment**: `pl-[12px]` indent, `table-fixed`, first-column width `92px` via `colgroup` inline style. Second column starts at 120px from panel left.
- **Dimension units**: px, %, rem, em, pt. `%` echoes raw value. `pt` = px × 0.75.
- **Number intent state**: shared between grid cell dropdown and detail panel — lifted to `TabAContent`.
- **Breadcrumb**: selection path from tree passed as `string[]`, rendered with shadcn `Breadcrumb`. Repo name excluded — repo is the active context, not part of the path.

---

## What's next

See `tokenizer_md/ROADMAP.md` for the full list. Immediate priorities:

1. **Refactor layout** — extract `Workspace`, `WorkspacePanel`, `AppShell`, `AppHeader`
2. **Refactor detail panel** — `DetailSection` wrapper, config-driven composition model
3. **Refactor grid** — extract `TokenGrid`, `useColumnResize`, config-driven cell renderers
4. **Separate data from UI** — move mock data out of components, define shared types
5. **CSS variables** — replace hardcoded values with custom properties
