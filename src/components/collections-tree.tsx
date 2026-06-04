'use client'

import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react'
import { Tree } from 'react-arborist'
import type { NodeRendererProps, NodeApi, TreeApi } from 'react-arborist'
import { ChevronRight } from 'lucide-react'

export interface TreeItem {
  id: string
  name: string
  tokenCount?: number
  children?: TreeItem[]
}

function getTotalCount(item: TreeItem): number {
  const own = item.tokenCount ?? 0
  const children = item.children?.reduce((sum, child) => sum + getTotalCount(child), 0) ?? 0
  return own + children
}


function TreeNode({ node, style, dragHandle }: NodeRendererProps<TreeItem>) {
  return (
    <div
      style={style}
      ref={dragHandle}
      className={`tok-tree-item flex items-center gap-1 rounded-md px-2 py-1.5 cursor-pointer select-none text-xs ${node.isSelected ? 'bg-primary/10' : ''}`}
    >
      <ChevronRight
        size={16}
        onClick={(e) => { e.stopPropagation(); node.toggle() }}
        className={`shrink-0 text-muted-foreground transition-transform duration-150 ${node.isOpen ? 'rotate-90' : ''} ${node.isLeaf ? 'invisible' : ''}`}
      />
      <span
        className={`truncate flex-1 ${node.isSelected ? 'font-semibold' : ''}`}
        onClick={() => node.select()}
      >
        {node.data.name}
      </span>
      <span className="shrink-0 text-[10px] text-muted-foreground">
        {getTotalCount(node.data)}
      </span>
    </div>
  )
}

export interface CollectionsTreeHandle {
  expandAll: () => void
  collapseAll: () => void
}

interface CollectionsTreeProps {
  data?: TreeItem[]
  onSelect?: (path: string[]) => void
}

export const CollectionsTree = forwardRef<CollectionsTreeHandle, CollectionsTreeProps>(
  function CollectionsTree({ data = [], onSelect }, ref) {
    const containerRef = useRef<HTMLDivElement>(null)
    const treeRef = useRef<TreeApi<TreeItem>>(null)
    const [size, setSize] = useState({ width: 0, height: 0 })

    useImperativeHandle(ref, () => ({
      expandAll: () => treeRef.current?.openAll(),
      collapseAll: () => treeRef.current?.closeAll(),
    }))

    useEffect(() => {
      if (!containerRef.current) return
      const ro = new ResizeObserver(([entry]) => {
        const { width, height } = entry.contentRect
        setSize({ width, height })
      })
      ro.observe(containerRef.current)
      return () => ro.disconnect()
    }, [])

    return (
      <div ref={containerRef} className="flex-1 min-h-0 overflow-hidden p-panel-padding">
        {size.width > 0 && (
          <Tree<TreeItem>
            ref={treeRef}
            data={data}
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
)
