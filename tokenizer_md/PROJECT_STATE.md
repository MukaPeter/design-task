# Project State — Tokenizer UI

Last updated: 2026-06-02 (session 5)

---

## What this project is

A UI prototype for Tokenizer — a design token management tool. This repo is the sandbox where the UI is being explored. The active demo (`/tokenizer-demo-01`) is a token manager UI with a tree, grid, and detail panel.

**Location:** `/Users/mukapeter/Desktop/Tokenizer`
**Local:** `npm run dev` → http://localhost:3000 (redirects to `/tokenizer-demo-01`)

Product vision: `tokenizer_md/PRODUCT_VISION.md`

---

## Stack

| Layer | Library | Version |
|---|---|---|
| Framework | Next.js (App Router) | 16 |
| UI components | shadcn/ui + Tailwind v4 | — |
| Drag and drop | @dnd-kit/core | — |
| Resizable panels | react-resizable-panels | v4 |
| Tree list | react-arborist | 3.8.0 |
| Table | shadcn/ui Table | — |
| Flow/canvas | @xyflow/react | — |
| Accordion | shadcn/ui Accordion (installed, not used — using plain useState collapsible instead) | — |

---

## Data hierarchy (agreed)

| Level | What it does | Relation |
|---|---|---|
| **Organization** | Top-level account. Billing and users live here. | One org → many Repositories |
| **Repository** | The release unit. Versioned and published as an npm package. | One repo → many Collections |
| **Collection** | Semantic grouping of tokens (e.g. `color-primitives`, `typescale`). Modes defined here. | One collection → many Groups |
| **Group** | Folders within a collection. Pure organisation. | One group → many Tokens |
| **Token** | The smallest unit. Name, DTCG type, description. | One token → many Mode values |
| **Mode value** | Value in a specific mode. Dimension types carry a unit (`px`, `rem`, `%`, `em`). Duration types carry a unit (`ms`, `s`). Color format is an export concern — stored canonically, converted on output. | Many per token |

---

## Pages

### `/tokenizer-demo-01` ← active work

Token management UI prototype.

**Layout:**
```
Sidebar | Panel (Tab A / Tab B)
          └─ Tab A: [Collections tree (23%) | Handle | Grid (77%) | Handle | Detail panel (35%, conditional)]
          └─ Tab B: placeholder
```

---

### Sidebar

- 3-state: collapsed (60px) / hover overlay / pinned (240px)
- `pinned` state persists in `localStorage`
- Nav items: **Repositories** (Database icon), **Settings** (Settings icon)

---

### Collections tree (left panel)

- `react-arborist` tree with `TREE_DATA` — two collections (A, B) with nested groups
- `ResizeObserver` measures container and passes `width`/`height` to `<Tree>` — required for react-arborist
- Selecting a node sets `selectedName` → shown as grid panel header
- Node style: `text-xs`, `rowHeight={36}`, `indent={16}`, open by default

---

### Grid (middle panel)

- shadcn `Table` with `table-fixed`, bottom `border-b`
- Columns: `Name`, `Mode 1` — all resizable via mouse drag (`startResize`). Mode 2 removed for now.
- Each row = one token. 15 rows covering all DTCG types (`percentage` removed — not a DTCG type, covered by `dimension`)
- **Name column**: DTCG type icon (lucide) + human-readable name (camelCase → `toDisplayName()`)
- **Mode 1 column**:
  - `color` — swatch + value in selected format + format dropdown (`hex`, `rgb`, `rgba`, `hsl`, `hsla`, `oklch`, `lab`, `lch`)
  - `dimension` — value + unit dropdown (`px`, `%`, `rem`, `em`, `pt`)
  - `duration` — value + unit dropdown (`ms`, `s`)
  - `number` — value + intent dropdown (`Opacity`, `Line height`, `Scale / ratio`, `Z-index`, `Count`, `Generic`) — synced with detail panel
  - All others — click-to-edit inline `Input`
- Hover on row reveals `PanelRightOpen` button → opens detail panel
- Row highlights (`data-state="selected"`) when detail panel is open for that row
- Table row hover: `#F9F9F9`. Header row has no hover state.
- **Sticky footer**: ghost `Button` with `+ Create token`

---

### Detail panel (right, conditional)

Opens when a row is clicked via the `PanelRightOpen` button. Default size 35%. Closes on X or re-click.

Extracted to `src/components/token-detail-panel/`. The panel shell (`index.tsx`) renders `TokenMeta` + `TokenTypeContent`. All type-specific content (description, sections) lives in `token-type-content.tsx`.

**Always present (shell):**
- `TokenMeta` — Type (icon + label) / DTCG type / Name, inline label–value rows
- `TokenTypeContent` — renders description + type-specific sections

**Color token sections:**
- Description
- Color swatch (large, with format + mode dropdowns)
- Values accordion — color formats × Mode 1/Mode 2 table
- Code syntax accordion — Web, iOS, Android, AG Grid entries
- Aliases accordion

**Duration token sections:**
- Description
- Values accordion — ms/s conversion table, Mode 1 only
- Code syntax accordion — Web, iOS, Android entries
- Aliases accordion

**Dimension token sections:**
- Description
- Values accordion — px/rem/em/%/pt conversion table, Mode 1 only (% and pt echo raw value, no container reference available)
- Code syntax accordion (empty by default)
- Aliases accordion

**Number token sections:**
- Description
- Values accordion — Intent dropdown (opacity/line-height/scale/z-index/count/generic) + formatted value. Intent state is shared with the grid cell dropdown. Uses `SectionTable` with `border-none` rows (no dividers).
- Code syntax accordion (empty by default)
- Aliases accordion

