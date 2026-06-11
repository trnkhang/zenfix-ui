import { useMemo, useState } from 'react'
import { JobCard } from '../components/JobCard'
import { useJobs } from '../hooks/useJobs'
import type { JobStatus } from '../lib/api'

type Filter = JobStatus | 'all'

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'running', label: '⟳ Running' },
  { key: 'done', label: '✓ Done' },
  { key: 'failed', label: '✗ Failed' },
  { key: 'pending', label: '○ Pending' },
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
          <h1 className="text-2xl font-bold text-slate-800">Jobs</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Live investigation and fix pipeline runs.
            {runningCount > 0 && (
              <span className="ml-2 inline-flex items-center gap-1 font-medium text-blue-600">
                <span className="animate-pulse">●</span> {runningCount} running
              </span>
            )}
          </p>
        </div>
        <button
          onClick={refresh}
          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          title="Refresh"
        >
          ↻
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === f.key
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {f.label}
              {f.key !== 'all' && (
                <span className="ml-1 text-slate-400">
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
          className="max-w-xs flex-1 rounded-xl border border-slate-200 px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <span className="mr-3 animate-spin text-2xl">⟳</span> Loading…
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
          ⚠️ {error}
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 text-5xl">📭</div>
          <h3 className="font-semibold text-slate-700">
            {filter !== 'all' || search ? 'No jobs match your filter' : 'No jobs yet'}
          </h3>
          <p className="mt-1 text-sm text-slate-400">
            Mention{' '}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-600">
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
