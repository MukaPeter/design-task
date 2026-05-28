'use client'

import { useState } from 'react'
import { DndContext } from '@dnd-kit/core'
import { Sidebar } from '@/components/sidebar'
import { Panel } from '@/components/panel'
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable'
import React from 'react'
import { LayoutDashboard, GitBranch, AlignLeft, ShieldAlert, FlaskConical, GitPullRequest, ScrollText } from 'lucide-react'

// ─── Nav ──────────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { id: 'overview',     label: 'Overview',        icon: <LayoutDashboard size={16} /> },
  { id: 'requirements', label: 'Requirements',    icon: <AlignLeft size={16} /> },
  { id: 'traceability', label: 'Traceability',    icon: <GitBranch size={16} /> },
  { id: 'risk',         label: 'Risk Management', icon: <ShieldAlert size={16} /> },
  { id: 'tests',        label: 'Test Results',    icon: <FlaskConical size={16} /> },
  { id: 'changes',      label: 'Change Control',  icon: <GitPullRequest size={16} /> },
  { id: 'audit',        label: 'Audit Log',       icon: <ScrollText size={16} /> },
]

// ─── Panel content — defined at module level so it never remounts ─────────────

const PANELS: Record<string, { tabs: { id: string; label: string; content: React.ReactNode }[] }> = {
  'panel-1': {
    tabs: [
      { id: 'a1', label: 'Tab A', content: <div className="p-4 text-sm text-muted-foreground">Panel 1 — Content A</div> },
      { id: 'a2', label: 'Tab B', content: <div className="p-4 text-sm text-muted-foreground">Panel 1 — Content B</div> },
    ],
  },
  'panel-2': {
    tabs: [
      { id: 'b1', label: 'Tab A', content: <div className="p-4 text-sm text-muted-foreground">Panel 2 — Content A</div> },
      { id: 'b2', label: 'Tab B', content: <div className="p-4 text-sm text-muted-foreground">Panel 2 — Content B</div> },
    ],
  },
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Demo() {
  const [order, setOrder] = useState(['panel-1', 'panel-2'])

  function handleDragEnd({ active, over }: { active: { id: string }, over: { id: string } | null }) {
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
        <DndContext id="demo-dnd" onDragEnd={handleDragEnd}>
          <ResizablePanelGroup direction="horizontal">
            {order.map((id, index) => (
              <React.Fragment key={id}>
                {index > 0 && <ResizableHandle withHandle />}
                <ResizablePanel id={id} defaultSize={50} minSize={20}>
                  <Panel id={id} tabs={PANELS[id].tabs} />
                </ResizablePanel>
              </React.Fragment>
            ))}
          </ResizablePanelGroup>
        </DndContext>
      </main>
    </div>
  )
}
