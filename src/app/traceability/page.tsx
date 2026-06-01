'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Sidebar } from '@/components/sidebar'
import { Chat } from '@/components/chat'
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable'
import { DEFAULT_NODES, DEFAULT_EDGES } from '@/components/flow'
import { Table2, Timeline } from 'lucide-react'

// ─── Nav ──────────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { id: 'traceability', label: 'Traceability Matrix', icon: <Table2 size={16} /> },
  { id: 'cia',          label: 'Impact Analysis Graph', icon: <Timeline size={16} /> },
]

// ─── Matrix data ──────────────────────────────────────────────────────────────

const REAL_REQUIREMENTS = DEFAULT_NODES.filter(n => n.data.nodeType === 'Requirement')
const STALE_COUNT = DEFAULT_NODES.filter(n => n.data.status === 'stale').length

const EXTRA_REQUIREMENTS = [
  { id: 'req-031', label: 'REQ-031', sublabel: 'Alarm Volume Minimum' },
  { id: 'req-058', label: 'REQ-058', sublabel: 'Battery Low Warning' },
  { id: 'req-110', label: 'REQ-110', sublabel: 'Dose Confirmation Dialog' },
  { id: 'req-175', label: 'REQ-175', sublabel: 'Air-in-Line Detection' },
  { id: 'req-220', label: 'REQ-220', sublabel: 'Occlusion Pressure Limit' },
]

const REQUIREMENTS = [...REAL_REQUIREMENTS, ...EXTRA_REQUIREMENTS]
const ARTIFACTS    = DEFAULT_NODES.filter(n => n.data.nodeType !== 'Requirement')

function isLinked(reqId: string, artifactId: string) {
  return DEFAULT_EDGES.some(
    e => (e.source === reqId && e.target === artifactId) ||
         (e.target === reqId && e.source === artifactId)
  )
}

// ─── Status dot ───────────────────────────────────────────────────────────────

const STATUS_DOT: Record<string, string> = {
  'up-to-date':   'bg-green-500',
  'needs-review': 'bg-amber-500',
  'stale':        'bg-red-500',
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TraceabilityMatrix() {
  const router = useRouter()

  function handleNavSelect(id: string) {
    if (id === 'cia') router.push('/cia')
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar items={NAV_ITEMS} activeId="traceability" onSelect={handleNavSelect} />
      <main className="flex-1 overflow-hidden">
        <ResizablePanelGroup orientation="horizontal">

          {/* Chat panel */}
          <ResizablePanel defaultSize={18} minSize={12}>
            <div className="h-full flex flex-col">
              <div className="h-14 flex items-center px-4 border-b shrink-0">
                <span className="text-sm font-semibold">Ketryx Agent</span>
              </div>
              <div className="flex-1 min-h-0">
                <Chat
                  theirName="Ketryx Agent"
                  myName="Peter"
                  placeholder="Ask anything..."
                  initialMessages={[
                    { id: 1, from: 'me',   text: 'Show me the traceability matrix for the current build.' },
                    { id: 2, from: 'them', text: 'Here is the full traceability matrix for the active build.\n\nRows are requirements. Columns are downstream artifacts — hazards, risk controls, design specs, tests, SOPs, and regulatory clauses.\n\nA dot indicates a traceability link exists. Color shows the artifact\'s current status: green is up to date, amber needs review, red is stale.\n\nFour stale artifacts are visible — they trace back to REQ-142. Click any row to drill into the change impact analysis for that requirement.' },
                  ]}
                />
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Matrix panel */}
          <ResizablePanel defaultSize={82} minSize={40} style={{ overflow: 'auto' }}>
            <div className="h-full flex flex-col">
              <div className="h-14 flex items-center px-4 border-b shrink-0">
                <span className="text-sm font-semibold">Traceability Matrix</span>
              </div>
              <div className="flex-1 overflow-auto">
                <table className="caption-bottom text-sm border-collapse w-full" style={{ minWidth: `${160 + ARTIFACTS.length * 100}px` }}>
                  <thead className="[&_tr]:border-b">
                    <tr className="border-b">
                      <th className="text-xs px-2 py-4 text-left align-middle font-medium sticky left-0 bg-background z-10 min-w-[160px]">Requirement</th>
                      {ARTIFACTS.map(a => (
                        <th key={a.id} className="text-xs px-2 py-4 text-center align-middle font-medium min-w-[90px]">
                          <div className="flex flex-col items-center gap-1">
                            <span className="font-medium">{String(a.data.label)}</span>
                            <span className="text-muted-foreground font-normal">{String(a.data.nodeType)}</span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="[&_tr:last-child]:border-0">
                    {REQUIREMENTS.map(req => {
                      const isReal = 'data' in req
                      const hasCIA = req.id === 'req-142'
                      const label = isReal ? String((req as typeof REAL_REQUIREMENTS[0]).data.label) : (req as typeof EXTRA_REQUIREMENTS[0]).label
                      const sublabel = isReal ? String((req as typeof REAL_REQUIREMENTS[0]).data.sublabel) : (req as typeof EXTRA_REQUIREMENTS[0]).sublabel
                      return (
                        <tr
                          key={req.id}
                          className={`border-b transition-colors ${hasCIA ? 'cursor-pointer group hover:bg-muted/50' : 'opacity-60'}`}
                          onClick={() => hasCIA && router.push('/cia')}
                        >
                          <td className={`text-xs p-2 sticky left-0 bg-background z-10 transition-colors ${hasCIA ? 'group-hover:bg-muted/50' : ''}`}>
                            <div className="font-medium">{label}</div>
                            <div className="text-muted-foreground">{sublabel}</div>
                          </td>
                          {ARTIFACTS.map(artifact => {
                            const linked = isReal && isLinked(req.id, artifact.id)
                            const dotColor = STATUS_DOT[String(artifact.data.status)] ?? 'bg-gray-300'
                            return (
                              <td key={artifact.id} className="p-2 text-center align-middle">
                                {linked && (
                                  <span
                                    className={`inline-block w-2.5 h-2.5 rounded-full ${dotColor} cursor-pointer hover:scale-125 transition-transform`}
                                    onClick={e => { e.stopPropagation(); router.push(`/cia?node=${artifact.id}`) }}
                                  />
                                )}
                              </td>
                            )
                          })}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <div className="shrink-0 border-t px-4 py-3 flex items-center justify-end gap-3">
                <span className="text-xs text-muted-foreground">{STALE_COUNT} item{STALE_COUNT !== 1 ? 's' : ''} require attention before closing</span>
                <Button size="sm" disabled>Approve & close</Button>
              </div>
            </div>
          </ResizablePanel>

        </ResizablePanelGroup>
      </main>
    </div>
  )
}
