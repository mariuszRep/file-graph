import { createServer } from './server'

const port = Number(process.env.PORT ?? 4317)

createServer().listen(port, () => {
  console.log(`File Graph API listening on http://localhost:${port}`)
})
