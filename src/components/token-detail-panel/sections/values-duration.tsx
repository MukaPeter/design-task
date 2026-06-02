'use client'

import { useState } from 'react'
import { ChevronDown, Copy } from 'lucide-react'
import { TableRow, TableCell } from '@/components/ui/table'
import { SectionTable } from './section-table'

interface Props {
  modeValues: Record<string, string>
}

type DurationUnit = 'ms' | 's'

function convert(raw: string, unit: DurationUnit): string {
  const n = parseFloat(raw)
  if (isNaN(n)) return ''
  return unit === 'ms' ? `${n}ms` : `${n / 1000}s`
}

const UNITS: DurationUnit[] = ['ms', 's']

export function ValuesDuration({ modeValues }: Props) {
  const [open, setOpen] = useState(true)
  const value = modeValues['Mode 1'] || ''

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
        <SectionTable headers={['Unit', 'Mode 1']}>
          {UNITS.map(unit => (
            <TableRow key={unit} className="group">
              <TableCell className="text-muted-foreground">{unit}</TableCell>
              <TableCell>
                {value ? (
                  <div className="flex items-center justify-between gap-1 min-w-0">
                    <span className="font-mono">{convert(value, unit)}</span>
                    <button
                      tabIndex={-1}
                      className="text-muted-foreground hover:text-foreground shrink-0 transition-opacity opacity-0 group-hover:opacity-100"
                      onClick={() => navigator.clipboard.writeText(convert(value, unit))}
                    >
                      <Copy size={12} />
                    </button>
                  </div>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </SectionTable>
      )}
    </div>
  )
}
