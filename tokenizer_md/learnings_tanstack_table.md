---
name: learnings-tanstack-table
description: "TanStack Table (@tanstack/react-table) — how we use it in Tokenizer, patterns, gotchas"
metadata: 
  node_type: memory
  type: learning
  originSessionId: 01988dce-bc45-4703-b577-829bd625ca86
---

# TanStack Table in Tokenizer

Package: `@tanstack/react-table`
Docs: https://tanstack.com/table/latest

---

## How we use it

We use TanStack Table for **column sizing and resize only**. We do not use its row model, sorting, filtering, or grouping features. Rows are rendered manually from our own `gridRows` array.

This is intentional — our grid has heterogeneous rows (token rows + spacer/title rows) that don't fit a uniform row model.

---

## Setup pattern

```ts
type ColData = Record<string, string>
const columnHelper = createColumnHelper<ColData>()

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
  data: [],           // empty — we render rows manually
  columns,
  getCoreRowModel: getCoreRowModel(),
  columnResizeMode: 'onChange',
  enableColumnResizing: true,
})
```

`data: []` because we don't use TanStack's row model.

---

## Getting column widths and resize handlers

```ts
const headers = table.getHeaderGroups()[0]?.headers ?? []

// In the header div:
headers.map(header => (
  <div style={{ width: header.getSize() }}>
    {String(header.column.columnDef.header ?? '')}
    {header.column.getCanResize() && (
      <div onMouseDown={header.getResizeHandler()} />
    )}
  </div>
))

// In body rows — get widths by index:
const colWidths = headers.map(h => h.getSize())
// colWidths[0] = name column width
// colWidths[1] = mode1 column width
```

---

## Adding a new mode column

Add one entry to the `columns` array:

```ts
columnHelper.accessor('mode2', {
  header: 'Mode 2',
  size: 220,
  minSize: 120,
  maxSize: 600,
}),
```

It appears automatically in the header and body — both read from `headers`.

---

## Rendering approach

All rows are `<div>` elements with `display: flex`. No `<table>`, `<thead>`, `<tr>`, or `<td>`.

This is why sticky works — `position: sticky; top: 0` on a `<div>` + `border-bottom` on a `<div>` is standard CSS, no browser table quirks.

---

## Actions column

The actions column (open detail button, width 32) is NOT a TanStack column. It's a fixed-width div appended to every row. This keeps it simple — no resizing needed, no header label needed.

---

## Hover state

Cannot use Tailwind `group` / `group-hover` on div rows in this file (Tailwind v4 scanning issue). Use `onMouseEnter` / `onMouseLeave` + a `hoveredRow` state string instead.

```ts
const [hoveredRow, setHoveredRow] = useState<string | null>(null)
// ...
onMouseEnter={() => setHoveredRow(row.id)}
onMouseLeave={() => setHoveredRow(null)}
// backgroundColor: isHovered ? 'var(--tok-gray-50)' : 'transparent'
```

---

## Border constant

```ts
const BORDER = '1px solid var(--tok-gray-200)'
```

Used for all grid borders (header bottom, column separators, row dividers). Do not use Tailwind `border-*` classes for layout-critical borders in this file.
