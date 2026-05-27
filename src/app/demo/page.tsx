'use client'

import React, { useState, useRef, useEffect } from 'react'
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core'
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ReactFlow, Background, Controls, reconnectEdge, addEdge, useNodesState, useEdgesState, ConnectionMode } from '@xyflow/react'
import type { Edge, Connection } from '@xyflow/react'
import { cn } from '@/lib/utils'
import { AppShell } from '@/components/app-shell'
import { Sidebar } from '@/components/sidebar'
import { LayoutDashboard, GitBranch, AlignLeft, ShieldAlert, FlaskConical, GitPullRequest, ScrollText } from 'lucide-react'
import '@xyflow/react/dist/style.css'

// ─── Sidebar config ───────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { id: 'overview',       label: 'Overview',        icon: <LayoutDashboard size={16} /> },
  { id: 'requirements',   label: 'Requirements',    icon: <AlignLeft size={16} /> },
  { id: 'traceability',   label: 'Traceability',    icon: <GitBranch size={16} /> },
  { id: 'risk',           label: 'Risk Management', icon: <ShieldAlert size={16} /> },
  { id: 'tests',          label: 'Test Results',    icon: <FlaskConical size={16} /> },
  { id: 'changes',        label: 'Change Control',  icon: <GitPullRequest size={16} /> },
  { id: 'audit',          label: 'Audit Log',       icon: <ScrollText size={16} /> },
]

const SIDEBAR_USER = {
  name: 'MukaPeter',
  role: 'Head of Design',
  initials: 'MP',
}

// ─── Flow panel ───────────────────────────────────────────────────────────────

const initialNodes = [
  { id: '1', position: { x: 80, y: 120 }, data: { label: 'Node A' } },
  { id: '2', position: { x: 280, y: 120 }, data: { label: 'Node B' } },
]

const initialEdges: Edge[] = []

function FlowPanel() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  function handleConnect(connection: Connection) {
    setEdges(eds => addEdge({ ...connection, type: 'step' }, eds))
  }

  function handleReconnect(oldEdge: Edge, newConnection: Connection) {
    setEdges(eds => reconnectEdge(oldEdge, newConnection, eds))
  }

  function handleReconnectEnd(
    _evt: unknown,
    edge: Edge,
    _handleType: unknown,
    connectionState: { isValid: boolean | null }
  ) {
    if (!connectionState.isValid) {
      setEdges(eds => eds.some(e => e.id === edge.id) ? eds : [...eds, edge])
    }
  }

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
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  )
}

// ─── Chat panel ───────────────────────────────────────────────────────────────

type Message = { id: number; from: 'me' | 'them'; text: string }

const seedMessages: Message[] = [
  { id: 1, from: 'them', text: 'Hey, can you check the workflow diagram?' },
  { id: 2, from: 'me',   text: 'Looking at it now — the nodes are connected, right?' },
  { id: 3, from: 'them', text: 'Exactly. Let me know if the flow makes sense.' },
]

function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>(seedMessages)
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function send() {
    const text = input.trim()
    if (!text) return
    setMessages(prev => [...prev, { id: Date.now(), from: 'me', text }])
    setInput('')
    setTimeout(() => {
      setMessages(prev => [...prev, { id: Date.now() + 1, from: 'them', text: 'Got it, thanks!' }])
    }, 800)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.map(msg => (
          <div key={msg.id} className={`flex items-end gap-2 ${msg.from === 'me' ? 'flex-row-reverse' : ''}`}>
            {msg.from === 'them' && (
              <Avatar className="w-6 h-6 shrink-0">
                <AvatarFallback className="text-xs">A</AvatarFallback>
              </Avatar>
            )}
            <div className={cn(
              'max-w-[75%] rounded-2xl px-3 py-2 text-sm',
              msg.from === 'me'
                ? 'bg-primary text-primary-foreground rounded-br-sm'
                : 'bg-muted rounded-bl-sm'
            )}>
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="border-t px-3 py-3 flex gap-2 shrink-0">
        <Input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Type a message..."
          className="text-sm"
        />
        <Button size="sm" onClick={send}>Send</Button>
      </div>
    </div>
  )
}

// ─── Swappable panel wrapper ──────────────────────────────────────────────────

const PANEL_META: Record<string, { title: string; content: React.ReactNode }> = {
  flow: { title: 'Workflow Diagram', content: <FlowPanel /> },
  chat: { title: 'Team Chat',        content: <ChatPanel /> },
}

function SwappablePanel({ id }: { id: string }) {
  const { attributes, listeners, setNodeRef: setDragRef, isDragging } = useDraggable({ id })
  const { setNodeRef: setDropRef, isOver } = useDroppable({ id })
  const { title, content } = PANEL_META[id]

  return (
    <div
      ref={el => { setDragRef(el); setDropRef(el) }}
      className={cn(
        'h-full flex flex-col transition-colors',
        isOver && !isDragging && 'bg-accent/30',
        isDragging && 'opacity-40'
      )}
    >
      <div
        {...listeners}
        {...attributes}
        className="flex items-center gap-2 px-4 py-3 border-b shrink-0 cursor-grab active:cursor-grabbing select-none"
      >
        <span className="text-muted-foreground">⠿</span>
        <span className="text-sm font-medium">{title}</span>
        <Badge variant="outline" className="ml-auto text-xs">drag to swap</Badge>
      </div>
      <div className="flex-1 overflow-hidden">
        {content}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Demo() {
  const [panelOrder, setPanelOrder] = useState(['flow', 'chat'])

  function handleDragEnd({ active, over }: { active: { id: string }, over: { id: string } | null }) {
    if (!over || active.id === over.id) return
    setPanelOrder(prev => {
      const next = [...prev]
      const a = next.indexOf(String(active.id))
      const b = next.indexOf(String(over.id))
      ;[next[a], next[b]] = [next[b], next[a]]
      return next
    })
  }

  return (
    <AppShell
      sidebar={
        <Sidebar
          items={NAV_ITEMS}
          user={SIDEBAR_USER}
          badge="Beta"
        />
      }
    >
      <DndContext id="panel-dnd" onDragEnd={handleDragEnd}>
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {panelOrder.map((id, index) => (
            <React.Fragment key={id}>
              {index > 0 && <ResizableHandle withHandle />}
              <ResizablePanel defaultSize={50} minSize={20}>
                <SwappablePanel id={id} />
              </ResizablePanel>
            </React.Fragment>
          ))}
        </ResizablePanelGroup>
      </DndContext>
    </AppShell>
  )
}
