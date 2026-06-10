import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { api, type Job } from '../lib/api'

export const JOBS_KEY = ['jobs'] as const

export function useJobs() {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: JOBS_KEY,
    queryFn: api.jobs.list,
  })

  useEffect(() => {
    const es = api.jobStream()

    es.addEventListener('job_update', (e: MessageEvent<string>) => {
      try {
        const updated: Job = JSON.parse(e.data)
        queryClient.setQueryData<Job[]>(JOBS_KEY, (prev) => {
          if (!prev) return [updated]
          const idx = prev.findIndex((j) => j.id === updated.id)
          if (idx === -1) return [updated, ...prev]
          const next = [...prev]
          next[idx] = updated
          return next
        })
      } catch {
        return
      }
    })

    return () => es.close()
  }, [queryClient])

  return {
    jobs: query.data ?? [],
    loading: query.isLoading,
    error: query.error?.message ?? null,
    refresh: () => queryClient.invalidateQueries({ queryKey: JOBS_KEY }),
  }
}
