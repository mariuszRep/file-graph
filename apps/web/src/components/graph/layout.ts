export type LayoutEdge = { source: string; target: string }
export type Point = { x: number; y: number }

// Column/row spacing tuned so node cards (~280x110) never overlap.
const COL_GAP = 420
const ROW_GAP = 150
const SWEEPS = 8

/**
 * Assign each node to a column (layer) using longest-path layering over the
 * dependency DAG. Source (parent) always lands left of its targets (children).
 * Cycles are tolerated: back edges simply don't push a node further right.
 */
function assignLayers(nodeIds: string[], edges: LayoutEdge[]): Map<string, number> {
  const succ = new Map<string, string[]>()
  const indegree = new Map<string, number>()
  nodeIds.forEach((id) => {
    succ.set(id, [])
    indegree.set(id, 0)
  })

  const dag = edges.filter((edge) => edge.source !== edge.target && succ.has(edge.source) && succ.has(edge.target))
  for (const edge of dag) {
    succ.get(edge.source)!.push(edge.target)
    indegree.set(edge.target, (indegree.get(edge.target) ?? 0) + 1)
  }

  // Kahn topological order; leftover (cyclic) nodes are appended in input order.
  const remaining = new Map(indegree)
  const queue = nodeIds.filter((id) => (remaining.get(id) ?? 0) === 0)
  const order: string[] = []
  const seen = new Set<string>()
  while (queue.length > 0) {
    const id = queue.shift()!
    if (seen.has(id)) continue
    seen.add(id)
    order.push(id)
    for (const next of succ.get(id)!) {
      remaining.set(next, (remaining.get(next) ?? 0) - 1)
      if ((remaining.get(next) ?? 0) <= 0 && !seen.has(next)) queue.push(next)
    }
  }
  for (const id of nodeIds) if (!seen.has(id)) order.push(id)

  // Longest-path layering in topological order.
  const layer = new Map<string, number>(nodeIds.map((id) => [id, 0]))
  for (const id of order) {
    const base = layer.get(id) ?? 0
    for (const next of succ.get(id)!) {
      if ((layer.get(next) ?? 0) < base + 1) layer.set(next, base + 1)
    }
  }
  return layer
}

/**
 * Left-to-right layered (Sugiyama-style) layout.
 * Files flow by dependency depth into columns, are ordered within each column
 * to reduce edge crossings, and are spaced so no two cards overlap.
 */
export function layeredLayout(nodeIds: string[], edges: LayoutEdge[]): Map<string, Point> {
  const result = new Map<string, Point>()
  if (nodeIds.length === 0) return result

  const layerOf = assignLayers(nodeIds, edges)
  const maxLayer = Math.max(0, ...nodeIds.map((id) => layerOf.get(id) ?? 0))

  // Bucket nodes into columns, preserving input order as the initial ordering.
  const columns: string[][] = Array.from({ length: maxLayer + 1 }, () => [])
  for (const id of nodeIds) columns[layerOf.get(id) ?? 0].push(id)

  // Build neighbour lists for crossing reduction.
  const preds = new Map<string, string[]>()
  const succs = new Map<string, string[]>()
  nodeIds.forEach((id) => {
    preds.set(id, [])
    succs.set(id, [])
  })
  for (const edge of edges) {
    if (edge.source === edge.target) continue
    if (preds.has(edge.target)) preds.get(edge.target)!.push(edge.source)
    if (succs.has(edge.source)) succs.get(edge.source)!.push(edge.target)
  }

  const indexOf = new Map<string, number>()
  const reindex = () => columns.forEach((col) => col.forEach((id, i) => indexOf.set(id, i)))
  reindex()

  const barycenter = (neighbours: string[]) => {
    const known = neighbours.filter((n) => indexOf.has(n))
    if (known.length === 0) return Number.NaN
    return known.reduce((sum, n) => sum + (indexOf.get(n) ?? 0), 0) / known.length
  }

  // Median/barycenter sweeps: alternately order each column by the average
  // position of its neighbours in the adjacent direction. This untangles edges.
  for (let sweep = 0; sweep < SWEEPS; sweep++) {
    const goingRight = sweep % 2 === 0
    if (goingRight) {
      for (let l = 1; l <= maxLayer; l++) {
        columns[l] = stableSortByBarycenter(columns[l], (id) => barycenter(preds.get(id)!))
        reindex()
      }
    } else {
      for (let l = maxLayer - 1; l >= 0; l--) {
        columns[l] = stableSortByBarycenter(columns[l], (id) => barycenter(succs.get(id)!))
        reindex()
      }
    }
  }

  // Assign coordinates: column -> x, ordered index -> y, each column centred.
  columns.forEach((col, l) => {
    const offset = -((col.length - 1) * ROW_GAP) / 2
    col.forEach((id, i) => {
      result.set(id, { x: l * COL_GAP, y: offset + i * ROW_GAP })
    })
  })
  return result
}

/** Stable sort by barycenter, keeping NaN-valued (no-neighbour) nodes in place. */
function stableSortByBarycenter(ids: string[], value: (id: string) => number): string[] {
  const decorated = ids.map((id, index) => ({ id, index, value: value(id) }))
  decorated.sort((a, b) => {
    if (Number.isNaN(a.value) && Number.isNaN(b.value)) return a.index - b.index
    if (Number.isNaN(a.value)) return a.index - b.index
    if (Number.isNaN(b.value)) return a.index - b.index
    return a.value - b.value || a.index - b.index
  })
  return decorated.map((entry) => entry.id)
}
