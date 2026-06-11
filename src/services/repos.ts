import type { AddRepoPayload, Repo, RepoStats } from '../types/repo'
import { request } from './http'

export const reposService = {
  list: () => request<Repo[]>('/api/repos'),
  add: (payload: AddRepoPayload) =>
    request<Repo>('/api/repos', { method: 'POST', body: JSON.stringify(payload) }),
  reindex: (id: string) =>
    request<{ status: string }>(`/api/repos/${id}/reindex`, { method: 'POST' }),
  delete: (id: string) => request<void>(`/api/repos/${id}`, { method: 'DELETE' }),
  stats: () => request<RepoStats>('/api/stats'),
}
