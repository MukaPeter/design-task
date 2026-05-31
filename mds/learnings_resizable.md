# react-resizable-panels — Learnings

## Install (via shadcn)

```bash
npx shadcn@latest add resizable
```

---

## v4 API change

`direction` prop renamed to `orientation` on `ResizablePanelGroup`:

```tsx
// ✗ v3 — breaks in v4
<ResizablePanelGroup direction="horizontal">

// ✓ v4
<ResizablePanelGroup orientation="horizontal">
```

The dev server won't catch this — only shows up in `npm run build`. Always run a build before pushing to Vercel.

---

## Hover highlight on handle

The library exposes no hover styling API. Since you own `resizable.tsx`, add the visual directly inside the component — two child divs using `group-hover:`:

```tsx
<Separator className="group ...">
  {/* Full-height line */}
  <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-border transition-all duration-150 group-hover:w-0.5 group-hover:bg-primary/60 group-active:bg-primary" />
  {/* Grip pill */}
  <div className="relative z-10 h-6 w-1 shrink-0 rounded-full bg-border transition-colors duration-150 group-hover:bg-primary/70 group-active:bg-primary" />
</Separator>
```

---

## Panel order swap

When changing the order of `ResizablePanel` children in React state, give each panel a stable `id` prop so the library can track sizes correctly:

```tsx
<ResizablePanel id={id} defaultSize={50} minSize={20}>
```

Without `id`, the library loses track of panel sizes on re-order and throws `addListener` errors.

---

## Key prop on mapped panels

Use `React.Fragment` with a key, not `<>`:

```tsx
{items.map((id, index) => (
  <React.Fragment key={id}>
    {index > 0 && <ResizableHandle withHandle />}
    <ResizablePanel id={id} defaultSize={50} minSize={20}>
      ...
    </ResizablePanel>
  </React.Fragment>
))}
```

---

## Modified components (library-level)

See `custom_components/custom_shadcn/resizable.tsx` — added hover highlight inside `ResizableHandle`.
