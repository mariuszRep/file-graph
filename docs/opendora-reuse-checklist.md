# OpenDora reuse checklist

- File tree UX: adapted folder-first sorting, compact rows, expand/collapse, selected state, empty/error states.
- Sidebar shell: adapted left-panel layout and refresh/open flow from dashboard shell.
- React Flow behavior: adapted provider boundary, graph DTO mapping, fit-view selection behavior, and floating controls.
- Handles and edges: adapted explicit source/target handle IDs and custom animated edge treatment from OpenDora workflow edges.
- Canvas zoom and sidemap: adapted OpenDora zoom bar and minimap/sidemap conventions for the File Graph canvas.
- Node presentation: adapted card-like node surface with semantic title/path/meta sections.
- Boundary rule: no OpenDora internal imports. Patterns were copied into File Graph-local components.