**Default (all other types):**
- Description ("No description available.")
- Code syntax accordion (empty entries)
- Aliases accordion (empty)

---

## Component customisations

| Component | File | What changed |
|---|---|---|
| TableRow | `ui/table.tsx` | Hover colour `#F9F9F9`, header excluded, `border-b` on all rows |
| Button | `ui/button.tsx` | Replaced base-ui with Radix-based shadcn button. `nav` size variant retained. |
| ResizableHandle | `ui/resizable.tsx` | Added hover highlight |
| Sidebar | `components/sidebar.tsx` | 3-state, localStorage pin |
| Panel | `components/panel.tsx` | Card + Tabs + dnd-kit drag handle |
| DropdownMenu | `ui/dropdown-menu.tsx` | `w-(--anchor-width)` → `min-w-(--anchor-width)` so menu grows to fit content |

---

## Key files

```
src/
  app/
    page.tsx                                    ← redirects to /tokenizer-demo-01
    tokenizer-demo-01/page.tsx                  ← grid + tree + wires detail panel
  components/
    sidebar.tsx
    panel.tsx
    token-detail-panel/
      index.tsx                                 ← panel shell (header, scroll, layout)
      types.ts                                  ← DtcgType, Token, ColorFormat, COLOR_FORMATS, TOKEN_TYPE_ICONS, toDisplayName
      color-utils.ts                            ← hexToRgb, convertColor and helpers
      token-type-content.tsx                    ← type switcher: descriptions, syntax entries, aliases per type
      sections/
        token-meta.tsx                          ← Type/DTCG/Name rows (plain HTML table + colgroup)
        description.tsx                         ← description block
        color-swatch.tsx                        ← swatch + format/mode dropdowns
        values-color.tsx                        ← color formats × modes table
        values-duration.tsx                     ← ms/s conversion table
        values-dimension.tsx                    ← px/rem/em/%/pt conversion table
        values-number.tsx                       ← intent dropdown + formatted value (uses SectionTable, no header, border-none rows)
        code-syntax.tsx                         ← collapsible name/value table, editable, + Add
        aliases.tsx                             ← collapsible token path list
        section-table.tsx                       ← shared table wrapper (alignment, table-fixed, first col width)
    ui/
      table.tsx                                 ← modified: hover colour, header exclusion
      resizable.tsx                             ← modified: hover highlight
      button.tsx                                ← Radix-based shadcn button, nav variant
      accordion.tsx                             ← installed but unused

tokenizer_md/                                   ← all project docs
CLAUDE.md                                       ← session bootstrap + working rules
```

---

## Key decisions / learnings

- **`group-hover` copy icon**: only works reliably with shadcn `TableRow`. Plain HTML `<tr>` does not trigger group-hover correctly.
- **Accordion**: base-ui's `AccordionContent` caused JSX parse errors in Turbopack. Using plain `useState` + `ChevronDown` collapsible instead.
- **DropdownMenuTrigger**: do not use `asChild` with a `<span>` — the `asChild` prop leaks to the DOM.
- **Color format**: stored as canonical hex, converted on render via `convertColor()`.
- **`toDisplayName()`**: converts camelCase DTCG type names to human-readable lowercase.
- **Tailwind v4 scanning**: arbitrary utility classes (e.g. `grid-cols-[5rem_1rem_1fr]`, `w-[84px]`) are NOT reliably generated for new component files outside `src/app/`. Use plain HTML elements with `colgroup` / inline `style` for layout-critical column widths. Standard named utilities (`w-20`, `table-fixed`, etc.) should be fine.
- **Button**: project's shadcn config uses base-ui primitives by default. Manually replaced with standard Radix-based implementation and installed `@radix-ui/react-slot`.
- **TOKEN_TYPE_ICONS**: defined with `React.createElement` (not JSX) in `types.ts` so the file stays a `.ts` module. Works fine at runtime.
- **SectionTable alignment**: all detail panel tables use `section-table.tsx` which owns `pl-[12px]` indent, `table-fixed`, and first-column width (`92px` via `colgroup` inline style). Second column starts at 120px from panel left — same x-position as the value column in `token-meta`. `token-meta.tsx` uses a plain HTML `<table>` with `<colgroup>` for reliable column widths independent of Tailwind scanning.
- **Dimension units**: px, %, rem, em, pt. `%` echoes raw value (no container reference). `pt` = px × 0.75. Base unit assumed to be px for conversions.
- **`percentage` is not a DTCG type**: removed from `DtcgType` union and grid. Percentage values are covered by `dimension` with a `%` unit.
- **`SectionTable` headers now optional**: pass `headers` for a header row, or `cols` (number) for headerless layout. Used by `ValuesNumber` which needs the column structure but no header row.
- **Number intent state**: lives in `TabAContent` in `page.tsx`, passed down to both the grid cell dropdown and `TokenDetailPanel` → `TokenTypeContent` → `ValuesNumber`. Changing intent in either place updates both.

---

## What's next

- ~~Fix alignment: `SectionTable` first column width — done, using `colgroup` inline style, second column now starts at 120px matching token-meta value column~~
- Wire sidebar nav (Repositories active state)
- Replace mock tree data with realistic collection/group/token structure
- Dynamic mode columns (defined per collection)
- Detail panel: make Description editable
- Token type enrichment UI (Figma type → DTCG type mapping)
- Lock / unlock mode toggle on the grid
- Build out more token types in detail panel (fontFamily, fontWeight, string, boolean, cubicBezier)
