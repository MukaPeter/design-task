'use client'

import { useState } from 'react'
import React from 'react'
import { Plus } from 'lucide-react'
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable'
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { WorkspacePanel } from '@/components/workspace-panel'
import { CollectionsTree } from '@/components/collections-tree'
import { TokenGrid, ROWS } from '@/components/token-grid'
import { TokenDetailPanel } from '@/components/token-detail-panel'
import type { Token } from '@/components/token-detail-panel/types'
import type { NumberIntent } from '@/components/token-detail-panel/sections/values-number'

export function TokensView() {
  const [selectedPath, setSelectedPath] = useState<string[] | null>(null)
  const [selectedRow, setSelectedRow]   = useState<Token | null>(null)
  const [numberIntent, setNumberIntent] = useState<NumberIntent>('generic')

  const mode1Values = Object.fromEntries(ROWS.map(r => [r.id, r.id === '1' ? '#0066FF' : '']))

  return (
    <ResizablePanelGroup orientation="horizontal" className="h-full">

      {/* Panel A — Collections tree */}
      <ResizablePanel id="panel-tree" defaultSize={23} minSize={15}>
        <WorkspacePanel title="Collections" collapsible>
          <CollectionsTree onSelect={setSelectedPath} />
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
              selectedRow={selectedRow}
              numberIntent={numberIntent}
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
