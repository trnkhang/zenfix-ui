import type { Job } from '../types/job'
import { BASE, request } from './http'

export interface CreateJobBody {
  repo: string
  description: string
  error_message?: string
  stack_trace?: string
  severity?: string
}

export const jobsService = {
  list: () => request<Job[]>('/api/jobs'),
  get: (id: string) => request<Job>(`/api/jobs/${id}`),
  create: (body: CreateJobBody) => request<Job>('/api/jobs', { method: 'POST', body: JSON.stringify(body) }),
  stream: (): EventSource => new EventSource(`${BASE}/api/jobs/stream`),
}
