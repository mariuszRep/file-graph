import type { FileNode, GraphEdge, GraphNode, GraphResponse, Relationship } from '@file-graph/shared'

export function buildGraph(workspaceId: string, nodes: FileNode[], relationships: Relationship[]): GraphResponse {
  const codeRelationships = relationships.filter((relationship) => relationship.kind === 'imports' || relationship.kind === 'reexports')
  const relatedNodeIds = new Set(codeRelationships.flatMap((relationship) => [relationship.sourceId, relationship.targetId]))
  const relationshipCounts = codeRelationships.reduce<Record<string, number>>((acc, relationship) => {
    acc[relationship.sourceId] = (acc[relationship.sourceId] ?? 0) + 1
    acc[relationship.targetId] = (acc[relationship.targetId] ?? 0) + 1
    return acc
  }, {})

  const graphNodes: GraphNode[] = nodes.filter((node) => node.kind === 'file' && relatedNodeIds.has(node.id)).map((node) => ({
    id: node.id,
    fileNodeId: node.id,
    label: node.name,
    path: node.relativePath,
    kind: node.kind,
    depth: node.depth,
    relationshipCount: relationshipCounts[node.id] ?? 0,
  }))

  const graphEdges: GraphEdge[] = codeRelationships.map((relationship) => ({
    id: relationship.id,
    source: relationship.sourceId,
    target: relationship.targetId,
    kind: relationship.kind,
    specifier: relationship.specifier,
  }))

  return { workspaceId, nodes: graphNodes, edges: graphEdges }
}
