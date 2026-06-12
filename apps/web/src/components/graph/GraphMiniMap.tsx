import { MiniMap } from '@xyflow/react'

export function GraphMiniMap() {
  return (
    <MiniMap
      className="graph-minimap"
      pannable
      zoomable
      ariaLabel="File graph minimap"
      maskColor="color-mix(in oklch, var(--panel) 65%, transparent)"
      nodeColor="oklch(0.68 0.018 285)"
      nodeStrokeColor="transparent"
      bgColor="transparent"
      nodeBorderRadius={6}
    />
  )
}
