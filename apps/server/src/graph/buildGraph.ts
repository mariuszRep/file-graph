import type { FileNode, GraphEdge, GraphNode, GraphResponse, Relationship } from '@file-graph/shared'

export function buildGraph(workspaceId: string, nodes: FileNode[], relationships: Relationship[]): GraphResponse {
  const childCounts = relationships.reduce<Record<string, number>>((acc, relationship) => {
    acc[relationship.sourceId] = (acc[relationship.sourceId] ?? 0) + 1
    return acc
  }, {})

  const graphNodes: GraphNode[] = nodes.map((node) => ({
    id: node.id,
    fileNodeId: node.id,
    label: node.name,
    path: node.relativePath,
    kind: node.kind,
    depth: node.depth,
    childCount: childCounts[node.id] ?? 0,
  }))

  const graphEdges: GraphEdge[] = relationships.map((relationship) => ({
    id: relationship.id,
    source: relationship.sourceId,
    target: relationship.targetId,
    kind: relationship.kind,
  }))

  return { workspaceId, nodes: graphNodes, edges: graphEdges }
}
