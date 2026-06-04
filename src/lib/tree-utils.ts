import type { TreeItem } from '@/components/collections-tree'

interface RawCollection {
  id: string
  name: string
}

interface RawToken {
  collection_id: string
  path: string[]
}

export function buildTreeData(collections: RawCollection[], tokens: RawToken[]): TreeItem[] {
  return collections.map(collection => {
    const collectionTokens = tokens.filter(t => t.collection_id === collection.id)
    const children = buildGroupNodes(collection.id, collectionTokens)
    return { id: collection.id, name: collection.name, children }
  })
}

function buildGroupNodes(collectionId: string, tokens: RawToken[]): TreeItem[] {
  const nodeMap = new Map<string, TreeItem & { _children: Map<string, TreeItem> }>()

  for (const token of tokens) {
    if (token.path.length === 0) continue

    let parentMap = nodeMap
    let idPrefix = collectionId

    for (let i = 0; i < token.path.length; i++) {
      const segment = token.path[i]
      const nodeId = `${idPrefix}/${segment}`
      const isLeaf = i === token.path.length - 1

      if (!parentMap.has(segment)) {
        const node = { id: nodeId, name: segment, tokenCount: 0, children: [], _children: new Map() }
        parentMap.set(segment, node)
      }

      const node = parentMap.get(segment)!

      if (isLeaf) {
        node.tokenCount = (node.tokenCount ?? 0) + 1
      }

      parentMap = node._children as Map<string, TreeItem & { _children: Map<string, TreeItem> }>
      idPrefix = nodeId
    }
  }

  return flattenNodes(nodeMap)
}

function flattenNodes(map: Map<string, TreeItem & { _children: Map<string, TreeItem> }>): TreeItem[] {
  return Array.from(map.values()).map(({ _children, ...node }) => ({
    ...node,
    children: _children.size > 0 ? flattenNodes(_children as Map<string, TreeItem & { _children: Map<string, TreeItem> }>) : undefined,
  }))
}
