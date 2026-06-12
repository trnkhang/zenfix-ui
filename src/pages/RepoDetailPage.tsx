import type React from 'react'
import {
  RiArrowLeftLine,
  RiCheckLine,
  RiExternalLinkLine,
  RiFlashlightLine,
  RiGitMergeLine,
  RiGitRepositoryLine,
  RiInboxLine,
  RiLoader4Line,
  RiTicket2Line,
} from 'react-icons/ri'
import { Link, useParams } from 'react-router-dom'
import { useRepo } from '../hooks/useRepo'
import { useJobs } from '../hooks/useJobs'
import type { Job, RepoStatus } from '../types'
import { formatDate, timeAgo } from '../lib/utils'

const STATUS_CONFIG: Record<RepoStatus, { label: string; badge: string; dot: string }> = {
  indexed:  { label: 'Indexed',  badge: 'bg-green-50 text-green-700 ring-green-200',                    dot: 'bg-green-500' },
  indexing: { label: 'Indexing', badge: 'bg-primary-fixed text-primary ring-primary-fixed-dim',         dot: 'bg-primary animate-pulse' },
  pending:  { label: 'Pending',  badge: 'bg-tertiary/10 text-tertiary ring-tertiary/30',                dot: 'bg-tertiary animate-pulse' },
  error:    { label: 'Error',    badge: 'bg-error-container text-on-error-container ring-error/20',     dot: 'bg-error' },
  unknown:  { label: 'Unknown',  badge: 'bg-surface-container text-on-surface-variant ring-outline-variant', dot: 'bg-outline' },
}


const JOB_STATUS_BADGE: Record<Job['status'], string> = {
  pending: 'bg-surface-container text-on-surface-variant',
  running: 'bg-primary-fixed text-primary',
  done:    'bg-green-50 text-green-700',
  failed:  'bg-error-container text-on-error-container',
}

