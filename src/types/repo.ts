export type RepoStatus = 'indexed' | 'indexing' | 'pending' | 'error' | 'unknown'

export interface Repo {
  id: string
  name: string
  author: string
  project: string
  branch: string
  status: RepoStatus
  chunksIndexed: number
  lastIndexed: string | null
  error: string | null
  autoReindex: boolean
}

export interface RepoStats {
  totalRepos: number
  indexedRepos: number
  totalChunks: number
  activeJobs: number
}

export interface AddRepoPayload {
  url: string
  branch: string
  autoReindex: boolean
}
