import type { Job } from '../types/job'
import { BASE, request } from './http'

export const jobsService = {
  list: () => request<Job[]>('/api/jobs'),
  get: (id: string) => request<Job>(`/api/jobs/${id}`),
  stream: (): EventSource => new EventSource(`${BASE}/api/jobs/stream`),
}
