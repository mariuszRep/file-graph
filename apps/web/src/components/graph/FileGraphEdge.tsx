import { BaseEdge, EdgeLabelRenderer, getBezierPath, type EdgeProps } from '@xyflow/react'

export function FileGraphEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, markerEnd, style, label }: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  return (
    <>
      <BaseEdge id={id} path={edgePath} markerEnd={markerEnd} style={style} className="file-graph-edge" />
      <circle className="file-graph-edge-dot" r="3">
        <animateMotion dur="2.8s" path={edgePath} repeatCount="indefinite" />
      </circle>
      {typeof label === 'string' ? (
        <EdgeLabelRenderer>
          <div className="edge-label nodrag nopan" style={{ transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)` }}>
            {label}
          </div>
        </EdgeLabelRenderer>
      ) : null}
    </>
  )
}
