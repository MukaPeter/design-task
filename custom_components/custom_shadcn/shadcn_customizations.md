# shadcn/ui — Custom Components

## button.tsx

### What was changed
Added a `nav` size variant to the `buttonVariants` cva config:

```ts
nav: "h-11 w-full px-3 gap-3 justify-start font-normal",
```

### Intent
Sidebar nav items need a button that is full-width, left-aligned, and has a fixed height. The default shadcn Button sizes are centered and not designed for navigation. Adding a variant keeps the change inside the component file (which we own) rather than patching it from outside — which avoids tailwind-merge conflicts with the base `justify-center` class.

---

## resizable.tsx

### What was changed
Inside `ResizableHandle`, replaced the default `ResizablePrimitive.Handle` with two custom child divs:

```tsx
{/* Full-height line */}
<div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-border transition-all duration-150 group-hover:w-0.5 group-hover:bg-primary/60 group-active:bg-primary" />

{/* Grip pill */}
{withHandle && (
  <div className="relative z-10 h-6 w-1 shrink-0 rounded-full bg-border transition-colors duration-150 group-hover:bg-primary/70 group-active:bg-primary" />
)}
```

### Intent
`react-resizable-panels` exposes no hover styling API. The handle needs to be visually discoverable on hover without being noisy at rest. The full-height line subtly thickens and shifts to primary color on hover. The grip pill (shown when `withHandle` is true) also reacts to hover and active states. Since we own `resizable.tsx`, the change lives inside the component — no external overrides needed.
