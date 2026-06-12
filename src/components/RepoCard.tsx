import { useState } from 'react'
import { RiCloseLine, RiExternalLinkLine, RiFlashlightLine, RiMoreFill, RiRefreshLine } from 'react-icons/ri'
import type { Repo, RepoStatus } from '../types'
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
    dot: 'bg-blue-400 animate-pulse',
    badge: 'bg-blue-50 text-blue-600 ring-blue-200',
  },
  pending: {
    label: 'Pending',
    dot: 'bg-amber-400 animate-pulse',
    badge: 'bg-amber-50 text-amber-600 ring-amber-200',
  },
  error: {
    label: 'Error',
    dot: 'bg-red-500',
    badge: 'bg-red-50 text-red-600 ring-red-200',
  },
  unknown: {
    label: 'Unknown',
    dot: 'bg-zinc-300',
    badge: 'bg-zinc-50 text-zinc-500 ring-zinc-200',
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
  const [open, setOpen] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const githubUrl = `https://github.com/${repo.author}/${repo.project}`

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs transition-shadow hover:shadow-sm">
      <div className="flex items-start justify-between gap-3">
        {/* Left — project name + meta */}
        <div className="min-w-0">
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-1.5 hover:text-blue-600"
          >
            <h3 className="truncate text-base font-semibold text-zinc-900 group-hover:text-blue-600">
              {repo.project}
            </h3>
            <RiExternalLinkLine className="shrink-0 text-zinc-300 group-hover:text-blue-400" />
          </a>
          <div className="mt-1 flex items-center gap-2">
            <span className="rounded border border-zinc-100 bg-zinc-50 px-1.5 py-0.5 font-mono text-xs text-zinc-400">
              {repo.branch}
            </span>
            {repo.autoReindex && (
              <span className="flex items-center gap-0.5 text-xs text-zinc-400">
                <RiFlashlightLine className="text-amber-400" /> auto
              </span>
            )}
          </div>
        </div>

        {/* Right — status + author + menu */}
        <div className="flex shrink-0 flex-col items-end gap-2">
          <div className="flex items-center gap-1.5">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${cfg.badge}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
              {cfg.label}
            </span>
            <div className="relative">
              <button
                onClick={() => setOpen((v) => !v)}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
              >
                <RiMoreFill />
              </button>
              {open && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => { setOpen(false); setConfirming(false) }} />
                  <div className="absolute right-0 z-20 mt-1 w-44 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-md">
                    {confirming ? (
                      <div className="p-3">
                        <p className="mb-2 text-xs font-medium text-zinc-700">Remove this repo?</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => { setConfirming(false) }}
                            className="flex-1 rounded-md border border-zinc-200 py-1 text-xs text-zinc-600 hover:bg-zinc-50"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => { onDelete(repo.id); setOpen(false); setConfirming(false) }}
                            className="flex-1 rounded-md bg-red-600 py-1 text-xs text-white hover:bg-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => { onReindex(repo.id); setOpen(false) }}
                          disabled={isActive}
                          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <RiRefreshLine /> Re-index
                        </button>
                        <div className="mx-2 h-px bg-zinc-100" />
                        <button
                          onClick={() => setConfirming(true)}
                          disabled={isActive}
                          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <RiCloseLine /> Remove
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
          <span className="text-xs text-zinc-400">{repo.author}</span>
        </div>
      </div>

      {repo.status === 'error' && repo.error && (
        <p className="mt-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-600">
          {repo.error}
        </p>
      )}

      <IndexProgress
        chunksIndexed={repo.chunksIndexed}
        filesTotal={repo.filesTotal ?? 0}
        filesDone={repo.filesDone ?? 0}
        isActive={isActive}
      />

      <p className="mt-3 text-xs text-zinc-400">Last indexed: {formatDate(repo.lastIndexed)}</p>
    </div>
  )
}
