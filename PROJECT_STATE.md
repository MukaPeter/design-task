# Project State

Last updated: 2026-06-01

This document captures the current state of the project so any new session can pick up exactly where we left off.

---

## What this project is

A rapid UI prototyping environment built for a Head of Design interview at Ketryx. The goal is to build fast, polished UI prototypes using a consistent component stack.

**Location:** `/Users/mukapeter/Desktop/design-task`
**Repo:** https://github.com/MukaPeter/design-task
**Deployed:** https://design-task-flax-gamma.vercel.app/cia
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

### `/traceability`
Traceability Matrix page. Entry point — links into the CIA drill-down.

**Layout:**
```
Sidebar | Ketryx Agent (18%) | Handle | Matrix panel (82%)
```

**Sidebar nav:** active item = Traceability Matrix. Clicking Impact Analysis Graph navigates to `/cia`.

**Matrix:**
- Rows: 8 requirements (REQ-142 + 2 real upstream + 5 static extras)
- Columns: all non-requirement nodes from `DEFAULT_NODES` (artifacts)
- Cells: colored dot where a traceability link exists (green/amber/red by artifact status)
- Only REQ-142 row is clickable → navigates to `/cia`
- Other rows are `opacity-60`, not clickable
- Clicking a dot navigates to `/cia?node=<nodeId>` (pre-selects that node + opens detail panel)
- Sticky first column with group-hover background sync
- Plain `<table>` (not shadcn Table) with `minWidth` computed from artifact count — needed for horizontal scroll
- Matrix panel uses `style={{ overflow: 'auto' }}` on ResizablePanel — required because react-resizable-panels sets `overflow: hidden` by default
- 5 extra static requirements (REQ-031, REQ-058, REQ-110, REQ-175, REQ-220) defined locally in the page, not in `flow.tsx`

**Chat:** pre-populated agent message explaining the matrix and prompting drill-down on red rows.

---

### `/cia` ← active work
Change Impact Analysis page. Fully built prototype.

**Layout:**
```
Sidebar | Ketryx Agent (15%) | Handle | Change Impact Graph (~85%) | Handle | Detail panel (conditional)
```

**Sidebar nav:**
- Traceability Matrix (`Table2` icon) → navigates to `/traceability`
- Impact Analysis Graph (`Timeline` icon) → active on this page

**Navigation:** `useSearchParams` reads `?node=<id>` on mount and pre-selects that node. Wrapped in `<Suspense>` (required by Next.js for `useSearchParams`).

---

#### Ketryx Agent panel
- 15% default width, 12% min
- Chat conversation starts with Peter referencing PR #847 (KTX-2047) triggering the analysis
- Agent response references PR #847 and KTX-2047 as clickable links, plus artifact ID links
- `PR #\d+` and `KTX-\d+` patterns linkified in chat via `LINK_RE` in `chat.tsx`
- Agent message broken into paragraphs via `\n\n`
- Both panels have GripVertical drag handles — drag to swap positions

---

#### Change Impact Graph panel
- Two tabs: **Graph** and **Triage**
- Tab list uses `bg-gray-100`
- **Graph tab:** xyflow canvas, `smoothstep` edges
  - REQ-142 is the root node — no upstream nodes. Everything flows downstream.
  - `defaultViewport={{ x: 80, y: 80, zoom: 0.9 }}` (no fitView)
  - Two custom node types:
    - `primary` — black border, confirmed impacted artifacts
    - `secondary` — gray border, agent-suggested "check these" items
  - Both node types show: label (text-sm semibold) + sublabel + confidence score (colored by band)
  - Hover state: blue border + `bg-primary/10` background
  - Selected state: 3px blue border, white background
  - Status dot (top-right, inline): green = up-to-date, amber = needs-review, red = stale
  - Confidence score color bands: ≥85% = muted, 60–84% = amber-600, <60% = red-500
  - Primary edges: black with arrowheads
  - Secondary edges: gray dashed + animated
  - Clicking a node opens the detail panel (same node click again = closes)
- **Triage tab:** table view of all nodes — Artifact, Type, Status badge, Confidence, Impact. Clicking a row opens the detail panel.

