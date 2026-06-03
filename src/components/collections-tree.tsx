'use client'

import { useRef, useEffect, useState } from 'react'
import { Tree } from 'react-arborist'
import type { NodeRendererProps, NodeApi } from 'react-arborist'
import { ChevronRight } from 'lucide-react'

export interface TreeItem {
  id: string
  name: string
  children?: TreeItem[]
}

export const TREE_DATA: TreeItem[] = [
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
  data?: TreeItem[]
  onSelect?: (path: string[]) => void
}

export function CollectionsTree({ data = TREE_DATA, onSelect }: CollectionsTreeProps) {
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
