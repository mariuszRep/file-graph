import { existsSync, readFileSync, statSync } from 'node:fs'
import { dirname, extname, join, resolve } from 'node:path'
import { randomUUID } from 'node:crypto'
import type { FileNode, Relationship, Workspace } from '@file-graph/shared'

const codeExtensions = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.mts', '.cts'])
const resolvableExtensions = ['', '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.mts', '.cts', '.json']
const importPattern = /(?:import\s+(?:type\s+)?(?:[^'";]+?\s+from\s+)?|import\s*\(|export\s+(?:type\s+)?(?:[^'";]+?\s+from\s+|\*\s+from\s+))['"]([^'"]+)['"]/g

type ImportMatch = {
  kind: 'imports' | 'reexports'
  specifier: string
}

export function isCodeFile(node: FileNode) {
  return node.kind === 'file' && codeExtensions.has(extname(node.absolutePath))
}

function extractImports(source: string): ImportMatch[] {
  const matches: ImportMatch[] = []
  for (const match of source.matchAll(importPattern)) {
    const statement = match[0]
    const specifier = match[1]
    if (!specifier?.startsWith('.')) continue
    matches.push({ kind: statement.trimStart().startsWith('export') ? 'reexports' : 'imports', specifier })
  }
  return matches
}

function resolveCandidate(candidate: string): string | null {
  for (const extension of resolvableExtensions) {
    const withExtension = `${candidate}${extension}`
    if (existsSync(withExtension) && statSync(withExtension).isFile()) return resolve(withExtension)
  }
  if (existsSync(candidate) && statSync(candidate).isDirectory()) {
    for (const extension of resolvableExtensions.filter(Boolean)) {
      const indexCandidate = join(candidate, `index${extension}`)
      if (existsSync(indexCandidate) && statSync(indexCandidate).isFile()) return resolve(indexCandidate)
    }
  }
  return null
}

function resolveImport(sourcePath: string, specifier: string, rootPath: string): string | null {
  const resolved = resolveCandidate(resolve(dirname(sourcePath), specifier))
  if (!resolved) return null
  return resolved.startsWith(rootPath) ? resolved : null
}

export function buildCodeRelationships(workspace: Workspace, nodes: FileNode[]): Relationship[] {
  const rootPath = resolve(workspace.rootPath)
  const nodesByAbsolute = new Map(nodes.map((node) => [resolve(node.absolutePath), node]))
  const relationships = new Map<string, Relationship>()

  for (const sourceNode of nodes.filter(isCodeFile)) {
    const source = readFileSync(sourceNode.absolutePath, 'utf8')
    for (const match of extractImports(source)) {
      const targetPath = resolveImport(sourceNode.absolutePath, match.specifier, rootPath)
      if (!targetPath) continue
      const targetNode = nodesByAbsolute.get(targetPath)
      if (!targetNode || targetNode.id === sourceNode.id) continue
      const key = `${sourceNode.id}:${targetNode.id}:${match.kind}`
      if (!relationships.has(key)) {
        relationships.set(key, {
          id: randomUUID(),
          workspaceId: workspace.id,
          sourceId: sourceNode.id,
          targetId: targetNode.id,
          kind: match.kind,
          specifier: match.specifier,
        })
      }
    }
  }

  return [...relationships.values()]
}
