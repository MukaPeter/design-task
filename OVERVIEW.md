# Project Overview

## What this is

A UI prototype built for a Head of Design interview at Ketryx — a company that builds software for regulated medical device development.

The prototype lives at `/cia` and demonstrates **Change Impact Analysis**: when a requirement changes in a regulated product, every downstream artifact (risks, tests, SOPs, regulatory clauses) must be reviewed. This prototype shows how an AI agent (Ketryx Agent) could help engineers understand what is impacted, why, and how confident the analysis is.

It shows a realistic end-to-end workflow: an engineer asks the agent about a change, the agent reasons over the artifact graph, and the UI surfaces the impact visually alongside the agent's full reasoning trace.

---

## How it works

### Stack

| Layer | Tool |
|---|---|
| Framework | Next.js (App Router) |
| UI components | shadcn/ui + Tailwind CSS v4 |
| Drag and drop | @dnd-kit/core |
| Resizable panels | react-resizable-panels (v4) |
| Flow / canvas diagrams | @xyflow/react (React Flow) |
| Tree lists | react-arborist |
| Language | TypeScript throughout |

### Layout

The `/cia` page is three resizable panels side by side:

- **Ketryx Agent** (15%) — a pre-populated chat showing a real CIA conversation. Artifact IDs in the agent's messages are clickable links that open the detail panel for that node.
- **Change Impact Graph** (~85%) — an interactive xyflow canvas showing the artifact dependency graph for a single change scenario (REQ-142: Infusion Rate Limit Enforcement). Nodes are colour-coded by type (primary = confirmed impact, secondary = suggested review) and carry status dots and confidence scores.
- **Detail panel** (conditional) — slides open when a node is clicked. Shows artifact metadata and the agent's full reasoning for that node, including which tools were called, what they returned, and why items were ruled out.

### Data model

All CIA scenario data lives in `src/components/flow.tsx` and is exported as plain TypeScript constants:

- `DEFAULT_NODES` — 16 nodes, each with status, confidence score, artifact type, and field data.
- `DEFAULT_EDGES` — 17 directed edges connecting them.
- `NODE_REASONING` — per-node reasoning: tool calls with results, reasoning text, confidence explanation, and ruled-out items.

There is no backend. Everything is static mock data rendered client-side.

### Key interaction flows

1. User opens `/cia` → sees the agent chat and the impact graph side by side.
2. Clicking an artifact ID in the chat → opens the detail panel for that node and selects it in the graph.
3. Clicking a graph node → opens the same detail panel from the other direction.
4. Detail panel tabs between **Details** (artifact fields, status) and **Agent Reasoning** (full reasoning trace).
5. Closing the panel deselects the node in the graph.
6. Either main panel can be dragged left or right to swap positions. The detail panel always stays adjacent to the graph.

---

## Component architecture

| Component | File | Role |
|---|---|---|
| Sidebar | `components/sidebar.tsx` | 3-state: collapsed (60px) / hover overlay / pinned (240px) |
| Panel | `components/panel.tsx` | Reusable card with tabs and a dnd-kit drag handle |
| Chat | `components/chat.tsx` | Chat bubble UI with artifact ID linkification |
| Flow | `components/flow.tsx` | xyflow canvas + all CIA scenario data |
| Button | `ui/button.tsx` | Extended with a `nav` size variant |
| ResizableHandle | `ui/resizable.tsx` | Extended with hover highlight (line + grip pill) |

---

## How to run it

```bash
npm run dev       # local dev at http://localhost:3000
npm run build     # production build — catches TypeScript errors Turbopack misses
```

Push to `main` on GitHub → Vercel auto-deploys.
