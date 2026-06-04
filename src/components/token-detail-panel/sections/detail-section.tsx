'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface Props {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}

export function DetailSection({ title, defaultOpen = true, children }: Props) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="flex flex-col gap-2">
      <button
        className="flex items-center gap-2 tok-section-title text-foreground py-1 outline-none w-full"
        onClick={() => setOpen(o => !o)}
      >
        <ChevronDown size={12} className={`shrink-0 transition-transform duration-150 ${open ? '' : '-rotate-90'}`} />
        {title}
      </button>
      {open && children}
    </div>
  )
}