function SkeletonBlock({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={`skeleton rounded-lg ${className ?? ''}`} style={style} />
}

function RepoDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Back link */}
      <SkeletonBlock className="h-4 w-40" />

      {/* Header card */}
      <div className="flex items-start justify-between gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-[0_4px_6px_-1px_rgb(0,0,0,0.05)]">
        <div className="flex items-center gap-4 min-w-0">
          <SkeletonBlock className="h-12 w-12 shrink-0 rounded-xl" />
          <div className="min-w-0">
            <SkeletonBlock className="h-6 w-48 rounded-md" />
            <SkeletonBlock className="mt-2 h-3 w-24 rounded-md" />
            <div className="mt-3 flex gap-2">
              <SkeletonBlock className="h-5 w-16 rounded" />
              <SkeletonBlock className="h-5 w-20 rounded-full" />
            </div>
          </div>
        </div>
        <div className="shrink-0 text-right space-y-2">
          <SkeletonBlock className="h-7 w-16 rounded-md" />
          <SkeletonBlock className="h-3 w-24 rounded" />
          <SkeletonBlock className="h-3 w-32 rounded" />
        </div>
      </div>

      {/* PR + Jira grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {[0, 1].map((i) => (
          <div key={i} className="rounded-xl border border-outline-variant bg-surface-container-lowest shadow-[0_4px_6px_-1px_rgb(0,0,0,0.05)]">
            <div className="flex items-center gap-2 border-b border-outline-variant px-6 py-4">
              <SkeletonBlock className="h-4 w-4 rounded" />
              <SkeletonBlock className="h-4 w-28 rounded-md" />
            </div>
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <SkeletonBlock className="h-8 w-8 rounded-lg" />
              <SkeletonBlock className="h-3 w-32 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Investigations */}
      <div className="rounded-xl border border-outline-variant bg-surface-container-lowest shadow-[0_4px_6px_-1px_rgb(0,0,0,0.05)]">
        <div className="flex items-center justify-between border-b border-outline-variant px-6 py-4">
          <SkeletonBlock className="h-4 w-28 rounded-md" />
          <SkeletonBlock className="h-5 w-8 rounded-full" />
        </div>
        <div className="divide-y divide-outline-variant/50">
          {[80, 60, 70].map((w, i) => (
            <div key={i} className="flex items-center gap-6 px-6 py-4">
              <SkeletonBlock className="h-3 rounded-md" style={{ width: `${w}%` } as React.CSSProperties} />
              <SkeletonBlock className="h-5 w-16 rounded-full ml-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function RepoDetailPage() {
  const { repoId } = useParams<{ repoId: string }>()
  const { data: repo, isLoading } = useRepo(repoId)
  const { jobs } = useJobs()

  const repoJobs = jobs.filter((j) => j.repo === repo?.name)

  const pullRequests = repoJobs
    .filter((j) => j.result?.prNumber)
    .map((j) => ({ job: j, pr: j.result! }))

  const jiraTickets = repoJobs
    .filter((j) => j.result?.jiraKey)
    .map((j) => ({ job: j, ticket: j.result! }))

  if (isLoading) {
    return <RepoDetailSkeleton />
  }

  if (!repo) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <RiGitRepositoryLine className="mb-4 text-5xl text-outline" />
        <h2 className="text-lg font-semibold text-on-surface">Repository not found</h2>
        <Link to="/indexing" className="mt-3 text-sm text-primary hover:underline">
          ← Back to Repositories
        </Link>
      </div>
    )
  }

  const cfg = STATUS_CONFIG[repo.status]
  const githubUrl = `https://github.com/${repo.author}/${repo.project}`

  return (
    <div className="space-y-4">
      <Link
        to="/indexing"
        className="inline-flex items-center gap-1.5 text-sm text-on-surface-variant transition-colors hover:text-primary"
      >
        <RiArrowLeftLine /> Back to Repositories
      </Link>

      <div className="flex items-start justify-between gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-[0_4px_6px_-1px_rgb(0,0,0,0.05)]">
        <div className="flex items-center gap-4 min-w-0">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-2xl text-primary">
            <RiGitRepositoryLine />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1
                className="text-2xl font-bold text-on-background"
                style={{ fontFamily: 'Geist, Inter, sans-serif' }}
              >
                {repo.project}
              </h1>
            </div>
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-0.5 inline-flex items-center gap-1 font-mono text-xs text-on-surface-variant transition-colors hover:text-primary"
            >
              <RiExternalLinkLine className="shrink-0" />
              {githubUrl}
            </a>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded bg-surface-container-high px-2 py-0.5 font-mono text-xs text-on-surface-variant">
                {repo.branch}
              </span>
              {repo.autoReindex && (
                <span className="flex items-center gap-0.5 text-xs text-on-surface-variant">
                  <RiFlashlightLine className="text-tertiary" /> auto-reindex
                </span>
              )}
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${cfg.badge}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                {cfg.label}
              </span>
            </div>
          </div>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-2xl font-bold text-on-surface" style={{ fontFamily: 'Geist, Inter, sans-serif' }}>
            {repo.chunksIndexed.toLocaleString()}
          </p>
          <p className="text-xs text-on-surface-variant">chunks indexed</p>
          <p className="mt-2 text-xs text-on-surface-variant">Last indexed: {formatDate(repo.lastIndexed)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-outline-variant bg-surface-container-lowest shadow-[0_4px_6px_-1px_rgb(0,0,0,0.05)]">
          <div className="flex items-center gap-2 border-b border-outline-variant px-6 py-4">
            <RiGitMergeLine className="text-primary" />
            <h2 className="text-base font-semibold text-on-surface" style={{ fontFamily: 'Geist, Inter, sans-serif' }}>
              Pull Requests
            </h2>
            <span className="ml-auto rounded-full bg-surface-container px-2 py-0.5 text-xs font-medium text-on-surface-variant">
              {pullRequests.length}
            </span>
          </div>

          {pullRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <RiInboxLine className="mb-2 text-3xl text-outline" />
              <p className="text-sm text-on-surface-variant">No pull requests yet</p>
              <p className="mt-0.5 text-xs text-on-surface-variant">PRs generated by Zenfix will appear here.</p>
            </div>
          ) : (
            <ul className="divide-y divide-outline-variant/50">
              {pullRequests.map(({ job, pr }) => (
                <li key={job.id} className="flex items-start justify-between gap-3 px-6 py-4 hover:bg-surface-container-low/50 transition-colors">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <RiGitMergeLine className="shrink-0 text-primary text-sm" />
                      <a
                        href={pr.prUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        PR #{pr.prNumber}
                      </a>
                      <RiExternalLinkLine className="text-outline text-xs" />
                    </div>
                    {pr.summary && (
                      <p className="mt-0.5 text-xs text-on-surface-variant truncate">{pr.summary}</p>
                    )}
                    <p className="mt-1 font-mono text-[11px] text-on-surface-variant">{timeAgo(job.createdAt)}</p>
                  </div>
                  <span className={`shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${JOB_STATUS_BADGE[job.status]}`}>
                    {job.status === 'done' ? <RiCheckLine /> : <RiLoader4Line className="animate-spin" />}
                    {job.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-outline-variant bg-surface-container-lowest shadow-[0_4px_6px_-1px_rgb(0,0,0,0.05)]">
          <div className="flex items-center gap-2 border-b border-outline-variant px-6 py-4">
            <RiTicket2Line className="text-secondary" />
            <h2 className="text-base font-semibold text-on-surface" style={{ fontFamily: 'Geist, Inter, sans-serif' }}>
              Jira Tickets
            </h2>
            <span className="ml-auto rounded-full bg-surface-container px-2 py-0.5 text-xs font-medium text-on-surface-variant">
              {jiraTickets.length}
            </span>
          </div>

          {jiraTickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <RiInboxLine className="mb-2 text-3xl text-outline" />
              <p className="text-sm text-on-surface-variant">No Jira tickets yet</p>
              <p className="mt-0.5 text-xs text-on-surface-variant">Tickets created by Zenfix will appear here.</p>
            </div>
          ) : (
            <ul className="divide-y divide-outline-variant/50">
              {jiraTickets.map(({ job, ticket }) => (
                <li key={job.id} className="flex items-start justify-between gap-3 px-6 py-4 hover:bg-surface-container-low/50 transition-colors">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <RiTicket2Line className="shrink-0 text-secondary text-sm" />
                      <a
                        href={ticket.jiraUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-secondary hover:underline"
                      >
                        {ticket.jiraKey}
                      </a>
                      <RiExternalLinkLine className="text-outline text-xs" />
                    </div>
                    {ticket.summary && (
                      <p className="mt-0.5 text-xs text-on-surface-variant truncate">{ticket.summary}</p>
                    )}
                    <p className="mt-1 font-mono text-[11px] text-on-surface-variant">{timeAgo(job.createdAt)}</p>
                  </div>
                  <span className={`shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${JOB_STATUS_BADGE[job.status]}`}>
                    {job.status === 'done' ? <RiCheckLine /> : <RiLoader4Line className="animate-spin" />}
                    {job.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="rounded-xl border border-outline-variant bg-surface-container-lowest shadow-[0_4px_6px_-1px_rgb(0,0,0,0.05)]">
        <div className="flex items-center justify-between border-b border-outline-variant px-6 py-4">
          <h2 className="text-base font-semibold text-on-surface" style={{ fontFamily: 'Geist, Inter, sans-serif' }}>
            Investigations
          </h2>
          <span className="rounded-full bg-surface-container px-2 py-0.5 text-xs font-medium text-on-surface-variant">
            {repoJobs.length}
          </span>
        </div>

        {repoJobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <RiInboxLine className="mb-2 text-3xl text-outline" />
            <p className="text-sm text-on-surface-variant">No investigations yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-outline-variant bg-surface-container-low">
                  {['Description', 'Status', 'PR', 'Jira', 'Created'].map((h) => (
                    <th key={h} className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {repoJobs.map((job) => (
                  <tr key={job.id} className="border-b border-outline-variant/50 last:border-0 hover:bg-surface-container-low/50 transition-colors">
                    <td className="px-6 py-3 font-mono text-xs text-on-surface-variant max-w-[260px] truncate">
                      {job.description}
                    </td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${JOB_STATUS_BADGE[job.status]}`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      {job.result?.prNumber ? (
                        <a href={job.result.prUrl} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-primary hover:underline">
                          <RiGitMergeLine /> #{job.result.prNumber}
                        </a>
                      ) : <span className="text-xs text-outline">—</span>}
                    </td>
                    <td className="px-6 py-3">
                      {job.result?.jiraKey ? (
                        <a href={job.result.jiraUrl} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-secondary hover:underline">
                          <RiTicket2Line /> {job.result.jiraKey}
                        </a>
                      ) : <span className="text-xs text-outline">—</span>}
                    </td>
                    <td className="px-6 py-3 text-xs text-on-surface-variant">{timeAgo(job.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
