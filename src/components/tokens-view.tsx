'use client'

import { useState, useRef } from 'react'
import React from 'react'
import { Plus, ChevronsDownUp, ChevronsUpDown } from 'lucide-react'
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable'
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { WorkspacePanel } from '@/components/workspace-panel'
import { CollectionsTree } from '@/components/collections-tree'
import type { CollectionsTreeHandle, TreeItem } from '@/components/collections-tree'
import { TokenGrid } from '@/components/token-grid'
import type { LiveToken } from '@/components/token-grid'
import { TokenDetailContent } from '@/components/token-detail-panel'
import type { Token } from '@/components/token-detail-panel/types'
import type { NumberIntent } from '@/types/tokens'

interface TokensViewProps {
  treeData?: TreeItem[]
  liveTokens?: LiveToken[]
  modeValues?: Record<string, string>
}

export function TokensView({ treeData = [], liveTokens = [], modeValues = {} }: TokensViewProps) {
  const [selectedPath, setSelectedPath] = useState<string[] | null>(null)
  const [selectedRow, setSelectedRow]   = useState<Token | null>(null)
  const [numberIntent, setNumberIntent] = useState<NumberIntent>('generic')
  const treeRef = useRef<CollectionsTreeHandle>(null)
  const [treeExpanded, setTreeExpanded] = useState(true)

  return (
    <ResizablePanelGroup orientation="horizontal" className="h-full">

      {/* Panel A — Collections tree */}
      <ResizablePanel id="panel-tree" defaultSize={23} minSize={15}>
        <WorkspacePanel
          title="Collections"
          actions={
            <Button
              variant="ghost"
              size="icon-sm"
              className="tok-icon-btn text-muted-foreground hover:text-foreground"
              onClick={() => {
                if (treeExpanded) {
                  treeRef.current?.collapseAll()
                } else {
                  treeRef.current?.expandAll()
                }
                setTreeExpanded(e => !e)
              }}
            >
              {treeExpanded ? <ChevronsDownUp size={14} /> : <ChevronsUpDown size={14} />}
            </Button>
          }
        >
          <CollectionsTree ref={treeRef} data={treeData} onSelect={setSelectedPath} />
        </WorkspacePanel>
      </ResizablePanel>

      <ResizableHandle withHandle />

      {/* Panel B — Token grid */}
      <ResizablePanel id="panel-grid" defaultSize={selectedRow ? 42 : 77} minSize={20}>
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
          contentScroll={false}
          footer={
            <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground">
              <Plus size={14} />
              Create token
            </Button>
          }
        >
          {!selectedPath ? (
            <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
              Select a collection or group
            </div>
          ) : (
            <TokenGrid
              treeData={treeData}
              selectedPath={selectedPath ?? []}
              selectedRow={selectedRow}
              numberIntent={numberIntent}
              liveTokens={liveTokens}
              initialModeValues={modeValues}
              onRowClick={row => setSelectedRow(prev => prev?.id === row.id ? null : row)}
              onNumberIntentChange={setNumberIntent}
            />
          )}
        </WorkspacePanel>
      </ResizablePanel>

      {/* Panel C — Token detail (conditional) */}
      {selectedRow && (
        <React.Fragment key={selectedRow.id}>
          <ResizableHandle withHandle />
          <ResizablePanel id="panel-detail" defaultSize={35} minSize={20}>
            <WorkspacePanel title="Token details" closeable onClose={() => setSelectedRow(null)}>
              <TokenDetailContent
                token={selectedRow}
                modeValues={{ 'Mode 1': modeValues[selectedRow.id] || '' }}
                numberIntent={numberIntent}
                onNumberIntentChange={setNumberIntent}
              />
            </WorkspacePanel>
          </ResizablePanel>
        </React.Fragment>
      )}

    </ResizablePanelGroup>
  )
}
