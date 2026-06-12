import { Panel, useReactFlow } from '@xyflow/react'
import { LocateFixed, Lock, Map, Maximize2, Minus, PanelRightOpen, Plus, Unlock } from 'lucide-react'
import { Button } from '../ui/button'

type GraphControlsProps = {
  locked: boolean
  showMiniMap: boolean
  showSettings: boolean
  onLockedChange: (locked: boolean) => void
  onMiniMapChange: (showMiniMap: boolean) => void
  onSettingsChange: (showSettings: boolean) => void
}

export function GraphControls({ locked, showMiniMap, showSettings, onLockedChange, onMiniMapChange, onSettingsChange }: GraphControlsProps) {
  const flow = useReactFlow()
  return (
    <Panel position="top-right" className="graph-controls">
      <Button size="sm" onClick={() => flow.fitView({ padding: 0.2 })}><Maximize2 aria-hidden="true" />Fit</Button>
      <Button size="sm" onClick={() => flow.setCenter(0, 0, { zoom: 0.8, duration: 300 })} aria-label="Center canvas"><LocateFixed aria-hidden="true" /></Button>
      <Button size="sm" onClick={() => flow.zoomIn()} aria-label="Zoom in"><Plus aria-hidden="true" /></Button>
      <Button size="sm" onClick={() => flow.zoomOut()} aria-label="Zoom out"><Minus aria-hidden="true" /></Button>
      <Button size="sm" variant={locked ? 'primary' : 'secondary'} onClick={() => onLockedChange(!locked)} aria-label={locked ? 'Unlock canvas' : 'Lock canvas'}>
        {locked ? <Lock aria-hidden="true" /> : <Unlock aria-hidden="true" />}
      </Button>
      <Button size="sm" variant={showMiniMap ? 'primary' : 'secondary'} onClick={() => onMiniMapChange(!showMiniMap)} aria-label="Toggle minimap"><Map aria-hidden="true" /></Button>
      <Button size="sm" variant={showSettings ? 'primary' : 'secondary'} onClick={() => onSettingsChange(!showSettings)} aria-label="Toggle canvas settings"><PanelRightOpen aria-hidden="true" /></Button>
    </Panel>
  )
}
