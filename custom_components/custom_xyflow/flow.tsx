'use client'

import { useCallback } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  reconnectEdge,
  useNodesState,
  useEdgesState,
  ConnectionMode,
} from '@xyflow/react'
import type { Node, Edge, Connection } from '@xyflow/react'
import '@xyflow/react/dist/style.css'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FlowProps {
  initialNodes?: Node[]
  initialEdges?: Edge[]
  edgeType?: 'step' | 'smoothstep' | 'straight' | 'default'
  showMiniMap?: boolean
  showControls?: boolean
  showBackground?: boolean
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

const DEFAULT_NODES: Node[] = [
  { id: '1', position: { x: 80,  y: 120 }, data: { label: 'Node A' } },
  { id: '2', position: { x: 300, y: 120 }, data: { label: 'Node B' } },
]

const DEFAULT_EDGES: Edge[] = []

// ─── Component ────────────────────────────────────────────────────────────────

export function Flow({
  initialNodes = DEFAULT_NODES,
  initialEdges = DEFAULT_EDGES,
  edgeType = 'step',
  showMiniMap = false,
  showControls = true,
  showBackground = true,
}: FlowProps) {
  const [nodes, , onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const handleConnect = useCallback((connection: Connection) => {
    setEdges(eds => addEdge({ ...connection, type: edgeType }, eds))
  }, [edgeType, setEdges])

  const handleReconnect = useCallback((oldEdge: Edge, newConnection: Connection) => {
    setEdges(eds => reconnectEdge(oldEdge, newConnection, eds))
  }, [setEdges])

  const handleReconnectEnd = useCallback((
    _evt: unknown,
    edge: Edge,
    _handleType: unknown,
    connectionState: { isValid: boolean | null }
  ) => {
    if (!connectionState.isValid) {
      setEdges(eds => eds.some(e => e.id === edge.id) ? eds : [...eds, edge])
    }
  }, [setEdges])

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
        onReconnect={handleReconnect}
        onReconnectEnd={handleReconnectEnd}
        edgesReconnectable
        reconnectRadius={40}
        connectionMode={ConnectionMode.Loose}
        fitView
      >
        {showBackground && <Background />}
        {showControls   && <Controls />}
        {showMiniMap    && <MiniMap />}
      </ReactFlow>
    </div>
  )
}
