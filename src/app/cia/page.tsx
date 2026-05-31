'use client'

import { useState } from 'react'
import { DndContext, DragEndEvent } from '@dnd-kit/core'
import { useDraggable, useDroppable } from '@dnd-kit/core'
import { GripVertical, Table2, Timeline, X } from 'lucide-react'
import { Sidebar } from '@/components/sidebar'
import { Chat } from '@/components/chat'
import { Flow, NODE_REASONING, DEFAULT_NODES } from '@/components/flow'
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import type { Node } from '@xyflow/react'
import React from 'react'

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
  'up-to-date':   'bg-green-100 text-green-800',
  'needs-review': 'bg-amber-100 text-amber-800',
  'stale':        'bg-red-100 text-red-800',
}

const STATUS_LABELS: Record<string, string> = {
  'up-to-date':   'Up to date',
  'needs-review': 'Needs review',
  'stale':        'Stale',
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status] ?? 'bg-muted text-muted-foreground'}`}>
      {STATUS_LABELS[status] ?? status}
    </span>
  )
}

// ─── Nav ──────────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { id: 'traceability', label: 'Traceability Matrix', icon: <Table2 size={16} /> },
  { id: 'cia',          label: 'Impact Analysis Graph', icon: <Timeline size={16} /> },
]

// ─── Draggable panel wrapper ──────────────────────────────────────────────────

function DraggablePanel({
  id,
  title,
  children,
  defaultSize,
  minSize,
}: {
  id: string
  title: string
  children: React.ReactNode
  defaultSize: number
  minSize: number
}) {
  const { listeners, attributes, setNodeRef: setDragRef, isDragging } = useDraggable({ id })
  const { setNodeRef: setDropRef, isOver } = useDroppable({ id })

  return (
    <ResizablePanel id={id} defaultSize={defaultSize} minSize={minSize}>
      <div
        ref={el => { setDragRef(el); setDropRef(el) }}
        className={`h-full flex flex-col transition-colors ${isOver && !isDragging ? 'bg-muted/50' : ''}`}
      >
        <div className="h-14 flex items-center gap-2 px-3 border-b shrink-0">
          <button
            {...listeners}
            {...attributes}
            className="text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing touch-none"
          >
            <GripVertical size={16} />
          </button>
          <span className="text-sm font-semibold">{title}</span>
        </div>
        <div className="flex-1 min-h-0">
          {children}
        </div>
      </div>
    </ResizablePanel>
  )
}

// ─── Panel content — defined at module level so it never remounts ─────────────

function makePanels(onNodeClick: (node: Node) => void, selectedNodeId: string | null, onArtifactClick: (id: string) => void): Record<string, { title: string; content: React.ReactNode }> {
  return {
    'chat-panel': {
      title: 'Ketryx Agent',
      content: <Chat theirName="Ketryx Agent" myName="Peter" placeholder="Ask anything..." onArtifactClick={onArtifactClick} initialMessages={[
        { id: 1, from: 'me',   text: 'Please run a full change impact analysis for REQ-142, the recent update to the infusion rate limit enforcement algorithm.' },
        { id: 2, from: 'them', text: 'Analysis complete. I identified 12 affected artifacts across requirements, risk controls, verification tests, and regulatory mappings. Four items are flagged as stale and require immediate attention — RISK-047-A, SPEC-SW-230, and TEST-V-340 are directly invalidated by the algorithm change. I\'ve also surfaced 4 secondary items with lower confidence scores for your review. The impact graph has been populated.' },
      ]} />,
    },
    'flow-panel': {
      title: 'Change Impact Graph',
      content: <Flow onNodeClick={onNodeClick} selectedNodeId={selectedNodeId} />,
    },
  }
}

const DEFAULT_SIZES: Record<string, { defaultSize: number; minSize: number }> = {
  'chat-panel': { defaultSize: 15, minSize: 12 },
  'flow-panel': { defaultSize: 65, minSize: 30 },
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const LABEL_TO_NODE = Object.fromEntries(
  DEFAULT_NODES.map(n => [String(n.data.label), n])
)

export default function CIA() {
  const [order, setOrder] = useState(['chat-panel', 'flow-panel'])
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)

  function handleArtifactClick(label: string) {
    const node = LABEL_TO_NODE[label]
    if (node) setSelectedNode(prev => prev?.id === node.id ? null : node)
  }

  const PANELS = makePanels((node) => {
    setSelectedNode(prev => prev?.id === node.id ? null : node)
  }, selectedNode?.id ?? null, handleArtifactClick)

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

  return (
    <div className="flex h-screen bg-background">
      <Sidebar items={NAV_ITEMS} />
      <main className="flex-1 overflow-hidden">
        <DndContext id="cia-dnd" onDragEnd={handleDragEnd}>
          <ResizablePanelGroup orientation="horizontal">
            {(() => {
              // Build render list: insert detail panel right after flow-panel
              const renderOrder: Array<{ type: 'panel'; id: string } | { type: 'detail' }> = []
              order.forEach((id) => {
                renderOrder.push({ type: 'panel', id })
                if (id === 'flow-panel' && selectedNode) {
                  renderOrder.push({ type: 'detail' })
                }
              })

              return renderOrder.map((item, index) => (
                <React.Fragment key={item.type === 'panel' ? item.id : 'detail-panel'}>
                  {index > 0 && <ResizableHandle withHandle />}
                  {item.type === 'panel' ? (
                    <DraggablePanel
                      id={item.id}
                      title={PANELS[item.id].title}
                      defaultSize={DEFAULT_SIZES[item.id].defaultSize}
                      minSize={DEFAULT_SIZES[item.id].minSize}
                    >
                      {PANELS[item.id].content}
                    </DraggablePanel>
                  ) : (() => {
                    const node = selectedNode!
                    return (
                      <ResizablePanel id="detail-panel" defaultSize={25} minSize={15}>
                        <div className="h-full flex flex-col">
                          <div className="h-14 flex items-center justify-between px-4 border-b shrink-0">
                            <div>
                              <div className="text-sm font-semibold leading-tight">{String(node.data.label ?? '')}</div>
                              <div className="text-xs text-muted-foreground">{String(node.data.nodeType ?? '')}</div>
                            </div>
                            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => setSelectedNode(null)}>
                              <X size={14} />
                            </Button>
                          </div>
                          <Tabs defaultValue="details" className="flex-1 min-h-0 gap-0">
                            <div className="px-4 py-3 border-b">
                              <TabsList>
                                <TabsTrigger value="details" className="text-xs">Details</TabsTrigger>
                                <TabsTrigger value="reasoning" className="text-xs">Agent Reasoning</TabsTrigger>
                              </TabsList>
                            </div>
                            <TabsContent value="details" className="flex-1 overflow-y-auto px-4 py-4 space-y-4 mt-0">
                              <div>
                                <div className="text-xs font-medium text-muted-foreground mb-1">Status</div>
                                <StatusBadge status={String(node.data.status ?? '')} />
                              </div>
                              <div className="border-t" />
                              {Object.entries(node.data)
                                .filter(([key]) => !['label', 'sublabel', 'nodeType', 'status'].includes(key))
                                .map(([key, val]) => (
                                  <div key={key}>
                                    <div className="text-xs font-medium text-muted-foreground mb-0.5">{key}</div>
                                    <div className="text-xs text-foreground">{String(val)}</div>
                                  </div>
                                ))}
                            </TabsContent>
                            <TabsContent value="reasoning" className="flex-1 overflow-y-auto px-4 py-6 mt-0 space-y-8">
                              {(() => {
                                const r = NODE_REASONING[node.id]
                                if (!r) return <div className="text-xs text-muted-foreground">No reasoning available.</div>
                                return (
                                  <>
                                    {/* Tools used */}
                                    <div>
                                      <div className="text-xs font-semibold text-foreground mb-2">Tools used</div>
                                      <div className="space-y-3">
                                        {r.tools.map((t, i) => (
                                          <div key={i} className="rounded-md bg-muted px-3 py-3 space-y-1.5">
                                            <div className="text-xs font-mono text-foreground">{t.call}</div>
                                            <div className="text-xs text-muted-foreground">{t.resultText}</div>
                                            {t.links && t.links.length > 0 && (
                                              <div className="flex flex-col gap-0.5 pt-0.5">
                                                {t.links.map((link, j) => (
                                                  <span key={j} className="text-xs text-primary cursor-pointer hover:underline">{link}</span>
                                                ))}
                                              </div>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </div>

                                    {/* Reasoning */}
                                    <div>
                                      <div className="text-xs font-semibold text-foreground mb-1">Reasoning</div>
                                      <div className="text-xs text-muted-foreground leading-relaxed">{r.reasoning}</div>
                                    </div>

                                    {/* Confidence explanation */}
                                    <div>
                                      <div className="text-xs font-semibold text-foreground mb-1">Why this confidence score</div>
                                      <div className="text-xs text-muted-foreground leading-relaxed">{r.confidenceExplanation}</div>
                                    </div>

                                    {/* Ruled out */}
                                    {r.ruledOut.length > 0 && (
                                      <div>
                                        <div className="text-xs font-semibold text-foreground mb-2">Ruled out</div>
                                        <div className="space-y-2">
                                          {r.ruledOut.map((item, i) => (
                                            <div key={i} className="rounded-md border border-dashed border-border px-3 py-2 space-y-0.5">
                                              <div className="text-xs font-medium text-foreground">{item.item}</div>
                                              <div className="text-xs text-muted-foreground">{item.reason}</div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </>
                                )
                              })()}
                            </TabsContent>
                          </Tabs>
                        </div>
                      </ResizablePanel>
                    )
                  })()}
                </React.Fragment>
              ))
            })()}
          </ResizablePanelGroup>
        </DndContext>
      </main>
    </div>
  )
}
