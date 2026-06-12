import { Handle, Position, type NodeProps } from '@xyflow/react'
import { File, Folder } from 'lucide-react'
import { Badge } from '../ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import type { FileGraphNodeData } from './graphMapper'

export function FileGraphNode({ data, selected }: NodeProps & { data: FileGraphNodeData }) {
  return (
    <Card className={`graph-node ${selected ? 'is-selected' : ''}`}>
      <Handle id="parent" type="target" position={Position.Left} className="graph-handle graph-handle-target" isConnectable={false} />
      <CardHeader>
        <CardTitle className="graph-node-title">
          {data.kind === 'directory' ? <Folder aria-hidden="true" /> : <File aria-hidden="true" />}
          <span>{data.label}</span>
        </CardTitle>
        <CardDescription className="graph-node-path">{data.path}</CardDescription>
      </CardHeader>
      <CardContent className="graph-node-meta-row">
        <Badge variant={data.kind === 'directory' ? 'default' : 'secondary'}>{data.kind}</Badge>
        {data.kind === 'directory' ? <Badge variant="secondary">{data.childCount} children</Badge> : null}
      </CardContent>
      <Handle id="children" type="source" position={Position.Right} className="graph-handle graph-handle-source" isConnectable={false} />
    </Card>
  )
}
