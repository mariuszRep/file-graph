import cors from 'cors'
import express from 'express'
import { registerGraphRoutes } from './routes/graph'
import { registerHealthRoutes } from './routes/health'
import { registerSelectionRoutes } from './routes/selection'
import { registerTreeRoutes } from './routes/tree'
import { registerWorkspaceRoutes } from './routes/workspaces'

export function createServer() {
  const app = express()
  const router = express.Router()

  app.use(cors())
  app.use(express.json({ limit: '1mb' }))

  registerHealthRoutes(router)
  registerWorkspaceRoutes(router)
  registerTreeRoutes(router)
  registerGraphRoutes(router)
  registerSelectionRoutes(router)

  app.use('/api', router)
  return app
}
