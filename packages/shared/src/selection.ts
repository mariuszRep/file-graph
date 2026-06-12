import { z } from 'zod'

export const selectionStateSchema = z.object({
  workspaceId: z.string(),
  fileNodeId: z.string().nullable(),
  source: z.enum(['tree', 'graph', 'system']),
  updatedAt: z.string(),
})
export type SelectionState = z.infer<typeof selectionStateSchema>

export const updateSelectionRequestSchema = z.object({
  fileNodeId: z.string().nullable(),
  source: z.enum(['tree', 'graph', 'system']).default('system'),
})
export type UpdateSelectionRequest = z.infer<typeof updateSelectionRequestSchema>
