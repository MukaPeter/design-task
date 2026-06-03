# Roadmap

Items that need design decisions before building are marked **[design]**.
Items ready to build are marked **[build]**.

---

## Needs design first

### Grid
- **[design]** Alias indicator in a cell — visual treatment for when a value is an alias
- **[design]** Add mode column — where does the button live? In the header row?
- **[design]** Column header rename — click to edit, what does the edit state look like?
- **[design]** Empty state — what does the grid show when a collection has no tokens?

### Tree
- **[design]** Breadcrumb as navigation — clicking a segment navigates to that level, tree selection syncs

### Detail panel
- **[design]** Description editable — click to edit, what does the edit state look like?

### Global
- **[design]** Re-opening a closed panel — how does the user get it back?
- **[design]** Lock / unlock mode toggle — location and behaviour TBD

---

## Ready to build

### Layout
- **[build]** Extract `Workspace` + `WorkspacePanel` components
- **[build]** Extract `AppShell` + `AppHeader` components
- **[build]** Replace current `panel.tsx` with new workspace system

### Detail panel
- **[build]** Extract `DetailSection` collapsible wrapper (replaces 6 hand-rolled accordions)
- **[build]** Config-driven composition model (`token-configs.tsx` + `token-detail-content.tsx`)
- **[build]** Strip shell from `TokenDetailPanel` — make it pure content

### Grid
- **[build]** Extract `TokenGrid` component out of `page.tsx`
- **[build]** Extract `useColumnResize` hook
- **[build]** Config-driven cell renderers per token type
- **[build]** Replace raw `<button>` with shadcn `Button` for open detail action
- **[build]** Move `DimensionUnit` / `DurationUnit` types to shared types file
- **[build]** Grouped grid rendering (group header rows with full path)

### Tree
- **[build]** Extract `CollectionsTree` component out of `page.tsx`
- **[build]** Make tree data a prop (data-agnostic component)

### Page
- **[build]** `page.tsx` becomes layout only — all logic moves to components
