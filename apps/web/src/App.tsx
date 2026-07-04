import type { FileTreeNode, GraphResponse, ScanSession, TreeResponse, Workspace } from '@file-graph/shared'
import { useEffect, useMemo, useState } from 'react'
import { FileTree } from './components/file-tree/FileTree'
import { FileGraphCanvas } from './components/graph/FileGraphCanvas'
import { AppShell } from './components/layout/AppShell'
import { Toolbar } from './components/layout/Toolbar'
import { EmptyState } from './components/ui/empty-state'
import { WorkspaceForm } from './components/workspace/WorkspaceForm'
import { api } from './lib/api'

function App() {
  const [workspace, setWorkspace] = useState<Workspace | null>(null)
  const [tree, setTree] = useState<TreeResponse | null>(null)
  const [graph, setGraph] = useState<GraphResponse | null>(null)
  const [scan, setScan] = useState<ScanSession | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [relationshipChain, setRelationshipChain] = useState<Set<string>>(new Set())
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.listWorkspaces().then((workspaces) => {
      if (workspaces[0]) setWorkspace(workspaces[0])
    }).catch(() => undefined)
  }, [])

  useEffect(() => {
    if (!workspace) return
    refreshData(workspace.id).catch((refreshError: unknown) => {
      setError(refreshError instanceof Error ? refreshError.message : String(refreshError))
    })
  }, [workspace])

  async function refreshData(workspaceId: string) {
    const [nextTree, nextGraph] = await Promise.all([api.getTree(workspaceId), api.getGraph(workspaceId)])
    setTree(nextTree)
    setGraph(nextGraph)
  }

  async function handleWorkspace(rootPath: string) {
    setLoading(true)
    setError(null)
    try {
      const nextWorkspace = await api.createWorkspace({ rootPath })
      setWorkspace(nextWorkspace)
      const nextScan = await api.scanWorkspace(nextWorkspace.id)
      setScan(nextScan.scan)
      await refreshData(nextWorkspace.id)
    } catch (workspaceError) {
      setError(workspaceError instanceof Error ? workspaceError.message : String(workspaceError))
    } finally {
      setLoading(false)
    }
  }

  async function handleRescan() {
    if (!workspace) return
    setLoading(true)
    setError(null)
    try {
      const nextScan = await api.scanWorkspace(workspace.id)
      setScan(nextScan.scan)
      await refreshData(workspace.id)
    } catch (scanError) {
      setError(scanError instanceof Error ? scanError.message : String(scanError))
    } finally {
      setLoading(false)
    }
  }

  function selectFromTree(node: FileTreeNode) {
    setSelectedId(node.id)
    if (workspace) void api.setSelection(workspace.id, node.id, 'tree')
  }

  function selectFromGraph(id: string) {
    setSelectedId(id)
    if (workspace) void api.setSelection(workspace.id, id, 'graph')
  }

  function handleToggleFolder(id: string) {
    setExpandedFolders((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // Compute relationship chain when selection or graph changes
  useEffect(() => {
    if (!selectedId || !graph) {
      setRelationshipChain(new Set())
      return
    }
    const chain = new Set<string>()
    const visited = new Set<string>()
    const queue = [selectedId]
    while (queue.length > 0) {
      const current = queue.shift()!
      if (visited.has(current)) continue
      visited.add(current)
      chain.add(current)
      for (const edge of graph.edges) {
        if (edge.source === current && !visited.has(edge.target)) queue.push(edge.target)
        if (edge.target === current && !visited.has(edge.source)) queue.push(edge.source)
      }
    }
    setRelationshipChain(chain)
  }, [selectedId, graph])


  return (
    <div className="app">
      <Toolbar workspace={workspace} scan={scan} loading={loading} onRescan={handleRescan} />
      <WorkspaceForm loading={loading} onSubmit={handleWorkspace} />
      {error ? <div className="error-banner">{error}</div> : null}
      <AppShell
        sidebar={workspace ? <FileTree root={tree?.root ?? null} selectedId={selectedId} onSelect={selectFromTree} relationshipChain={relationshipChain} expanded={expandedFolders} onToggle={handleToggleFolder} /> : <EmptyState title="No folder selected" description="Enter an absolute local path to start exploring." />}
        canvas={<FileGraphCanvas graph={graph} selectedId={selectedId} onSelect={selectFromGraph} />}
      />
    </div>
  )
}

export default App
