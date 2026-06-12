import { randomUUID } from 'node:crypto'
import { readdirSync, statSync } from 'node:fs'
import { basename, join, relative, resolve } from 'node:path'
import type { FileNode, Relationship, Workspace } from '@file-graph/shared'
import { shouldIgnorePath } from './ignoreRules'
import { buildCodeRelationships } from './codeRelationships'

type ScanResult = {
  nodes: FileNode[]
  relationships: Relationship[]
  fileCount: number
  directoryCount: number
}

const maxNodes = Number(process.env.FILE_GRAPH_MAX_NODES ?? 2500)

function toIso(mtimeMs: number) {
  return new Date(mtimeMs).toISOString()
}

export function scanWorkspace(workspace: Workspace): ScanResult {
  const rootPath = resolve(workspace.rootPath)
  const rootStat = statSync(rootPath)
  if (!rootStat.isDirectory()) throw new Error('Workspace root must be a directory')

  const nodes: FileNode[] = []
  let fileCount = 0
  let directoryCount = 0

  function visit(absolutePath: string, parentId: string | null, depth: number): string {
    if (nodes.length >= maxNodes) throw new Error(`Scan limit reached at ${maxNodes} nodes. Add ignore rules or scan a smaller folder.`)
    const stats = statSync(absolutePath)
    const kind = stats.isDirectory() ? 'directory' : 'file'
    const relativePath = relative(rootPath, absolutePath) || '.'
    const id = randomUUID()
    nodes.push({
      id,
      workspaceId: workspace.id,
      parentId,
      name: relativePath === '.' ? workspace.name : basename(absolutePath),
      relativePath,
      absolutePath,
      kind,
      size: kind === 'file' ? stats.size : null,
      depth,
      modifiedAt: toIso(stats.mtimeMs),
    })
    if (kind === 'file') fileCount += 1
    if (kind === 'directory') {
      directoryCount += 1
      const entries = readdirSync(absolutePath, { withFileTypes: true })
        .filter((entry) => !shouldIgnorePath(entry.name))
        .filter((entry) => entry.isDirectory() || entry.isFile())
        .sort((a, b) => {
          if (a.isDirectory() !== b.isDirectory()) return a.isDirectory() ? -1 : 1
          return a.name.localeCompare(b.name)
        })
      for (const entry of entries) visit(join(absolutePath, entry.name), id, depth + 1)
    }
    return id
  }

  visit(rootPath, null, 0)
  const relationships: Relationship[] = buildCodeRelationships(workspace, nodes)
  return { nodes, relationships, fileCount, directoryCount }
}
