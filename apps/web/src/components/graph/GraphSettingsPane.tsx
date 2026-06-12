import { Panel } from '@xyflow/react'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'

type GraphSettingsPaneProps = {
  locked: boolean
  showMiniMap: boolean
  nodeCount: number
  edgeCount: number
  onLockedChange: (locked: boolean) => void
  onMiniMapChange: (showMiniMap: boolean) => void
}

export function GraphSettingsPane({ locked, showMiniMap, nodeCount, edgeCount, onLockedChange, onMiniMapChange }: GraphSettingsPaneProps) {
  return (
    <Panel position="top-left" className="graph-settings-pane">
      <Card>
        <CardHeader>
          <CardTitle>Canvas tools</CardTitle>
          <CardDescription>OpenDora-style graph controls</CardDescription>
        </CardHeader>
        <CardContent className="graph-settings-content">
          <div className="graph-stats">
            <Badge>{nodeCount} nodes</Badge>
            <Badge variant="secondary">{edgeCount} edges</Badge>
          </div>
          <Button size="sm" variant={locked ? 'primary' : 'secondary'} onClick={() => onLockedChange(!locked)}>
            {locked ? 'Unlock node movement' : 'Lock node movement'}
          </Button>
          <Button size="sm" variant={showMiniMap ? 'primary' : 'secondary'} onClick={() => onMiniMapChange(!showMiniMap)}>
            {showMiniMap ? 'Hide sidemap' : 'Show sidemap'}
          </Button>
          <p className="graph-settings-help">Drag nodes to rearrange the graph. Edges stay connected through explicit parent/children handles.</p>
        </CardContent>
      </Card>
    </Panel>
  )
}
