# Library Notes — Lessons Learned

Real gotchas and patterns discovered while building. Not docs — things the docs don't tell you upfront.

---

## Modified UI Components

Tracking every change made to `src/components/ui/`. These are components installed via shadcn that we deliberately modified.

| Library | Component | Modification | Why |
|---|---|---|---|
| shadcn/ui | `button.tsx` | Added `nav` size variant: `h-11 w-full px-3 gap-3 justify-start font-normal` | Sidebar nav items need a full-width, left-aligned button with fixed height. The default sizes don't fit — adding a variant is cleaner than overriding from outside. |
| react-resizable-panels (via shadcn `resizable`) | `resizable.tsx` | Added two child divs inside `ResizableHandle`: a full-height animated line and a grip pill, both using `group-hover:` for highlight | The library exposes no hover styling API. We own the component so we added the visual directly inside it rather than patching from outside. |

---

## shadcn/ui

**Install components individually:**
```bash
npx shadcn@latest add button card input ...
```

**Components live in your codebase** at `src/components/ui/` — you own the code, you can modify anything directly.

**Tailwind v4 gotcha:** This project uses Tailwind v4. Some community examples are written for v3. The config syntax is different — no `tailwind.config.js`, everything is in `globals.css` using `@theme`.

**Colors use OKLCH** — or you can use hex directly in CSS custom properties:
```css
--primary: #009CFF;  /* hex works fine */
--primary: oklch(0.65 0.19 230);  /* oklch also works */
```

**Pre-installed in this project:**
`avatar, badge, button, card, dialog, dropdown-menu, input, label, resizable, select, separator, sheet, tabs, textarea`

---

## react-resizable-panels (via shadcn `resizable`)

**Install via shadcn:**
```bash
npx shadcn@latest add resizable
```

**Hover highlight on the handle:** The library exposes `data-resize-handle-state` (`idle` / `hover` / `drag`) on the Separator element — but targeting pseudo-elements or children via Tailwind data-attribute selectors is unreliable. Use `group` + `group-hover:` on actual child divs instead:
```tsx
<Separator className="group ...">
  <div className="... group-hover:bg-primary/60" />
</Separator>
```

**Make the handle wider than `w-px`** for a comfortable grab target — `w-2` works well, with the visual line as an absolutely positioned inner div.

**v4 API change:** `direction` prop renamed to `orientation` on `ResizablePanelGroup`. Dev server won't catch this — only shows up in `npm run build` (TypeScript check). Always run a build before pushing to Vercel.

**Panel order swap:** When you change the order of `ResizablePanel` children in React state, they re-render in the new order. The resize positions reset — acceptable for most use cases.

**Key prop warning:** When mapping panels, use `React.Fragment` with a key instead of `<>`:
```tsx
{items.map((id, index) => (
  <React.Fragment key={id}>
    {index > 0 && <ResizableHandle />}
    <ResizablePanel>...</ResizablePanel>
  </React.Fragment>
))}
```

---

## dnd-kit

