'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { COLOR_FORMATS, type ColorFormat } from '../types'
import { convertColor } from '../color-utils'

interface Props {
  modeValues: Record<string, string>
}

const SWATCH_MODES = ['Mode 1'] as const
type SwatchMode = typeof SWATCH_MODES[number]

export function ColorSwatch({ modeValues }: Props) {
  const [format, setFormat] = useState<ColorFormat>('hex')
  const [mode, setMode] = useState<SwatchMode>('Mode 1')

  const hex = modeValues[mode] || ''

  return (
    <div className="flex flex-col gap-2">
      <div
        className="w-full h-24 rounded-md border border-black/10"
        style={{ backgroundColor: hex || 'transparent' }}
      />
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-xs truncate">
          {hex ? convertColor(hex, format) : '—'}
        </span>
        <div className="flex items-center gap-1 shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-0.5 border rounded px-2 py-1 text-[10px] text-muted-foreground hover:text-foreground cursor-pointer">
              {format}<ChevronDown size={10} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[80px]">
              {COLOR_FORMATS.map(fmt => (
                <DropdownMenuItem key={fmt} className="text-xs" onClick={() => setFormat(fmt)}>{fmt}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-0.5 border rounded px-2 py-1 text-[10px] text-muted-foreground hover:text-foreground cursor-pointer">
              {mode}<ChevronDown size={10} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[90px]">
              {SWATCH_MODES.map(m => (
                <DropdownMenuItem key={m} className="text-xs" onClick={() => setMode(m)}>{m}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}
