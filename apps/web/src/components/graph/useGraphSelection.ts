import type { NodeMouseHandler } from '@xyflow/react'

export function useGraphSelection(onSelect: (id: string) => void): NodeMouseHandler {
  return (_event, node) => onSelect(node.id)
}
