import type { Repo, RepoStatus } from '../lib/api'
import { IndexProgress } from './IndexProgress'

interface Props {
  repo: Repo
  onReindex: (id: string) => void
  onDelete: (id: string) => void
}

const STATUS_CONFIG: Record<RepoStatus, { label: string; dot: string; badge: string }> = {
  indexed: {
    label: 'Indexed',
    dot: 'bg-emerald-500',
    badge: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  },
  indexing: {
    label: 'Indexing',
    dot: 'bg-blue-500 animate-pulse',
    badge: 'bg-blue-50 text-blue-700 ring-blue-200',
  },
  pending: {
    label: 'Pending',
    dot: 'bg-amber-400 animate-pulse',
    badge: 'bg-amber-50 text-amber-700 ring-amber-200',
  },
  error: { label: 'Error', dot: 'bg-red-500', badge: 'bg-red-50 text-red-700 ring-red-200' },
  unknown: {
    label: 'Unknown',
    dot: 'bg-slate-400',
    badge: 'bg-slate-50 text-slate-600 ring-slate-200',
  },
}

function formatDate(iso: string | null): string {
  if (!iso) return 'Never'
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

export function RepoCard({ repo, onReindex, onDelete }: Props) {
  const cfg = STATUS_CONFIG[repo.status]
  const isActive = repo.status === 'indexing' || repo.status === 'pending'

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-lg text-slate-400">📁</span>
            <h3 className="truncate font-semibold text-slate-800">{repo.name}</h3>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span className="rounded border border-slate-100 bg-slate-50 px-2 py-0.5 font-mono text-xs text-slate-400">
              {repo.branch}
            </span>
            {repo.autoReindex && <span className="text-xs text-slate-400">⚡ auto</span>}
          </div>
        </div>

        <span
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${cfg.badge}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
          {cfg.label}
        </span>
      </div>

      {repo.status === 'error' && repo.error && (
        <p className="mt-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-600">
          {repo.error}
        </p>
      )}

      <IndexProgress chunksIndexed={repo.chunksIndexed} isActive={isActive} />

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
        <span className="text-xs text-slate-400">Last indexed: {formatDate(repo.lastIndexed)}</span>
        <div className="flex gap-2">
          <button
            onClick={() => onReindex(repo.id)}
            disabled={isActive}
            className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Re-index
          </button>
          <button
            onClick={() => onDelete(repo.id)}
            disabled={isActive}
            className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  )
}
