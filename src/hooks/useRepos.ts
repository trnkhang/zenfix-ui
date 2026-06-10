import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, type AddRepoPayload, type Repo } from '../lib/api'

export const REPOS_KEY = ['repos'] as const
export const STATS_KEY = ['stats'] as const

export function useRepos() {
  const queryClient = useQueryClient()

  const reposQuery = useQuery({
    queryKey: REPOS_KEY,
    queryFn: api.repos.list,
    // Keep polling while any repo is actively being indexed
    refetchInterval: (query) => {
      const repos = query.state.data ?? []
      return repos.some((r) => r.status === 'indexing' || r.status === 'pending') ? 5_000 : false
    },
  })

  const statsQuery = useQuery({
    queryKey: STATS_KEY,
    queryFn: api.stats,
    refetchInterval: 15_000,
  })

  const addMutation = useMutation({
    mutationFn: (payload: AddRepoPayload) => api.repos.add(payload),
    onSuccess: (newRepo) => {
      queryClient.setQueryData<Repo[]>(REPOS_KEY, (prev) => [newRepo, ...(prev ?? [])])
      void queryClient.invalidateQueries({ queryKey: STATS_KEY })
    },
  })

  const reindexMutation = useMutation({
    mutationFn: (id: string) => api.repos.reindex(id),
    onMutate: (id) => {
      queryClient.setQueryData<Repo[]>(REPOS_KEY, (prev) =>
        prev?.map((r) => (r.id === id ? { ...r, status: 'pending' as const } : r)) ?? [],
      )
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: REPOS_KEY })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.repos.delete(id),
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
    reindex: (id: string) => reindexMutation.mutate(id),
    removeRepo: (id: string) => deleteMutation.mutate(id),
    refresh: () => queryClient.invalidateQueries({ queryKey: REPOS_KEY }),
  }
}
