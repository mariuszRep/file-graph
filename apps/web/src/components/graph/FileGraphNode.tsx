import { Handle, Position, type NodeProps } from '@xyflow/react'
import { FileCode2 } from 'lucide-react'
import { Badge } from '../ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import type { FileGraphNodeData } from './graphMapper'

export function FileGraphNode({ data, selected }: NodeProps & { data: FileGraphNodeData }) {
  return (
    <Card className={`graph-node ${selected ? 'is-selected' : ''}`}>
      <Handle id="imported-by" type="target" position={Position.Left} className="graph-handle graph-handle-target" isConnectable={false} />
      <CardHeader>
        <CardTitle className="graph-node-title">
          <FileCode2 aria-hidden="true" />
          <span>{data.label}</span>
        </CardTitle>
        <CardDescription className="graph-node-path">{data.path}</CardDescription>
      </CardHeader>
      <CardContent className="graph-node-meta-row">
        <Badge>code file</Badge>
        <Badge variant="secondary">{data.relationshipCount} relations</Badge>
      </CardContent>
      <Handle id="imports" type="source" position={Position.Right} className="graph-handle graph-handle-source" isConnectable={false} />
    </Card>
  )
}
