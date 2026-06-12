import type { Router } from 'express'
import { graphRepository, workspaceRepository } from '../db/repositories'
import { sendError } from '../errors'
import { buildTree } from '../tree/buildTree'

export function registerTreeRoutes(router: Router) {
  router.get('/workspaces/:id/tree', (request, response) => {
    const workspace = workspaceRepository.get(request.params.id)
    if (!workspace) return sendError(response, 404, 'workspace_not_found', 'Workspace was not found')
    response.json(buildTree(workspace.id, graphRepository.nodes(workspace.id)))
  })
}
