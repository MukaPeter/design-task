'use client'

import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  horizontalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable'
import { WorkspacePanel } from '@/components/workspace-panel'
import React from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WorkspacePanelConfig {
  id: string
  title: React.ReactNode
  content: React.ReactNode
  footer?: React.ReactNode
  actions?: React.ReactNode
  defaultSize?: number
  minSize?: number
  draggable?: boolean
  collapsible?: boolean
  closeable?: boolean
}

interface WorkspaceProps {
  panels: WorkspacePanelConfig[]
}

// ─── Sortable panel wrapper ───────────────────────────────────────────────────

function SortablePanel({
  panel,
  isLast,
  onClose,
}: {
  panel: WorkspacePanelConfig
  isLast: boolean
  onClose: (id: string) => void
}) {
  const { listeners, attributes, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: panel.id, disabled: !panel.draggable })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <React.Fragment>
      <ResizablePanel
        id={panel.id}
        defaultSize={panel.defaultSize ?? 33}
        minSize={panel.minSize ?? 10}
        style={style}
        ref={setNodeRef}
      >
        <WorkspacePanel
          title={panel.title}
          draggable={panel.draggable}
          collapsible={panel.collapsible}
          closeable={panel.closeable}
          actions={panel.actions}
          footer={panel.footer}
          onClose={() => onClose(panel.id)}
          dragListeners={listeners}
          dragAttributes={attributes}
        >
          {panel.content}
        </WorkspacePanel>
      </ResizablePanel>
      {!isLast && <ResizableHandle withHandle />}
    </React.Fragment>
  )
}

// ─── Workspace ────────────────────────────────────────────────────────────────

export function Workspace({ panels: initialPanels }: WorkspaceProps) {
  const [panels, setPanels] = useState(initialPanels)

  const sensors = useSensors(useSensor(PointerSensor, {
    activationConstraint: { distance: 8 },
  }))

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setPanels(prev => {
        const oldIndex = prev.findIndex(p => p.id === active.id)
        const newIndex = prev.findIndex(p => p.id === over.id)
        return arrayMove(prev, oldIndex, newIndex)
      })
    }
  }

  function handleClose(id: string) {
    setPanels(prev => prev.filter(p => p.id !== id))
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={panels.map(p => p.id)} strategy={horizontalListSortingStrategy}>
        <ResizablePanelGroup orientation="horizontal" className="h-full">
          {panels.map((panel, i) => (
            <SortablePanel
              key={panel.id}
              panel={panel}
              isLast={i === panels.length - 1}
              onClose={handleClose}
            />
          ))}
        </ResizablePanelGroup>
      </SortableContext>
    </DndContext>
  )
}
