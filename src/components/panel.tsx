'use client'

import { useState } from 'react'
import { useDraggable, useDroppable } from '@dnd-kit/core'
import { ChevronDown, Check } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import React from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Repository {
  id: string
  name: string
}

export interface PanelTab {
  id: string
  label: string
  content: React.ReactNode
}

export interface PanelProps {
  id: string
  tabs: PanelTab[]
  defaultTab?: string
  repositories?: Repository[]
  defaultRepository?: string
}

// ─── Component ───────────────────────────────────────────────────────────────

export function Panel({ id, tabs, defaultTab, repositories = [], defaultRepository }: PanelProps) {
  const { listeners, attributes, setNodeRef: setDragRef, isDragging } = useDraggable({ id })
  const { setNodeRef: setDropRef, isOver } = useDroppable({ id })

  const [selectedRepoId, setSelectedRepoId] = useState(
    defaultRepository ?? repositories[0]?.id ?? null
  )

  const selectedRepo = repositories.find(r => r.id === selectedRepoId)

  return (
    <div ref={el => { setDragRef(el); setDropRef(el) }} className="h-full">
      <Card className={`h-full p-0 gap-0 rounded-none ring-0 transition-colors ${isOver && !isDragging ? 'bg-muted/50' : ''}`}>
        <Tabs
          defaultValue={defaultTab ?? tabs[0]?.id}
          className="flex-1 min-h-0 gap-0"
        >
          {/* Header — repo selector */}
          <div className="flex items-center px-4 h-14 border-b shrink-0">
            {repositories.length > 0 ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1.5 text-sm font-medium hover:text-foreground/80 focus:outline-none cursor-pointer">
                  {selectedRepo?.name ?? 'Select repository'}
                  <ChevronDown size={14} className="text-muted-foreground" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {repositories.map(repo => (
                    <DropdownMenuItem
                      key={repo.id}
                      onClick={() => setSelectedRepoId(repo.id)}
                      className="flex items-center justify-between gap-4"
                    >
                      {repo.name}
                      {repo.id === selectedRepoId && <Check size={14} />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="text-sm font-medium text-muted-foreground">No repository</div>
            )}
          </div>

          {/* Content panels */}
          {tabs.map(tab => (
            <TabsContent
              key={tab.id}
              value={tab.id}
              className="min-h-0 overflow-hidden"
            >
              {tab.content}
            </TabsContent>
          ))}
        </Tabs>
      </Card>
    </div>
  )
}
