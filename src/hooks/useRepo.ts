import { useQuery, useQueryClient, type UseQueryResult } from '@tanstack/react-query'
import { reposService } from '../services'
import type { Repo } from '../types'
import { REPOS_KEY } from './useRepos'

export function useRepo(id: string | undefined): UseQueryResult<Repo> {
  const queryClient = useQueryClient()

  return useQuery<Repo>({
    queryKey: ['repos', id],
    queryFn: () => reposService.get(id!),
    enabled: !!id,
    initialData: () => {
      const cached = queryClient.getQueryData<Repo[]>(REPOS_KEY)
      return cached?.find((r) => r.id === id)
    },
    initialDataUpdatedAt: () =>
      queryClient.getQueryState(REPOS_KEY)?.dataUpdatedAt,
  })
}
