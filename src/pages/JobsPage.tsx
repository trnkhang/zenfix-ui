import { useMemo, useState } from 'react'
import {
  RiCheckboxCircleLine,
  RiCloseCircleLine,
  RiInboxLine,
  RiPlayCircleLine,
  RiRadioButtonLine,
  RiRefreshLine,
} from 'react-icons/ri'
import { Link } from 'react-router-dom'
import { JobCard } from '../components/JobCard'
import { JobCardSkeleton } from '../components/Skeleton'
import { useJobs } from '../hooks/useJobs'
import { useRepos } from '../hooks/useRepos'
import type { JobStatus } from '../types'

type Filter = JobStatus | 'all'

const FILTERS: { key: Filter; label: string; icon?: React.ReactNode }[] = [
  { key: 'all',     label: 'All' },
  { key: 'running', label: 'Running', icon: <RiPlayCircleLine className="text-amber-500" /> },
  { key: 'done',    label: 'Done',    icon: <RiCheckboxCircleLine className="text-emerald-500" /> },
  { key: 'failed',  label: 'Failed',  icon: <RiCloseCircleLine className="text-rose-500" /> },
  { key: 'pending', label: 'Pending', icon: <RiRadioButtonLine className="text-slate-400" /> },
]

export function JobsPage() {
  const { jobs, loading, error, refresh } = useJobs()
  const { repos } = useRepos()
  const repoIdByName = useMemo(
    () => Object.fromEntries(repos.map((r) => [r.name, r.id])),
    [repos],
  )
  const [filter, setFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    return jobs.filter((j) => {
      const matchFilter = filter === 'all' || j.status === filter
      const matchSearch = !search ||
        j.repo.toLowerCase().includes(search.toLowerCase()) ||
        j.description.toLowerCase().includes(search.toLowerCase())
      return matchFilter && matchSearch
    })
  }, [jobs, filter, search])

  const runningCount = jobs.filter((j) => j.status === 'running').length

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-on-background" style={{ fontFamily: 'Geist, Inter, sans-serif' }}>
            Investigations
          </h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            Live investigation and fix pipeline runs.
            {runningCount > 0 && (
              <span className="ml-2 inline-flex items-center gap-1 font-medium text-primary">
                <RiPlayCircleLine className="text-amber-500" /> {runningCount} running
              </span>
            )}
          </p>
        </div>
        <button
          onClick={refresh}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-outline-variant text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
          title="Refresh"
        >
          <RiRefreshLine />
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex gap-1 rounded-xl border border-outline-variant bg-surface-container-lowest p-1">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === f.key
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {f.icon}
              {f.label}
              {f.key !== 'all' && (
                <span className={`ml-0.5 ${filter === f.key ? 'text-on-primary/70' : 'text-outline'}`}>
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
          className="max-w-xs flex-1 rounded-xl border border-outline-variant bg-surface-container-lowest px-3 py-1.5 text-sm text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {loading && (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => <JobCardSkeleton key={i} />)}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-error-container bg-error-container px-4 py-3 text-sm text-on-error-container">
          {error}
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <RiInboxLine className="mb-3 text-5xl text-outline" />
          <h3 className="font-semibold text-on-surface">
            {filter !== 'all' || search ? 'No jobs match your filter' : 'No jobs yet'}
          </h3>
          <p className="mt-1 text-sm text-on-surface-variant">
            Describe a bug in{' '}
            <Link to="/chat" className="font-medium text-primary hover:underline">
              Chat
            </Link>{' '}
            to start one.
          </p>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="space-y-4">
          {filtered.map((job) => <JobCard key={job.id} job={job} repoId={repoIdByName[job.repo]} />)}
        </div>
      )}
    </div>
  )
}
