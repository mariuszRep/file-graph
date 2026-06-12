# File Graph preflight

## VISION.md check

- `/mnt/fileshare/projects/file-graph/VISION.md`: absent at implementation start.
- Relevant parent product context found at `/mnt/fileshare/projects/opendora/VISION.md` for OpenDora reuse boundaries.
- Alignment: File Graph is a separate local app, not an OpenDora core module. Reuse should copy/adapt approved UI behavior and patterns rather than import OpenDora internals.

## OpenDora reuse sources inspected

- `opendora/apps/web/components/file-tree/file-tree-panel.tsx`: flat file-tree store, selected row state, folder-first sorting, loading/empty/error states.
- `opendora/apps/web/app/dashboard/dashboard-shell.tsx`: left sidebar tree placement, root path selector, refresh action, compact path labeling.
- `opendora/apps/web/components/workflow/workflow-editor.tsx`: React Flow provider boundary and DTO-to-React-Flow mapping pattern.
- `opendora/apps/web/components/react-flow/controls.tsx`: compact control styling over graph canvas.
- `opendora/apps/web/components/react-flow/node.tsx`: card-like graph node composition with semantic header/content sections.

## Implementation decision

Use Vite React frontend plus local Node API server with SQLite via better-sqlite3 and a shared TypeScript contract package.
