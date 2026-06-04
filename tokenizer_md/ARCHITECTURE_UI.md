# Architecture

---

## Layout structure

```
App
├── Sidebar                          ← nav rail, always present
└── AppShell                         ← fills remaining space
      ├── AppHeader                  ← repo selector, global actions
      └── Workspace                  ← resizable panel container, dnd context
            ├── WorkspacePanel       ← Panel A (e.g. tree)
            │     ├── PanelHeader    ← drag handle · title · actions · collapse · close
            │     ├── PanelContent   ← scroll container, owns overflow
            │     └── PanelFooter    ← optional
            ├── ResizableHandle
            ├── WorkspacePanel       ← Panel B (e.g. grid)
            │     ├── PanelHeader
            │     ├── PanelContent
            │     └── PanelFooter
            ├── ResizableHandle
            └── WorkspacePanel       ← Panel C (e.g. detail)
                  ├── PanelHeader
                  ├── PanelContent
                  └── PanelFooter
```

The workspace is agnostic — it holds any number of panels and doesn't care what's inside them. Panels are slots. Swapping content on a different page doesn't require touching the layout.

The number of panels is not hardcoded. The workspace renders whatever it receives. There is no upper limit enforced at the component level — the practical constraint is screen space, not the component. 1 panel (full-width view) is just as valid as 4 panels side by side.

---

## AppHeader

Sits above the workspace. Separate from panels. One per page/view.

```
[ repo selector ]  ··········  [ global actions ]
```

---

## Workspace

- Holds ordered list of panels
- Owns dnd context + panel order state
- Owns panel visibility (collapsed / open / closed)
- Knows responsive priority per panel
- Panel sizing is percentage-based (react-resizable-panels constraint)
- Pixel-based collapse thresholds require a `ResizeObserver` on the workspace container

```tsx
<Workspace panels={[
  { id: 'tree',   content: <CollectionsTree />, defaultSize: 23, minSize: 15 },
  { id: 'grid',   content: <TokenGrid />,       defaultSize: 50, minSize: 20 },
  { id: 'detail', content: <DetailPanel />,     defaultSize: 27, minSize: 20 },
]} />
```

---

## WorkspacePanel

A panel is a self-contained UI unit.

### PanelHeader

```
[ drag handle? ]  [ title ]  ··········  [ actions? ]  [ collapse? ]  [ close? ]
```

All behaviours are opt-in — off by default.

| Prop | Type | Default | Notes |
|---|---|---|---|
| `title` | string or node | required | |
| `draggable` | boolean | false | Shows drag handle, enables reorder |
| `collapsible` | boolean | false | Shrinks panel to header only |
| `closeable` | boolean | false | Removes panel from workspace |
| `actions` | node | — | Right-side slot for contextual actions |

### PanelContent

- Owns `overflow-y-auto`
- Fills available height between header and footer
- Content passed as children — knows nothing about scroll

### PanelFooter

- Optional
- Passed as a prop
- Typical use: `+ Create token`, pagination, status

### Full API

```tsx
<WorkspacePanel
  title="Collections"
  draggable
  collapsible
  closeable
  actions={<SearchButton />}
  footer={<CreateTokenButton />}
>
  <CollectionsTree />
</WorkspacePanel>
```

---

## Component inventory

### Ready-made — use as-is

| Component | Source | Used for |
|---|---|---|
| `ResizablePanelGroup` / `ResizablePanel` | shadcn/ui | Panel layout + sizing |
| `ResizableHandle` | shadcn/ui (modified — see below) | Resize drag handle between panels |
| `Button` | shadcn/ui | Close, collapse, footer actions |
| `DndContext` / `SortableContext` | @dnd-kit/core + sortable | Drag-to-reorder context |
| `useSortable` | @dnd-kit/sortable | Per-panel drag hook |
| `GripVertical` | lucide-react | Drag handle icon |
| `X` | lucide-react | Close icon |
| `ChevronsLeftRight` / `ChevronsRightLeft` | lucide-react | Collapse/expand icon |

### Customised — built on an existing component

| Component | Base | What changed |
|---|---|---|
| `ResizableHandle` | shadcn `resizable.tsx` | Hover highlight added. No further changes needed. |

### New — built from scratch

| Component | Why no existing base |
|---|---|
| `app-shell.tsx` | Simple flex wrapper — no library equivalent needed |
| `app-header.tsx` | Repo selector + global actions bar |
| `workspace.tsx` | No library handles dnd + resizable together |
| `workspace-panel.tsx` | Header / content / footer shell — no shadcn equivalent |

