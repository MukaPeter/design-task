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

The workspace is agnostic — it holds any number of panels (practical range: 1–4) and doesn't care what's inside them. Panels are slots. Swapping content on a different page doesn't require touching the layout.

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

## Open questions

- Panel order and size persistence — `localStorage`?
- Responsive priority — which panel collapses first when viewport shrinks?
- Re-opening a closed panel — needs a panel manager or toggle mechanism
