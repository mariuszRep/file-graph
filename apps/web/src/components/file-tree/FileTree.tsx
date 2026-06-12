import type { FileTreeNode as FileTreeNodeData } from '@file-graph/shared'
import { useMemo, useState } from 'react'
import { EmptyState } from '../ui/empty-state'
import { FileTreeNode } from './FileTreeNode'

type FileTreeProps = {
  root: FileTreeNodeData | null
  selectedId: string | null
  onSelect: (node: FileTreeNodeData) => void
}

export function FileTree({ root, selectedId, onSelect }: FileTreeProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const visibleExpanded = useMemo(() => {
    const next = new Set(expanded)
    if (root) next.add(root.id)
    return next
  }, [expanded, root])

  if (!root) return <EmptyState title="No scan data" description="Open a local folder and scan it to build the tree." />

  function handleToggle(id: string) {
    setExpanded((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <nav className="file-tree" aria-label="File tree">
      <ul>
        <FileTreeNode node={root} selectedId={selectedId} expanded={visibleExpanded} onToggle={handleToggle} onSelect={onSelect} />
      </ul>
    </nav>
  )
}
