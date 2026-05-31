# @xyflow/react — Custom Components

## flow.tsx

### What it is
A wrapper around `ReactFlow` that sets up controlled state, wires all connection and reconnection handlers, and exposes a clean props API. Not a modification of a library component — it encapsulates the required boilerplate so the parent never touches xyflow internals directly.

### Key decisions

**Controlled state via hooks**
Uses `useNodesState` and `useEdgesState` as required by xyflow. Mixing controlled and uncontrolled causes subtle bugs — all state goes through these hooks.

**Reconnectable edges with edge restoration**
Handles the full reconnect lifecycle:
- `onReconnect` — updates the edge to its new connection
- `onReconnectEnd` — restores the edge if it was dropped on empty space (`connectionState.isValid === false`)

This prevents edges from silently disappearing when a reconnect drag is cancelled.

**All features are togglable via props**
`showMiniMap`, `showControls`, `showBackground` all default to sensible values but can be turned off. Edge type is configurable via `edgeType` prop and applies to all new connections.

**`ConnectionMode.Loose`**
Allows connecting to a node's body, not just its handles. Paired with `reconnectRadius={40}` for a generous snap zone.

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `initialNodes` | `Node[]` | two placeholder nodes | Starting nodes |
| `initialEdges` | `Edge[]` | `[]` | Starting edges |
| `edgeType` | `'step' \| 'smoothstep' \| 'straight' \| 'default'` | `'step'` | Edge style for new connections |
| `showMiniMap` | `boolean` | `false` | Show minimap |
| `showControls` | `boolean` | `true` | Show zoom/fit controls |
| `showBackground` | `boolean` | `true` | Show dot grid background |

### Intent
Drop-in flow canvas that works out of the box with no xyflow setup required by the parent. The parent provides nodes and edges (or uses the defaults) and gets a fully interactive, reconnectable diagram.
