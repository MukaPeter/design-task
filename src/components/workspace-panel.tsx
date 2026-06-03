'use client'

import { useState } from 'react'
import { GripVertical, X, ChevronsLeftRight, ChevronsRightLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface WorkspacePanelProps {
  title: React.ReactNode
  draggable?: boolean
  collapsible?: boolean
  closeable?: boolean
  actions?: React.ReactNode
  footer?: React.ReactNode
  children: React.ReactNode
  onClose?: () => void
  dragListeners?: Record<string, unknown>
  dragAttributes?: Record<string, unknown>
}

export function WorkspacePanel({
  title,
  draggable = false,
  collapsible = false,
  closeable = false,
  actions,
  footer,
  children,
  onClose,
  dragListeners,
  dragAttributes,
}: WorkspacePanelProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="h-full flex flex-col bg-background border-r last:border-r-0">

      {/* Header */}
      <div className="h-14 flex items-center gap-2 px-4 border-b shrink-0">

        {/* Drag handle */}
        {draggable && (
          <button
            {...dragListeners}
            {...dragAttributes}
            className="text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing touch-none shrink-0"
          >
            <GripVertical size={16} />
          </button>
        )}

        {/* Title */}
        <div className="flex-1 min-w-0 text-sm font-semibold truncate">
          {title}
        </div>

        {/* Right slot: actions + collapse + close */}
        <div className="flex items-center gap-1 shrink-0">
          {actions && !collapsed && (
            <div className="flex items-center gap-1">{actions}</div>
          )}

          {collapsible && (
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => setCollapsed(c => !c)}
            >
              {collapsed
                ? <ChevronsLeftRight size={14} />
                : <ChevronsRightLeft size={14} />
              }
            </Button>
          )}

          {closeable && (
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground hover:text-foreground"
              onClick={onClose}
            >
              <X size={14} />
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      {!collapsed && (
        <div className="flex-1 min-h-0 overflow-y-auto flex flex-col">
          {children}
        </div>
      )}

      {/* Footer */}
      {!collapsed && footer && (
        <div className="shrink-0 border-t px-2 py-2">
          {footer}
        </div>
      )}

    </div>
  )
}
