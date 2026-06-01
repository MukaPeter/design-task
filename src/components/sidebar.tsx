'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Pin, PinOff } from 'lucide-react'

export interface SidebarItem {
  id: string
  label: string
  icon: React.ReactNode
}

export interface SidebarProps {
  items: SidebarItem[]
  activeId?: string
  onSelect?: (id: string) => void
}

const W_COLLAPSED = 60
const W_EXPANDED  = 240

export function Sidebar({ items, activeId, onSelect }: SidebarProps) {
  const [active,  setActive]  = useState(activeId ?? items[0]?.id)
  const [pinned,  setPinned]  = useState(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('sidebar-pinned') === 'true'
  })
  const [hovered, setHovered] = useState(false)

  useEffect(() => {
    localStorage.setItem('sidebar-pinned', String(pinned))
  }, [pinned])

  const expanded = pinned || hovered

  return (
    // Outer div — owns layout space
    // Pinned: 240px (pushes content). Collapsed: 60px (content stays).
    <div
      style={{ width: pinned ? W_EXPANDED : W_COLLAPSED }}
      className="relative shrink-0 h-full transition-[width] duration-200 ease-in-out"
    >
      {/* Inner aside — owns the visual
          Hover: wider than outer, floats over content with shadow
          Pinned: matches outer, no shadow */}
      <aside
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ width: expanded ? W_EXPANDED : W_COLLAPSED }}
        className={cn(
          'absolute inset-y-0 left-0 flex flex-col border-r bg-background overflow-hidden',
          'transition-[width,box-shadow] duration-200 ease-in-out',
          hovered && !pinned ? 'z-50 shadow-xl' : 'z-10 shadow-none',
        )}
      >
        {/* Header */}
        <div className="h-14 flex items-center px-4 shrink-0 justify-between border-b">
          {expanded && <span className="font-semibold text-sm">Demo</span>}
          {expanded && (
            <button
              onClick={() => setPinned(p => !p)}
              className="text-muted-foreground hover:text-foreground transition-colors ml-auto"
            >
              {pinned ? <PinOff size={16} /> : <Pin size={16} />}
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 flex flex-col gap-1 p-2">
          {items.map(item => (
            <Button
              key={item.id}
              size="nav"
              variant={active === item.id ? 'default' : 'ghost'}
              className={active === item.id ? '' : 'hover:bg-[#F5F5F5]'}
              title={!expanded ? item.label : undefined}
              onClick={() => { setActive(item.id); onSelect?.(item.id) }}
            >
              {item.icon}
              {expanded && item.label}
            </Button>
          ))}
        </nav>
      </aside>
    </div>
  )
}
