# Project State

Last updated: 2026-05-31

This document captures the current state of the project so any new session can pick up exactly where we left off.

---

## What this project is

A rapid UI prototyping environment built for a Head of Design interview at Ketryx. The goal is to build fast, polished UI prototypes using a consistent component stack.

**Location:** `/Users/mukapeter/Desktop/design-task`
**Repo:** https://github.com/MukaPeter/design-task
**Deployed:** https://design-task-flax-gamma.vercel.app/demo2
**Local:** `npm run dev` → http://localhost:3000

**Deploying:**
- Push to `main` → Vercel auto-deploys
- Always run `npm run build` before pushing — TypeScript errors only surface in the production build, not the dev server (Turbopack is more lenient)

---

## Stack

| Layer | Library | Version |
|---|---|---|
| Framework | Next.js (App Router) | 16 |
| UI components | shadcn/ui + Tailwind v4 | — |
| Drag and drop | @dnd-kit/core | — |
| Resizable panels | react-resizable-panels | v4 |
| Flow/canvas | @xyflow/react | — |
| Tree list | react-arborist | 3.8.0 |
| Table | shadcn/ui Table | — |

---

## Pages

### `/demo`
Two-panel layout. Reference build — do not modify.

- Sidebar (3-state: collapsed 60px / hover overlay / pinned 240px)
- DndContext wrapping two resizable panels with drag-to-swap
- Panel component: Card + Tabs + drag handle (GripVertical in header)

---

### `/demo2`
Single panel with an inner resizable split. Token management UI prototype.

**Layout:**
```
Sidebar | Panel (Tab A / Tab B)
          └─ Tab A: [Collections (23%) | Handle | Grid panel (77%) | Handle | Detail panel (conditional)]
          └─ Tab B: placeholder
```

---

### `/cia` ← active work
Change Impact Analysis page. Fully built prototype.

**Layout:**
```
Sidebar | Ketryx Agent (15%) | Handle | Change Impact Graph (~85%) | Handle | Detail panel (conditional)
```

**Sidebar nav:**
- Traceability Matrix (`Table2` icon)
- Impact Analysis Graph (`Timeline` icon)

---

#### Ketryx Agent panel
- 15% default width, 12% min
- Pre-populated chat: Peter's request + Ketryx Agent response
- Chat bubbles: Peter = blue (bg-primary), Ketryx Agent = gray (bg-gray-100)
- Sender names shown inside bubble (Peter / Ketryx Agent)
- Artifact IDs in agent messages (REQ-xxx, RISK-xxx, etc.) are blue underlined links — clicking opens the detail panel for that node
- `text-xs leading-relaxed` for bubble text
- Both panels have GripVertical drag handles — drag to swap positions

---

#### Change Impact Graph panel
- xyflow canvas, `smoothstep` edges
- `defaultViewport={{ x: 80, y: 80, zoom: 0.9 }}` (no fitView)
- Two custom node types:
  - `primary` — black border, confirmed impacted artifacts
  - `secondary` — gray border, agent-suggested "check these" items
- Both node types show: label (text-sm semibold) + sublabel + confidence score (colored by band)
- Hover state: blue border + `bg-primary/10` background
- Selected state: 3px blue border, white background
- Status dot (top-right, inline): green = up-to-date, amber = needs-review, red = stale (primary nodes only)
- Confidence score color bands: ≥85% = muted (not a focus), 60–84% = amber-600, <60% = red-500
- Primary edges: black with arrowheads
- Secondary edges: gray dashed + animated
- Clicking a node opens the detail panel (same node click again = closes)
- Closing detail panel deselects the node in xyflow

**CIA scenario: REQ-142 — Infusion Rate Limit Enforcement change**
- 12 primary nodes + 4 secondary nodes
- Flows left to right: upstream reqs → REQ-142 → hazard / risk controls / design spec → tests → SOP → regulatory clauses
- Secondary nodes: SPEC-HW-105, TEST-V-210, UI-SPEC-088, DOC-DHF-024

---

