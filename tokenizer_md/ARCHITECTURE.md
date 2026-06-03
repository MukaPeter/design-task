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

## Open questions

- Panel order and size persistence — `localStorage`?
- Responsive priority — which panel collapses first when viewport shrinks?
- Re-opening a closed panel — needs a panel manager or toggle mechanism
