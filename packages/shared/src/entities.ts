import { z } from 'zod'

export const fileKindSchema = z.enum(['file', 'directory'])
export type FileKind = z.infer<typeof fileKindSchema>

export const workspaceSchema = z.object({
  id: z.string(),
  name: z.string(),
  rootPath: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
})
export type Workspace = z.infer<typeof workspaceSchema>

export const scanStatusSchema = z.enum(['pending', 'running', 'completed', 'failed'])
export type ScanStatus = z.infer<typeof scanStatusSchema>

export const scanSessionSchema = z.object({
  id: z.string(),
  workspaceId: z.string(),
  status: scanStatusSchema,
  startedAt: z.string(),
  completedAt: z.string().nullable(),
  fileCount: z.number().int().nonnegative(),
  directoryCount: z.number().int().nonnegative(),
  error: z.string().nullable(),
})
export type ScanSession = z.infer<typeof scanSessionSchema>

export const fileNodeSchema = z.object({
  id: z.string(),
  workspaceId: z.string(),
  parentId: z.string().nullable(),
  name: z.string(),
  relativePath: z.string(),
  absolutePath: z.string(),
  kind: fileKindSchema,
  size: z.number().int().nonnegative().nullable(),
  depth: z.number().int().nonnegative(),
  modifiedAt: z.string().nullable(),
})
export type FileNode = z.infer<typeof fileNodeSchema>

export const relationshipKindSchema = z.enum(['contains', 'selected'])
export type RelationshipKind = z.infer<typeof relationshipKindSchema>

export const relationshipSchema = z.object({
  id: z.string(),
  workspaceId: z.string(),
  sourceId: z.string(),
  targetId: z.string(),
  kind: relationshipKindSchema,
})
export type Relationship = z.infer<typeof relationshipSchema>
