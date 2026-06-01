'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { DndContext, DragEndEvent } from '@dnd-kit/core'
import { useDraggable, useDroppable } from '@dnd-kit/core'
import { GripVertical, Table2, Timeline, X } from 'lucide-react'
import { Sidebar } from '@/components/sidebar'
import { Chat } from '@/components/chat'
import { Flow, NODE_REASONING, DEFAULT_NODES, DEFAULT_EDGES, TEST_RUN_HISTORY, NODE_DRAFTS, INITIAL_CHAT_MESSAGES, type RunResult } from '@/components/flow'
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import type { Node } from '@xyflow/react'
import React, { Suspense } from 'react'

// ─── Run result config ────────────────────────────────────────────────────────

const RUN_CONFIG: Record<RunResult, { label: string; dot: string; text: string }> = {
  'passed':             { label: 'Passed',                   dot: 'bg-green-500',  text: 'text-green-700' },
  'failed-bug':         { label: 'Failed — bug',             dot: 'bg-red-500',    text: 'text-red-700' },
  'failed-test-change': { label: 'Failed — test needs update', dot: 'bg-amber-500', text: 'text-amber-700' },
  'failed-infra':       { label: 'Failed — infra issue',     dot: 'bg-slate-400',  text: 'text-slate-600' },
}

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