**Install:**
```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

**SSR hydration error** — dnd-kit generates random accessibility IDs that differ between server and client. Fix: always give `DndContext` a stable `id` prop:
```tsx
<DndContext id="my-dnd-context" onDragEnd={...}>
```

**Drag handle pattern** — scope `useDraggable` listeners to a handle element only, not the whole card. This prevents conflicts with interactive content (React Flow, inputs, etc.) inside the draggable:
```tsx
const { listeners, attributes, setNodeRef } = useDraggable({ id })
// Apply setNodeRef to the card wrapper
// Apply listeners + attributes only to the handle div
```

**Free canvas positioning** — track `{ x, y }` in state per item. On `dragEnd`, add `delta.x` / `delta.y` to the stored position:
```tsx
function handleDragEnd({ active, delta }) {
  setPositions(prev => ({
    ...prev,
    [active.id]: {
      x: prev[active.id].x + delta.x,
      y: prev[active.id].y + delta.y,
    }
  }))
}
```

**Panel swap** — for swapping two items (not a list), use a simple index swap on `dragEnd`. Don't need `@dnd-kit/sortable` for two items:
```tsx
const a = order.indexOf(active.id)
const b = order.indexOf(over.id)
;[next[a], next[b]] = [next[b], next[a]]
```

**Event conflicts with React Flow** — dnd-kit and React Flow both capture pointer events. Use a drag handle scoped to the panel header so React Flow's canvas stays fully interactive.

---

## React Flow (@xyflow/react)

**Install:**
```bash
npm install @xyflow/react
```

**Always import the CSS:**
```tsx
import '@xyflow/react/dist/style.css'
```

**Use controlled state** — always use `useNodesState` and `useEdgesState` hooks. Mixing controlled (`nodes=`) and uncontrolled (`defaultNodes=`) causes subtle bugs with reconnect and other interactions:
```tsx
const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
```

**Edge types:**
- `default` — bezier curves (elastic)
- `step` — right-angle squared connectors
- `smoothstep` — rounded right angles
- `straight` — direct straight lines

Set per edge: `{ ...connection, type: 'step' }` or globally via `defaultEdgeOptions={{ type: 'step' }}`.

**User-drawn connections:**
```tsx
import { addEdge } from '@xyflow/react'

function handleConnect(connection) {
  setEdges(eds => addEdge({ ...connection, type: 'step' }, eds))
}
<ReactFlow onConnect={handleConnect} ... />
```

**Reconnectable edges** — allow users to grab and redirect existing connectors:
```tsx
<ReactFlow
  edgesReconnectable
  reconnectRadius={40}           // increase this — default is too small
  connectionMode={ConnectionMode.Loose}  // snap to node body, not just handle
  onReconnect={(old, newConn) => setEdges(eds => reconnectEdge(old, newConn, eds))}
  onReconnectEnd={(_, edge, __, connectionState) => {
    if (!connectionState.isValid) {
      // dropped on empty space — restore the edge
      setEdges(eds => eds.some(e => e.id === edge.id) ? eds : [...eds, edge])
    }
  }}
/>
```

**`onReconnectEnd` signature:** `(event, edge, handleType, connectionState)` — `connectionState.isValid` is `false` when dropped on empty space.

**Container must have explicit height** — React Flow needs a parent div with a defined height, not just `h-full` from a flex parent. Verify the chain of height declarations goes all the way up.

---

## CSS / Layout Patterns

### Two-layer sidebar (overlay vs. push)

When a component needs to behave differently in layout vs. visually — use two elements:

```tsx
{/* Outer div — owns layout space (what flexbox sees) */}
<div style={{ width: pinned ? EXPANDED_WIDTH : COLLAPSED_WIDTH }}
     className="relative shrink-0 transition-[width]">

  {/* Inner aside — owns visual (can overflow outer) */}
  <aside style={{ width: expanded ? EXPANDED_WIDTH : COLLAPSED_WIDTH }}
         className="absolute inset-y-0 left-0 ...">
    ...
  </aside>
</div>
```

- **Hover (overlay):** outer stays narrow, inner expands beyond it, `z-50` + shadow
- **Pinned (push):** outer expands to full width, inner matches, normal flow

Conflating layout and visual into one element makes overlay-vs-push impossible.

### Z-index should not be binary

Avoid toggling between `z-0` and `z-50`. Use a baseline:

- `z-10` — always above content (default "above" state)
- `z-50` — explicitly floating / overlaying

Dropping to `z-0` during a CSS transition is almost always wrong — the transition takes time and elements can visually cross each other during those milliseconds.

### Transitions expose timing bugs that static states hide

A layout bug that only exists for 200ms still looks broken. When you add a CSS transition, check every state change that happens simultaneously — a z-index drop + a width expansion at the same time will overlap during the transition even if the end states are correct.

### Define JSX nodes and config objects at module level, not inside components

If a value doesn't depend on component state or props, define it **outside** the component. Defining objects or JSX nodes inside a component means they are recreated on every render — which can cause children to remount, reset their state, and cause visual flicker.

```tsx
// ✗ recreated on every render — children remount when parent re-renders
export default function Page() {
  const panels = {
    flow: { node: <FlowPanel /> },  // new element instance every render
  }
}