---

## Token data model (to be moved to its own doc)

Each token has:

| Field | Description |
|---|---|
| **Name** | User-defined. Whatever was imported from Figma or created manually (e.g. `primary-blue`, `spacing-4`, `brand/action/default`) |
| **Type** | Tokenizer's internal enriched type (e.g. `dimension`) |
| **DTCG type** | W3C Design Token Community Group standard type — what gets exported and consumed by other tools |

Both Type and DTCG type are shown in the detail panel. They are often the same, but diverge when the user enriches a Figma primitive — e.g. Figma exports `number`, user maps it to DTCG `dimension`.

> **Note:** This section belongs in a dedicated token data model doc. Move it out of ARCHITECTURE.md when that doc is created.

---

## Detail panel — constant structure

Every token type shows these, always:

```
TokenMeta        ← Type / DTCG type / Name
Description      ← user-defined or default
[type-specific]  ← 0 or more sections (ValuesColor, ValuesDimension, etc.)
CodeSyntax       ← collapsible, always present
Aliases          ← collapsible, always present
```

---

## Detail panel — composition model

The detail panel uses a **config-driven composition model**. Each token type declares what it renders — the renderer is dumb and just executes the config.

### Why
- Adding a new token type = one config entry, no new layout code
- Changing a shared section (e.g. `CodeSyntax` style) = updates all token types automatically
- Structure is explicit and readable in one place

### Shape

```ts
interface TokenConfig {
  description: string
  sections: React.ReactNode[]   // rendered in order, after TokenMeta + Description
}

const TOKEN_CONFIGS: Partial<Record<DtcgType, TokenConfig>> = {
  color: {
    description: '...',
    sections: [<ColorSwatch />, <ValuesColor />, <CodeSyntax />, <Aliases />],
  },
  dimension: {
    description: '...',
    sections: [<ValuesDimension />, <CodeSyntax />, <Aliases />],
  },
  // new token type = one new entry here
}
```

### Renderer

```
TokenMeta                     ← always, from structure
Description                   ← always, from config
sections[0], sections[1]...   ← from config, in declaration order
```

### Section inventory

Sections are reusable building blocks. Each is independent — the config picks which ones to include per token type. A section used by one type today can be added to any other type in the future without changes to the section itself.

| Section | Currently used by | Notes |
|---|---|---|
| `ColorSwatch` | `color` | Large swatch with format + mode dropdowns |
| `ValuesColor` | `color` | Color formats × modes table |
| `ValuesDimension` | `dimension` | Unit conversion table |
| `ValuesDuration` | `duration` | ms/s conversion table |
| `ValuesNumber` | `number` | Intent dropdown + formatted value |
| `CodeSyntax` | all | Collapsible name/value table, editable |
| `Aliases` | all | Collapsible token path list |

### Section component audit

For each section: what library components it uses, what is hand-rolled, and whether the custom parts can be replaced.

---

#### `TokenMeta`
| | |
|---|---|
| **Uses** | Plain HTML `<table>` + `<colgroup>`, lucide icons via `TOKEN_TYPE_ICONS` |
| **Custom** | The table layout itself — no shadcn table used here deliberately (colgroup width control) |
| **Replace?** | No. shadcn `Table` doesn't support reliable `colgroup` column widths with Tailwind v4 scanning. Plain HTML is correct here. |

---

#### `Description`
| | |
|---|---|
| **Uses** | Plain HTML only |
| **Custom** | Entire component |
| **Replace?** | No library equivalent needed — it's two text nodes. Keep as-is. |

---

#### `ColorSwatch`
| | |
|---|---|
| **Uses** | `DropdownMenu` (shadcn/base-ui), `ChevronDown` (lucide), `convertColor` (custom util) |
| **Custom** | The swatch div (`<div style={{ backgroundColor }}>`) — plain HTML with inline style |
| **Replace?** | No library component for a color swatch. Inline style is correct here — background color is dynamic. |

---

#### `ValuesColor` / `ValuesDimension` / `ValuesDuration` / `ValuesNumber`
| | |
|---|---|
| **Uses** | `SectionTable` (custom), shadcn `Table` rows/cells, `DropdownMenu` (number only), `Copy` (lucide) |
| **Custom** | Collapsible wrapper — hand-rolled `useState` + `ChevronDown` button repeated in every section |
| **Replace?** | **Yes** — extract a shared `DetailSection` collapsible wrapper. All four sections use identical open/close pattern. |

