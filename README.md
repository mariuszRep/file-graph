# File Graph

File Graph is a local-only browser app for exploring a filesystem/project as a graph. It pairs a file tree on the left with a React Flow canvas on the right, backed by a local Node API and SQLite database.

## Architecture

- `apps/web`: Vite, React, React Flow UI
- `apps/server`: local Node/Express API for filesystem scanning and SQLite persistence
- `packages/shared`: shared TypeScript schemas, entities, API DTOs, tree/graph contracts

The frontend never scans the filesystem directly. It calls the local API under `/api`, and Vite proxies those requests to `http://localhost:4317` during development.

## Run locally

```bash
npm install
npm run dev
```

Then open the Vite URL, usually `http://localhost:5173`.

## MVP flow

1. Enter an absolute local folder path.
2. File Graph registers the workspace and scans it.
3. Scan results are stored in `.file-graph/file-graph.sqlite`.
4. The file tree renders folders/files.
5. The graph renders file/folder nodes and containment edges.
6. Selecting a tree item focuses/highlights the graph node. Selecting a graph node updates selection state.

## Default ignored folders

`.git`, `node_modules`, `dist`, `build`, `.next`, `coverage`, `.turbo`, `.cache`.

## Current limitations

- Scans are full deterministic scans, not incremental.
- Graph relationships are hierarchy-only in the MVP.
- Large repositories are capped by `FILE_GRAPH_MAX_NODES` with a default of `2500`.
- There is no desktop shell yet. The app runs as a local web server plus browser UI.
