import { z } from 'zod'
import { workspaceSchema, scanSessionSchema } from './entities'
import { graphResponseSchema } from './graph'
import { selectionStateSchema, updateSelectionRequestSchema } from './selection'
import { treeResponseSchema } from './tree'

export const createWorkspaceRequestSchema = z.object({
  rootPath: z.string().min(1),
})
export type CreateWorkspaceRequest = z.infer<typeof createWorkspaceRequestSchema>

export const workspaceResponseSchema = z.object({ workspace: workspaceSchema })
export type WorkspaceResponse = z.infer<typeof workspaceResponseSchema>

export const workspacesResponseSchema = z.object({ workspaces: workspaceSchema.array() })
export type WorkspacesResponse = z.infer<typeof workspacesResponseSchema>

export const scanResponseSchema = z.object({ scan: scanSessionSchema })
export type ScanResponse = z.infer<typeof scanResponseSchema>

export const healthResponseSchema = z.object({ ok: z.boolean(), service: z.literal('file-graph') })
export type HealthResponse = z.infer<typeof healthResponseSchema>

export const apiSchemas = {
  createWorkspaceRequest: createWorkspaceRequestSchema,
  updateSelectionRequest: updateSelectionRequestSchema,
  healthResponse: healthResponseSchema,
  workspaceResponse: workspaceResponseSchema,
  workspacesResponse: workspacesResponseSchema,
  scanResponse: scanResponseSchema,
  treeResponse: treeResponseSchema,
  graphResponse: graphResponseSchema,
  selectionResponse: selectionStateSchema,
}
