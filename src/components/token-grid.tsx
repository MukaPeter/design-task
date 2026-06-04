'use client'

import { useState, useMemo } from 'react'
import { TextSearch, Plus } from 'lucide-react'
import {
  useReactTable,
  getCoreRowModel,
  createColumnHelper,
} from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { TOKEN_TYPE_ICONS } from '@/components/token-detail-panel/types'
import type { Token } from '@/components/token-detail-panel/types'
import type { DtcgType, ColorFormat, NumberIntent } from '@/types/tokens'
import { renderCell, DIMENSION_UNITS, DURATION_UNITS } from '@/components/cell-renderers'
import type { CellRendererProps } from '@/components/cell-renderers'
import type { TreeItem } from '@/components/collections-tree'

export interface LiveToken {
  id: string
  name: string
  type: DtcgType
  description?: string | null
  collection_name: string
  path: string[]
}

type GridRow =
  | { kind: 'spacer'; id: string; label: string; first: boolean }
  | { kind: 'token'; token: Token }

function pathStartsWith(tokenPath: string[], prefix: string[]): boolean {
  if (prefix.length === 0) return true
  if (tokenPath.length < prefix.length) return false
  return prefix.every((seg, i) => tokenPath[i] === seg)
}

function getGroupedRows(liveTokens: LiveToken[], selectedPath: string[]): GridRow[] {
  if (selectedPath.length === 0) return []

  const collectionName = selectedPath[0]
  const subPath = selectedPath.slice(1)

  const filtered = liveTokens.filter(t =>
    t.collection_name === collectionName &&
    pathStartsWith(t.path, subPath)
  )

  if (filtered.length === 0) return []

  const groups = new Map<string, LiveToken[]>()
  for (const token of filtered) {
    const key = token.path.join('/')
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(token)
  }

  // Single group that exactly matches the selected path — no spacer
  if (groups.size === 1 && subPath.length > 0 && subPath.length === filtered[0].path.length) {
    return filtered.map(t => ({ kind: 'token' as const, token: { id: t.id, name: t.name, type: t.type } }))
  }

  const rows: GridRow[] = []
  let isFirst = true
  for (const [pathKey, groupTokens] of groups) {
    const parts = pathKey.split('/')
    const label = parts[parts.length - 1]
    rows.push({ kind: 'spacer', id: pathKey, label, first: isFirst })
    isFirst = false
    for (const t of groupTokens) {
      rows.push({ kind: 'token', token: { id: t.id, name: t.name, type: t.type } })
    }
  }
  return rows
}

// ─── Column definitions ───────────────────────────────────────────────────────

type ColData = Record<string, string>
const columnHelper = createColumnHelper<ColData>()

const BORDER = '1px solid var(--tok-gray-200)'

// ─── Component ────────────────────────────────────────────────────────────────

interface TokenGridProps {
  treeData: TreeItem[]
  selectedPath: string[]
  selectedRow: Token | null
  numberIntent: NumberIntent
  liveTokens: LiveToken[]
  initialModeValues: Record<string, string>
  onRowClick: (row: Token) => void
  onNumberIntentChange: (intent: NumberIntent) => void
}

