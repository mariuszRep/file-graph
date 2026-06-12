import type { GraphResponse } from '@file-graph/shared'
import { Background, ReactFlow, ReactFlowProvider, useReactFlow } from '@xyflow/react'
import { useEffect, useMemo } from 'react'
import { EmptyState } from '../ui/empty-state'
import { FileGraphEdge } from './FileGraphEdge'
import { FileGraphNode } from './FileGraphNode'
import { GraphControls } from './GraphControls'
import { GraphMiniMap } from './GraphMiniMap'
import { GraphZoomBar } from './GraphZoomBar'
import { toReactFlowGraph } from './graphMapper'
import { useGraphSelection } from './useGraphSelection'

const nodeTypes = { fileGraphNode: FileGraphNode }
const edgeTypes = { fileGraphEdge: FileGraphEdge }

type FileGraphCanvasProps = {
  graph: GraphResponse | null
  selectedId: string | null
  onSelect: (id: string) => void
}

function CanvasInner({ graph, selectedId, onSelect }: FileGraphCanvasProps) {
  const flow = useReactFlow()
  const mapped = useMemo(() => (graph ? toReactFlowGraph(graph) : { nodes: [], edges: [] }), [graph])
  const onNodeClick = useGraphSelection(onSelect)
  const nodes = useMemo(() => mapped.nodes.map((node) => ({ ...node, selected: node.id === selectedId })), [mapped.nodes, selectedId])

  useEffect(() => {
    if (selectedId) flow.fitView({ nodes: [{ id: selectedId }], duration: 300, padding: 0.5 })
  }, [flow, selectedId])

  if (!graph || graph.nodes.length === 0) return <EmptyState title="No graph yet" description="Scan a folder to create graph nodes and relationships." />

  return (
    <ReactFlow nodes={nodes} edges={mapped.edges} nodeTypes={nodeTypes} edgeTypes={edgeTypes} onNodeClick={onNodeClick} fitView minZoom={0.25} maxZoom={1.8} edgesFocusable nodesFocusable>
      <Background />
      <GraphControls />
      <GraphZoomBar />
      <GraphMiniMap />
    </ReactFlow>
  )
}

export function FileGraphCanvas(props: FileGraphCanvasProps) {
  return (
    <ReactFlowProvider>
      <CanvasInner {...props} />
    </ReactFlowProvider>
  )
}
