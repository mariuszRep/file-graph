import { z } from 'zod'
import { fileNodeSchema } from './entities'

export const fileTreeNodeSchema: z.ZodType<FileTreeNode> = fileNodeSchema.extend({
  children: z.lazy(() => fileTreeNodeSchema.array()),
})

export type FileTreeNode = z.infer<typeof fileNodeSchema> & {
  children: FileTreeNode[]
}

export const treeResponseSchema = z.object({
  workspaceId: z.string(),
  root: fileTreeNodeSchema.nullable(),
})
export type TreeResponse = z.infer<typeof treeResponseSchema>
