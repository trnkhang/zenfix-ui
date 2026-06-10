import type { Job, JobStatus, JobStep } from '../lib/api'

interface Props {
  job: Job
}

const STATUS_COLORS: Record<JobStatus, string> = {
  pending: 'bg-slate-50 text-slate-600 ring-slate-200',
  running: 'bg-blue-50 text-blue-700 ring-blue-200',
  done:    'bg-emerald-50 text-emerald-700 ring-emerald-200',
  failed:  'bg-red-50 text-red-700 ring-red-200',
}

const STEP_ICONS: Record<JobStep['status'], string> = {
  pending: '○',
  running: '◎',
  done:    '✓',
  failed:  '✗',
}

const STEP_COLORS: Record<JobStep['status'], string> = {
  pending: 'text-slate-300',
  running: 'text-blue-500',
  done:    'text-emerald-500',
  failed:  'text-red-500',
}

function formatTime(iso: string): string {
  return new Intl.DateTimeFormat('en', {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
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
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">🔧</span>
            <span className="font-mono text-xs text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
              #{job.id.slice(0, 8)}
            </span>
            <span className="font-semibold text-slate-800 text-sm truncate">{job.repo}</span>
          </div>
          <p className="text-sm text-slate-500 mt-1 truncate">{job.description}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ring-1 ${STATUS_COLORS[job.status]}`}>
            {job.status === 'running' ? '⟳ Running' : job.status.charAt(0).toUpperCase() + job.status.slice(1)}
          </span>
        </div>
      </div>

      {/* Steps timeline */}
      {job.steps.length > 0 && (
        <div className="mt-4 space-y-1.5">
          {job.steps.map((step, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <span className={`mt-0.5 font-mono text-sm font-bold ${STEP_COLORS[step.status]} ${step.status === 'running' ? 'animate-pulse' : ''}`}>
                {STEP_ICONS[step.status]}
              </span>
              <div className="flex-1 min-w-0">
                <span className={`text-sm ${step.status === 'pending' ? 'text-slate-400' : 'text-slate-700'}`}>
                  {step.name}
                </span>
                {step.detail && (
                  <p className="text-xs text-slate-400 truncate">{step.detail}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Result block */}
      {job.result && job.status === 'done' && (
        <div className="mt-4 p-3 bg-emerald-50 border border-emerald-100 rounded-lg space-y-1">
          {job.result.summary && (
            <p className="text-sm text-emerald-800 font-medium">{job.result.summary}</p>
          )}
          <div className="flex flex-wrap gap-3 mt-1">
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

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 text-xs text-slate-400">
        <span>{formatTime(job.createdAt)}</span>
        {duration && <span>⏱ {duration}</span>}
      </div>
    </div>
  )
}
