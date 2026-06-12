import type { ScanSession, Workspace } from '@file-graph/shared'
import { RefreshCw } from 'lucide-react'
import { Button } from '../ui/button'

type ToolbarProps = {
  workspace: Workspace | null
  scan: ScanSession | null
  loading: boolean
  onRescan: () => void
}

export function Toolbar({ workspace, scan, loading, onRescan }: ToolbarProps) {
  return (
    <header className="toolbar">
      <div>
        <p className="eyebrow">File Graph</p>
        <h1>{workspace?.name ?? 'Choose a local project'}</h1>
      </div>
      <div className="toolbar-actions">
        {scan ? <span className="status-pill">{scan.fileCount} files · {scan.directoryCount} folders</span> : null}
        <Button onClick={onRescan} disabled={!workspace || loading}>
          <RefreshCw aria-hidden="true" />
          {loading ? 'Scanning' : 'Rescan'}
        </Button>
      </div>
    </header>
  )
}
