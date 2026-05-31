'use client'

import { useDraggable, useDroppable } from '@dnd-kit/core'
import { GripVertical } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PanelTab {
  id: string
  label: string
  content: React.ReactNode
}

export interface PanelProps {
  id: string
  tabs: PanelTab[]
  defaultTab?: string
}

// ─── Component ───────────────────────────────────────────────────────────────

export function Panel({ id, tabs, defaultTab }: PanelProps) {
  const { listeners, attributes, setNodeRef: setDragRef, isDragging } = useDraggable({ id })
  const { setNodeRef: setDropRef, isOver } = useDroppable({ id })

  return (
    <div ref={el => { setDragRef(el); setDropRef(el) }} className="h-full">
      <Card className={`h-full p-0 gap-0 rounded-none ring-0 transition-colors ${isOver && !isDragging ? 'bg-muted/50' : ''}`}>
        <Tabs
          defaultValue={defaultTab ?? tabs[0]?.id}
          className="flex-1 min-h-0 gap-0"
        >
          {/* Header — drag handle + tab switcher */}
          <div className="flex items-center gap-2 px-3 h-14 border-b shrink-0">
            {/* Drag handle — listeners scoped here, content stays interactive */}
            <button
              {...listeners}
              {...attributes}
              className="text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing touch-none"
            >
              <GripVertical size={16} />
            </button>

            <TabsList>
              {tabs.map(tab => (
                <TabsTrigger key={tab.id} value={tab.id} className="text-xs px-2">
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Content panels — min-h-0 needed for flex height chain */}
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
