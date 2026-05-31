# @xyflow/react (React Flow) — Learnings

## Install

```bash
npm install @xyflow/react
```

Always import the CSS:

```tsx
import '@xyflow/react/dist/style.css'
```

---

## Always use controlled state

Use `useNodesState` and `useEdgesState` hooks. Mixing controlled and uncontrolled causes subtle bugs:

```tsx
const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
```

---

## Edge types

- `default` — bezier curves
- `step` — right-angle squared connectors
- `smoothstep` — rounded right angles
- `straight` — direct lines

Set per edge or globally:

```tsx
defaultEdgeOptions={{ type: 'step' }}
```

---

## Reconnectable edges

```tsx
<ReactFlow
  edgesReconnectable
  reconnectRadius={40}
  connectionMode={ConnectionMode.Loose}
  onReconnect={(old, newConn) => setEdges(eds => reconnectEdge(old, newConn, eds))}
  onReconnectEnd={(_, edge, __, connectionState) => {
    if (!connectionState.isValid) {
      setEdges(eds => eds.some(e => e.id === edge.id) ? eds : [...eds, edge])
    }
  }}
/>
```

`onReconnectEnd` signature: `(event, edge, handleType, connectionState)` — `connectionState.isValid` is `false` when dropped on empty space.

---

## Container must have explicit height

React Flow needs a parent with a defined height. `h-full` alone won't work unless the full flex/height chain above it is correctly set up. Verify every ancestor has an explicit height or `flex-1 min-h-0`.

---

## Event conflicts with dnd-kit

Both libraries capture pointer events. Scope dnd-kit drag listeners to the panel header only so React Flow's canvas stays fully interactive.
