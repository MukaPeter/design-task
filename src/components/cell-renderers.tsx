'use client'

import { ChevronDown } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { convertColor } from '@/components/token-detail-panel/color-utils'
import {
  type DtcgType, type ColorFormat, COLOR_FORMATS,
  type DimensionUnit, DIMENSION_UNITS,
  type DurationUnit, DURATION_UNITS,
  type NumberIntent, NUMBER_INTENTS,
} from '@/types/tokens'
import React from 'react'

export { DIMENSION_UNITS, DURATION_UNITS }

export interface CellRendererProps {
  value: string
  isEditing: boolean
  onStartEdit: () => void
  onEndEdit: () => void
  onChange: (value: string) => void
  colorFormat: ColorFormat
  onColorFormatChange: (fmt: ColorFormat) => void
  dimensionUnit: DimensionUnit
  onDimensionUnitChange: (unit: DimensionUnit) => void
  durationUnit: DurationUnit
  onDurationUnitChange: (unit: DurationUnit) => void
  numberIntent: NumberIntent
  onNumberIntentChange: (intent: NumberIntent) => void
}

function EditableInput({ value, onChange, onEndEdit, mono = false }: {
  value: string
  onChange: (v: string) => void
  onEndEdit: () => void
  mono?: boolean
}) {
  return (
    <Input
      autoFocus
      value={value}
      onChange={e => onChange(e.target.value)}
      onBlur={onEndEdit}
      onKeyDown={e => e.key === 'Enter' && onEndEdit()}
      className={`border-none shadow-none p-0 bg-transparent focus-visible:ring-0 focus-visible:outline-none w-full${mono ? ' font-mono' : ''}`}
      style={{ fontSize: '12px' }}
    />
  )
}

function UnitDropdown<T extends string>({ value, options, onChange }: {
  value: T
  options: T[]
  onChange: (v: T) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="tok-unit-label flex items-center gap-0.5 text-muted-foreground hover:text-foreground shrink-0 px-1 cursor-pointer"
        onClick={e => e.stopPropagation()}
      >
        {value}<ChevronDown size={10} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {options.map(opt => (
          <DropdownMenuItem key={opt} className="text-xs" onClick={() => onChange(opt)}>
            {opt}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

type CellRenderer = (props: CellRendererProps) => React.ReactNode

function defaultRenderer({ value, isEditing, onStartEdit, onEndEdit, onChange }: CellRendererProps) {
  if (isEditing) return <EditableInput value={value} onChange={onChange} onEndEdit={onEndEdit} />
  return <span className="truncate block text-xs cursor-text" onClick={onStartEdit}>{value}</span>
}

export const CELL_RENDERERS: Partial<Record<DtcgType, CellRenderer>> = {
  color: ({ value, isEditing, onStartEdit, onEndEdit, onChange, colorFormat, onColorFormatChange }) => {
    if (isEditing) return <EditableInput value={value} onChange={onChange} onEndEdit={onEndEdit} mono />
    return (
      <div className="flex items-center gap-2 min-w-0">
        <span
          className="w-4 h-4 rounded-sm shrink-0 border border-black/10 cursor-pointer"
          style={{ backgroundColor: value || 'transparent' }}
          onClick={onStartEdit}
        />
        <span className="truncate text-xs flex-1 min-w-0">
          {value ? convertColor(value, colorFormat) : ''}
        </span>
        <UnitDropdown value={colorFormat} options={COLOR_FORMATS as unknown as ColorFormat[]} onChange={onColorFormatChange} />
      </div>
    )
  },

  dimension: ({ value, isEditing, onStartEdit, onEndEdit, onChange, dimensionUnit, onDimensionUnitChange }) => {
    if (isEditing) return <EditableInput value={value} onChange={onChange} onEndEdit={onEndEdit} />
    return (
      <div className="flex items-center gap-2 min-w-0" onClick={onStartEdit}>
        <span className="truncate text-xs flex-1 min-w-0 cursor-text">
          {value ? `${value}${dimensionUnit}` : ''}
        </span>
        <UnitDropdown value={dimensionUnit} options={DIMENSION_UNITS} onChange={onDimensionUnitChange} />
      </div>
    )
  },

  duration: ({ value, isEditing, onStartEdit, onEndEdit, onChange, durationUnit, onDurationUnitChange }) => {
    if (isEditing) return <EditableInput value={value} onChange={onChange} onEndEdit={onEndEdit} />
    return (
      <div className="flex items-center gap-2 min-w-0" onClick={onStartEdit}>
        <span className="truncate text-xs flex-1 min-w-0 cursor-text">
          {value ? `${value}${durationUnit}` : ''}
        </span>
        <UnitDropdown value={durationUnit} options={DURATION_UNITS} onChange={onDurationUnitChange} />
      </div>
    )
  },

  number: ({ value, isEditing, onStartEdit, onEndEdit, onChange, numberIntent, onNumberIntentChange }) => {
    const label = NUMBER_INTENTS.find(i => i.value === numberIntent)!.label
    const displayValue = value ? (numberIntent === 'angle' ? `${value}°` : value) : ''
    if (isEditing) return <EditableInput value={value} onChange={onChange} onEndEdit={onEndEdit} />
    return (
      <div className="flex items-center gap-2 min-w-0" onClick={onStartEdit}>
        <span className="truncate text-xs flex-1 min-w-0 cursor-text">{displayValue}</span>
        <DropdownMenu>
          <DropdownMenuTrigger
            className="tok-unit-label flex items-center gap-0.5 text-muted-foreground hover:text-foreground shrink-0 px-1 cursor-pointer whitespace-nowrap"
            onClick={e => e.stopPropagation()}
          >
            {label}<ChevronDown size={10} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[160px]">
            {NUMBER_INTENTS.map(i => (
              <DropdownMenuItem key={i.value} className="text-xs whitespace-nowrap" onClick={() => onNumberIntentChange(i.value)}>
                {i.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    )
  },
}

export function renderCell(type: DtcgType, props: CellRendererProps): React.ReactNode {
  const renderer = CELL_RENDERERS[type] ?? defaultRenderer
  return renderer(props)
}
