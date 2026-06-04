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

**Separate table implementations for grid vs. detail panel** — the token grid and detail panel section tables share the shadcn `Table` component but need different behaviour. Don't try to make one `Table` do both:

| Concern | Token grid | Section tables (`SectionTable`, `Aliases`) |
|---|---|---|
| Row dividers | `border-b` on `TableRow` | `[&_tr]:border-0` override |
| Border collapse | Default (`collapse`) | `.tok-table` class (`separate`) |
| Corner radius | Not applied | `.tok-row-hover` on `td:first/last-child` |

Apply `.tok-table` and `[&_tr]:border-0` only to the detail panel tables — not the base `Table` component.

**`--accent` token** — shadcn's `hover:bg-accent` drives ghost button hover AND dropdown item hover. In this project `--accent` is remapped to `--tok-gray-100` (pure gray) in `globals.css`. If hover states look blue/dirty, check `--accent` first.

**`group-hover` only works with shadcn `TableRow`** — plain HTML `<tr>` does not trigger `group-hover`. If you need a hover-reveal button inside a table, you must use the shadcn `TableRow` component. This is because `TableRow` renders a `<tr>` with Tailwind's `group` support baked in correctly.

**Excluding header rows from hover** — add `[thead_&]:hover:bg-transparent` to `TableRow`'s base className. This removes the hover background for rows inside `<thead>` without affecting body rows:

```tsx
// in table.tsx
"border-b transition-colors hover:bg-[#F9F9F9] [thead_&]:hover:bg-transparent ..."
```

**`DropdownMenuTrigger` — never use `asChild` with a `<span>`** — the `asChild` prop leaks to the DOM element causing a React warning. Apply `className` directly to `DropdownMenuTrigger` instead — it renders a `<button>` by default which is fine as long as it's not nested inside another `<button>`:

```tsx
// ✅ correct
<DropdownMenuTrigger className="flex items-center gap-1 text-xs ...">
  {value}<ChevronDown size={10} />
</DropdownMenuTrigger>

// ❌ wrong — asChild leaks to DOM
<DropdownMenuTrigger asChild>
  <span role="button">...</span>
</DropdownMenuTrigger>
```

---

## DropdownMenu — content width

**This project uses `@base-ui/react/menu`**, not Radix. The `DropdownMenuContent` Popup class includes `w-(--anchor-width)` which forces the menu to match the trigger's width exactly. This causes clipping when menu items are longer than the trigger (e.g. "Scale / ratio" in a narrow trigger).

**Fix** — in `ui/dropdown-menu.tsx`, change `w-(--anchor-width)` to `min-w-(--anchor-width)` so the menu is *at least* as wide as the trigger but can grow to fit content:

```tsx
// ui/dropdown-menu.tsx — MenuPrimitive.Popup className
// ❌ locks to trigger width
"w-(--anchor-width) min-w-32 ..."

// ✅ can grow wider than trigger
"min-w-(--anchor-width) min-w-32 ..."
```

After this fix, do not set explicit `min-w-[Xpx]` on individual `DropdownMenuContent` instances — let the component handle it. Only add `min-w-[Xpx]` if you need a specific minimum for that dropdown.

**`--anchor-width`** is a CSS custom property set by base-ui's `Positioner` component at render time. It equals the trigger's rendered width. You cannot override it from outside — you must fix it in the component.

---

## Accordion

Installed via `npx shadcn@latest add accordion`. Uses `@base-ui/react/accordion` under the hood.

**Turbopack parse error** — using `AccordionPrimitive.Header` / `AccordionPrimitive.Trigger` directly alongside the shadcn wrapper components causes a JSX parse error in Turbopack (`Unterminated regexp literal`). Root cause unclear — likely a conflict between the shadcn wrapper and direct primitive usage.

**Workaround** — use a plain `useState` + `ChevronDown` collapsible instead. Simpler, no dependency issues:

```tsx
const [open, setOpen] = useState(true)

<div>
  <button
    className="flex items-center gap-2 text-xs font-semibold"
    onClick={() => setOpen(o => !o)}
  >
    <ChevronDown size={12} className={`transition-transform ${open ? '' : '-rotate-90'}`} />
    Section title
  </button>
  {open && <div className="pl-[12px]">...content...</div>}
</div>
```

Indent content by `chevron width (12px) + gap (8px) - table's own padding (px-2 = 8px) = 12px` to align with the title text.

---

## Modified components (library-level)

See `custom_components/custom_shadcn/` for modified versions.

| Component | Modification | Why |
|---|---|---|
| `button.tsx` | Added `nav` size variant | Sidebar nav items need full-width, left-aligned, fixed-height button |
