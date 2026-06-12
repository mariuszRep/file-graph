import type { GraphNode } from '@file-graph/shared'

const xGap = 340
const yGap = 148
const stagger = 44

export function graphPosition(node: GraphNode, rowInDepth: number) {
  return {
    x: node.depth * xGap,
    y: rowInDepth * yGap + (node.depth % 2) * stagger,
  }
}
