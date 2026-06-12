import { randomUUID } from 'node:crypto'
import type { FileNode, Relationship, ScanSession, SelectionState, Workspace } from '@file-graph/shared'
import { db } from './connection'

type WorkspaceRow = { id: string; name: string; root_path: string; created_at: string; updated_at: string }
type FileNodeRow = { id: string; workspace_id: string; parent_id: string | null; name: string; relative_path: string; absolute_path: string; kind: 'file' | 'directory'; size: number | null; depth: number; modified_at: string | null }
type RelationshipRow = { id: string; workspace_id: string; source_id: string; target_id: string; kind: 'imports' | 'reexports' | 'selected'; specifier: string | null }
type ScanRow = { id: string; workspace_id: string; status: ScanSession['status']; started_at: string; completed_at: string | null; file_count: number; directory_count: number; error: string | null }

const now = () => new Date().toISOString()

function workspaceFromRow(row: WorkspaceRow): Workspace {
  return { id: row.id, name: row.name, rootPath: row.root_path, createdAt: row.created_at, updatedAt: row.updated_at }
}

function fileNodeFromRow(row: FileNodeRow): FileNode {
  return { id: row.id, workspaceId: row.workspace_id, parentId: row.parent_id, name: row.name, relativePath: row.relative_path, absolutePath: row.absolute_path, kind: row.kind, size: row.size, depth: row.depth, modifiedAt: row.modified_at }
}

function relationshipFromRow(row: RelationshipRow): Relationship {
  return { id: row.id, workspaceId: row.workspace_id, sourceId: row.source_id, targetId: row.target_id, kind: row.kind, specifier: row.specifier }
}

function scanFromRow(row: ScanRow): ScanSession {
  return { id: row.id, workspaceId: row.workspace_id, status: row.status, startedAt: row.started_at, completedAt: row.completed_at, fileCount: row.file_count, directoryCount: row.directory_count, error: row.error }
}

export const workspaceRepository = {
  all(): Workspace[] {
    return db.prepare('SELECT * FROM workspaces ORDER BY updated_at DESC').all().map((row) => workspaceFromRow(row as WorkspaceRow))
  },
  get(id: string): Workspace | undefined {
    const row = db.prepare('SELECT * FROM workspaces WHERE id = ?').get(id) as WorkspaceRow | undefined
    return row ? workspaceFromRow(row) : undefined
  },
  upsert(rootPath: string): Workspace {
    const existing = db.prepare('SELECT * FROM workspaces WHERE root_path = ?').get(rootPath) as WorkspaceRow | undefined
    if (existing) return workspaceFromRow(existing)
    const id = randomUUID()
    const timestamp = now()
    const name = rootPath.replace(/\/$/, '').split('/').filter(Boolean).pop() ?? rootPath
    db.prepare('INSERT INTO workspaces (id, name, root_path, created_at, updated_at) VALUES (?, ?, ?, ?, ?)').run(id, name, rootPath, timestamp, timestamp)
    return { id, name, rootPath, createdAt: timestamp, updatedAt: timestamp }
  },
}

export const scanRepository = {
  start(workspaceId: string): ScanSession {
    const scan: ScanSession = { id: randomUUID(), workspaceId, status: 'running', startedAt: now(), completedAt: null, fileCount: 0, directoryCount: 0, error: null }
    db.prepare('INSERT INTO scan_sessions (id, workspace_id, status, started_at, completed_at, file_count, directory_count, error) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(scan.id, scan.workspaceId, scan.status, scan.startedAt, scan.completedAt, scan.fileCount, scan.directoryCount, scan.error)
    return scan
  },
  complete(scanId: string, fileCount: number, directoryCount: number): ScanSession {
    db.prepare('UPDATE scan_sessions SET status = ?, completed_at = ?, file_count = ?, directory_count = ? WHERE id = ?').run('completed', now(), fileCount, directoryCount, scanId)
    return scanFromRow(db.prepare('SELECT * FROM scan_sessions WHERE id = ?').get(scanId) as ScanRow)
  },
  fail(scanId: string, error: string): ScanSession {
    db.prepare('UPDATE scan_sessions SET status = ?, completed_at = ?, error = ? WHERE id = ?').run('failed', now(), error, scanId)
    return scanFromRow(db.prepare('SELECT * FROM scan_sessions WHERE id = ?').get(scanId) as ScanRow)
  },
}

export const graphRepository = {
  replaceWorkspaceGraph(workspaceId: string, nodes: FileNode[], relationships: Relationship[]) {
    const replace = db.transaction(() => {
      db.prepare('DELETE FROM relationships WHERE workspace_id = ?').run(workspaceId)
      db.prepare('DELETE FROM file_nodes WHERE workspace_id = ?').run(workspaceId)
      const insertNode = db.prepare('INSERT INTO file_nodes (id, workspace_id, parent_id, name, relative_path, absolute_path, kind, size, depth, modified_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
      for (const node of nodes) insertNode.run(node.id, node.workspaceId, node.parentId, node.name, node.relativePath, node.absolutePath, node.kind, node.size, node.depth, node.modifiedAt)
      const insertRelationship = db.prepare('INSERT INTO relationships (id, workspace_id, source_id, target_id, kind, specifier) VALUES (?, ?, ?, ?, ?, ?)')
      for (const relationship of relationships) insertRelationship.run(relationship.id, relationship.workspaceId, relationship.sourceId, relationship.targetId, relationship.kind, relationship.specifier)
    })
    replace()
  },
  nodes(workspaceId: string): FileNode[] {
    return db.prepare('SELECT * FROM file_nodes WHERE workspace_id = ? ORDER BY depth, kind DESC, name COLLATE NOCASE').all(workspaceId).map((row) => fileNodeFromRow(row as FileNodeRow))
  },
  relationships(workspaceId: string): Relationship[] {
    return db.prepare('SELECT * FROM relationships WHERE workspace_id = ?').all(workspaceId).map((row) => relationshipFromRow(row as RelationshipRow))
  },
}

export const selectionRepository = {
  get(workspaceId: string): SelectionState {
    const row = db.prepare('SELECT * FROM selections WHERE workspace_id = ?').get(workspaceId) as { workspace_id: string; file_node_id: string | null; source: SelectionState['source']; updated_at: string } | undefined
    return row ? { workspaceId: row.workspace_id, fileNodeId: row.file_node_id, source: row.source, updatedAt: row.updated_at } : { workspaceId, fileNodeId: null, source: 'system', updatedAt: now() }
  },
  set(workspaceId: string, fileNodeId: string | null, source: SelectionState['source']): SelectionState {
    const updatedAt = now()
    db.prepare('INSERT INTO selections (workspace_id, file_node_id, source, updated_at) VALUES (?, ?, ?, ?) ON CONFLICT(workspace_id) DO UPDATE SET file_node_id = excluded.file_node_id, source = excluded.source, updated_at = excluded.updated_at').run(workspaceId, fileNodeId, source, updatedAt)
    return { workspaceId, fileNodeId, source, updatedAt }
  },
}
