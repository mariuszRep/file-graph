import type { Router } from 'express'
import { updateSelectionRequestSchema } from '@file-graph/shared'
import { selectionRepository, workspaceRepository } from '../db/repositories'
import { sendError } from '../errors'

export function registerSelectionRoutes(router: Router) {
  router.get('/workspaces/:id/selection', (request, response) => {
    const workspace = workspaceRepository.get(request.params.id)
    if (!workspace) return sendError(response, 404, 'workspace_not_found', 'Workspace was not found')
    response.json(selectionRepository.get(workspace.id))
  })

  router.patch('/workspaces/:id/selection', (request, response) => {
    const workspace = workspaceRepository.get(request.params.id)
    if (!workspace) return sendError(response, 404, 'workspace_not_found', 'Workspace was not found')
    const parsed = updateSelectionRequestSchema.safeParse(request.body)
    if (!parsed.success) return sendError(response, 400, 'invalid_selection', 'Selection payload is invalid', parsed.error.flatten())
    response.json(selectionRepository.set(workspace.id, parsed.data.fileNodeId, parsed.data.source))
  })
}
