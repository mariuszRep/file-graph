import type { FormEvent } from 'react'
import { useState } from 'react'
import { FolderOpen } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'

type WorkspaceFormProps = {
  loading: boolean
  onSubmit: (rootPath: string) => Promise<void>
}

export function WorkspaceForm({ loading, onSubmit }: WorkspaceFormProps) {
  const [rootPath, setRootPath] = useState('')

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!rootPath.trim()) return
    await onSubmit(rootPath.trim())
  }

  return (
    <form className="workspace-form" onSubmit={handleSubmit}>
      <label htmlFor="workspace-path">Local folder path</label>
      <div className="workspace-row">
        <Input id="workspace-path" value={rootPath} onChange={(event) => setRootPath(event.target.value)} placeholder="/home/mariusz/projects/opendora" />
        <Button type="submit" variant="primary" disabled={loading}>
          <FolderOpen aria-hidden="true" />
          Open
        </Button>
      </div>
    </form>
  )
}
