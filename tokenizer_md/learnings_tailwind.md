# Tailwind CSS — Learnings

## Version

This stack uses **Tailwind v4**. No `tailwind.config.js` — all configuration lives in `globals.css` using `@theme`:

```css
@theme {
  --primary: #009CFF;
  --primary-foreground: #ffffff;
  --radius: 0.5rem;
}
```

Colors use OKLCH or hex directly. No config file to edit.

---

## min-h-0 — the flex height gotcha

Flex children default to `min-height: auto`, which prevents them from shrinking below their content. Add `min-h-0` to any flex child that should scroll or clip:

```tsx
<div className="flex flex-col h-full">
  <div className="shrink-0">Header</div>
  <div className="flex-1 min-h-0 overflow-auto">Scrollable content</div>
</div>
```

Without `min-h-0`, the scrollable area will overflow its container instead of scrolling.

---

## h-full chains

`h-full` only works when every ancestor up the DOM tree has an explicit height or is a flex child filling space. Debug by walking up the tree — the chain must be unbroken from `<html>` down.

Common pattern for full-screen layouts:

```css
html, body → h-full
#root / layout wrapper → h-full or h-screen
flex children → flex-1 min-h-0
```

---

## group / group-hover

Use `group` on a parent and `group-hover:` on children to style children based on parent hover:

```tsx
<div className="group">
  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
    Shows on parent hover
  </div>
</div>
```

Named groups for nested hover: `group/handle`, `group-hover/handle:`.

---

## transition shorthand

`transition-all` transitions every property. Prefer specific transitions for performance:

```
transition-colors      → color, background-color, border-color
transition-[width]     → only width (custom property in brackets)
transition-[width,box-shadow]  → multiple specific properties
```

---

## Arbitrary values

Use square brackets for one-off values not in the design scale:

```
w-[240px]   h-[13px]   px-[13px]   bg-[#009CFF]
```

Fine to use when a specific number is required. Don't use them to override a component's default structure — add a variant instead.

---

## z-index stacking

Common values to keep consistent:

| Use case | z value |
|---|---|
| Sidebar overlay (hover) | `z-50` |
| Pinned sidebar | `z-10` |
| Dropdowns / tooltips | `z-50` |
| Modals | `z-100` |

Set explicitly — don't rely on DOM order for stacking.

---

## justify-center override in button

shadcn Button base class includes `justify-center`. When adding a `justify-start` size variant, `tailwind-merge` may not reliably override it. If needed:

```
!justify-start
```

Test before shipping. Adding `justify-start` directly to the size variant string usually works, but verify.
