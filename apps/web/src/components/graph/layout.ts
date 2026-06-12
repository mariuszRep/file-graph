export type LayoutEdge = { source: string; target: string }
export type Point = { x: number; y: number }

// Spacing is tuned for the node card size (~280x110) so cards don't overlap.
const K = 320
const ITERATIONS = 400
const GRAVITY = 0.02
const MIN_DIST = 1

/**
 * Deterministic force-directed layout (canonical Fruchterman-Reingold).
 * Each iteration computes a fresh displacement (no momentum carryover) and
 * clamps it by a cooling "temperature" so the simulation always converges.
 */
export function forceDirectedLayout(nodeIds: string[], edges: LayoutEdge[]): Map<string, Point> {
  const count = nodeIds.length
  const result = new Map<string, Point>()
  if (count === 0) return result

  const pos = new Map<string, Point>()
  // Deterministic initial placement on a circle so layouts are stable across renders.
  const radius = Math.max(400, count * 30)
  nodeIds.forEach((id, index) => {
    const angle = (index / count) * Math.PI * 2
    pos.set(id, { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius })
  })

  const validEdges = edges.filter((edge) => pos.has(edge.source) && pos.has(edge.target))
  const disp = new Map<string, Point>()
  let temperature = radius

  for (let iteration = 0; iteration < ITERATIONS; iteration++) {
    nodeIds.forEach((id) => disp.set(id, { x: 0, y: 0 }))

    // Repulsion between every pair of nodes: force = K^2 / dist.
    for (let i = 0; i < count; i++) {
      const a = pos.get(nodeIds[i])!
      const da = disp.get(nodeIds[i])!
      for (let j = i + 1; j < count; j++) {
        const b = pos.get(nodeIds[j])!
        let dx = a.x - b.x
        let dy = a.y - b.y
        let dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < MIN_DIST) {
          // Deterministic nudge for coincident nodes.
          dx = (i - j) || 1
          dy = (j - i) || 1
          dist = Math.sqrt(dx * dx + dy * dy)
        }
        const force = (K * K) / dist
        const ux = (dx / dist) * force
        const uy = (dy / dist) * force
        da.x += ux
        da.y += uy
        const db = disp.get(nodeIds[j])!
        db.x -= ux
        db.y -= uy
      }
    }

    // Attraction along edges: force = dist^2 / K.
    for (const edge of validEdges) {
      const a = pos.get(edge.source)!
      const b = pos.get(edge.target)!
      const dx = a.x - b.x
      const dy = a.y - b.y
      const dist = Math.max(Math.sqrt(dx * dx + dy * dy), MIN_DIST)
      const force = (dist * dist) / K
      const ux = (dx / dist) * force
      const uy = (dy / dist) * force
      const da = disp.get(edge.source)!
      const db = disp.get(edge.target)!
      da.x -= ux
      da.y -= uy
      db.x += ux
      db.y += uy
    }

    // Apply displacement, clamped to the current temperature, plus gentle gravity.
    for (const id of nodeIds) {
      const p = pos.get(id)!
      const d = disp.get(id)!
      const len = Math.sqrt(d.x * d.x + d.y * d.y) || 1
      const step = Math.min(len, temperature)
      p.x += (d.x / len) * step - p.x * GRAVITY
      p.y += (d.y / len) * step - p.y * GRAVITY
    }

    // Cool down linearly so movement settles.
    temperature = Math.max(temperature - radius / ITERATIONS, 1)
  }

  for (const id of nodeIds) {
    const p = pos.get(id)!
    // Safety guard against any non-finite coordinate.
    result.set(id, {
      x: Number.isFinite(p.x) ? p.x : 0,
      y: Number.isFinite(p.y) ? p.y : 0,
    })
  }
  return result
}
