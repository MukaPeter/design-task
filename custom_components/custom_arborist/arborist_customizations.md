# react-arborist — Custom Components

## collections-tree.tsx

### What it is
A ready-to-use tree component built on react-arborist. Handles dynamic sizing automatically via ResizeObserver — just drop it into any flex column and it fills the space.

### Key decisions

**ResizeObserver for sizing**
react-arborist requires explicit `width` and `height`. The component measures its container via ResizeObserver and passes the values to Tree. Guards against rendering before measurement with `size.width > 0`.

**Hover and selected states**
- Hover: `#F5F5F5` (neutral gray, matches sidebar nav hover)
- Selected: `bg-primary/10` (light blue) + `font-semibold`
- Chevron is `invisible` (not hidden) on leaf nodes to preserve indent alignment

**Props**

| Prop | Default | Description |
|---|---|---|
| `data` | required | Tree data array |
| `rowHeight` | `36` | Height of each row slot in px |
| `indent` | `16` | Pixel indent per nesting level |
| `openByDefault` | `true` | All nodes expanded on load |

### Intent
A reusable tree list for sidebar panels (Collections, navigation, file trees). Visual style matches the rest of the UI — same font size (text-xs), same hover color, same primary color for selection.
