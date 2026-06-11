import type { Job, JobStatus, JobStep } from '../lib/api'

interface Props {
  job: Job
}

const STATUS_COLORS: Record<JobStatus, string> = {
  pending: 'bg-slate-50 text-slate-600 ring-slate-200',
  running: 'bg-blue-50 text-blue-700 ring-blue-200',
  done: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  failed: 'bg-red-50 text-red-700 ring-red-200',
}

const STEP_ICONS: Record<JobStep['status'], string> = {
  pending: '○',
  running: '◎',
  done: '✓',
  failed: '✗',
}

const STEP_COLORS: Record<JobStep['status'], string> = {
  pending: 'text-slate-300',
  running: 'text-blue-500',
  done: 'text-emerald-500',
  failed: 'text-red-500',
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
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">🔧</span>
            <span className="rounded border border-slate-100 bg-slate-50 px-2 py-0.5 font-mono text-xs text-slate-400">
              #{job.id.slice(0, 8)}
            </span>
            <span className="truncate text-sm font-semibold text-slate-800">{job.repo}</span>
          </div>
          <p className="mt-1 truncate text-sm text-slate-500">{job.description}</p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${STATUS_COLORS[job.status]}`}
          >
            {job.status === 'running'
              ? '⟳ Running'
              : job.status.charAt(0).toUpperCase() + job.status.slice(1)}
          </span>
        </div>
      </div>

      {job.steps.length > 0 && (
        <div className="mt-4 space-y-1.5">
          {job.steps.map((step, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <span
                className={`mt-0.5 font-mono text-sm font-bold ${STEP_COLORS[step.status]} ${step.status === 'running' ? 'animate-pulse' : ''}`}
              >
                {STEP_ICONS[step.status]}
              </span>
              <div className="min-w-0 flex-1">
                <span
                  className={`text-sm ${step.status === 'pending' ? 'text-slate-400' : 'text-slate-700'}`}
                >
                  {step.name}
                </span>
                {step.detail && <p className="truncate text-xs text-slate-400">{step.detail}</p>}
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
              <a
                href={job.result.jiraUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline"
              >
                🎫 {job.result.jiraKey}
              </a>
            )}
            {job.result.prNumber && (
              <a
                href={job.result.prUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline"
              >
                🔀 PR #{job.result.prNumber}
              </a>
            )}
            {job.result.isComplex && (
              <span className="text-xs text-amber-600">⚠️ Complex — manual review</span>
            )}
          </div>
        </div>
      )}

      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-400">
        <span>{formatTime(job.createdAt)}</span>
        {duration && <span>⏱ {duration}</span>}
      </div>
    </div>
  )
}
