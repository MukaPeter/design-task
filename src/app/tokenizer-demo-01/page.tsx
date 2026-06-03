'use client'

import { useRef, useEffect, useState } from 'react'
import { Tree } from 'react-arborist'
import type { NodeRendererProps, NodeApi } from 'react-arborist'
import { ChevronRight, PanelRightOpen, X, Copy } from 'lucide-react'
import { Sidebar } from '@/components/sidebar'
import { Panel } from '@/components/panel'
import { WorkspacePanel } from '@/components/workspace-panel'
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import React from 'react'
import { Database, Settings, Plus, ChevronDown } from 'lucide-react'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { TokenDetailPanel } from '@/components/token-detail-panel'
import type { Token, DtcgType, ColorFormat } from '@/components/token-detail-panel/types'
import type { NumberIntent } from '@/components/token-detail-panel/sections/values-number'
import { NUMBER_INTENTS } from '@/components/token-detail-panel/sections/values-number'
import { TOKEN_TYPE_ICONS, toDisplayName, COLOR_FORMATS } from '@/components/token-detail-panel/types'
import { convertColor } from '@/components/token-detail-panel/color-utils'

// ─── Nav ──────────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { id: 'repositories', label: 'Repositories', icon: <Database size={16} /> },
  { id: 'settings',     label: 'Settings',     icon: <Settings size={16} /> },
]

// ─── Collections tree ─────────────────────────────────────────────────────────

interface TreeItem {
  id: string
  name: string
  children?: TreeItem[]
}

const TREE_DATA: TreeItem[] = [
  {
    id: '1',
    name: 'Collection A',
    children: [
      {
        id: '1-1',
        name: 'Group',
        children: [
          { id: '1-1-1', name: 'Group' },
          { id: '1-1-2', name: 'Group' },
        ],
      },
      {
        id: '1-2',
        name: 'Group',
        children: [
          { id: '1-2-1', name: 'Group' },
        ],
      },
    ],
  },
  {
    id: '2',
    name: 'Collection B',
    children: [
      {
        id: '2-1',
        name: 'Group',
        children: [
          { id: '2-1-1', name: 'Group' },
        ],
      },
    ],
  },
]

function TreeNode({ node, style, dragHandle }: NodeRendererProps<TreeItem>) {
  return (
    <div
      style={style}
      ref={dragHandle}
      onClick={() => node.toggle()}
      className={`flex items-center gap-1 rounded-md px-2 py-1.5 cursor-pointer select-none text-xs hover:bg-[#F5F5F5] ${node.isSelected ? 'bg-primary/10' : ''}`}
    >
      <ChevronRight
        size={16}
        className={`shrink-0 text-muted-foreground transition-transform duration-150 ${node.isOpen ? 'rotate-90' : ''} ${node.isLeaf ? 'invisible' : ''}`}
      />
      <span className={`truncate ${node.isSelected ? 'font-semibold' : ''}`}>{node.data.name}</span>
    </div>
  )
}

interface CollectionsTreeProps {
  onSelect?: (path: string[]) => void
}

function CollectionsTree({ onSelect }: CollectionsTreeProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    if (!ref.current) return
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setSize({ width, height })
    })
    ro.observe(ref.current)
    return () => ro.disconnect()
  }, [])

  return (
    <div ref={ref} className="flex-1 min-h-0 overflow-hidden p-4">
      {size.width > 0 && (
        <Tree<TreeItem>
          data={TREE_DATA}
          width={size.width}
          height={size.height}
          rowHeight={36}
          indent={16}
          openByDefault
          onSelect={(nodes: NodeApi<TreeItem>[]) => {
            if (nodes.length > 0) {
              const node = nodes[0]
              const path: string[] = []
              let current: NodeApi<TreeItem> | null = node
              while (current) {
                path.unshift(current.data.name)
                current = current.parent?.id === '__REACT_ARBORIST_INTERNAL_ROOT__' ? null : current.parent ?? null
              }
              onSelect?.(path)
            }
          }}
        >
          {TreeNode}
        </Tree>
      )}
    </div>
  )
}

type DimensionUnit = 'px' | '%' | 'rem' | 'em' | 'pt'
const DIMENSION_UNITS: DimensionUnit[] = ['px', '%', 'rem', 'em', 'pt']
type DurationUnit = 'ms' | 's'
const DURATION_UNITS: DurationUnit[] = ['ms', 's']

// ─── Grid data ───────────────────────────────────────────────────────────────

