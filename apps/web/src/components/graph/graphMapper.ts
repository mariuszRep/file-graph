import type { GraphResponse } from '@file-graph/shared'
import { MarkerType, Position, type Edge, type Node } from '@xyflow/react'
import { layeredLayout } from './layout'

export type FileGraphNodeData = {
  label: string
  path: string
  kind: 'file' | 'directory'
  relationshipCount: number
  hasParent: boolean
  hasChildren: boolean
  inRelationshipChain: boolean
}

export function toReactFlowGraph(graph: GraphResponse, highlightIds: Set<string>): { nodes: Node<FileGraphNodeData>[]; edges: Edge[] } {
  const positions = layeredLayout(
    graph.nodes.map((node) => node.id),
    graph.edges.map((edge) => ({ source: edge.source, target: edge.target })),
  )

  // Nodes to visually emphasize (computed by the caller). Empty means no selection.
  const relationshipChain = highlightIds
  const hasSelection = relationshipChain.size > 0

  return {
    nodes: graph.nodes.map((node) => {
      const position = positions.get(node.id) ?? { x: 0, y: 0 }
      return {
        id: node.id,
        type: 'fileGraphNode',
        position,
        targetPosition: Position.Left,
        sourcePosition: Position.Right,
        data: {
          label: node.label,
          path: node.path,
          kind: node.kind,
          relationshipCount: node.relationshipCount,
          hasParent: graph.edges.some((edge) => edge.target === node.id),
          hasChildren: graph.edges.some((edge) => edge.source === node.id),
          inRelationshipChain: relationshipChain.has(node.id),
        },
      }
    }),
    edges: graph.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: 'imports',
      targetHandle: 'imported-by',
      type: 'fileGraphEdge',
      animated: edge.kind === 'selected',
      label: edge.kind === 'reexports' ? 're-export' : 'import',
      data: { specifier: edge.specifier, inRelationshipChain: relationshipChain.has(edge.source) && relationshipChain.has(edge.target) },
      markerEnd: { type: MarkerType.ArrowClosed },
      style: hasSelection && !(relationshipChain.has(edge.source) && relationshipChain.has(edge.target)) ? { opacity: 0.2 } : undefined,
    })),
  }
}
