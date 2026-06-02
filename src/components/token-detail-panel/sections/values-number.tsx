'use client'

import { useState } from 'react'
import { ChevronDown, Copy } from 'lucide-react'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { TableRow, TableCell } from '@/components/ui/table'
import { SectionTable } from './section-table'

export type NumberIntent = 'opacity' | 'line-height' | 'scale' | 'z-index' | 'count' | 'generic'

export const NUMBER_INTENTS: { value: NumberIntent; label: string }[] = [
  { value: 'opacity',     label: 'Opacity' },
  { value: 'line-height', label: 'Line height' },
  { value: 'scale',       label: 'Scale / ratio' },
  { value: 'z-index',     label: 'Z-index' },
  { value: 'count',       label: 'Count' },
  { value: 'generic',     label: 'Generic' },
]

interface Props {
  modeValues: Record<string, string>
  intent: NumberIntent
  onIntentChange: (intent: NumberIntent) => void
}

function formatValue(raw: string, intent: NumberIntent): string {
  const n = parseFloat(raw)
  if (isNaN(n)) return '—'
  switch (intent) {
    case 'opacity':
    case 'line-height':
    case 'scale':
    case 'generic':  return String(n)
    case 'z-index':
    case 'count':    return String(Math.floor(n))
  }
}

export function ValuesNumber({ modeValues, intent, onIntentChange }: Props) {
  const [open, setOpen] = useState(true)
  const raw = modeValues['Mode 1'] || ''
  const formatted = formatValue(raw, intent)
  const intentLabel = NUMBER_INTENTS.find(i => i.value === intent)!.label

  return (
    <div className="flex flex-col gap-2">
      <button
        className="flex items-center gap-2 text-xs font-semibold text-foreground py-1 outline-none w-full"
        onClick={() => setOpen(o => !o)}
      >
        <ChevronDown size={12} className={`shrink-0 transition-transform duration-150 ${open ? '' : '-rotate-90'}`} />
        Values
      </button>
      {open && (
        <SectionTable cols={2}>
          <TableRow className="border-none">
            <TableCell className="text-muted-foreground">Intent</TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-0.5 border rounded px-2 py-1 text-[10px] text-muted-foreground hover:text-foreground cursor-pointer">
                  {intentLabel}<ChevronDown size={10} />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-[160px]">
                  {NUMBER_INTENTS.map(i => (
                    <DropdownMenuItem key={i.value} className="text-xs" onClick={() => onIntentChange(i.value)}>
                      {i.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
          <TableRow className="border-none group">
            <TableCell className="text-muted-foreground">Value</TableCell>
            <TableCell>
              <div className="flex items-center gap-1 min-w-0">
                <span className="font-mono">{formatted}</span>
                {formatted !== '—' && (
                  <button
                    tabIndex={-1}
                    className="text-muted-foreground hover:text-foreground transition-opacity opacity-0 group-hover:opacity-100"
                    onClick={() => navigator.clipboard.writeText(formatted)}
                  >
                    <Copy size={12} />
                  </button>
                )}
              </div>
            </TableCell>
          </TableRow>
        </SectionTable>
      )}
    </div>
  )
}
