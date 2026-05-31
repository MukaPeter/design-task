# Registry — Custom Components

Index of all custom and modified components. When working with any of these, load the relevant customization doc first.

---

## shadcn/ui modifications

| Component | File | What was changed |
|---|---|---|
| Button | `custom_shadcn/button.tsx` | Added `nav` size variant for sidebar nav items |
| ResizableHandle | `custom_shadcn/resizable.tsx` | Added hover highlight — line + grip pill styled with `group-hover:` |

Details → `custom_shadcn/shadcn_customizations.md`

---

## dnd-kit custom components

| Component | File | What it does |
|---|---|---|
| Panel | `custom_dndkit/panel.tsx` | Card + Tabs + drag handle + droppable. Content-agnostic layout container |
| Sidebar | `custom_dndkit/sidebar.tsx` | 3-state sidebar (collapsed / hover overlay / pinned). Isolated — no external state |

Details → `custom_dndkit/dndkit_customizations.md`

---

## @xyflow/react custom components

| Component | File | What it does |
|---|---|---|
| Flow | `custom_xyflow/flow.tsx` | ReactFlow wrapper with controlled state, reconnectable edges, toggleable UI |

Details → `custom_xyflow/xyflow_customizations.md`

---

## react-arborist custom components

| Component | File | What it does |
|---|---|---|
| CollectionsTree | `custom_arborist/collections-tree.tsx` | Auto-sizing tree list with hover/selected states, chevron expand/collapse |

Details → `custom_arborist/arborist_customizations.md`
