import type { GraphResponse } from '@file-graph/shared'
import { MarkerType, Position, type Edge, type Node } from '@xyflow/react'
import { graphPosition } from './layout'

export type FileGraphNodeData = {
  label: string
  path: string
  kind: 'file' | 'directory'
  childCount: number
  hasParent: boolean
  hasChildren: boolean
}

export function toReactFlowGraph(graph: GraphResponse): { nodes: Node<FileGraphNodeData>[]; edges: Edge[] } {
  const depthRows = new Map<number, number>()

  return {
    nodes: graph.nodes.map((node) => {
      const rowInDepth = depthRows.get(node.depth) ?? 0
      depthRows.set(node.depth, rowInDepth + 1)
      return {
        id: node.id,
        type: 'fileGraphNode',
        position: graphPosition(node, rowInDepth),
        targetPosition: Position.Left,
        sourcePosition: Position.Right,
        data: {
          label: node.label,
          path: node.path,
          kind: node.kind,
          childCount: node.childCount,
          hasParent: graph.edges.some((edge) => edge.target === node.id),
          hasChildren: graph.edges.some((edge) => edge.source === node.id),
        },
      }
    }),
    edges: graph.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: 'children',
      targetHandle: 'parent',
      type: 'fileGraphEdge',
      animated: edge.kind === 'selected',
      label: edge.kind,
      markerEnd: { type: MarkerType.ArrowClosed },
    })),
  }
}
