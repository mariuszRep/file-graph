import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import type { Router } from 'express'
import { createWorkspaceRequestSchema } from '@file-graph/shared'
import { graphRepository, scanRepository, workspaceRepository } from '../db/repositories'
import { sendError } from '../errors'
import { scanWorkspace } from '../scanner/scanWorkspace'

export function registerWorkspaceRoutes(router: Router) {
  router.get('/workspaces', (_request, response) => {
    response.json({ workspaces: workspaceRepository.all() })
  })

  router.post('/workspaces', (request, response) => {
    const parsed = createWorkspaceRequestSchema.safeParse(request.body)
    if (!parsed.success) return sendError(response, 400, 'invalid_workspace', 'Workspace path is required', parsed.error.flatten())
    const rootPath = resolve(parsed.data.rootPath)
    if (!existsSync(rootPath)) return sendError(response, 404, 'workspace_not_found', 'Workspace path does not exist')
    const workspace = workspaceRepository.upsert(rootPath)
    response.status(201).json({ workspace })
  })

  router.post('/workspaces/:id/scan', (request, response) => {
    const workspace = workspaceRepository.get(request.params.id)
    if (!workspace) return sendError(response, 404, 'workspace_not_found', 'Workspace was not found')
    const scan = scanRepository.start(workspace.id)
    try {
      const result = scanWorkspace(workspace)
      graphRepository.replaceWorkspaceGraph(workspace.id, result.nodes, result.relationships)
      response.json({ scan: scanRepository.complete(scan.id, result.fileCount, result.directoryCount) })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      response.status(500).json({ scan: scanRepository.fail(scan.id, message) })
    }
  })
}
