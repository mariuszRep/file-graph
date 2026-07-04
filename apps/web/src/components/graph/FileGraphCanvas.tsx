import type { GraphResponse } from '@file-graph/shared'
import { Background, ReactFlow, ReactFlowProvider, useEdgesState, useNodesState, useReactFlow, type Edge, type Node } from '@xyflow/react'
import { useEffect, useMemo, useState } from 'react'
import { EmptyState } from '../ui/empty-state'
import { FileGraphEdge } from './FileGraphEdge'
import { FileGraphNode } from './FileGraphNode'
import { GraphControls } from './GraphControls'
import { GraphMiniMap } from './GraphMiniMap'
import { GraphSettingsPane } from './GraphSettingsPane'
import { GraphZoomBar } from './GraphZoomBar'
import { toReactFlowGraph, type FileGraphNodeData } from './graphMapper'
import { useGraphSelection } from './useGraphSelection'

const nodeTypes = { fileGraphNode: FileGraphNode }
const edgeTypes = { fileGraphEdge: FileGraphEdge }

type FileGraphCanvasProps = {
  graph: GraphResponse | null
  selectedId: string | null
  onSelect: (id: string) => void
}

function CanvasInner({ graph, selectedId, onSelect }: FileGraphCanvasProps) {
  const mapped = useMemo(() => (graph ? toReactFlowGraph(graph, selectedId) : { nodes: [], edges: [] }), [graph, selectedId])

  if (!graph || graph.nodes.length === 0) return <EmptyState title="No code relationships yet" description="The tree shows folders. The canvas appears after a scan finds local imports or re-exports between files." />

  const graphSignature = `${graph.workspaceId}:${graph.nodes.map((node) => node.id).join(',')}:${graph.edges.map((edge) => edge.id).join(',')}`

  return <ControlledGraph key={graphSignature} initialNodes={mapped.nodes} initialEdges={mapped.edges} selectedId={selectedId} onSelect={onSelect} />
}

type ControlledGraphProps = {
  initialNodes: Node<FileGraphNodeData>[]
  initialEdges: Edge[]
  selectedId: string | null
  onSelect: (id: string) => void
}

function ControlledGraph({ initialNodes, initialEdges, selectedId, onSelect }: ControlledGraphProps) {
  const flow = useReactFlow()
  const [nodes, , onNodesChange] = useNodesState<Node<FileGraphNodeData>>(initialNodes)
  const [edges, , onEdgesChange] = useEdgesState(initialEdges)
  const [locked, setLocked] = useState(false)
  const [showMiniMap, setShowMiniMap] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const onNodeClick = useGraphSelection(onSelect)
  const renderedNodes = useMemo(() => nodes.map((node) => ({ ...node, selected: node.id === selectedId })), [nodes, selectedId])

  useEffect(() => {
    if (selectedId) {
      // Zoom to fit the entire relationship chain, not just the selected node
      const chainNodes = nodes.filter((node) => node.data.inRelationshipChain)
      if (chainNodes.length > 0) {
        flow.fitView({ nodes: chainNodes.map((n) => ({ id: n.id })), duration: 300, padding: 0.5 })
      }
    }
  }, [flow, selectedId, nodes])

  return (
    <ReactFlow
      nodes={renderedNodes}
      edges={edges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onNodeClick={onNodeClick}
      fitView
      minZoom={0.25}
      maxZoom={1.8}
      panOnDrag
      panOnScroll
      selectionOnDrag
      zoomOnDoubleClick={false}
      nodesDraggable={!locked}
      nodesConnectable={false}
      edgesFocusable
      nodesFocusable
      deleteKeyCode={['Backspace', 'Delete']}
      proOptions={{ hideAttribution: true }}
    >
      <Background />
      <GraphControls locked={locked} showMiniMap={showMiniMap} showSettings={showSettings} onLockedChange={setLocked} onMiniMapChange={setShowMiniMap} onSettingsChange={setShowSettings} />
      {showSettings ? <GraphSettingsPane locked={locked} showMiniMap={showMiniMap} nodeCount={nodes.length} edgeCount={edges.length} onLockedChange={setLocked} onMiniMapChange={setShowMiniMap} /> : null}
      <GraphZoomBar />
      {showMiniMap ? <GraphMiniMap /> : null}
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
