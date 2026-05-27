# Project

Design task showcase — Next.js + shadcn/ui + Tailwind CSS.
Deployed to Vercel. Goal: build fast, polished UI prototypes.

# Commands

- `npm run dev` — start local server at localhost:3000
- `npm run build` — production build check
- `npx shadcn@latest add <component>` — add a shadcn component

# Stack rules

- Always use shadcn components from `@/components/ui/`, never build primitives from scratch
- Tailwind for all styling — no separate CSS files, no inline styles
- TypeScript throughout
- No unnecessary comments in code

# Pre-installed shadcn components

avatar, badge, button, card, dialog, dropdown-menu, input, label, select, separator, sheet, tabs, textarea, resizable

# Drag and drop

Use `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` for drag-and-drop interactions.

# Panel layouts

Use the `resizable` shadcn component (wraps `react-resizable-panels`) for resizable panel layouts.

# Canvas and flow diagrams

Use `@xyflow/react` (React Flow) for node-based diagrams, flow charts, workflow builders, and canvas layouts with connected nodes.

# Typography

Font: Inter (loaded via `next/font/google` in layout.tsx, variable `--font-inter`). Always use Inter — never change the font.

# Design preferences

- Clean, minimal aesthetic
- Consistent spacing using Tailwind scale (4, 8, 16, 24, 32px)
- Dark mode support via shadcn theming (use `dark:` variants)
- Mobile-first layouts

# Component selection rules

Follow this order strictly. Do not skip steps or jump ahead.

1. **Select the right component first** — does it fit the use case out of the box? If not, pick a different one.
2. **Use it as-is** — standard props, standard variants, standard sizes from the design system.
3. **Arbitrary values** — only when the user specifies an exact number (e.g. `px-[13px]`). Fine to use, do not avoid them.
4. **Override component structure or behaviour** — requires explicit alignment with the user before touching anything. Never do this unilaterally.

Overriding a component's internals is high risk: it creates fragile behaviour, is hard to document, and breaks across sessions. When in doubt, use a plain HTML element instead and style it from scratch.

Document the *why* behind component choices — not just the code. Decisions that aren't written down are lost between sessions.

# What NOT to do

- Don't install extra UI libraries (no MUI, no Chakra, no Radix directly)
- Don't use Lorem Ipsum — write realistic, context-appropriate copy
- Don't add animations unless explicitly asked
- Don't create new CSS files

# Task brief

When given a task, it will be in TASK.md at the root. Read it before building anything.
