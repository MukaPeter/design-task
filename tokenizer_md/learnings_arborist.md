# react-arborist — Learnings

## Install

```bash
npm install react-arborist
```

Version used: 3.8.0

---

## Basic setup

Three things required: data, dimensions, and a node renderer.

```tsx
import { Tree } from 'react-arborist'
import type { NodeRendererProps } from 'react-arborist'

interface TreeItem {
  id: string
  name: string
  children?: TreeItem[]
}

function Node({ node, style, dragHandle }: NodeRendererProps<TreeItem>) {
  return (
    <div style={style} ref={dragHandle} onClick={() => node.toggle()}>
      {node.data.name}
    </div>
  )
}

<Tree<TreeItem> data={data} width={300} height={600} rowHeight={36}>
  {Node}
</Tree>
```

---

## Dynamic sizing — ResizeObserver pattern

The Tree requires explicit `width` and `height` — it does not auto-size. Use a ResizeObserver to measure the container and pass the dimensions:

```tsx
function CollectionsTree() {
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
        <Tree<TreeItem> data={data} width={size.width} height={size.height} rowHeight={36}>
          {Node}
        </Tree>
      )}
    </div>
  )
}
```

Guard with `size.width > 0` so Tree doesn't render before the container is measured.

---

## rowHeight and the gap mechanic

`rowHeight` is a fixed number — not calculated from content. It controls:
1. The height of each row slot (absolute positioning: `top: index * rowHeight`)
2. The visual gap between row backgrounds

The visible background height is driven by content + padding on the node div. The gap between adjacent backgrounds is:

```
gap = rowHeight − (content height + vertical padding)
```

To eliminate the gap entirely, add `h-full` to the node div so the background fills the full slot.

---

## Node renderer — key props

| Prop | Type | What it is |
|---|---|---|
| `style` | `React.CSSProperties` | Position + size from arborist — always apply to outer div |
| `node` | `NodeApi<T>` | The node instance — access data, state, methods |
| `dragHandle` | `ref` | Apply to the draggable element |

Key `node` properties and methods:

```tsx
node.data        // your data object
node.isSelected  // boolean
node.isOpen      // boolean (for folders)
node.isLeaf      // boolean (no children)
node.toggle()    // open/close
node.select()    // select this node
```

---

## Indent

`indent` prop sets the pixel offset per nesting level. Default is 24. Set to 16 for a tighter look:

```tsx
<Tree indent={16} ...>
```

---

## Key behaviour props

| Prop | Default | What it does |
|---|---|---|
| `openByDefault` | `false` | All nodes open on load |
| `disableDrag` | `false` | Turn off drag-to-reorder |
| `disableDrop` | `false` | Turn off drop targets |
| `disableMultiSelection` | `false` | Single select only |
| `searchTerm` | — | Filter nodes by string |
| `onSelect` | — | Callback when node selected |
| `onMove` | — | Callback when node dragged to new position |

---

## Visual styling

There are no built-in variants. All visual appearance is controlled by the node renderer. Common pattern:

```tsx
<div
  style={style}
  ref={dragHandle}
  onClick={() => node.toggle()}
  className={`flex items-center gap-1 rounded-md px-2 py-1.5 cursor-pointer text-xs
    hover:bg-[#F5F5F5]
    ${node.isSelected ? 'bg-primary/10 font-semibold' : ''}
    ${node.isLeaf ? '' : ''}`}
>
  <ChevronRight
    size={14}
    className={`shrink-0 text-muted-foreground transition-transform duration-150
      ${node.isOpen ? 'rotate-90' : ''}
      ${node.isLeaf ? 'invisible' : ''}`}
  />
  <span className="truncate">{node.data.name}</span>
</div>
```