---

#### `CodeSyntax`
| | |
|---|---|
| **Uses** | `SectionTable` (custom), shadcn `Table` rows/cells, `Input` (shadcn), `Copy` + `ChevronDown` (lucide) |
| **Custom** | Collapsible wrapper (same as Values sections). Inline editing via click-to-edit pattern. Copy button. |
| **Replace?** | Collapsible → `DetailSection` (same fix as Values). Click-to-edit and copy button — no library equivalent, keep custom. |

---

#### `Aliases`
| | |
|---|---|
| **Uses** | shadcn `Table` rows/cells, `ChevronDown` (lucide) |
| **Custom** | Collapsible wrapper (same pattern). Token path rendered as plain spans. |
| **Replace?** | Collapsible → `DetailSection`. Path rendering — no library needed, keep as-is. |

---

#### `SectionTable`
| | |
|---|---|
| **Uses** | shadcn `Table`, `TableHeader`, `TableBody`, `TableHead`, `TableRow` |
| **Custom** | The `colgroup` with fixed first-column width (`92px`), the `pl-[12px]` indent |
| **Replace?** | No — this is a thin wrapper that solves a real layout problem (reliable column widths). Keep it. |

---

### Summary of custom parts to address

| Issue | Affected sections | Action |
|---|---|---|
| Hand-rolled collapsible (useState + ChevronDown) | `ValuesColor`, `ValuesDimension`, `ValuesDuration`, `ValuesNumber`, `CodeSyntax`, `Aliases` | Extract `DetailSection` wrapper |
| All other custom code | Various | No library replacement available — keep |

### Files
- `token-configs.tsx` — the config map, one entry per DTCG type
- `token-detail-content.tsx` — the dumb renderer (replaces `token-type-content.tsx`)
- `sections/detail-section.tsx` — shared collapsible wrapper (new)
- `sections/` — building blocks, one file per section

---

## Token grid

### Row
Each row represents one token. The row holds the token's name and its value in each mode.

### Name column
- Always the first column
- Shows the token type icon (not editable) + the token name
- The token name is the user-given identifier (e.g. `primary-blue`, `spacing-4`, `brand/action/default`)
- Name is read-only for now — editable later, with the ability to push the updated name back to connected systems

### Value columns (one per mode)
Each mode is a separate column. A value cell contains:
- **Color sample** — only for color tokens
- **Value** — the displayed value in the selected unit or format
- **Unit / format dropdown** — only where applicable (color → format, dimension → unit, duration → unit, number → intent)
- **Alias indicator** — visual flag shown when the token is an alias. Design and logic TBD.
- **Recalculation** — switching unit or format recalculates the displayed value. The canonical stored value never changes — conversion is display-only.

### Modes

> A mode is a named condition under which a token takes a specific value.

The token identity stays the same — same name, same type, same purpose. Only the value changes per mode. Example: `color/brand/primary` is `#0066FF` in Light mode and `#3385FF` in Dark mode.

Modes are defined at the **Collection level** — all tokens in a collection share the same set of modes. The grid columns change depending on which collection is selected.

**Naming:**
- Default names are auto-incremented — Mode 1, Mode 2, Mode 3...
- User can rename any column by clicking the header (e.g. "Light", "Dark", "High contrast")
- Adding a new column always uses the next default number based on count, regardless of existing column names

### Actions column
- Last column, always present
- Opens the detail panel for the selected row

### Grid grouping

The grid is not a flat list. When the selected node contains sub-groups, the grid renders each sub-group as a section with a header row, followed by its tokens.

**Group header row** — shows the full path from the collection down to that group:

```
semantic/primary
  default         [value]  [value]
  default-hover   [value]  [value]
  foreground      [value]  [value]

semantic/secondary
  default         [value]  [value]
  default-hover   [value]  [value]
  foreground      [value]  [value]
```

The header row is non-interactive — it's a visual separator, not a selectable row. The path depth matches however deep the user has defined their group structure.

---

### Grid audit — current state vs target

