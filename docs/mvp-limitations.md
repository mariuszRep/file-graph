# MVP limitations

- Full scans only. Incremental indexing and file watchers are deferred.
- Relationship inference covers local JavaScript/TypeScript imports and re-exports. Package dependencies, aliases/tsconfig paths, and symbol-level references are deferred.
- Graph layout is deterministic and simple. Clustering, advanced layout engines, filtering, and minimap polish are deferred.
- Workspace opening uses an absolute path input because browser-only folder scanning is not available to the frontend.
- SQLite is local to `.file-graph/file-graph.sqlite` and has no migration versioning beyond MVP bootstrap DDL.
