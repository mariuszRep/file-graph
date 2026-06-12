import type { GraphResponse } from '@file-graph/shared'
import { MarkerType, Position, type Edge, type Node } from '@xyflow/react'
import { forceDirectedLayout } from './layout'

export type FileGraphNodeData = {
  label: string
  path: string
  kind: 'file' | 'directory'
  relationshipCount: number
  hasParent: boolean
  hasChildren: boolean
}

export function toReactFlowGraph(graph: GraphResponse): { nodes: Node<FileGraphNodeData>[]; edges: Edge[] } {
  const positions = forceDirectedLayout(
    graph.nodes.map((node) => node.id),
    graph.edges.map((edge) => ({ source: edge.source, target: edge.target })),
  )

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
      data: { specifier: edge.specifier },
      markerEnd: { type: MarkerType.ArrowClosed },
    })),
  }
}