| Area | Current state | Target |
|---|---|---|
| **Location** | Inside `page.tsx` | Extract to `components/token-grid.tsx` |
| **Cell renderers** | Giant `if/else` chain per token type inline in JSX | Config-driven `CellRenderer` per token type, same pattern as detail panel |
| **Column resize** | Hand-rolled `mousedown/mousemove/mouseup` inline | Extract to `useColumnResize` hook |
| **Open detail button** | Raw `<button>` | shadcn `Button` with `variant="ghost"` `size="icon-sm"` |
| **Mode columns** | Hardcoded to one column (Mode 1) | Dynamic — driven by selected collection's mode definitions |
| **Column header rename** | Not built | Click header to rename, default name auto-incremented |
| **Add mode** | Not built | Add column button, TBD placement |
| **Alias indicator** | Not built | Visual flag per cell, design and logic TBD |
| **Mock data** | `ROWS` hardcoded in `page.tsx` | Passed as prop to `TokenGrid` |
| **`DimensionUnit` / `DurationUnit` types** | Defined inline in `page.tsx` | Move to shared types file |

---

## Collections tree

The tree is purely organisational navigation. It shows structure only — Collections and Groups. Tokens are never shown in the tree.

### Naming
"Collection", "Group", and "Token" are **structural types** — they describe what something is in the hierarchy. The actual names are always user-defined, either imported or created manually.

```
color-primitives        ← a Collection (user named)
  └── brand             ← a Group (user named)
        └── primary     ← a Group (user named, leaf)
typescale               ← a Collection (user named)
  └── heading           ← a Group (user named)
```

The type determines behaviour (selection scope, grid rendering). The name is whatever the user called it.

### What the tree shows
```
color-primitives
  └── brand
        └── primary     ← leaf (no sub-groups)
typescale
  └── heading            ← leaf (no sub-groups)
```

A **leaf** in the tree is a Group with no sub-groups. It may contain 1 or many tokens — that doesn't affect whether it appears as a leaf.

### Click behaviour — split interaction zones

Each tree row has two distinct clickable areas:

| Zone | Element | Action |
|---|---|---|
| **Chevron** | `ChevronRight` icon | `node.toggle()` — expand or collapse. Does not select. |
| **Label** | `<span>` with node name | `node.select()` — selects the node, loads the grid. Does not toggle. |

The outer row div has no `onClick`. Clicks are handled only on the chevron and label. This prevents accidental selection when the user intends to expand, and prevents accidental toggling when the user intends to select.

react-arborist fires `onSelect` only when `node.select()` is called explicitly — there is no implicit selection from clicking anywhere in the row. The `handleClick` method on `NodeApi` is only used by the default row renderer, which we do not use.

### Selection behaviour

| Selected node | Grid shows |
|---|---|
| **Collection** | All tokens in all groups and sub-groups within it (recursive) |
| **Group** | All tokens in all sub-groups within it + its own tokens (recursive) |
| **Leaf (group with no sub-groups)** | All tokens directly inside it |

Selection is always additive and recursive. You never get a partial view — selecting a node always shows the full contents of everything underneath it.

### Scope
The tree shows Collections and Groups within the **currently selected Repository** (selected via the AppHeader dropdown). The Repository level is not shown in the tree.

### Selection constraints

- **Single selection only** — one node at a time, no multi-select
- **Maximum scope = Collection** — the largest grid view is one collection and all tokens within it
- **Repository-level view is not available** — you cannot select all collections simultaneously

### Token counts

Each tree row shows a right-aligned token count. The count is recursive — a node shows the total number of tokens in itself and all descendants.

- **Leaf nodes** — `tokenCount` field on the `TreeItem`
- **Parent nodes** — `getTotalCount()` recurses through all children and sums
- **Zeros shown** — empty groups display `0`, not hidden
- Displayed at 10px (`tok-unit-label` class), `text-muted-foreground`

### Panel header actions

The `actions` slot on `WorkspacePanel` is the correct home for panel-scoped controls. For the Collections panel this is the expand/collapse all toggle:

- Single button, toggles between `ChevronsDownUp` (collapse all) and `ChevronsUpDown` (expand all)
- State tracked in `TokensView` as `treeExpanded: boolean`
- Calls `treeRef.current.collapseAll()` / `expandAll()` via `forwardRef` + `useImperativeHandle` on `CollectionsTree`

### Breadcrumb
The breadcrumb above the grid reflects the path to the selected node within the current repository:

```
Collection A  /  Group  /  Group
```

The repository name is **not included** — the repo is the active context for the whole session. Navigating away from a repo means leaving that context entirely. Repeating it in the breadcrumb adds no value.

---

## Open questions

- Panel order and size persistence — `localStorage`?
- Responsive priority — which panel collapses first when viewport shrinks?
- Re-opening a closed panel — needs a panel manager or toggle mechanism