const ROWS: Token[] = [
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

// ─── Tab A content ────────────────────────────────────────────────────────────

function TabAContent() {
  const [selectedPath, setSelectedPath] = useState<string[] | null>(null)
  const [selectedRow, setSelectedRow]   = useState<Token | null>(null)
  const [editingCell, setEditingCell]   = useState<string | null>(null)
  const [colorFormat, setColorFormat]       = useState<ColorFormat>('hex')
  const [dimensionUnit, setDimensionUnit]   = useState<DimensionUnit>('px')
  const [durationUnit, setDurationUnit]     = useState<DurationUnit>('ms')
  const [numberIntent, setNumberIntent]     = useState<NumberIntent>('generic')
  const [mode1Values, setMode1Values]   = useState<Record<string, string>>({
    ...Object.fromEntries(ROWS.map(row => [row.id, ''])),
    '1': '#0066FF',
  })

  // ─── Column resize ──────────────────────────────────────────────────────────
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

  function handleRowClick(row: Token) {
    setSelectedRow(prev => prev?.id === row.id ? null : row)
  }


  return (
    <ResizablePanelGroup orientation="horizontal" className="h-full">

      {/* Collections tree */}
      <ResizablePanel id="inner-left" defaultSize={23} minSize={15}>
        <WorkspacePanel title="Collections" collapsible>
          <CollectionsTree onSelect={setSelectedPath} />
        </WorkspacePanel>
      </ResizablePanel>

      <ResizableHandle withHandle />

      {/* Grid */}
      <ResizablePanel id="inner-middle" defaultSize={77} minSize={20}>
        <WorkspacePanel
          title={selectedPath ? (
            <Breadcrumb>
              <BreadcrumbList>
                {selectedPath.map((segment, i) => (
                  <React.Fragment key={i}>
                    {i > 0 && <BreadcrumbSeparator />}
                    <BreadcrumbItem>
                      {i === selectedPath.length - 1
                        ? <BreadcrumbPage className="font-semibold">{segment}</BreadcrumbPage>
                        : <span className="text-muted-foreground text-sm">{segment}</span>
                      }
                    </BreadcrumbItem>
                  </React.Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          ) : (
            <span className="text-muted-foreground font-normal">—</span>
          )}
          footer={
            <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground">
              <Plus size={14} />
              Create token
            </Button>
          }
        >
          <div className="flex-1 min-h-0 overflow-auto">
            {!selectedPath ? (
              <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                Select a collection or group
              </div>
            ) : null}
            {selectedPath && <Table className="table-fixed border-b">
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
                {ROWS.map(row => (
                  <TableRow
                    key={row.id}
                    data-state={selectedRow?.id === row.id ? 'selected' : undefined}
                    className="group"
                  >
                    <TableCell className="border-r">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-4 flex items-center justify-center shrink-0">{TOKEN_TYPE_ICONS[row.type]}</span>
                        <span className="truncate text-xs">{toDisplayName(row.name)}</span>
                      </div>
                    </TableCell>
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
                                <DropdownMenuItem
                                  key={fmt}
                                  className="text-xs"
                                  onClick={() => setColorFormat(fmt)}
                                >
                                  {fmt}
                                </DropdownMenuItem>
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
                                <DropdownMenuItem key={i.value} className="text-xs whitespace-nowrap" onClick={() => setNumberIntent(i.value)}>{i.label}</DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      ) : (
                        <span className="truncate block text-xs cursor-text">{mode1Values[row.id]}</span>
                      )}
                    </TableCell>
                    <TableCell className="w-8">
                      <button
                        onClick={() => handleRowClick(row)}
                        className="text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <PanelRightOpen size={16} />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>}
          </div>
        </WorkspacePanel>
      </ResizablePanel>

      {/* Detail panel — appears when a row is selected */}
      {selectedRow && (
        <React.Fragment key={selectedRow.id}>
          <ResizableHandle withHandle />
          <ResizablePanel id="inner-detail" defaultSize={35} minSize={20}>
            <TokenDetailPanel
              token={selectedRow}
              modeValues={{ 'Mode 1': mode1Values[selectedRow.id] || '' }}
              onClose={() => setSelectedRow(null)}
              numberIntent={numberIntent}
              onNumberIntentChange={setNumberIntent}
            />
          </ResizablePanel>
        </React.Fragment>
      )}

    </ResizablePanelGroup>
  )
}

const PANEL_TABS = [
  { id: 'a1', label: 'Tab A', content: <TabAContent /> },
  { id: 'a2', label: 'Tab B', content: <div className="p-4 text-sm text-muted-foreground">Panel — Content B</div> },
]

const REPOSITORIES = [
  { id: 'r1', name: 'Brand tokens' },
  { id: 'r2', name: 'Product tokens' },
  { id: 'r3', name: 'Marketing tokens' },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Demo2() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar items={NAV_ITEMS} />
      <main className="flex-1 overflow-hidden">
        <ResizablePanelGroup orientation="horizontal">
          <ResizablePanel id="panel-1" defaultSize={100}>
            <Panel id="panel-1" tabs={PANEL_TABS} repositories={REPOSITORIES} />
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>
    </div>
  )
}
