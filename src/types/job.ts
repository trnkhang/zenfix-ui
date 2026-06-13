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
    fixDirection?: string
    affectedFiles?: string[]
    confidence?: number
    investigationSteps?: string[]
    isComplex?: boolean
    error?: string
    jiraKey?: string
    jiraUrl?: string
    prNumber?: number
    prUrl?: string
    offendingCommit?: string
    commitMessage?: string
  }
}
