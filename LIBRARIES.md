# Library Notes — Lessons Learned

Real gotchas and patterns discovered while building. Not docs — things the docs don't tell you upfront.

---

## shadcn/ui

**Install components individually:**
```bash
npx shadcn@latest add button card input ...
```

**Components live in your codebase** at `src/components/ui/` — you own the code, you can modify anything directly.

**Tailwind v4 gotcha:** This project uses Tailwind v4. Some community examples are written for v3. The config syntax is different — no `tailwind.config.js`, everything is in `globals.css` using `@theme`.

**Colors use OKLCH** — or you can use hex directly in CSS custom properties:
```css
--primary: #009CFF;  /* hex works fine */
--primary: oklch(0.65 0.19 230);  /* oklch also works */
```

**Pre-installed in this project:**
`avatar, badge, button, card, dialog, dropdown-menu, input, label, resizable, select, separator, sheet, tabs, textarea`

---

## react-resizable-panels (via shadcn `resizable`)

**Install via shadcn:**
```bash
npx shadcn@latest add resizable
```

**Hover highlight on the handle:** The library exposes `data-resize-handle-state` (`idle` / `hover` / `drag`) on the Separator element — but targeting pseudo-elements or children via Tailwind data-attribute selectors is unreliable. Use `group` + `group-hover:` on actual child divs instead:
```tsx
<Separator className="group ...">
  <div className="... group-hover:bg-primary/60" />
</Separator>
```

**Make the handle wider than `w-px`** for a comfortable grab target — `w-2` works well, with the visual line as an absolutely positioned inner div.

**Panel order swap:** When you change the order of `ResizablePanel` children in React state, they re-render in the new order. The resize positions reset — acceptable for most use cases.

**Key prop warning:** When mapping panels, use `React.Fragment` with a key instead of `<>`:
```tsx
{items.map((id, index) => (
  <React.Fragment key={id}>
    {index > 0 && <ResizableHandle />}
    <ResizablePanel>...</ResizablePanel>
  </React.Fragment>
))}
```

---

## dnd-kit

**Install:**
```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

**SSR hydration error** — dnd-kit generates random accessibility IDs that differ between server and client. Fix: always give `DndContext` a stable `id` prop:
```tsx
<DndContext id="my-dnd-context" onDragEnd={...}>
```

**Drag handle pattern** — scope `useDraggable` listeners to a handle element only, not the whole card. This prevents conflicts with interactive content (React Flow, inputs, etc.) inside the draggable:
```tsx
const { listeners, attributes, setNodeRef } = useDraggable({ id })
// Apply setNodeRef to the card wrapper
// Apply listeners + attributes only to the handle div
```

**Free canvas positioning** — track `{ x, y }` in state per item. On `dragEnd`, add `delta.x` / `delta.y` to the stored position:
```tsx
function handleDragEnd({ active, delta }) {
  setPositions(prev => ({
    ...prev,
    [active.id]: {
      x: prev[active.id].x + delta.x,
      y: prev[active.id].y + delta.y,
    }
  }))
}
```

**Panel swap** — for swapping two items (not a list), use a simple index swap on `dragEnd`. Don't need `@dnd-kit/sortable` for two items:
```tsx
const a = order.indexOf(active.id)
const b = order.indexOf(over.id)
;[next[a], next[b]] = [next[b], next[a]]
```

**Event conflicts with React Flow** — dnd-kit and React Flow both capture pointer events. Use a drag handle scoped to the panel header so React Flow's canvas stays fully interactive.

---

## React Flow (@xyflow/react)

**Install:**
```bash
npm install @xyflow/react
```

**Always import the CSS:**
```tsx
import '@xyflow/react/dist/style.css'
```

**Use controlled state** — always use `useNodesState` and `useEdgesState` hooks. Mixing controlled (`nodes=`) and uncontrolled (`defaultNodes=`) causes subtle bugs with reconnect and other interactions:
```tsx
const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
```

**Edge types:**
- `default` — bezier curves (elastic)
- `step` — right-angle squared connectors
- `smoothstep` — rounded right angles
- `straight` — direct straight lines

Set per edge: `{ ...connection, type: 'step' }` or globally via `defaultEdgeOptions={{ type: 'step' }}`.

**User-drawn connections:**
```tsx
import { addEdge } from '@xyflow/react'

function handleConnect(connection) {
  setEdges(eds => addEdge({ ...connection, type: 'step' }, eds))
}
<ReactFlow onConnect={handleConnect} ... />
```

**Reconnectable edges** — allow users to grab and redirect existing connectors:
```tsx
<ReactFlow
  edgesReconnectable
  reconnectRadius={40}           // increase this — default is too small
  connectionMode={ConnectionMode.Loose}  // snap to node body, not just handle
  onReconnect={(old, newConn) => setEdges(eds => reconnectEdge(old, newConn, eds))}
  onReconnectEnd={(_, edge, __, connectionState) => {
    if (!connectionState.isValid) {
      // dropped on empty space — restore the edge
      setEdges(eds => eds.some(e => e.id === edge.id) ? eds : [...eds, edge])
    }
  }}
/>
```

**`onReconnectEnd` signature:** `(event, edge, handleType, connectionState)` — `connectionState.isValid` is `false` when dropped on empty space.

**Container must have explicit height** — React Flow needs a parent div with a defined height, not just `h-full` from a flex parent. Verify the chain of height declarations goes all the way up.
