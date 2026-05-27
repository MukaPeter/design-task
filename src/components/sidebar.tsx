'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Pin, PinOff } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SidebarItem {
  id: string
  label: string
  icon: React.ReactNode
}

export interface SidebarUser {
  name: string
  role: string
  initials: string
}

export interface SidebarProps {
  items: SidebarItem[]
  activeId?: string
  onSelect?: (id: string) => void
  brand?: React.ReactNode
  user?: SidebarUser
  badge?: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const COLLAPSED_WIDTH = 60
const EXPANDED_WIDTH  = 240

// ─── Component ───────────────────────────────────────────────────────────────

export function Sidebar({
  items,
  activeId,
  onSelect,
  brand,
  user,
  badge,
}: SidebarProps) {
  const [pinned, setPinned]     = useState(false)
  const [hovered, setHovered]   = useState(false)
  const [active, setActive]     = useState(activeId ?? items[0]?.id)

  const expanded = pinned || hovered

  function handleSelect(id: string) {
    setActive(id)
    onSelect?.(id)
  }

  return (
    <aside
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ width: expanded ? EXPANDED_WIDTH : COLLAPSED_WIDTH }}
      className="relative flex flex-col h-full border-r bg-background overflow-hidden transition-[width] duration-200 ease-in-out shrink-0"
    >

      {/* Brand row */}
      <div className="flex items-center h-14 px-3 shrink-0">
        <div className="flex items-center justify-center w-9 h-9 rounded-md bg-primary shrink-0">
          {brand ?? <span className="text-primary-foreground text-sm font-bold">K</span>}
        </div>
        {expanded && (
          <div className="ml-3 flex items-center gap-2 overflow-hidden">
            <span className="font-semibold text-sm whitespace-nowrap">Ketryx</span>
            {badge && <Badge variant="outline" className="text-xs shrink-0">{badge}</Badge>}
          </div>
        )}

        {/* Pin button — only visible when expanded */}
        {expanded && (
          <button
            onClick={() => setPinned(p => !p)}
            className="ml-auto p-1 rounded text-muted-foreground hover:text-foreground transition-colors shrink-0"
            title={pinned ? 'Unpin sidebar' : 'Pin sidebar'}
          >
            {pinned ? <PinOff size={14} /> : <Pin size={14} />}
          </button>
        )}
      </div>

      <Separator />

      {/* Nav items */}
      <nav className="flex-1 flex flex-col gap-0.5 p-2 overflow-y-auto overflow-x-hidden">
        {items.map(item => (
          <button
            key={item.id}
            onClick={() => handleSelect(item.id)}
            title={!expanded ? item.label : undefined}
            className={cn(
              'flex items-center gap-3 rounded-md px-2 py-2 text-sm transition-colors w-full text-left',
              active === item.id
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <span className="shrink-0 w-5 flex items-center justify-center">
              {item.icon}
            </span>
            {expanded && (
              <span className="whitespace-nowrap overflow-hidden text-ellipsis">
                {item.label}
              </span>
            )}
          </button>
        ))}
      </nav>

      <Separator />

      {/* User row */}
      {user && (
        <div className="flex items-center gap-3 px-3 py-3 shrink-0">
          <Avatar className="w-8 h-8 shrink-0">
            <AvatarFallback className="text-xs">{user.initials}</AvatarFallback>
          </Avatar>
          {expanded && (
            <div className="overflow-hidden">
              <p className="text-xs font-medium truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.role}</p>
            </div>
          )}
        </div>
      )}

    </aside>
  )
}