export function TokenGrid({
  treeData: _treeData,
  selectedPath,
  selectedRow,
  numberIntent,
  liveTokens,
  initialModeValues,
  onRowClick,
  onNumberIntentChange,
}: TokenGridProps) {
  const [editingCell, setEditingCell]     = useState<string | null>(null)
  const [colorFormat, setColorFormat]     = useState<ColorFormat>('hex')
  const [dimensionUnit, setDimensionUnit] = useState<typeof DIMENSION_UNITS[number]>('px')
  const [durationUnit, setDurationUnit]   = useState<typeof DURATION_UNITS[number]>('ms')
  const [mode1Values, setMode1Values]     = useState<Record<string, string>>(initialModeValues)
  const [hoveredRow, setHoveredRow]       = useState<string | null>(null)

  const columns = useMemo(() => [
    columnHelper.accessor('name', {
      header: 'Name',
      size: 160,
      minSize: 80,
      maxSize: 600,
    }),
    columnHelper.accessor('mode1', {
      header: 'Mode 1',
      size: 220,
      minSize: 120,
      maxSize: 600,
    }),
  ], [])

  const table = useReactTable({
    data: [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    columnResizeMode: 'onChange',
    enableColumnResizing: true,
  })

  const headers = table.getHeaderGroups()[0]?.headers ?? []
  const gridRows = getGroupedRows(liveTokens, selectedPath)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* ── Sticky header ── */}
      <div
        className="bg-background"
        style={{ display: 'flex', alignItems: 'stretch', height: 40, borderBottom: BORDER, flexShrink: 0 }}
      >
        {headers.map(header => (
          <div
            key={header.id}
            style={{
              width: header.getSize(),
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              padding: '0 8px',
              fontSize: '13px',
              fontWeight: 500,
              position: 'relative',
              borderRight: BORDER,
              userSelect: 'none',
            }}
          >
            {String(header.column.columnDef.header ?? '')}
            {header.column.getCanResize() && (
              <div
                onMouseDown={header.getResizeHandler()}
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 0,
                  height: '100%',
                  width: 4,
                  cursor: 'col-resize',
                }}
              />
            )}
          </div>
        ))}
        {/* Actions column — add mode */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 8px' }}>
          <Button
            variant="ghost"
            size="icon-sm"
            title="Add mode"
            className="tok-icon-btn text-muted-foreground hover:text-foreground"
          >
            <Plus size={14} />
          </Button>
        </div>
      </div>

      {/* ── Body rows ── */}
      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
      <div style={{ borderBottom: BORDER }}>
        {gridRows.map((gridRow, i) => {

          // Spacer / group title row
          if (gridRow.kind === 'spacer') {
            return (
              <div
                key={`spacer-${gridRow.id}`}
                style={{
                  paddingTop:    gridRow.first ? 16 : 40,
                  paddingBottom: 12,
                  paddingLeft:   16,
                  paddingRight:  16,
                }}
              >
                <span className="tok-panel-title text-foreground">{gridRow.label}</span>
              </div>
            )
          }

          // Token row
          const row        = gridRow.token
          const isGroupStart = i === 0 || gridRows[i - 1].kind === 'spacer'
          const isSelected = selectedRow?.id === row.id
          const isHovered  = hoveredRow === row.id

          const colWidths = headers.map(h => h.getSize())

          const cellProps: CellRendererProps = {
            value:                mode1Values[row.id] ?? '',
            isEditing:            editingCell === row.id,
            onStartEdit:          () => setEditingCell(row.id),
            onEndEdit:            () => setEditingCell(null),
            onChange:             v => setMode1Values(prev => ({ ...prev, [row.id]: v })),
            colorFormat,
            onColorFormatChange:  setColorFormat,
            dimensionUnit,
            onDimensionUnitChange: setDimensionUnit,
            durationUnit,
            onDurationUnitChange: setDurationUnit,
            numberIntent,
            onNumberIntentChange,
          }

          return (
            <div
              key={row.id}
              onMouseEnter={() => setHoveredRow(row.id)}
              onMouseLeave={() => setHoveredRow(null)}
              style={{
                display:         'flex',
                alignItems:      'stretch',
                height:          40,
                overflow:        'hidden',
                borderTop:       isGroupStart ? BORDER : undefined,
                borderBottom:    BORDER,
                backgroundColor: isSelected
                  ? 'rgba(0, 156, 255, 0.08)'
                  : isHovered
                    ? 'var(--tok-gray-50)'
                    : 'transparent',
              }}
            >
              {/* Name cell */}
              <div
                style={{
                  width:       colWidths[0] ?? 160,
                  flexShrink:  0,
                  borderRight: BORDER,
                  padding:     '0 8px',
                  display:     'flex',
                  alignItems:  'center',
                  gap:         8,
                  minWidth:    0,
                  overflow:    'hidden',
                }}
              >
                <span style={{ width: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {TOKEN_TYPE_ICONS[row.type]}
                </span>
                <span style={{ fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {row.name}
                </span>
              </div>

              {/* Mode 1 cell */}
              <div
                style={{
                  width:       colWidths[1] ?? 220,
                  flexShrink:  0,
                  borderRight: BORDER,
                  padding:     '0 8px',
                  display:     'flex',
                  alignItems:  'center',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  {renderCell(row.type, cellProps)}
                </div>
              </div>

              {/* Actions cell */}
              <div
                style={{
                  flex:            1,
                  display:         'flex',
                  alignItems:      'center',
                  justifyContent:  'flex-end',
                  padding:         '0 8px',
                }}
              >
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onRowClick(row)}
                  className="tok-icon-btn text-muted-foreground hover:text-foreground"
                  style={{ opacity: isHovered || isSelected ? 1 : 0 }}
                >
                  <TextSearch size={16} />
                </Button>
              </div>
            </div>
          )
        })}
      </div>
      </div>

    </div>
  )
}
