import type { Router } from 'express'
import { graphRepository, workspaceRepository } from '../db/repositories'
import { sendError } from '../errors'
import { buildGraph } from '../graph/buildGraph'

export function registerGraphRoutes(router: Router) {
  router.get('/workspaces/:id/graph', (request, response) => {
    const workspace = workspaceRepository.get(request.params.id)
    if (!workspace) return sendError(response, 404, 'workspace_not_found', 'Workspace was not found')
    response.json(buildGraph(workspace.id, graphRepository.nodes(workspace.id), graphRepository.relationships(workspace.id)))
  })
}
