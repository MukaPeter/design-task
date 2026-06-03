'use client'

import { useRef, useState } from 'react'
import { PanelRightOpen, ChevronDown } from 'lucide-react'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { TOKEN_TYPE_ICONS, toDisplayName, COLOR_FORMATS } from '@/components/token-detail-panel/types'
import { convertColor } from '@/components/token-detail-panel/color-utils'
import { NUMBER_INTENTS } from '@/components/token-detail-panel/sections/values-number'
import type { Token, ColorFormat } from '@/components/token-detail-panel/types'
import type { NumberIntent } from '@/components/token-detail-panel/sections/values-number'
import React from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

type DimensionUnit = 'px' | '%' | 'rem' | 'em' | 'pt'
type DurationUnit = 'ms' | 's'

const DIMENSION_UNITS: DimensionUnit[] = ['px', '%', 'rem', 'em', 'pt']
const DURATION_UNITS: DurationUnit[] = ['ms', 's']

export const ROWS: Token[] = [
  { id: '1',  name: 'color',       type: 'color'       },
  { id: '2',  name: 'dimension',   type: 'dimension'   },
  { id: '3',  name: 'duration',    type: 'duration'    },
  { id: '4',  name: 'fontFamily',  type: 'fontFamily'  },
  { id: '5',  name: 'fontWeight',  type: 'fontWeight'  },
  { id: '6',  name: 'number',      type: 'number'      },
  { id: '7',  name: 'string',      type: 'string'      },
  { id: '8',  name: 'boolean',     type: 'boolean'     },
  { id: '9',  name: 'gradient',    type: 'gradient'    },
  { id: '10', name: 'typography',  type: 'typography'  },
  { id: '11', name: 'border',      type: 'border'      },
  { id: '12', name: 'shadow',      type: 'shadow'      },
  { id: '13', name: 'transition',  type: 'transition'  },
  { id: '14', name: 'cubicBezier', type: 'cubicBezier' },
  { id: '15', name: 'strokeStyle', type: 'strokeStyle' },
]

interface TokenGridProps {
  rows?: Token[]
  selectedRow: Token | null
  numberIntent: NumberIntent
  onRowClick: (row: Token) => void
  onNumberIntentChange: (intent: NumberIntent) => void
}

// ─── Component ───────────────────────────────────────────────────────────────

