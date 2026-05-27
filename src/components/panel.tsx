'use client'

import { useDraggable, useDroppable } from '@dnd-kit/core'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export interface PanelProps {
  id: string
  title: string
  children: React.ReactNode
  draggable?: boolean
  className?: string
}

export function Panel({ id, title, children, draggable = true, className }: PanelProps) {
  const { attributes, listeners, setNodeRef: setDragRef, isDragging } = useDraggable({ id })
  const { setNodeRef: setDropRef, isOver } = useDroppable({ id })

  return (
    <div
      ref={el => { setDragRef(el); setDropRef(el) }}
      className={cn(
        'h-full flex flex-col transition-colors',
        isOver && !isDragging && 'bg-accent/30',
        isDragging && 'opacity-40',
        className
      )}
    >
      {/* Header */}
      <div
        {...(draggable ? { ...listeners, ...attributes } : {})}
        className={cn(
          'flex items-center gap-2 px-4 py-3 border-b shrink-0 select-none',
          draggable && 'cursor-grab active:cursor-grabbing'
        )}
      >
        {draggable && <span className="text-muted-foreground">⠿</span>}
        <span className="text-sm font-medium">{title}</span>
        {draggable && (
          <Badge variant="outline" className="ml-auto text-xs">drag to swap</Badge>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  )
}
