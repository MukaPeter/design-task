# Architecture

---

## Layout structure

```
page.tsx
  ├── sidebar.tsx          ← nav rail (left)
  └── workspace.tsx        ← dynamic panel layout
        └── workspace-panel.tsx (× N)
              ├── Header   ← title + drag handle + close
              ├── Content  ← any content (tree, grid, detail, etc.)
              └── Footer   ← optional (e.g. + Create token)
```

The workspace is agnostic — it holds any number of panels (practical range: 1–4) and doesn't care what's inside them. Panels are slots. Swapping content on a different page doesn't require touching the layout.

---

## Workspace API

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

**Behaviour**
- Resizable via handle on the edge (react-resizable-panels)
- Draggable — reorders within the workspace (dnd-kit)
- Closeable — optional

**Structure**
```tsx
<WorkspacePanel
  title="Collections"
  onClose={() => ...}        // optional
  footer={<CreateButton />}  // optional
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
| `Button` | shadcn/ui | Close button, footer actions |
| `DndContext` / `SortableContext` | @dnd-kit/core + sortable | Drag-to-reorder context |
| `useSortable` | @dnd-kit/sortable | Per-panel drag hook |
| `GripVertical` | lucide-react | Drag handle icon |
| `X` | lucide-react | Close icon |

### Customised — built on an existing component

| Component | Base | What changed |
|---|---|---|
| `ResizableHandle` | shadcn `resizable.tsx` | Hover highlight added. No further changes needed. |

### New — built from scratch

| Component | Why no existing base |
|---|---|
| `workspace.tsx` | No library handles the dnd + resizable combination together |
| `workspace-panel.tsx` | Header / content / footer shell — no shadcn equivalent |

---

## Layout rules (to be defined)

- Panel sizing is percentage-based (react-resizable-panels constraint)
- Pixel-based collapse thresholds require a `ResizeObserver` on the workspace container
- Panel C (detail) is conditional — shown/hidden based on selection state