export function TokenGrid({
  rows = ROWS,
  selectedRow,
  numberIntent,
  onRowClick,
  onNumberIntentChange,
}: TokenGridProps) {
  const [editingCell, setEditingCell]     = useState<string | null>(null)
  const [colorFormat, setColorFormat]     = useState<ColorFormat>('hex')
  const [dimensionUnit, setDimensionUnit] = useState<DimensionUnit>('px')
  const [durationUnit, setDurationUnit]   = useState<DurationUnit>('ms')
  const [mode1Values, setMode1Values]     = useState<Record<string, string>>({
    ...Object.fromEntries(rows.map(row => [row.id, ''])),
    '1': '#0066FF',
  })

  const [colWidths, setColWidths] = useState({ name: 160, mode1: 220 })
  const resizeRef = useRef<{ col: keyof typeof colWidths, startX: number, startWidth: number } | null>(null)

  function startResize(col: keyof typeof colWidths, e: React.MouseEvent) {
    e.preventDefault()
    resizeRef.current = { col, startX: e.clientX, startWidth: colWidths[col] }

    function onMouseMove(e: MouseEvent) {
      if (!resizeRef.current) return
      const delta = e.clientX - resizeRef.current.startX
      const newWidth = Math.max(60, resizeRef.current.startWidth + delta)
      setColWidths(prev => ({ ...prev, [resizeRef.current!.col]: newWidth }))
    }

    function onMouseUp() {
      resizeRef.current = null
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }

  return (
    <Table className="table-fixed border-b">
      <TableHeader>
        <TableRow>
          {(['name', 'mode1'] as const).map((col, i) => (
            <TableHead
              key={col}
              style={{ width: colWidths[col] }}
              className="relative border-r select-none"
            >
              {['Name', 'Mode 1'][i]}
              <div
                className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-primary/40 active:bg-primary/60"
                onMouseDown={(e) => startResize(col, e)}
              />
            </TableHead>
          ))}
          <TableHead className="w-8" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map(row => (
          <TableRow
            key={row.id}
            data-state={selectedRow?.id === row.id ? 'selected' : undefined}
            className="group"
          >
            {/* Name cell */}
            <TableCell className="border-r">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-4 flex items-center justify-center shrink-0">{TOKEN_TYPE_ICONS[row.type]}</span>
                <span className="truncate text-xs">{toDisplayName(row.name)}</span>
              </div>
            </TableCell>

            {/* Value cell */}
            <TableCell
              className="border-r"
              onClick={() => row.type !== 'color' && setEditingCell(row.id)}
            >
              {editingCell === row.id ? (
                <Input
                  autoFocus
                  value={mode1Values[row.id]}
                  onChange={e => setMode1Values(prev => ({ ...prev, [row.id]: e.target.value }))}
                  onBlur={() => setEditingCell(null)}
                  onKeyDown={e => e.key === 'Enter' && setEditingCell(null)}
                  className="h-auto border-none shadow-none p-0 text-xs bg-transparent focus-visible:ring-0 focus-visible:outline-none w-full"
                />
              ) : row.type === 'color' ? (
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-4 h-4 rounded-sm shrink-0 border border-black/10 cursor-pointer"
                    style={{ backgroundColor: mode1Values[row.id] || 'transparent' }}
                    onClick={() => setEditingCell(row.id)}
                  />
                  <span className="truncate text-xs flex-1 min-w-0">
                    {mode1Values[row.id] ? convertColor(mode1Values[row.id], colorFormat) : ''}
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center gap-0.5 text-[10px] text-muted-foreground hover:text-foreground shrink-0 px-1 cursor-pointer" onClick={e => e.stopPropagation()}>
                      {colorFormat}<ChevronDown size={10} />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {COLOR_FORMATS.map(fmt => (
                        <DropdownMenuItem key={fmt} className="text-xs" onClick={() => setColorFormat(fmt)}>{fmt}</DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : row.type === 'dimension' ? (
                <div className="flex items-center gap-2 min-w-0" onClick={() => setEditingCell(row.id)}>
                  <span className="truncate text-xs flex-1 min-w-0 cursor-text">
                    {mode1Values[row.id] ? `${mode1Values[row.id]}${dimensionUnit}` : ''}
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center gap-0.5 text-[10px] text-muted-foreground hover:text-foreground shrink-0 px-1 cursor-pointer" onClick={e => e.stopPropagation()}>
                      {dimensionUnit}<ChevronDown size={10} />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {DIMENSION_UNITS.map(unit => (
                        <DropdownMenuItem key={unit} className="text-xs" onClick={() => setDimensionUnit(unit)}>{unit}</DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : row.type === 'duration' ? (
                <div className="flex items-center gap-2 min-w-0" onClick={() => setEditingCell(row.id)}>
                  <span className="truncate text-xs flex-1 min-w-0 cursor-text">
                    {mode1Values[row.id] ? `${mode1Values[row.id]}${durationUnit}` : ''}
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center gap-0.5 text-[10px] text-muted-foreground hover:text-foreground shrink-0 px-1 cursor-pointer" onClick={e => e.stopPropagation()}>
                      {durationUnit}<ChevronDown size={10} />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {DURATION_UNITS.map(unit => (
                        <DropdownMenuItem key={unit} className="text-xs" onClick={() => setDurationUnit(unit)}>{unit}</DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : row.type === 'number' ? (
                <div className="flex items-center gap-2 min-w-0" onClick={() => setEditingCell(row.id)}>
                  <span className="truncate text-xs flex-1 min-w-0 cursor-text">{mode1Values[row.id]}</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center gap-0.5 text-[10px] text-muted-foreground hover:text-foreground shrink-0 px-1 cursor-pointer whitespace-nowrap" onClick={e => e.stopPropagation()}>
                      {NUMBER_INTENTS.find(i => i.value === numberIntent)!.label}<ChevronDown size={10} />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="min-w-[160px]">
                      {NUMBER_INTENTS.map(i => (
                        <DropdownMenuItem key={i.value} className="text-xs whitespace-nowrap" onClick={() => onNumberIntentChange(i.value)}>{i.label}</DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <span className="truncate block text-xs cursor-text">{mode1Values[row.id]}</span>
              )}
            </TableCell>

            {/* Actions cell */}
            <TableCell className="w-8">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onRowClick(row)}
                className="text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100"
              >
                <PanelRightOpen size={16} />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
