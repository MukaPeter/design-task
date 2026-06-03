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

### Files
- `token-configs.tsx` — the config map, one entry per DTCG type
- `token-detail-content.tsx` — the dumb renderer (replaces `token-type-content.tsx`)
- Section components — unchanged building blocks (`ValuesColor`, `CodeSyntax`, etc.)

---

## Open questions

- Panel order and size persistence — `localStorage`?
- Responsive priority — which panel collapses first when viewport shrinks?
- Re-opening a closed panel — needs a panel manager or toggle mechanism
