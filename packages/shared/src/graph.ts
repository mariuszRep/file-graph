import { z } from 'zod'
import { fileKindSchema, relationshipKindSchema } from './entities'

export const graphNodeSchema = z.object({
  id: z.string(),
  fileNodeId: z.string(),
  label: z.string(),
  path: z.string(),
  kind: fileKindSchema,
  depth: z.number().int().nonnegative(),
  relationshipCount: z.number().int().nonnegative(),
})
export type GraphNode = z.infer<typeof graphNodeSchema>

export const graphEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  kind: relationshipKindSchema,
  specifier: z.string().nullable(),
})
export type GraphEdge = z.infer<typeof graphEdgeSchema>

export const graphResponseSchema = z.object({
  workspaceId: z.string(),
  nodes: graphNodeSchema.array(),
  edges: graphEdgeSchema.array(),
})
export type GraphResponse = z.infer<typeof graphResponseSchema>
