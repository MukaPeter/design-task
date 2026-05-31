'use client'

import { useRef, useEffect, useState } from 'react'
import { Tree } from 'react-arborist'
import type { NodeRendererProps, NodeApi } from 'react-arborist'
import { ChevronRight, X, PanelRightOpen, Palette, Ruler, Clock, Type, Hash, ToggleLeft, PaintRoller, SquareDashed, SquareDashedTopSolid, Minus, LineStyle, CodeXml, Bold, Blend, Spline, Percent, BookType } from 'lucide-react'
import { Sidebar } from '@/components/sidebar'
import { Panel } from '@/components/panel'
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import React from 'react'
import { LayoutDashboard, GitBranch, FileText, ShieldAlert, FlaskConical, GitPullRequest, ScrollText } from 'lucide-react'

// ─── Nav ──────────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { id: 'overview',     label: 'Overview',        icon: <LayoutDashboard size={16} /> },
  { id: 'requirements', label: 'Requirements',    icon: <FileText size={16} /> },
  { id: 'traceability', label: 'Traceability',    icon: <GitBranch size={16} /> },
  { id: 'risk',         label: 'Risk Management', icon: <ShieldAlert size={16} /> },
  { id: 'tests',        label: 'Test Results',    icon: <FlaskConical size={16} /> },
  { id: 'changes',      label: 'Change Control',  icon: <GitPullRequest size={16} /> },
  { id: 'audit',        label: 'Audit Log',       icon: <ScrollText size={16} /> },
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
  onSelect?: (name: string) => void
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
            if (nodes.length > 0) onSelect?.(nodes[0].data.name)
          }}
        >
          {TreeNode}
        </Tree>
      )}
    </div>
  )
}

// ─── Token types ─────────────────────────────────────────────────────────────

type DtcgType = 'color' | 'dimension' | 'duration' | 'fontFamily' | 'fontWeight' | 'number' | 'string' | 'boolean' | 'gradient' | 'typography' | 'border' | 'shadow' | 'transition' | 'cubicBezier' | 'strokeStyle' | 'percentage'

const F_ICON = <span className="text-[10px] font-bold text-muted-foreground leading-none">F</span>

const TOKEN_TYPE_ICONS: Record<DtcgType, React.ReactNode> = {
  color:       <Palette      size={16} className="shrink-0 text-muted-foreground" strokeWidth={2.5} />,
  dimension:   <Ruler        size={16} className="shrink-0 text-muted-foreground" strokeWidth={2.5} />,
  duration:    <Clock        size={16} className="shrink-0 text-muted-foreground" strokeWidth={2.5} />,
  fontFamily:  <BookType     size={16} className="shrink-0 text-muted-foreground" strokeWidth={2.5} />,
  fontWeight:  <Bold         size={16} className="shrink-0 text-muted-foreground" strokeWidth={2.5} />,
  number:      <Hash         size={16} className="shrink-0 text-muted-foreground" strokeWidth={2.5} />,
  string:      <CodeXml      size={16} className="shrink-0 text-muted-foreground" strokeWidth={2.5} />,
  boolean:     <ToggleLeft   size={16} className="shrink-0 text-muted-foreground" strokeWidth={2.5} />,
  gradient:    <PaintRoller  size={16} className="shrink-0 text-muted-foreground" strokeWidth={2.5} />,
  typography:  <Type         size={16} className="shrink-0 text-muted-foreground" strokeWidth={2.5} />,
  border:      <SquareDashedTopSolid size={16} className="shrink-0 text-muted-foreground" strokeWidth={2.5} />,
  shadow:      <Minus        size={16} className="shrink-0 text-muted-foreground" strokeWidth={2.5} />,
  transition:  <Blend        size={16} className="shrink-0 text-muted-foreground" strokeWidth={2.5} />,
  cubicBezier: <Spline       size={16} className="shrink-0 text-muted-foreground" strokeWidth={2.5} />,
  strokeStyle: <LineStyle    size={16} className="shrink-0 text-muted-foreground" strokeWidth={2.5} />,
  percentage:  <Percent      size={16} className="shrink-0 text-muted-foreground" strokeWidth={2.5} />,
}

// ─── Grid data ───────────────────────────────────────────────────────────────