#### Detail panel (conditional, always adjacent to flow panel)
- Appears when a graph node is clicked
- Always renders immediately next to the flow panel regardless of drag order
- Header: node label + artifact type + X close button
- Two tabs (shadcn Tabs):
  - **Details** — status badge + type-specific artifact fields
  - **Agent Reasoning** — tools used (with blue artifact links), reasoning text, confidence explanation, ruled-out items
- Status badge colors: green (up-to-date), amber (needs-review), red (stale)

---

#### Panel drag-to-swap
- Both Ketryx Agent and Change Impact Graph panels have GripVertical drag handles
- DndContext wraps the group — dragging swaps the two main panels
- Detail panel always stays adjacent to the flow panel (never between chat and flow)

---

## Data architecture (`flow.tsx`)

All CIA data lives in `flow.tsx` and is exported:

- `DEFAULT_NODES` — 16 nodes with full mock data per node type (status, confidence, artifact fields)
- `DEFAULT_EDGES` — 17 edges (primary black + secondary dashed)
- `NODE_REASONING` — per-node agent reasoning: tools used (call + resultText + links[]), reasoning text, confidence explanation, ruled-out items
- `NODE_TYPES` — `{ primary: PrimaryNode, secondary: SecondaryNode }`

---

## Component customisations

| Component | File | What changed |
|---|---|---|
| Button | `ui/button.tsx` | Added `nav` size variant (`text-sm`, full-width, left-aligned) |
| ResizableHandle | `ui/resizable.tsx` | Added hover highlight — line + grip pill |
| Panel | `components/panel.tsx` | Custom: Card + Tabs + dnd-kit drag handle. `gap-0` on Tabs |
| Sidebar | `components/sidebar.tsx` | Custom: 3-state, two-layer pattern, ghost hover → `#F5F5F5` |
| Chat | `components/chat.tsx` | Added `theirName`, `myName`, `onArtifactClick`; artifact ID linkification; sender name in bubble |
| Flow | `components/flow.tsx` | Full CIA scenario data, custom node types, confidence colors, status dots, `onNodeClick`, `selectedNodeId` sync |

---

## Typography

| Element | Size | Token |
|---|---|---|
| Sidebar nav items | 14px | `text-sm` |
| Tab labels | 12px | `text-xs` |
| Tree list rows | 12px | `text-xs` |
| Panel headers | 14px | `text-sm font-semibold` |
| Graph node label | 14px | `text-sm font-semibold` |
| Graph node sublabel + confidence | 12px | `text-xs` |
| Chat bubbles | 12px | `text-xs leading-relaxed` |
| Detail panel fields | 12px | `text-xs` |

---

## Colors (non-theme / hardcoded)

| Use | Value | Where |
|---|---|---|
| Hover on sidebar inactive items | `#F5F5F5` | `sidebar.tsx` |
| Hover on tree rows | `#F5F5F5` | `demo2/page.tsx` TreeNode |
| Selected tree row background | `bg-primary/10` | `demo2/page.tsx` TreeNode |
| Ketryx Agent chat bubble | `bg-gray-100` | `chat.tsx` |
| Confidence high (≥85%) | `text-muted-foreground` | `flow.tsx` |
| Confidence medium (60–84%) | `text-amber-600` | `flow.tsx` |
| Confidence low (<60%) | `text-red-500` | `flow.tsx` |

---

## Key files

```
src/
  app/
    demo/page.tsx         ← two-panel reference (do not modify)
    demo2/page.tsx        ← token management UI
    cia/page.tsx          ← change impact analysis (active)
  components/
    sidebar.tsx           ← 3-state sidebar (isolated, stable)
    panel.tsx             ← tabs + drag handle card
    chat.tsx              ← chat UI component (modified)
    flow.tsx              ← xyflow canvas + full CIA data (modified)
    ui/
      button.tsx          ← modified: nav variant
      resizable.tsx       ← modified: hover highlight

mds/                      ← learnings per library
custom_components/        ← modified + custom components with docs
CLAUDE.md                 ← working rules for Claude
PROJECT_STATE.md          ← this file
```

---

## What's next (cia page)

- Add "Re-analyse" button to the Agent Reasoning tab
- Consider highlighting graph nodes from chat interaction (e.g. agent response mentions a node → it glows)
- Consider a legend for node types / status dots / confidence bands
- Push to Vercel when ready