function makePanels(
  onNodeClick: (node: Node) => void,
  selectedNodeId: string | null,
  onArtifactClick: (id: string) => void,
  chatMessages: import('@/components/chat').ChatMessage[],
  onChatMessagesChange: (m: import('@/components/chat').ChatMessage[]) => void,
  nodeOverrides: Record<string, Record<string, unknown>>,
): Record<string, { title: string; content: React.ReactNode }> {
  return {
    'chat-panel': {
      title: 'Ketryx Agent',
      content: <Chat theirName="Ketryx Agent" myName="Peter" placeholder="Ask anything..." onArtifactClick={onArtifactClick} messages={chatMessages} onMessagesChange={onChatMessagesChange} />,
    },
    'flow-panel': {
      title: 'Change Impact Graph',
      content: (
        <Tabs defaultValue="graph" className="h-full gap-0">
          <div className="px-4 py-3 border-b shrink-0">
            <TabsList className="bg-gray-100">
              <TabsTrigger value="graph" className="text-xs">Graph</TabsTrigger>
              <TabsTrigger value="table" className="text-xs">Triage</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="graph" className="flex-1 min-h-0 mt-0">
            <Flow onNodeClick={onNodeClick} selectedNodeId={selectedNodeId} nodeOverrides={nodeOverrides} />
          </TabsContent>
          <TabsContent value="table" className="flex-1 overflow-y-auto mt-0 p-4">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="text-left pb-2 font-medium">Artifact</th>
                  <th className="text-left pb-2 font-medium">Type</th>
                  <th className="text-left pb-2 font-medium">Status</th>
                  <th className="text-left pb-2 font-medium">Confidence</th>
                  <th className="text-left pb-2 font-medium">Impact</th>
                </tr>
              </thead>
              <tbody>
                {DEFAULT_NODES.map(n => {
                  const nd = { ...n.data, ...(nodeOverrides[n.id] ?? {}) }
                  const conf = Number(nd.confidence)
                  return (
                  <tr
                    key={n.id}
                    className={`border-b last:border-0 cursor-pointer transition-colors ${n.id === selectedNodeId ? 'bg-primary/10' : 'hover:bg-muted/50'}`}
                    onClick={() => onNodeClick(n)}
                  >
                    <td className="py-2 font-medium">{String(nd.label)}</td>
                    <td className="py-2 text-muted-foreground">{String(nd.nodeType)}</td>
                    <td className="py-2"><StatusBadge status={String(nd.status)} /></td>
                    <td className={`py-2 font-medium ${conf >= 85 ? 'text-foreground' : conf >= 60 ? 'text-amber-600' : 'text-red-500'}`}>
                      <span className="flex items-center gap-1.5">
                        {nd.confidence != null ? `${conf}%` : '—'}
                        {!!nd.confidenceRaised && (
                          <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-green-500 text-white shrink-0">
                            <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="py-2 text-muted-foreground capitalize">{n.type}</td>
                  </tr>
                  )
                })}
              </tbody>
            </table>
          </TabsContent>
        </Tabs>
      ),
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

const LABEL_TO_ID = Object.fromEntries(
  DEFAULT_NODES.map(n => [String(n.data.label), n.id])
)


function CIA() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [order, setOrder] = useState(['chat-panel', 'flow-panel'])

  useEffect(() => {
    if (localStorage.getItem('chat-panel-left') === 'false') {
      setOrder(['flow-panel', 'chat-panel'])
    }
  }, [])
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [chatMessages, setChatMessages] = useState(INITIAL_CHAT_MESSAGES)
  const [nodeOverrides, setNodeOverrides] = useState<Record<string, Record<string, unknown>>>({})

  useEffect(() => {
    const nodeId = searchParams.get('node')
    if (nodeId) {
      const node = DEFAULT_NODES.find(n => n.id === nodeId)
      if (node) setSelectedNode(node)
    }
  }, [searchParams])

  function simulateReanalysis(nodeId: string) {
    const r = NODE_REASONING[nodeId]
    const nodeLabel = String(DEFAULT_NODES.find(n => n.id === nodeId)?.data.label ?? nodeId)
    if (!r) return

    const userMessage = {
      id: Date.now(),
      from: 'me' as const,
      text: `Here's the updated verification report for ${nodeLabel} — TEST-V-340 re-run against v2.2 boundary values. Please re-analyse.`,
      attachments: ['TEST-V-340_rerun_v2.2.pdf'],
    }

    const agentSteps: Array<{ delay: number; text: string }> = [
      { delay: 600,  text: `Re-analysing ${nodeLabel} with new evidence...` },
      { delay: 1800, text: `🔍 \`read_attachment("TEST-V-340_rerun_v2.2.pdf")\`\n✓ Test report validated — boundary values confirmed for v2.2 algorithm` },
      ...r.tools.map((t, i) => ({
        delay: 3000 + i * 1200,
        text: `🔍 \`${t.call}\`\n✓ ${t.resultText}${t.links && t.links.length > 0 ? '\n' + t.links.join(', ') : ''}`,
      })),
      { delay: 3000 + r.tools.length * 1200, text: `${r.reasoning}\n\n${r.confidenceExplanation}\n\nConfidence updated: 54% → 93%. TEST-V-340 re-run report logged as verification evidence on RISK-047-A.` },
    ]

    setChatMessages(prev => [...prev, userMessage])

    let accumulated = 0
    agentSteps.forEach((step, i) => {
      accumulated += step.delay
      const isLast = i === agentSteps.length - 1
      setTimeout(() => {
        setChatMessages(prev => [...prev, { id: Date.now() + Math.random(), from: 'them', text: step.text }])
        if (isLast) {
          setNodeOverrides(prev => ({
            ...prev,
            [nodeId]: {
              confidence: 93,
              confidenceRaised: true,
              'Verification Status': 'Re-verified (v2.2)',
              Evidence: 'TEST-V-340_rerun_v2.2.pdf — attached by J. Müller',
            },
          }))
        }
      }, accumulated)
    })
  }

  function handleArtifactClick(label: string) {
    const node = LABEL_TO_NODE[label]
    if (node) setSelectedNode(prev => prev?.id === node.id ? null : node)
  }

  const PANELS = makePanels(
    (node) => { setSelectedNode(prev => prev?.id === node.id ? null : node) },
    selectedNode?.id ?? null,
    handleArtifactClick,
    chatMessages,
    setChatMessages,
    nodeOverrides,
  )

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return
    setOrder(prev => {
      const next = [...prev]
      const a = next.indexOf(String(active.id))
      const b = next.indexOf(String(over.id))
      ;[next[a], next[b]] = [next[b], next[a]]
      localStorage.setItem('chat-panel-left', String(next[0] === 'chat-panel'))
      return next
    })
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar items={NAV_ITEMS} activeId="cia" onSelect={id => id === 'traceability' && router.push('/traceability')} />
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
                    const nodeData = { ...node.data, ...(nodeOverrides[node.id] ?? {}) }
                    return (
                      <ResizablePanel id="detail-panel" defaultSize={25} minSize={15}>
                        <div className="h-full flex flex-col">
                          <div className="h-14 flex items-center justify-between px-4 border-b shrink-0">
                            <div>
                              <div className="text-sm font-semibold leading-tight">{String(nodeData.label ?? '')}</div>
                              <div className="text-xs text-muted-foreground">{String(nodeData.nodeType ?? '')}</div>
                            </div>
                            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => setSelectedNode(null)}>
                              <X size={14} />
                            </Button>
                          </div>
                          <Tabs defaultValue="details" className="flex-1 min-h-0 gap-0">
                            <div className="px-4 py-3 border-b">
                              <TabsList className="bg-gray-100">
                                <TabsTrigger value="details" className="text-xs">Details</TabsTrigger>
                                {NODE_DRAFTS[node.id] && (
                                  <TabsTrigger value="draft" className="text-xs">Documentation Draft</TabsTrigger>
                                )}
                                <TabsTrigger value="reasoning" className="text-xs">Agent Reasoning</TabsTrigger>
                              </TabsList>
                            </div>
                            <TabsContent value="details" className="flex-1 flex flex-col min-h-0 mt-0">
                              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <div className="text-xs font-medium text-muted-foreground mb-1">Status</div>
                                    <StatusBadge status={String(nodeData.status ?? '')} />
                                  </div>
                                  {nodeData.confidence != null && (
                                    <div className="text-right">
                                      <div className="text-xs font-medium text-muted-foreground mb-1">Agent Confidence</div>
                                      <div className="flex items-center justify-end gap-1.5">
                                        <span className={`text-sm font-semibold ${Number(nodeData.confidence) >= 85 ? 'text-foreground' : Number(nodeData.confidence) >= 60 ? 'text-amber-600' : 'text-red-500'}`}>
                                          {Number(nodeData.confidence)}%
                                        </span>
                                        {!!nodeData.confidenceRaised && (
                                          <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-green-500 text-white shrink-0">
                                            <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                                <div className="border-t" />
                                {Object.entries(nodeData)
                                  .filter(([key]) => !['label', 'sublabel', 'nodeType', 'status', 'confidence', 'confidenceRaised'].includes(key))
                                  .map(([key, val]) => (
                                    <div key={key}>
                                      <div className="text-xs font-medium text-muted-foreground mb-0.5">{key}</div>
                                      {key === 'Jira ticket' || key === 'GitHub PR'
                                        ? <a href="#" className="text-xs text-primary underline font-medium">{String(val)}</a>
                                        : <div className="text-xs text-foreground">{String(val)}</div>
                                      }
                                    </div>
                                  ))}
                                {(() => {
                                  const runs = TEST_RUN_HISTORY[node.id]
                                  if (!runs) return null
                                  return (
                                    <>
                                      <div className="border-t" />
                                      <div>
                                        <div className="text-xs font-medium text-muted-foreground mb-2">Recent Runs</div>
                                        <div className="rounded-lg bg-muted/50 overflow-hidden">
                                          {runs.map((run, i) => {
                                            const cfg = RUN_CONFIG[run.result]
                                            return (
                                              <div key={i} className={`flex items-center justify-between px-3 py-2 ${i < runs.length - 1 ? 'border-b border-border/50' : ''}`}>
                                                <div className="flex items-center gap-2">
                                                  <span className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />
                                                  <span className={`text-xs font-medium ${cfg.text}`}>{cfg.label}</span>
                                                </div>
                                                <a href="#" className="text-xs text-primary hover:underline">{run.timestamp}</a>
                                              </div>
                                            )
                                          })}
                                        </div>
                                      </div>
                                    </>
                                  )
                                })()}
                                {(() => {
                                  const downstreamIds = DEFAULT_EDGES
                                    .filter(e => e.source === node.id)
                                    .map(e => e.target)
                                  const downstreamNodes = downstreamIds
                                    .map(id => DEFAULT_NODES.find(n => n.id === id))
                                    .filter(Boolean) as typeof DEFAULT_NODES
                                  if (downstreamNodes.length === 0) return null
                                  return (
                                    <>
                                      <div className="border-t" />
                                      <div>
                                        <div className="text-xs font-medium text-muted-foreground mb-2">Downstream</div>
                                        <div className="flex flex-col gap-2.5">
                                          {downstreamNodes.map(n => (
                                            <button
                                              key={n.id}
                                              className="text-xs text-primary hover:underline text-left"
                                              onClick={() => setSelectedNode(n)}
                                            >
                                              {String(n.data.label)} — {String(n.data.sublabel)}
                                            </button>
                                          ))}
                                        </div>
                                      </div>
                                    </>
                                  )
                                })()}
                              </div>
                              <div className="shrink-0 border-t px-4 py-3 flex gap-2 justify-end">
                                <Button size="sm">Accept</Button>
                                <Button variant="outline" size="sm">Reject</Button>
                              </div>
                            </TabsContent>
                            <TabsContent value="reasoning" className="flex-1 flex flex-col min-h-0 mt-0">
                            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-8">
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
                                          <div key={i} className="rounded-md bg-gray-100 px-3 py-3 space-y-1.5">
                                            <div className="text-xs font-mono text-foreground">{t.call}</div>
                                            <div className="text-xs text-muted-foreground">{t.resultText}</div>
                                            {t.links && t.links.length > 0 && (
                                              <div className="flex flex-col gap-2 pt-1">
                                                {t.links.map((link, j) => {
                                                  const runs = TEST_RUN_HISTORY[LABEL_TO_ID[link]]
                                                  return (
                                                    <div key={j} className="flex items-center justify-between">
                                                      <span className="text-xs text-primary cursor-pointer hover:underline">{link}</span>
                                                      {runs && (
                                                        <TooltipProvider>
                                                          <div className="flex items-center gap-1">
                                                            {runs.map((run, k) => {
                                                              const cfg = RUN_CONFIG[run.result]
                                                              return (
                                                                <Tooltip key={k}>
                                                                  <TooltipTrigger>
                                                                    <span className={`w-2.5 h-2.5 rounded-full ${cfg.dot} cursor-default inline-block`} />
                                                                  </TooltipTrigger>
                                                                  <TooltipContent>
                                                                    <span>{run.timestamp} — {cfg.label}</span>
                                                                  </TooltipContent>
                                                                </Tooltip>
                                                              )
                                                            })}
                                                          </div>
                                                        </TooltipProvider>
                                                      )}
                                                    </div>
                                                  )
                                                })}
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
                            </div>
                            <div className="shrink-0 border-t px-4 py-3 flex justify-end">
                              <Button size="sm" onClick={() => simulateReanalysis(node.id)}>Re-analyse</Button>
                            </div>
                            </TabsContent>
                            {NODE_DRAFTS[node.id] && (() => {
                              const draft = NODE_DRAFTS[node.id]!
                              return (
                                <TabsContent value="draft" className="flex-1 flex flex-col min-h-0 mt-0">
                                  <div className="flex-1 overflow-y-auto px-4 py-4">
                                    <div className="text-xs text-muted-foreground mb-4 flex items-center gap-1.5">
                                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400" />
                                      Agent-generated draft — review before approving
                                    </div>
                                    <div className="rounded-lg border bg-gray-50 px-4 py-4 space-y-3">
                                      <div className="text-xs font-semibold text-foreground">{draft.title}</div>
                                      <div className="border-t" />
                                      {draft.content.split('\n\n').map((para, i) => (
                                        <p key={i} className="text-xs text-foreground leading-relaxed">{para}</p>
                                      ))}
                                    </div>
                                  </div>
                                  <div className="shrink-0 border-t px-4 py-3 flex gap-2 justify-end">
                                    <Button size="sm">Approve draft</Button>
                                    <Button variant="outline" size="sm">Request changes</Button>
                                  </div>
                                </TabsContent>
                              )
                            })()}
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

export default function CIAPage() {
  return (
    <Suspense>
      <CIA />
    </Suspense>
  )
}
