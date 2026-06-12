import type { ReactNode } from 'react'
import {
  RiBugLine,
  RiCheckLine,
  RiGitMergeLine,
  RiGitRepositoryLine,
  RiLoader4Line,
  RiRadioButtonLine,
  RiTicketLine,
} from 'react-icons/ri'
import { Link } from 'react-router-dom'
import { useJobs } from '../hooks/useJobs'
import { useRepos } from '../hooks/useRepos'
import type { Job } from '../types'
import { timeAgo } from '../lib/utils'

const JOB_STATUS_BADGE: Record<Job['status'], string> = {
  pending:    'bg-surface-container text-on-surface-variant',
  running:    'bg-primary-fixed text-primary',
  done:       'bg-surface-container-high text-on-surface-variant',
  failed:     'bg-error-container text-on-error-container',
}

const JOB_STATUS_ICON: Record<Job['status'], ReactNode> = {
  pending: <RiRadioButtonLine className="text-outline text-[13px]" />,
  running: <RiLoader4Line className="animate-spin text-primary text-[13px]" />,
  done:    <RiCheckLine className="text-on-surface-variant text-[13px]" />,
  failed:  <span className="h-1.5 w-1.5 rounded-full bg-error" />,
}

interface KpiCardProps {
  icon: ReactNode
  iconColor: string
  value: number | string
  label: string
  badge?: ReactNode
}

function KpiCard({ icon, iconColor, value, label, badge }: KpiCardProps) {
  return (
    <div className="group rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-[0_4px_6px_-1px_rgb(0,0,0,0.05)] transition-shadow hover:shadow-md">
      <div className="mb-3 flex items-start justify-between">
        <span className={`text-xl ${iconColor}`}>{icon}</span>
        {badge}
      </div>
      <p className="text-4xl font-bold text-on-surface" style={{ fontFamily: 'Geist, Inter, sans-serif' }}>{value}</p>
      <p className="mt-1 text-sm font-medium text-on-surface-variant">{label}</p>
    </div>
  )
}

function KpiCardSkeleton() {
  return (
    <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-[0_4px_6px_-1px_rgb(0,0,0,0.05)]">
      <div className="mb-3 flex items-start justify-between">
        <div className="skeleton h-5 w-5 rounded" />
        <div className="skeleton h-5 w-14 rounded-md" />
      </div>
      <div className="skeleton h-9 w-16 rounded-md" />
      <div className="skeleton mt-2 h-3 w-24 rounded" />
    </div>
  )
}

function TableRowSkeleton() {
  return (
    <tr className="border-b border-outline-variant/50 last:border-0">
      <td className="px-6 py-4"><div className="skeleton h-3 w-20 rounded" /></td>
      <td className="px-6 py-4"><div className="skeleton h-3 w-40 rounded" /></td>
      <td className="px-6 py-4"><div className="skeleton h-5 w-16 rounded-full" /></td>
      <td className="px-6 py-4"><div className="skeleton h-3 w-12 rounded" /></td>
    </tr>
  )
}

