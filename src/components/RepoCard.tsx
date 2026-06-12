import { useState } from 'react'
import {
  RiArrowRightLine,
  RiDeleteBinLine,
  RiFlashlightLine,
  RiGitRepositoryLine,
  RiMoreFill,
  RiRefreshLine,
} from 'react-icons/ri'
import { Link } from 'react-router-dom'
import type { Repo, RepoStatus } from '../types'
import { formatDate } from '../lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { IndexProgress } from './IndexProgress'

interface Props {
  repo: Repo
  onReindex: (id: string) => void
  onDelete: (id: string) => void
}

const STATUS_CONFIG: Record<RepoStatus, { label: string; dot: string; badge: string }> = {
  indexed:  { label: 'Indexed',  dot: 'bg-green-500',            badge: 'bg-green-50 text-green-700 ring-green-200'            },
  indexing: { label: 'Indexing', dot: 'bg-primary animate-pulse', badge: 'bg-primary-fixed text-primary ring-primary-fixed-dim' },
  pending:  { label: 'Pending',  dot: 'bg-tertiary animate-pulse',badge: 'bg-tertiary/10 text-tertiary ring-tertiary/30'        },
  error:    { label: 'Error',    dot: 'bg-error',                  badge: 'bg-error-container text-on-error-container ring-error/20' },
  unknown:  { label: 'Unknown',  dot: 'bg-outline',               badge: 'bg-surface-container text-on-surface-variant ring-outline-variant' },
}

const ICON_COLORS = [
  'bg-primary/10 text-primary',
  'bg-tertiary/10 text-tertiary',
  'bg-secondary/10 text-secondary',
  'bg-green-50 text-green-700',
]

function hashColor(str: string): string {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0
  return ICON_COLORS[h % ICON_COLORS.length]
}


export function RepoCard({ repo, onReindex, onDelete }: Props) {
  const cfg      = STATUS_CONFIG[repo.status]
  const isActive = repo.status === 'indexing' || repo.status === 'pending'
  const [confirming, setConfirming] = useState(false)
  const iconClass = hashColor(repo.project)

  return (
    <div className="group flex flex-col rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-[0_4px_6px_-1px_rgb(0,0,0,0.05)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_16px_-4px_rgba(0,0,0,0.07)]">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-lg ${iconClass}`}>
            <RiGitRepositoryLine />
          </div>
          <div className="min-w-0">
            <Link
              to={`/repos/${repo.id}`}
              className="group/link inline-flex items-center gap-1 hover:text-primary"
            >
              <h3 className="truncate text-[15px] font-semibold text-on-background group-hover/link:text-primary" style={{ fontFamily: 'Geist, Inter, sans-serif' }}>
                {repo.project}
              </h3>
            </Link>
            <p className="mt-0.5 text-xs text-on-surface-variant">{repo.author}</p>
          </div>
        </div>

        <DropdownMenu onOpenChange={(open) => { if (!open) setConfirming(false) }}>
          <DropdownMenuTrigger asChild>
            <button className="ml-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-outline transition-colors hover:bg-surface-container hover:text-on-surface">
              <RiMoreFill />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            {confirming ? (
              <div className="p-2">
                <p className="mb-2 px-1 text-xs font-medium text-on-surface">Remove this repo?</p>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setConfirming(false)}
                    className="flex-1 rounded border border-outline-variant py-1 text-xs text-on-surface-variant hover:bg-surface-container"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => { onDelete(repo.id); setConfirming(false) }}
                    className="flex-1 rounded bg-error py-1 text-xs text-on-error hover:opacity-90"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ) : (
              <>
                <DropdownMenuItem
                  disabled={isActive}
                  onSelect={(e) => { e.preventDefault(); onReindex(repo.id) }}
                  className="gap-2 text-sm"
                >
                  <RiRefreshLine className="text-on-surface-variant" /> Re-index
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  disabled={isActive}
                  onSelect={(e) => { e.preventDefault(); setConfirming(true) }}
                  className="gap-2 text-sm text-error focus:text-error"
                >
                  <RiDeleteBinLine /> Remove
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-2.5 border-t border-outline-variant/30 pt-4">
        <span className="inline-flex items-center rounded bg-surface-container-high px-2 py-0.5 font-mono text-[11px] text-on-surface-variant">
          {repo.branch}
        </span>
        {repo.autoReindex && (
          <span className="flex items-center gap-0.5 text-xs text-on-surface-variant">
            <RiFlashlightLine className="text-tertiary" /> auto
          </span>
        )}
        <span className={`ml-auto inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${cfg.badge}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
          {cfg.label}
        </span>
      </div>

      {repo.status === 'error' && repo.error && (
        <p className="mt-2 rounded-lg border border-error-container bg-error-container/50 px-3 py-2 text-xs text-on-error-container">
          {repo.error}
        </p>
      )}

      <IndexProgress
        chunksIndexed={repo.chunksIndexed}
        filesTotal={repo.filesTotal ?? 0}
        filesDone={repo.filesDone ?? 0}
        isActive={isActive}
      />

      <p className="mt-3 text-xs text-on-surface-variant">
        Last indexed: {formatDate(repo.lastIndexed)}
      </p>

      <Link
        to={`/repos/${repo.id}`}
        className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:text-primary-container"
      >
        View details <RiArrowRightLine />
      </Link>
    </div>
  )
}
