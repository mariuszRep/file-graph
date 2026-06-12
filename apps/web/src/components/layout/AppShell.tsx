import type { ReactNode } from 'react'
import { Panel } from '../ui/panel'

type AppShellProps = {
  sidebar: ReactNode
  canvas: ReactNode
}

export function AppShell({ sidebar, canvas }: AppShellProps) {
  return (
    <main className="app-shell">
      <Panel className="sidebar-panel">{sidebar}</Panel>
      <Panel className="canvas-panel">{canvas}</Panel>
    </main>
  )
}
