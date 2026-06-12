import type { CreateWorkspaceRequest, GraphResponse, ScanResponse, SelectionState, TreeResponse, Workspace, WorkspaceResponse, WorkspacesResponse } from '@file-graph/shared'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api${path}`, {
    ...init,
    headers: {
      'content-type': 'application/json',
      ...init?.headers,
    },
  })
  const data = await response.json().catch(() => null)
  if (!response.ok) {
    const message = data?.error?.message ?? `Request failed: ${response.status}`
    throw new Error(message)
  }
  return data as T
}

export const api = {
  async listWorkspaces(): Promise<Workspace[]> {
    const data = await request<WorkspacesResponse>('/workspaces')
    return data.workspaces
  },
  async createWorkspace(payload: CreateWorkspaceRequest): Promise<Workspace> {
    const data = await request<WorkspaceResponse>('/workspaces', { method: 'POST', body: JSON.stringify(payload) })
    return data.workspace
  },
  scanWorkspace(workspaceId: string): Promise<ScanResponse> {
    return request<ScanResponse>(`/workspaces/${workspaceId}/scan`, { method: 'POST' })
  },
  getTree(workspaceId: string): Promise<TreeResponse> {
    return request<TreeResponse>(`/workspaces/${workspaceId}/tree`)
  },
  getGraph(workspaceId: string): Promise<GraphResponse> {
    return request<GraphResponse>(`/workspaces/${workspaceId}/graph`)
  },
  setSelection(workspaceId: string, fileNodeId: string | null, source: SelectionState['source']): Promise<SelectionState> {
    return request<SelectionState>(`/workspaces/${workspaceId}/selection`, { method: 'PATCH', body: JSON.stringify({ fileNodeId, source }) })
  },
}