const ROWS: Row[] = [
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
  { id: '16', name: 'percentage',  type: 'percentage'  },
]

// ─── Tab A content ────────────────────────────────────────────────────────────

interface Row { id: string; name: string; type: DtcgType }

function TabAContent() {
  const [selectedName, setSelectedName] = useState<string | null>(null)
  const [selectedRow, setSelectedRow]   = useState<Row | null>(null)
  const [editingCell, setEditingCell]   = useState<string | null>(null)
  const [mode1Values, setMode1Values]   = useState<Record<string, string>>({
    ...Object.fromEntries(ROWS.map(row => [row.id, ''])),
    '1': '#0066FF',
  })

  // ─── Column resize ──────────────────────────────────────────────────────────
  const [colWidths, setColWidths] = useState({ name: 160, mode1: 220, mode2: 140, mode3: 140 })
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

  function handleRowClick(row: Row) {
    setSelectedRow(prev => prev?.id === row.id ? null : row)
  }


  return (
    <ResizablePanelGroup orientation="horizontal" className="h-full">

      {/* Collections tree */}
      <ResizablePanel id="inner-left" defaultSize={23} minSize={15}>
        <div className="h-full bg-background flex flex-col">
          <div className="h-14 flex items-center px-4 border-b shrink-0">
            <span className="text-sm font-semibold">Collections</span>
          </div>
          <CollectionsTree onSelect={setSelectedName} />
        </div>
      </ResizablePanel>

      <ResizableHandle withHandle />

      {/* Grid */}
      <ResizablePanel id="inner-middle" defaultSize={77} minSize={20}>
        <div className="h-full bg-background flex flex-col">
          <div className="h-14 flex items-center px-4 border-b shrink-0">
            <span className="text-sm font-semibold">{selectedName ?? '—'}</span>
          </div>
          <div className="flex-1 min-h-0 overflow-auto">
            {!selectedName ? (
              <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                Select a collection or group
              </div>
            ) : null}
            {selectedName && <Table className="table-fixed">
              <TableHeader>
                <TableRow>
                  {(['name', 'mode1', 'mode2', 'mode3'] as const).map((col, i) => (
                    <TableHead
                      key={col}
                      style={{ width: colWidths[col] }}
                      className="relative border-r select-none"
                    >
                      {['Name', 'Mode 1', 'Mode 2', 'Mode 3'][i]}
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
                        <span className="truncate text-xs">{row.name}</span>
                      </div>
                    </TableCell>
                    <TableCell
                      className="cursor-text border-r"
                      onClick={() => setEditingCell(row.id)}
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
                            className="w-4 h-4 rounded-sm shrink-0 border border-black/10"
                            style={{ backgroundColor: mode1Values[row.id] || 'transparent' }}
                          />
                          <span className="truncate text-xs">{mode1Values[row.id]}</span>
                        </div>
                      ) : (
                        <span className="truncate block text-xs">{mode1Values[row.id]}</span>
                      )}
                    </TableCell>
                    <TableCell className="truncate border-r" />
                    <TableCell className="truncate border-r" />
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
        </div>
      </ResizablePanel>

      {/* Detail panel — appears when a row is selected */}
      {selectedRow && (
        <React.Fragment key={selectedRow.id}>
          <ResizableHandle withHandle />
          <ResizablePanel id="inner-detail" defaultSize={30} minSize={20}>
            <div className="h-full bg-background flex flex-col">
              <div className="h-14 flex items-center px-4 border-b shrink-0 justify-between">
                <span className="text-sm font-semibold">{selectedRow.name}</span>
                <button
                  onClick={() => setSelectedRow(null)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="flex-1 min-h-0 overflow-auto p-4 flex flex-col gap-4 text-xs">
                {[
                  { label: 'Name', value: selectedRow.name },
                  { label: 'Type', value: selectedRow.type },
                ].map(({ label, value }) => (
                  <div key={label} className="flex flex-col gap-0.5">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Demo2() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar items={NAV_ITEMS} />
      <main className="flex-1 overflow-hidden">
        <ResizablePanelGroup orientation="horizontal">
          <ResizablePanel id="panel-1" defaultSize={100}>
            <Panel id="panel-1" tabs={PANEL_TABS} />
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>
    </div>
  )
}