export function DashboardPage() {
  const { repos, stats, loading: reposLoading } = useRepos()
  const { jobs, loading: jobsLoading } = useJobs()

  const loading = reposLoading || jobsLoading

  const totalRepos = stats?.totalRepos ?? repos.length
  const activeJobs = jobs.filter((j) => j.status === 'running' || j.status === 'pending').length
  const recentJobs = [...jobs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5)

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-on-background" style={{ fontFamily: 'Geist, Inter, sans-serif' }}>
          Dashboard Overview
        </h1>
        <p className="mt-1 text-sm text-on-surface-variant">System health and active investigations.</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <KpiCardSkeleton key={i} />)
        ) : (
          <>
            <KpiCard
              icon={<RiGitRepositoryLine />}
              iconColor="text-outline group-hover:text-primary transition-colors"
              value={totalRepos}
              label="Repositories"
              badge={
                <span className="rounded-md bg-surface-container-low px-2 py-0.5 text-xs font-medium text-on-surface-variant">
                  Total
                </span>
              }
            />
            <KpiCard
              icon={<RiBugLine />}
              iconColor="text-primary"
              value={activeJobs}
              label="Active Jobs"
              badge={
                <span className="flex items-center gap-1 rounded-md bg-primary-fixed px-2 py-0.5 text-xs font-medium text-primary">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                  Active
                </span>
              }
            />
            <KpiCard
              icon={<RiTicketLine />}
              iconColor="text-outline group-hover:text-primary transition-colors"
              value={0}
              label="Open Jira Tickets"
              badge={
                <span className="rounded-md bg-surface-container-low px-2 py-0.5 text-xs font-medium text-on-surface-variant">
                  Needs Action
                </span>
              }
            />
            <KpiCard
              icon={<RiGitMergeLine />}
              iconColor="text-outline group-hover:text-primary transition-colors"
              value={0}
              label="Open Pull Requests"
              badge={
                <span className="rounded-md bg-surface-container-low px-2 py-0.5 text-xs font-medium text-on-surface-variant">
                  Pending
                </span>
              }
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Recent Jobs */}
        <div className="lg:col-span-2 rounded-xl border border-outline-variant bg-surface-container-lowest shadow-[0_4px_6px_-1px_rgb(0,0,0,0.05)]">
          <div className="flex items-center justify-between border-b border-outline-variant px-6 py-4">
            <h2 className="text-base font-semibold text-on-surface" style={{ fontFamily: 'Geist, Inter, sans-serif' }}>
              Recent Jobs
            </h2>
            <Link to="/jobs" className="text-sm font-medium text-primary hover:underline">
              View All
            </Link>
          </div>

          {loading ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-outline-variant bg-surface-container-low">
                    {['Repo', 'Description', 'Status', 'Created'].map((h) => (
                      <th key={h} className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-on-surface-variant">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 4 }).map((_, i) => <TableRowSkeleton key={i} />)}
                </tbody>
              </table>
            </div>
          ) : recentJobs.length === 0 ? (
            <div className="px-6 py-10 text-center text-sm text-on-surface-variant">No jobs yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-outline-variant bg-surface-container-low">
                    {['Repo', 'Description', 'Status', 'Created'].map((h) => (
                      <th key={h} className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-on-surface-variant">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentJobs.map((job) => (
                    <tr key={job.id} className="border-b border-outline-variant/50 transition-colors hover:bg-surface-container-low/50 last:border-0">
                      <td className="px-6 py-4"><span className="font-mono text-xs">{job.repo.split('/').pop()}</span></td>
                      <td className="px-6 py-4 font-mono text-xs text-on-surface-variant max-w-[220px] truncate">{job.description}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${JOB_STATUS_BADGE[job.status]}`}>
                          {JOB_STATUS_ICON[job.status]}
                          {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-on-surface-variant">{timeAgo(job.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Agent Activity */}
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-[0_4px_6px_-1px_rgb(0,0,0,0.05)]">
          <div className="mb-4 flex items-center gap-2">
            <RiBugLine className="text-primary" />
            <h2 className="text-base font-semibold text-on-surface" style={{ fontFamily: 'Geist, Inter, sans-serif' }}>
              Agent Activity
            </h2>
          </div>

          {loading ? (
            <div className="flex flex-col gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-3">
                  <div className="skeleton mt-0.5 h-6 w-6 shrink-0 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <div className="skeleton h-3 w-3/4 rounded" />
                    <div className="skeleton h-3 w-1/3 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <p className="text-sm text-on-surface-variant">No activity yet. Start an investigation to see agent logs here.</p>
          ) : (
            <div className="relative">
              <div className="absolute left-[11px] top-2 bottom-0 w-px bg-outline-variant/40" />
              <div className="flex flex-col gap-4 relative z-10">
                {jobs.slice(0, 4).map((job) => (
                  <div key={job.id} className="flex gap-3">
                    <div className="mt-0.5 h-6 w-6 shrink-0 rounded-full bg-primary-fixed flex items-center justify-center">
                      <RiBugLine className="text-primary text-xs" />
                    </div>
                    <div>
                      <p className="text-sm text-on-surface">
                        <span className="font-medium">{job.repo.split('/').pop()}</span>{' '}
                        <span className="text-on-surface-variant">— {job.status}</span>
                      </p>
                      <span className="text-xs text-on-surface-variant">{timeAgo(job.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
