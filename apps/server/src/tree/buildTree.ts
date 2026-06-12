import type { FileNode, FileTreeNode, TreeResponse } from '@file-graph/shared'

export function buildTree(workspaceId: string, nodes: FileNode[]): TreeResponse {
  const byParent = new Map<string | null, FileNode[]>()
  for (const node of nodes) {
    const siblings = byParent.get(node.parentId) ?? []
    siblings.push(node)
    byParent.set(node.parentId, siblings)
  }

  function toTree(node: FileNode): FileTreeNode {
    const children = (byParent.get(node.id) ?? []).map(toTree)
    return { ...node, children }
  }

  const root = (byParent.get(null) ?? [])[0]
  return { workspaceId, root: root ? toTree(root) : null }
}
