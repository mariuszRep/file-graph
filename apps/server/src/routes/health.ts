import type { Router } from 'express'

export function registerHealthRoutes(router: Router) {
  router.get('/health', (_request, response) => {
    response.json({ ok: true, service: 'file-graph' })
  })
}
