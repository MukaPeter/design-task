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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dragAttributes?: Record<string, any>
  contentScroll?: boolean
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
  contentScroll = true,
}: WorkspacePanelProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="h-full flex flex-col bg-background border-r last:border-r-0">

      {/* Header */}
      <div className="h-panel-header flex items-center gap-2 px-panel-padding-x border-b shrink-0">

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
        <div className="flex-1 min-w-0 tok-panel-title truncate">
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
              className="tok-icon-btn text-muted-foreground hover:text-foreground"
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
              className="tok-icon-btn text-muted-foreground hover:text-foreground"
              onClick={onClose}
            >
              <X size={14} />
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      {!collapsed && (
        <div className={`flex-1 min-h-0 flex flex-col${contentScroll ? ' overflow-y-auto' : ' overflow-hidden'}`}>
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
