import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { reposService } from '../services'
import type { AddRepoPayload, Repo } from '../types'

export const REPOS_KEY = ['repos'] as const
export const STATS_KEY = ['stats'] as const

export function useRepos() {
  const queryClient = useQueryClient()

  const reposQuery = useQuery({
    queryKey: REPOS_KEY,
    queryFn: reposService.list,
  })

  const statsQuery = useQuery({
    queryKey: STATS_KEY,
    queryFn: reposService.stats,
  })

  const addMutation = useMutation({
    mutationFn: (payload: AddRepoPayload) => reposService.add(payload),
    onSuccess: (newRepo) => {
      queryClient.setQueryData<Repo[]>(REPOS_KEY, (prev) => [newRepo, ...(prev ?? [])])
      void queryClient.invalidateQueries({ queryKey: STATS_KEY })
    },
  })

  const reindexMutation = useMutation({
    mutationFn: (id: string) => reposService.reindex(id),
    onMutate: (id) => {
      queryClient.setQueryData<Repo[]>(
        REPOS_KEY,
        (prev) => prev?.map((r) => (r.id === id ? { ...r, status: 'pending' as const } : r)) ?? [],
      )
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: REPOS_KEY })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => reposService.delete(id),
    onSuccess: (_, id) => {
      queryClient.setQueryData<Repo[]>(REPOS_KEY, (prev) => prev?.filter((r) => r.id !== id) ?? [])
      void queryClient.invalidateQueries({ queryKey: STATS_KEY })
    },
  })

  return {
    repos: reposQuery.data ?? [],
    stats: statsQuery.data ?? null,
    loading: reposQuery.isLoading,
    error: reposQuery.error?.message ?? statsQuery.error?.message ?? null,
    isAdding: addMutation.isPending,
    addRepo: (payload: AddRepoPayload) => addMutation.mutateAsync(payload),
    reindex: (id: string) => reindexMutation.mutateAsync(id),
    removeRepo: (id: string) => deleteMutation.mutateAsync(id),
    refresh: () => queryClient.invalidateQueries({ queryKey: REPOS_KEY }),
  }
}
