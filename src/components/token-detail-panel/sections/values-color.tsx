'use client'

import { useState } from 'react'
import { ChevronDown, Copy } from 'lucide-react'
import { TableRow, TableCell } from '@/components/ui/table'
import { SectionTable } from './section-table'
import { COLOR_FORMATS } from '../types'
import { convertColor } from '../color-utils'

interface Props {
  modeValues: Record<string, string>
}

export function ValuesColor({ modeValues }: Props) {
  const [open, setOpen] = useState(true)

  const modes = [
    { label: 'Mode 1', value: modeValues['Mode 1'] || '' },
  ]

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
        <SectionTable headers={['Format', ...modes.map(m => m.label)]}>
          {COLOR_FORMATS.map(fmt => (
            <TableRow key={fmt} className="group">
              <TableCell className="text-muted-foreground whitespace-nowrap">{fmt}</TableCell>
              {modes.map(m => (
                <TableCell key={m.label}>
                  {m.value ? (
                    <div className="flex items-center justify-between gap-1 min-w-0">
                      <span className="font-mono truncate">{convertColor(m.value, fmt)}</span>
                      <button
                        tabIndex={-1}
                        className="text-muted-foreground hover:text-foreground shrink-0 transition-opacity opacity-0 group-hover:opacity-100"
                        onClick={() => navigator.clipboard.writeText(convertColor(m.value, fmt))}
                      >
                        <Copy size={12} />
                      </button>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </SectionTable>
      )}
    </div>
  )
}
