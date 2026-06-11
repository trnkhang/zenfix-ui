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
import type { Job, JobStatus, JobStep } from '../types'

interface Props {
  job: Job
}

const STATUS_BADGE: Record<JobStatus, string> = {
  pending: 'bg-zinc-50 text-zinc-500 ring-zinc-200',
  running: 'bg-blue-50 text-blue-600 ring-blue-200',
  done:    'bg-emerald-50 text-emerald-700 ring-emerald-200',
  failed:  'bg-red-50 text-red-600 ring-red-200',
}

const STEP_ICON: Record<JobStep['status'], React.ReactNode> = {
  pending: <RiRadioButtonLine className="text-zinc-300" />,
  running: <RiLoader4Line className="animate-spin text-blue-500" />,
  done:    <RiCheckLine className="text-emerald-500" />,
  failed:  <RiCloseCircleLine className="text-red-500" />,
}

const STEP_TEXT: Record<JobStep['status'], string> = {
  pending: 'text-zinc-400',
  running: 'text-zinc-700',
  done:    'text-zinc-700',
  failed:  'text-zinc-700',
}

function formatTime(iso: string): string {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date(iso))
}

function durationStr(job: Job): string {
  if (!job.completedAt) return ''
  const ms = new Date(job.completedAt).getTime() - new Date(job.createdAt).getTime()
  const secs = Math.round(ms / 1000)
  return secs >= 60 ? `${Math.floor(secs / 60)}m ${secs % 60}s` : `${secs}s`
}

export function JobCard({ job }: Props) {
  const duration = durationStr(job)

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <RiToolsLine className="shrink-0 text-zinc-400" />
            <span className="rounded border border-zinc-100 bg-zinc-50 px-2 py-0.5 font-mono text-xs text-zinc-400">
              #{job.id.slice(0, 8)}
            </span>
            <span className="truncate text-sm font-medium text-zinc-800">{job.repo}</span>
          </div>
          <p className="mt-1 truncate text-sm text-zinc-500">{job.description}</p>
        </div>

        <span className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${STATUS_BADGE[job.status]}`}>
          {job.status === 'running'
            ? <span className="flex items-center gap-1.5"><RiLoader4Line className="animate-spin" /> Running</span>
            : job.status.charAt(0).toUpperCase() + job.status.slice(1)}
        </span>
      </div>

      {job.steps.length > 0 && (
        <div className="mt-4 space-y-1.5 rounded-lg bg-zinc-50 p-3">
          {job.steps.map((step, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <span className="mt-0.5 text-sm">{STEP_ICON[step.status]}</span>
              <div className="min-w-0 flex-1">
                <span className={`text-sm ${STEP_TEXT[step.status]}`}>{step.name}</span>
                {step.detail && (
                  <p className="truncate text-xs text-zinc-400">{step.detail}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {job.result && job.status === 'done' && (
        <div className="mt-4 space-y-1 rounded-lg border border-emerald-100 bg-emerald-50 p-3">
          {job.result.summary && (
            <p className="text-sm font-medium text-emerald-800">{job.result.summary}</p>
          )}
          <div className="mt-1 flex flex-wrap gap-3">
            {job.result.jiraKey && (
              <a href={job.result.jiraUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
                <RiTicket2Line /> {job.result.jiraKey}
              </a>
            )}
            {job.result.prNumber && (
              <a href={job.result.prUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
                <RiGitMergeLine /> PR #{job.result.prNumber}
              </a>
            )}
            {job.result.isComplex && (
              <span className="text-xs text-amber-600">Complex — manual review</span>
            )}
          </div>
        </div>
      )}

      <div className="mt-3 flex items-center justify-between border-t border-zinc-100 pt-3 text-xs text-zinc-400">
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
