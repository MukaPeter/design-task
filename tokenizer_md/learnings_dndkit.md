# dnd-kit — Learnings

## Install

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

---

## SSR hydration error

dnd-kit generates random accessibility IDs that differ between server and client. Always give `DndContext` a stable `id` prop:

```tsx
<DndContext id="my-dnd-context" onDragEnd={...}>
```

---

## Drag handle pattern

Scope `useDraggable` listeners to a handle element only — not the whole card. This prevents conflicts with interactive content (inputs, flow diagrams, etc.) inside the draggable:

```tsx
const { listeners, attributes, setNodeRef } = useDraggable({ id })
// setNodeRef → card wrapper
// listeners + attributes → handle element only
```

---

## Panel swap (two items)

For swapping two panels, use a simple index swap in `onDragEnd`. No need for `@dnd-kit/sortable`:

```tsx
function handleDragEnd({ active, over }: DragEndEvent) {
  if (!over || active.id === over.id) return
  setOrder(prev => {
    const next = [...prev]
    const a = next.indexOf(String(active.id))
    const b = next.indexOf(String(over.id))
    ;[next[a], next[b]] = [next[b], next[a]]
    return next
  })
}
```

---

## TypeScript types

Use `DragEndEvent` from `@dnd-kit/core` for the `onDragEnd` handler — not a manual type. `active.id` is `UniqueIdentifier` (string | number), not just `string`:

```tsx
import { DndContext, DragEndEvent } from '@dnd-kit/core'

function handleDragEnd({ active, over }: DragEndEvent) { ... }
```

---

## Event conflicts with react-resizable-panels

dnd-kit and react-resizable-panels both capture pointer events. Scope dnd-kit listeners to a drag handle in the panel header — not the whole panel. This keeps the resize handle fully interactive.
