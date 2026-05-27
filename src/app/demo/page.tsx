'use client'

import React, { useState } from 'react'
import { DndContext } from '@dnd-kit/core'
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable'
import { AppShell } from '@/components/app-shell'
import { Sidebar } from '@/components/sidebar'
import { Panel } from '@/components/panel'
import { Flow } from '@/components/flow'
import { Chat } from '@/components/chat'
import { LayoutDashboard, GitBranch, AlignLeft, ShieldAlert, FlaskConical, GitPullRequest, ScrollText } from 'lucide-react'

// ─── Config ───────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { id: 'overview',     label: 'Overview',        icon: <LayoutDashboard size={16} /> },
  { id: 'requirements', label: 'Requirements',    icon: <AlignLeft size={16} /> },
  { id: 'traceability', label: 'Traceability',    icon: <GitBranch size={16} /> },
  { id: 'risk',         label: 'Risk Management', icon: <ShieldAlert size={16} /> },
  { id: 'tests',        label: 'Test Results',    icon: <FlaskConical size={16} /> },
  { id: 'changes',      label: 'Change Control',  icon: <GitPullRequest size={16} /> },
  { id: 'audit',        label: 'Audit Log',       icon: <ScrollText size={16} /> },
]

const SEED_MESSAGES = [
  { id: 1, from: 'them' as const, text: 'Hey, can you check the workflow diagram?' },
  { id: 2, from: 'me'   as const, text: 'On it — draw a connection between the nodes.' },
  { id: 3, from: 'them' as const, text: 'Done. Does the flow make sense?' },
]

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

  const panelContent: Record<string, { title: string; node: React.ReactNode }> = {
    flow: { title: 'Workflow Diagram', node: <Flow /> },
    chat: { title: 'Team Chat',        node: <Chat initialMessages={SEED_MESSAGES} /> },
  }

  return (
    <AppShell
      sidebar={
        <Sidebar
          items={NAV_ITEMS}
          user={{ name: 'MukaPeter', role: 'Head of Design', initials: 'MP' }}
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
                <Panel id={id} title={panelContent[id].title}>
                  {panelContent[id].node}
                </Panel>
              </ResizablePanel>
            </React.Fragment>
          ))}
        </ResizablePanelGroup>
      </DndContext>
    </AppShell>
  )
}
