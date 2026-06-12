import {
  RiCheckLine,
  RiCloseCircleLine,
  RiGitMergeLine,
  RiLoader4Line,
  RiRadioButtonLine,
  RiTicket2Line,
  RiTimerLine,
  RiToolsLine,
} from 'react-icons/ri'
import { Link } from 'react-router-dom'
import type { Job, JobStatus, JobStep } from '../types'

interface Props {
  job: Job
  repoId?: string
}

const STATUS_BADGE: Record<JobStatus, string> = {
  pending: 'bg-surface-container text-on-surface-variant ring-outline-variant',
  running: 'bg-primary-fixed text-primary ring-primary-fixed-dim',
  done:    'bg-green-50 text-green-700 ring-green-200',
  failed:  'bg-error-container text-on-error-container ring-error/30',
}

const STEP_ICON: Record<JobStep['status'], React.ReactNode> = {
  pending: <RiRadioButtonLine className="text-outline" />,
  running: <RiLoader4Line className="animate-spin text-primary" />,
  done:    <RiCheckLine className="text-green-600" />,
  failed:  <RiCloseCircleLine className="text-error" />,
}

const STEP_TEXT: Record<JobStep['status'], string> = {
  pending: 'text-on-surface-variant',
  running: 'text-on-surface',
  done:    'text-on-surface',
  failed:  'text-on-surface',
}

function formatTime(iso: string): string {
  return new Intl.DateTimeFormat('en', {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  }).format(new Date(iso))
}

function durationStr(job: Job): string {
  if (!job.completedAt) return ''
  const ms   = new Date(job.completedAt).getTime() - new Date(job.createdAt).getTime()
  const secs = Math.round(ms / 1000)
  return secs >= 60 ? `${Math.floor(secs / 60)}m ${secs % 60}s` : `${secs}s`
}

export function JobCard({ job, repoId }: Props) {
  const duration = durationStr(job)

  return (
    <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-[0_4px_6px_-1px_rgb(0,0,0,0.05)] transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <RiToolsLine className="shrink-0 text-outline" />
            <span className="rounded border border-outline-variant bg-surface-container px-2 py-0.5 font-mono text-xs text-on-surface-variant">
              #{job.id.slice(0, 8)}
            </span>
            {repoId ? (
              <Link
                to={`/repos/${repoId}`}
                className="truncate text-sm font-semibold text-primary hover:underline"
                style={{ fontFamily: 'Geist, Inter, sans-serif' }}
              >
                {job.repo}
              </Link>
            ) : (
              <span className="truncate text-sm font-semibold text-on-surface" style={{ fontFamily: 'Geist, Inter, sans-serif' }}>
                {job.repo}
              </span>
            )}
          </div>
          <p className="mt-1 truncate text-sm text-on-surface-variant">{job.description}</p>
        </div>

        <span className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${STATUS_BADGE[job.status]}`}>
          {job.status === 'running'
            ? <span className="flex items-center gap-1.5"><RiLoader4Line className="animate-spin" /> Running</span>
            : job.status.charAt(0).toUpperCase() + job.status.slice(1)}
        </span>
      </div>

      {job.steps.length > 0 && (
        <div className="mt-4 space-y-1.5 rounded-lg bg-surface-container-low p-3">
          {job.steps.map((step, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <span className="mt-0.5 text-sm">{STEP_ICON[step.status]}</span>
              <div className="min-w-0 flex-1">
                <span className={`text-sm ${STEP_TEXT[step.status]}`}>{step.name}</span>
                {step.detail && (
                  <p className="truncate text-xs text-on-surface-variant">{step.detail}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {job.result && job.status === 'done' && (
        <div className="mt-4 space-y-1 rounded-lg border border-green-100 bg-green-50 p-3">
          {job.result.summary && (
            <p className="text-sm font-medium text-green-800">{job.result.summary}</p>
          )}
          <div className="mt-1 flex flex-wrap gap-3">
            {job.result.jiraKey && (
              <a href={job.result.jiraUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-primary hover:underline">
                <RiTicket2Line /> {job.result.jiraKey}
              </a>
            )}
            {job.result.prNumber && (
              <a href={job.result.prUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-primary hover:underline">
                <RiGitMergeLine /> PR #{job.result.prNumber}
              </a>
            )}
            {job.result.isComplex && (
              <span className="text-xs text-tertiary">Complex — manual review</span>
            )}
          </div>
        </div>
      )}

      <div className="mt-3 flex items-center justify-between border-t border-outline-variant/50 pt-3 text-xs text-on-surface-variant">
        <span>{formatTime(job.createdAt)}</span>
        {duration && (
          <span className="flex items-center gap-1">
            <RiTimerLine /> {duration}
          </span>
        )}
      </div>
    </div>
  )
}