**CIA scenario: REQ-142 — Infusion Rate Limit Enforcement change**
- REQ-142 is the origin (Jira: KTX-2047, GitHub PR: #847)
- 14 downstream nodes (removed REQ-085, REQ-201 upstream nodes)
- Secondary nodes: SPEC-HW-105, TEST-V-210, UI-SPEC-088, DOC-DHF-024

---

#### Detail panel (conditional, always adjacent to flow panel)
- Appears when a graph node is clicked, Triage row clicked, or navigated to via `?node=` param
- Header: node label + artifact type + X close button
- Three tabs (shadcn Tabs), tab list uses `bg-gray-100`:
  - **Details** — Status badge (left) + Agent Confidence % (right, color-coded). Fields below — `Jira ticket` and `GitHub PR` fields render as `<a>` links. For test nodes: Recent Runs section (last 5, colored dot + result label + clickable timestamp link). Footer: Accept (primary) + Reject (outline), right-aligned.
  - **Documentation Draft** — shown only on nodes where docs are the output (Risk Control, Design Spec, Verification Test, SOP, Regulatory Clause, Documentation). Agent-generated draft in a `bg-gray-50` document container. Footer: Request changes (outline) + Approve draft (primary), right-aligned.
  - **Agent Reasoning** — tool call cards (`bg-gray-100`). Test artifact links show 5 run history dots inline right, with shadcn Tooltip on hover. Below: Reasoning, Confidence explanation, Ruled-out items. Footer: Re-analyse (primary), right-aligned.
- Tab order: Details → Documentation Draft (if available) → Agent Reasoning
- Status badge colors: green (up-to-date), amber (needs-review), red (stale)

---

#### Panel drag-to-swap
- Both Ketryx Agent and Change Impact Graph panels have GripVertical drag handles
- DndContext wraps the group — dragging swaps the two main panels
- Detail panel always stays adjacent to the flow panel

---

## Data architecture (`flow.tsx`)

All CIA data lives in `flow.tsx` and is exported:

- `DEFAULT_NODES` — 14 nodes (removed REQ-085, REQ-201). REQ-142 is root with `Jira ticket` and `GitHub PR` fields.
- `DEFAULT_EDGES` — edges (primary black + secondary dashed). No upstream edges.
- `NODE_REASONING` — per-node agent reasoning: tools used (call + resultText + links[]), reasoning text, confidence explanation, ruled-out items
- `NODE_TYPES` — `{ primary: PrimaryNode, secondary: SecondaryNode }`
- `TEST_RUN_HISTORY` — mock run history for test nodes (test-v340, test-v341, test-v210). `RunResult` = `'passed' | 'failed-bug' | 'failed-test-change' | 'failed-infra'`
- `NODE_DRAFTS` — agent-generated documentation drafts for 12 nodes (Risk Controls, Design Specs, Tests, SOP, Regulatory Clauses, Documentation). Not shown on Requirements or Hazards.
- `RUN_CONFIG` — in `cia/page.tsx`: maps RunResult to `{ label, dot, text }`

---

## Component customisations

| Component | File | What changed |
|---|---|---|
| Button | `ui/button.tsx` | Added `nav` size variant |
| ResizableHandle | `ui/resizable.tsx` | Added hover highlight — line + grip pill |
| Panel | `components/panel.tsx` | Custom: Card + Tabs + dnd-kit drag handle |
| Sidebar | `components/sidebar.tsx` | Custom: 3-state, `onSelect` callback for navigation |
| Chat | `components/chat.tsx` | `theirName`, `myName`, `onArtifactClick`; artifact + PR + Jira linkification; multi-paragraph via `\n\n` |
| Flow | `components/flow.tsx` | Full CIA data, `DEFAULT_EDGES` exported, `TEST_RUN_HISTORY`, `NODE_DRAFTS` |
| Tooltip | `ui/tooltip.tsx` | Added via shadcn (base-ui). Run history dot tooltips in Agent Reasoning |

---

## Typography

| Element | Size | Token |
|---|---|---|
| Sidebar nav items | 14px | `text-sm` |
| Tab labels | 12px | `text-xs` |
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
| Ketryx Agent chat bubble | `bg-gray-100` | `chat.tsx` |
| Detail panel tab list | `bg-gray-100` | `cia/page.tsx` |
| Graph panel tab list | `bg-gray-100` | `cia/page.tsx` |
| Agent Reasoning tool call cards | `bg-gray-100` | `cia/page.tsx` |
| Documentation draft container | `bg-gray-50` | `cia/page.tsx` |
| Confidence high (≥85%) | `text-muted-foreground` | `flow.tsx` |
| Confidence medium (60–84%) | `text-amber-600` | `flow.tsx` |
| Confidence low (<60%) | `text-red-500` | `flow.tsx` |

---

## Key files

```
src/
  app/
    demo/page.tsx           ← two-panel reference (do not modify)
    demo2/page.tsx          ← token management UI
    cia/page.tsx            ← change impact analysis (active)
    traceability/page.tsx   ← traceability matrix (entry point)
  components/
    sidebar.tsx             ← 3-state sidebar, onSelect navigation
    panel.tsx               ← tabs + drag handle card
    chat.tsx                ← chat UI, artifact + PR + Jira linkification
    flow.tsx                ← xyflow canvas + all CIA data
    ui/
      button.tsx            ← modified: nav variant
      resizable.tsx         ← modified: hover highlight
      tooltip.tsx           ← added via shadcn

mds/                        ← learnings per library
custom_components/          ← modified + custom components with docs
CLAUDE.md                   ← working rules for Claude
PROJECT_STATE.md            ← this file
```

---

## Navigation flow

```
/traceability  →  click REQ-142 row  →  /cia
/traceability  →  click a dot        →  /cia?node=<id>  (detail panel pre-opened)
/cia           →  sidebar nav        →  /traceability
```

---

## What's next

- Consider highlighting graph nodes when agent mentions them in chat
- Consider a legend for node types / status dots / confidence bands
- Triage table: add sorting / filtering
- Push to Vercel when ready
