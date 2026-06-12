import Database from 'better-sqlite3'
import { mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { applySchema } from './schema'

const here = dirname(fileURLToPath(import.meta.url))
const dataDir = join(here, '../../../../.file-graph')
const databasePath = process.env.FILE_GRAPH_DB ?? join(dataDir, 'file-graph.sqlite')

mkdirSync(dataDir, { recursive: true })

export const db = new Database(databasePath)
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')
applySchema(db)

export type Db = typeof db
