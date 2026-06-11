import { useMemo, useState } from 'react'
import {
  RiCheckLine,
  RiCloseCircleLine,
  RiInboxLine,
  RiLoader4Line,
  RiRadioButtonLine,
  RiRefreshLine,
} from 'react-icons/ri'
import { JobCard } from '../components/JobCard'
import { JobCardSkeleton } from '../components/Skeleton'
import { useJobs } from '../hooks/useJobs'
import type { JobStatus } from '../types'

type Filter = JobStatus | 'all'

const FILTERS: { key: Filter; label: string; icon?: React.ReactNode }[] = [
  { key: 'all',     label: 'All' },
  { key: 'running', label: 'Running', icon: <RiLoader4Line className="animate-spin" /> },
  { key: 'done',    label: 'Done',    icon: <RiCheckLine /> },
  { key: 'failed',  label: 'Failed',  icon: <RiCloseCircleLine /> },
  { key: 'pending', label: 'Pending', icon: <RiRadioButtonLine /> },
]

export function JobsPage() {
  const { jobs, loading, error, refresh } = useJobs()
  const [filter, setFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    return jobs.filter((j) => {
      const matchFilter = filter === 'all' || j.status === filter
      const matchSearch =
        !search ||
        j.repo.toLowerCase().includes(search.toLowerCase()) ||
        j.description.toLowerCase().includes(search.toLowerCase())
      return matchFilter && matchSearch
    })
  }, [jobs, filter, search])

  const runningCount = jobs.filter((j) => j.status === 'running').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Jobs</h1>
          <p className="mt-0.5 text-sm text-zinc-500">
            Live investigation and fix pipeline runs.
            {runningCount > 0 && (
              <span className="ml-2 inline-flex items-center gap-1 font-medium text-blue-600">
                <RiLoader4Line className="animate-spin" /> {runningCount} running
              </span>
            )}
          </p>
        </div>
        <button
          onClick={refresh}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-400 transition-colors hover:bg-white hover:text-zinc-600"
          title="Refresh"
        >
          <RiRefreshLine className="text-base" />
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex gap-1 rounded-lg border border-zinc-200 bg-white p-1">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === f.key
                  ? 'bg-zinc-900 text-white'
                  : 'text-zinc-500 hover:text-zinc-700'
              }`}
            >
              {f.icon}
              {f.label}
              {f.key !== 'all' && (
                <span className={`ml-0.5 ${filter === f.key ? 'text-zinc-300' : 'text-zinc-400'}`}>
                  {jobs.filter((j) => j.status === f.key).length}
                </span>
              )}
            </button>
          ))}
        </div>

        <input
          type="search"
          placeholder="Search jobs…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs flex-1 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm outline-none focus:border-zinc-400"
        />
      </div>

      {loading && (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <JobCardSkeleton key={i} />
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <RiInboxLine className="mb-3 text-5xl text-zinc-300" />
          <h3 className="font-semibold text-zinc-700">
            {filter !== 'all' || search ? 'No jobs match your filter' : 'No jobs yet'}
          </h3>
          <p className="mt-1 text-sm text-zinc-400">
            Mention{' '}
            <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-zinc-600">
              @Zenfix repo:owner/repo &lt;bug&gt;
            </code>{' '}
            in Teams to start one.
          </p>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="space-y-4">
          {filtered.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  )
}
