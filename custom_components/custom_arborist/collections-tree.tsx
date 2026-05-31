'use client'

import { useRef, useEffect, useState } from 'react'
import { Tree } from 'react-arborist'
import type { NodeRendererProps } from 'react-arborist'
import { ChevronRight } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TreeItem {
  id: string
  name: string
  children?: TreeItem[]
}

// ─── Node renderer ────────────────────────────────────────────────────────────

function TreeNode({ node, style, dragHandle }: NodeRendererProps<TreeItem>) {
  return (
    <div
      style={style}
      ref={dragHandle}
      onClick={() => node.toggle()}
      className={`flex items-center gap-1 rounded-md px-2 py-1.5 cursor-pointer select-none text-xs hover:bg-[#F5F5F5] ${node.isSelected ? 'bg-primary/10' : ''}`}
    >
      <ChevronRight
        size={14}
        className={`shrink-0 text-muted-foreground transition-transform duration-150 ${node.isOpen ? 'rotate-90' : ''} ${node.isLeaf ? 'invisible' : ''}`}
      />
      <span className={`truncate ${node.isSelected ? 'font-semibold' : ''}`}>
        {node.data.name}
      </span>
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export interface CollectionsTreeProps {
  data: TreeItem[]
  rowHeight?: number
  indent?: number
  openByDefault?: boolean
}

export function CollectionsTree({
  data,
  rowHeight = 36,
  indent = 16,
  openByDefault = true,
}: CollectionsTreeProps) {
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
          rowHeight={rowHeight}
          indent={indent}
          openByDefault={openByDefault}
        >
          {TreeNode}
        </Tree>
      )}
    </div>
  )
}
