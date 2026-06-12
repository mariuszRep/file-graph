import type { FileTreeNode as FileTreeNodeData } from '@file-graph/shared'
import { ChevronRight, File, Folder, FolderOpen } from 'lucide-react'

type FileTreeNodeProps = {
  node: FileTreeNodeData
  selectedId: string | null
  expanded: Set<string>
  onToggle: (id: string) => void
  onSelect: (node: FileTreeNodeData) => void
}

export function FileTreeNode({ node, selectedId, expanded, onToggle, onSelect }: FileTreeNodeProps) {
  const isDirectory = node.kind === 'directory'
  const isExpanded = expanded.has(node.id)
  const selected = selectedId === node.id

  return (
    <li>
      <button
        type="button"
        className={`tree-row ${selected ? 'is-selected' : ''}`}
        style={{ paddingLeft: `${node.depth * 14 + 8}px` }}
        onClick={() => {
          onSelect(node)
          if (isDirectory) onToggle(node.id)
        }}
        title={node.absolutePath}
      >
        {isDirectory ? <ChevronRight className={isExpanded ? 'chevron is-open' : 'chevron'} aria-hidden="true" /> : <span className="tree-spacer" />}
        {isDirectory ? (isExpanded ? <FolderOpen aria-hidden="true" /> : <Folder aria-hidden="true" />) : <File aria-hidden="true" />}
        <span>{node.name}</span>
      </button>
      {isDirectory && isExpanded && node.children.length > 0 ? (
        <ul>
          {node.children.map((child) => (
            <FileTreeNode key={child.id} node={child} selectedId={selectedId} expanded={expanded} onToggle={onToggle} onSelect={onSelect} />
          ))}
        </ul>
      ) : null}
    </li>
  )
}
