import type Database from 'better-sqlite3'

export function applySchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS workspaces (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      root_path TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS scan_sessions (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
      status TEXT NOT NULL,
      started_at TEXT NOT NULL,
      completed_at TEXT,
      file_count INTEGER NOT NULL DEFAULT 0,
      directory_count INTEGER NOT NULL DEFAULT 0,
      error TEXT
    );

    CREATE TABLE IF NOT EXISTS file_nodes (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
      parent_id TEXT REFERENCES file_nodes(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      relative_path TEXT NOT NULL,
      absolute_path TEXT NOT NULL,
      kind TEXT NOT NULL,
      size INTEGER,
      depth INTEGER NOT NULL,
      modified_at TEXT,
      UNIQUE(workspace_id, relative_path)
    );

    CREATE TABLE IF NOT EXISTS relationships (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
      source_id TEXT NOT NULL REFERENCES file_nodes(id) ON DELETE CASCADE,
      target_id TEXT NOT NULL REFERENCES file_nodes(id) ON DELETE CASCADE,
      kind TEXT NOT NULL,
      UNIQUE(workspace_id, source_id, target_id, kind)
    );

    CREATE TABLE IF NOT EXISTS selections (
      workspace_id TEXT PRIMARY KEY REFERENCES workspaces(id) ON DELETE CASCADE,
      file_node_id TEXT REFERENCES file_nodes(id) ON DELETE SET NULL,
      source TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `)
}
