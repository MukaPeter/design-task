# shadcn/ui — Learnings

## Install

```bash
npx shadcn@latest add button card input ...
```

Components live in `src/components/ui/` — you own the code, modify directly.

---

## Component selection rules

Follow this order strictly:

1. Select the right component — does it fit the use case out of the box?
2. Use it as-is — standard props, standard variants, standard sizes
3. Arbitrary values — only when a specific number is required (e.g. `px-[13px]`). Fine to use.
4. Override component structure or behaviour — requires explicit alignment before touching. Never unilaterally.

When a component's defaults conflict with your needs, add a variant to it (you own the file). Don't patch from outside.

---

## Tailwind v4

This stack uses Tailwind v4. No `tailwind.config.js` — everything is in `globals.css` using `@theme`. Colors use OKLCH or hex directly:

```css
--primary: #009CFF;
--primary-foreground: #ffffff;
```

---

## Button

**Custom nav size** — for sidebar nav items, add a `nav` size variant directly in `button.tsx`:

```tsx
nav: "h-11 w-full px-3 gap-3 justify-start font-normal",
```

Use `variant="default"` for active, `variant="ghost"` for inactive. Do not use the default Button for nav items without a custom size — the default height and padding will conflict.

**`justify-center` in base class** — the base Button has `justify-center`. If you add a `justify-start` size variant, tailwind-merge may not reliably override it. Test carefully, and if needed use `!justify-start`.

---

## Tabs

**@base-ui/react** — shadcn Tabs uses `@base-ui/react/tabs`, not Radix. Behaviour is similar but the internals differ.

**`TabsContent` height** — `TabsContent` has `flex-1` but needs `min-h-0 overflow-hidden` via `className` to fill height correctly in a flex column:

```tsx
<TabsContent className="min-h-0 overflow-hidden" value="tab">
```

**`gap-2` on Tabs root** — the Tabs root adds `gap-2` between TabsList and TabsContent. Account for this in height calculations.

**Variants** — `variant="default"` gives a muted background with active tab as a raised button. `variant="line"` gives a transparent background with an underline indicator.

---

## Card

**Default padding** — Card has `py-4` and `gap-4`. Remove with `className="p-0 gap-0"` when the card should fill a container edge-to-edge.

**Edge-to-edge** — also remove `rounded-xl` and `ring-1` via `className="rounded-none ring-0"`.

---

## Table

**Fixed column widths** — use `table-fixed` on `<Table>` and set widths via inline `style` on `<TableHead>`. Tailwind width classes (`w-[20%]`) work for static widths but inline styles are required for dynamic/resizable columns:

```tsx
<Table className="table-fixed">
  <TableHead style={{ width: 160 }}>Name</TableHead>
```

**Vertical dividers** — no built-in prop. Add `border-r` to `TableHead` and `TableCell`:

```tsx
<TableHead className="border-r">Name</TableHead>
<TableCell className="border-r">{value}</TableCell>
```

Uses the same `border` color token as horizontal row dividers.

**Truncate in fixed-width columns** — with `table-fixed`, long content overflows. Add `truncate` to `TableCell` or wrap content in `<span className="truncate block">`:

```tsx
<TableCell className="truncate">{row.name}</TableCell>
```

**Row selection highlight** — use `data-state="selected"` on `TableRow`. The base styles already handle `data-[state=selected]:bg-muted`:

```tsx
<TableRow data-state={isSelected ? 'selected' : undefined}>
```

**Hover-reveal button** — add `group` to `TableRow`, `opacity-0 group-hover:opacity-100` to the button:

```tsx
<TableRow className="group">
  <TableCell>
    <button className="opacity-0 group-hover:opacity-100 transition-colors">
      <Icon />
    </button>
  </TableCell>
```

**Click-to-edit cell (inline edit)** — replace cell content with a borderless Input on click. Use `h-auto border-none shadow-none p-0 bg-transparent focus-visible:ring-0` to make the input invisible — no layout shift:

```tsx
<TableCell onClick={() => setEditing(row.id)}>
  {editing === row.id ? (
    <Input
      autoFocus
      value={value}
      onChange={...}
      onBlur={() => setEditing(null)}
      onKeyDown={e => e.key === 'Enter' && setEditing(null)}
      className="h-auto border-none shadow-none p-0 text-xs bg-transparent focus-visible:ring-0 w-full"
    />
  ) : value}
</TableCell>
```

**No built-in column resizing** — must be custom. See pattern below.

---

## Custom column resize pattern

For resizable columns on a fixed-layout table. Uses `useRef` for drag state (not `useState`) to avoid re-renders during drag:

```tsx
const [colWidths, setColWidths] = useState({ col1: 160, col2: 220 })
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
```

Add a resize handle at the right edge of each `TableHead`:

```tsx
<TableHead style={{ width: colWidths.col1 }} className="relative select-none">
  Label
  <div
    className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-primary/40"
    onMouseDown={(e) => startResize('col1', e)}
  />
</TableHead>
```

Key points:
- `Math.max(60, ...)` sets a minimum column width
- `select-none` on `TableHead` prevents text selection during drag
- `window` listeners (not element listeners) ensure drag works even if cursor moves fast

---

## Modified components (library-level)

See `custom_components/custom_shadcn/` for modified versions.

| Component | Modification | Why |
|---|---|---|
| `button.tsx` | Added `nav` size variant | Sidebar nav items need full-width, left-aligned, fixed-height button |
