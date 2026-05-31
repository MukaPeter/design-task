# dnd-kit — Custom Components

## panel.tsx

### What it is
A composed component built on shadcn `Card` + shadcn `Tabs` + dnd-kit `useDraggable` / `useDroppable`. It is not a modification of a library component — it is a custom component that uses dnd-kit as a capability.

### Key decisions

**Drag handle scoped to header only**
The `useDraggable` listeners are attached only to the `GripVertical` button in the header — not the whole card. This keeps all interactive content inside the panel (inputs, canvas, buttons) fully clickable and not hijacked by the drag system.

```tsx
<button {...listeners} {...attributes} className="cursor-grab ...">
  <GripVertical size={16} />
</button>
```

**Both draggable and droppable on the same ref**
The outer div receives both `setDragRef` and `setDropRef` so the panel is simultaneously a drag source and a drop target. This enables panel swapping without a separate invisible drop zone.

**Drop highlight**
When another panel is dragged over this one (`isOver && !isDragging`), the card background shifts to `bg-muted/50`. The `!isDragging` guard prevents the panel from highlighting itself while being dragged.

### Intent
A generic content container that can hold any tabbed content and be repositioned by drag-and-drop. The content it holds (tabs, what's in them) is defined by the parent — the panel itself is layout-only.

---

## sidebar.tsx

### What it is
A custom sidebar component built with shadcn `Button` (nav variant). Not a modification of a dnd-kit component — it sits alongside dnd-kit in the layout and uses a two-layer pattern to handle its three states cleanly.

### Key decisions

**Two-layer pattern (outer div + inner aside)**
The outer `div` owns the layout space — it holds the width that pushes or does not push the content beside it. The inner `aside` owns the visual — it can expand wider than the outer div on hover without reflowing the page.

```
Collapsed: outer = 60px, inner = 60px
Hover:     outer = 60px, inner = 240px (floats over content, z-50, shadow)
Pinned:    outer = 240px, inner = 240px (pushes content, no shadow)
```

**All state is internal**
`pinned`, `hovered`, and `active` are managed inside the component. The only surface to the outside world is `items`, `activeId`, and `onSelect`. This means nothing outside can accidentally break the sidebar's visual state.

**Nav items use the `nav` Button size variant**
Full-width, left-aligned, fixed height. Icon is always present; label renders only when expanded. The `aside` `overflow-hidden` clips the label in collapsed state — no conditional width tricks needed.

### Intent
A navigation sidebar with three states (collapsed, hover overlay, pinned) that is fully isolated from the rest of the layout. Safe to use alongside dnd-kit panels — pointer events do not conflict because the sidebar does not use any dnd-kit listeners.