// ✓ defined once at module level — stable across renders
const PANELS = {
  flow: { node: <FlowPanel /> },
}
export default function Page() { ... }
```

Same applies to config objects passed as props:
```tsx
// ✗ new object reference every render
<Sidebar user={{ name: 'MP', role: 'Designer' }} />

// ✓ stable reference
const USER = { name: 'MP', role: 'Designer' }
<Sidebar user={USER} />
```

### `min-h-0` — the flex height chain fix

When using `flex-1` to fill remaining space in a flex column, the element won't shrink below its content size unless you add `min-h-0`. This breaks overflow and causes layout blowout.

```tsx
// ✗ content overflows — flex item won't shrink
<div className="flex-1 overflow-hidden">...</div>

// ✓ correct — min-h-0 allows it to shrink
<div className="flex-1 min-h-0 overflow-hidden">...</div>
```

Apply `min-h-0` to every element in the chain: the TabsContent, the inner wrapper, and any intermediate divs. One missing link breaks the whole chain.

### Fixed height on nav items prevents jumping

When toggling label visibility in a sidebar, always keep the label in the DOM — hide it with `opacity-0` instead of conditional rendering. Pair with a fixed height (`h-9`) on the button:

```tsx
// ✗ causes height jump — element mounts/unmounts
{expanded && <span>{label}</span>}

// ✓ stable — always in DOM, just fades
<span className={expanded ? 'opacity-100' : 'opacity-0'}>{label}</span>
```

---

## Building Complex Components — Process Lessons

Hard-won lessons from building the sidebar with collapsed / hover / pinned states.

### Work with the component, not against it

Use the system's existing scale — Tailwind spacing, the component's variants, design tokens.
Don't reach for arbitrary values when standard ones exist and mean the same thing.

```tsx
// ✗ arbitrary overrides — accumulate and become unmaintainable
nav: "h-[44px] w-full px-[13px] gap-3"

// ✓ standard scale — works with the system
nav: "h-11 w-full px-3 gap-3"   // h-11 = 44px, px-3 = 12px
```

Overrides signal that you're fighting the component. Stop and ask: is there a standard value that works? Is there a variant I should add instead of patching from outside?

### Build one state at a time

Build collapsed → confirm → commit. Then hover → confirm → commit. Then pinned.
Building all three simultaneously means every change breaks two other states. You lose track of what broke what.

### Agree on the numbers before touching code

Write down the exact sizes before writing a single class:
- Sidebar collapsed width: 60px
- Nav padding: 8px → button width = 60 - 8 - 8 = 44px
- Icon: 16px → centered padding = (44 - 16) / 2 = 14px
- Sidebar expanded width: 240px → button width = 240 - 8 - 8 = 224px

Only then write the code. Guessing sizes and adjusting by eye creates an endless loop.

### Smallest possible edit, one thing at a time

When something looks wrong, change one value, check it, then continue.
Never switch approaches mid-session without fully understanding why the current one failed.

### Own the component — don't fight it from outside

When a shadcn component's defaults conflict with your needs, add a variant to it.
You own the code in `src/components/ui/`. Edit it directly instead of trying to override from className.

```tsx
// ✗ fighting the component from outside
<Button className="h-[44px] justify-start px-[13px]">

// ✓ own it — add a nav size variant to button.tsx
size: {
  nav: "h-[44px] w-full px-[13px] gap-3 justify-start font-normal",
}
// then use it cleanly
<Button size="nav" variant="ghost">
```

### Use the right HTML element for the job

The shadcn `Button` component is for standalone actions (submit, cancel, confirm).
For sidebar nav items, use a plain `<button>` or the `Button` component with a custom `nav` size variant — not the default size which has conflicting padding and height.

### Label visibility in collapsed sidebars — use overflow-hidden, not opacity

`opacity-0` hides text visually but the element still takes up space and can bleed into the collapsed sidebar boundary. The cleaner approach: put `overflow-hidden` on the button itself. As the sidebar animates from 240→60px, the button shrinks with it and clips the label naturally — no opacity tricks needed.
