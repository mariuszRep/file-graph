import type { FileTreeNode as FileTreeNodeData } from '@file-graph/shared'
import { useMemo } from 'react'
import { EmptyState } from '../ui/empty-state'
import { FileTreeNode } from './FileTreeNode'

type FileTreeProps = {
  root: FileTreeNodeData | null
  selectedId: string | null
  onSelect: (node: FileTreeNodeData) => void
  relationshipChain: Set<string>
  expanded: Set<string>
  onToggle: (id: string) => void
}

export function FileTree({ root, selectedId, onSelect, relationshipChain, expanded, onToggle }: FileTreeProps) {
  const visibleExpanded = useMemo(() => {
    const next = new Set(expanded)
    if (root) next.add(root.id)
    return next
  }, [expanded, root])

  if (!root) return <EmptyState title="No scan data" description="Open a local folder and scan it to build the tree." />

  return (
    <nav className="file-tree" aria-label="File tree">
      <ul>
        <FileTreeNode node={root} selectedId={selectedId} expanded={visibleExpanded} onToggle={onToggle} onSelect={onSelect} relationshipChain={relationshipChain} />
      </ul>
    </nav>
  )
}
