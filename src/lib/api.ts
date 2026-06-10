const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

// ── Types ────────────────────────────────────────────────────────────────────

export type RepoStatus = 'indexed' | 'indexing' | 'pending' | 'error' | 'unknown'

export interface Repo {
  id: string
  name: string          // owner/repo
  branch: string
  status: RepoStatus
  chunksIndexed: number
  lastIndexed: string | null
  error: string | null
  autoReindex: boolean
}

export type JobStatus = 'pending' | 'running' | 'done' | 'failed'

export interface JobStep {
  name: string
  status: 'pending' | 'running' | 'done' | 'failed'
  detail?: string
  startedAt?: string
  completedAt?: string
}

export interface Job {
  id: string
  repo: string
  description: string
  severity: string
  status: JobStatus
  steps: JobStep[]
  createdAt: string
  completedAt?: string
  result?: {
    summary?: string
    jiraKey?: string
    jiraUrl?: string
    prNumber?: number
    prUrl?: string
    isComplex?: boolean
  }
}

export interface RepoStats {
  totalRepos: number
  indexedRepos: number
  totalChunks: number
  activeJobs: number
}

export interface AddRepoPayload {
  name: string
  branch: string
  autoReindex: boolean
}

// ── Helpers ──────────────────────────────────────────────────────────────────

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`${res.status} ${res.statusText}: ${text}`)
  }
  return res.json() as Promise<T>
}

// ── Repos ────────────────────────────────────────────────────────────────────

export const api = {
  repos: {
    list: () => request<Repo[]>('/api/repos'),
    add: (payload: AddRepoPayload) =>
      request<Repo>('/api/repos', { method: 'POST', body: JSON.stringify(payload) }),
    reindex: (id: string) =>
      request<{ status: string }>(`/api/repos/${id}/reindex`, { method: 'POST' }),
    delete: (id: string) =>
      request<void>(`/api/repos/${id}`, { method: 'DELETE' }),
  },

  jobs: {
    list: () => request<Job[]>('/api/jobs'),
    get: (id: string) => request<Job>(`/api/jobs/${id}`),
  },

  stats: () => request<RepoStats>('/api/stats'),

  /** Returns a native EventSource connected to the SSE job stream. */
  jobStream: (): EventSource => new EventSource(`${BASE}/api/jobs/stream`),
}
