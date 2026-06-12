import { useEffect, useRef, useState } from 'react'
import { Panel, useStore } from '@xyflow/react'

type GraphZoomBarProps = {
  minZoom?: number
  maxZoom?: number
}

export function GraphZoomBar({ minZoom = 0.25, maxZoom = 1.8 }: GraphZoomBarProps) {
  const zoom = useStore((state) => state.transform[2])
  const [visible, setVisible] = useState(false)
  const firstRender = useRef(true)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pct = Math.round(zoom * 100)
  const progress = Math.max(0, Math.min(1, (zoom - minZoom) / (maxZoom - minZoom)))

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    setVisible(true)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setVisible(false), 1500)
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [zoom])

  return (
    <Panel position="bottom-center" className={`graph-zoom-bar ${visible ? 'is-visible' : ''}`}>
      <div className="graph-zoom-track"><span style={{ width: `${progress * 100}%` }} /></div>
      <span>{pct}%</span>
    </Panel>
  )
}
