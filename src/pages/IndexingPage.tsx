import { useState, useRef } from 'react'
import { RiAddLine, RiAlertLine, RiCloseLine, RiGitRepositoryLine, RiInboxLine, RiRefreshLine } from 'react-icons/ri'
import { RepoCard } from '../components/RepoCard'
import { RepoCardSkeleton } from '../components/Skeleton'
import { toast } from 'sonner'
import { useRepos } from '../hooks/useRepos'

function parseGithubUrl(input: string): { author: string; project: string } | null {
  try {
    const cleaned = input.trim().replace(/\.git$/, '')
    const url = cleaned.startsWith('http') ? new URL(cleaned) : new URL(`https://github.com/${cleaned}`)
    const parts = url.pathname.replace(/^\//, '').split('/')
    if (parts.length >= 2 && parts[0] && parts[1]) {
      return { author: parts[0], project: parts[1] }
    }
  } catch { /* ignore */ }
  return null
}

interface AddRepoModalProps {
  onClose: () => void
  onAdd: (url: string, branch: string, autoReindex: boolean) => Promise<unknown>
}

function AddRepoModal({ onClose, onAdd }: AddRepoModalProps) {
  const [url, setUrl]               = useState('')
  const [branch, setBranch]         = useState('master')
  const [autoReindex, setAutoReindex] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [err, setErr]               = useState<string | null>(null)
  const parsed = parseGithubUrl(url)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!parsed) return
    setSubmitting(true)
    setErr(null)
    try {
      await onAdd(url.trim(), branch.trim() || 'master', autoReindex)
      onClose()
    } catch (error) {
      setErr(error instanceof Error ? error.message : 'Failed to add repo')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="w-full max-w-md rounded-2xl border border-outline-variant bg-surface-container-lowest shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-outline-variant px-6 py-4">
          <h2 className="font-semibold text-on-surface" style={{ fontFamily: 'Geist, Inter, sans-serif' }}>
            Connect GitHub Repository
          </h2>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container"
          >
            <RiCloseLine />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-on-surface">
              GitHub URL <span className="text-error">*</span>
            </label>
            <input
              type="text"
              placeholder="https://github.com/owner/repo"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full rounded-lg border border-outline-variant bg-surface-container px-3 py-2 text-sm text-on-surface outline-none transition focus:border-primary focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20"
              required
              autoFocus
            />
            {url && (
              <div className="mt-2 flex items-center gap-1.5">
                {parsed ? (
                  <>
                    <span className="text-xs text-green-600">✓</span>
                    <span className="text-xs text-on-surface-variant">
                      <span className="font-medium text-on-surface">{parsed.author}</span>
                      <span className="text-outline"> / </span>
                      <span className="font-medium text-on-surface">{parsed.project}</span>
                    </span>
                  </>
                ) : (
                  <span className="text-xs text-error">Invalid GitHub URL</span>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-on-surface">Branch</label>
            <input
              type="text"
              placeholder="main"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="w-full rounded-lg border border-outline-variant bg-surface-container px-3 py-2 text-sm text-on-surface outline-none transition focus:border-primary focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={autoReindex}
              onChange={(e) => setAutoReindex(e.target.checked)}
              className="h-4 w-4 rounded accent-primary"
            />
            <div>
              <span className="text-sm font-medium text-on-surface">Auto re-index on push</span>
              <p className="text-xs text-on-surface-variant">Re-index changed files when code is pushed</p>
            </div>
          </label>

          {err && (
            <p className="rounded-lg border border-error-container bg-error-container px-3 py-2 text-sm text-on-error-container">
              {err}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-outline-variant bg-surface-container px-4 py-2 text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container-high"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !parsed}
              className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-on-primary transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 hover:opacity-90"
            >
              {submitting ? 'Adding…' : 'Add & Index'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function IndexingPage() {
  const { repos, loading, error, addRepo, reindex, removeRepo, refresh } = useRepos()
  const [showModal, setShowModal]   = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const filtered = repos.filter((r) => r.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const refreshing = useRef(false)
  async function handleRefresh() {
    if (refreshing.current) return
    refreshing.current = true
    try {
      await refresh()
      toast.success('Repositories refreshed')
    } catch {
      toast.error('Failed to refresh')
    } finally {
      refreshing.current = false
    }
  }

  async function handleReindex(id: string) {
    try {
      await reindex(id)
      toast.success('Re-index started')
    } catch {
      toast.error('Failed to start re-index')
    }
  }

  async function handleDelete(id: string) {
    try {
      await removeRepo(id)
      toast.success('Repository removed')
    } catch {
      toast.error('Failed to remove repository')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-on-background" style={{ fontFamily: 'Geist, Inter, sans-serif' }}>
            Repositories
          </h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            Manage connected codebases, view active investigation jobs, and synchronize latest branch structures.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleRefresh}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-outline-variant text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
            title="Refresh"
          >
            <RiRefreshLine />
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-on-primary shadow-[0_4px_6px_-1px_rgb(0,0,0,0.1)] transition active:scale-[0.98] hover:opacity-90"
          >
            <RiAddLine /> Connect GitHub Repository
          </button>
        </div>
      </div>

      {repos.length > 4 && (
        <input
          type="search"
          placeholder="Filter repositories…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full max-w-sm rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-sm text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      )}

      {loading && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <RepoCardSkeleton key={i} />)}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-error-container bg-error-container px-4 py-3 text-sm text-on-error-container">
          <RiAlertLine className="shrink-0" /> {error}
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          {searchQuery ? (
            <>
              <RiInboxLine className="mb-3 text-5xl text-outline" />
              <h3 className="font-semibold text-on-surface">No repos match your search</h3>
              <p className="mt-1 text-sm text-on-surface-variant">Try a different name.</p>
            </>
          ) : (
            <>
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-container text-3xl text-on-surface-variant">
                <RiGitRepositoryLine />
              </div>
              <h3 className="font-semibold text-on-surface">No repos indexed yet</h3>
              <p className="mt-1 text-sm text-on-surface-variant">Add a repo to get started.</p>
              <button
                onClick={() => setShowModal(true)}
                className="mt-4 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-on-primary transition hover:opacity-90"
              >
                Connect your first repo
              </button>
            </>
          )}
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((repo) => (
            <RepoCard key={repo.id} repo={repo} onReindex={handleReindex} onDelete={handleDelete} />
          ))}
          {/* Add new card */}
          <button
            onClick={() => setShowModal(true)}
            className="flex min-h-[160px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-outline-variant bg-surface-container-lowest/50 text-on-surface-variant transition-colors hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
          >
            <RiAddLine className="text-2xl" />
            <span className="text-sm font-medium">Add New Repository</span>
            <span className="text-xs text-on-surface-variant">Connect another codebase</span>
          </button>
        </div>
      )}

      {showModal && (
        <AddRepoModal
          onClose={() => setShowModal(false)}
          onAdd={async (url, branch, auto) => {
            await addRepo({ url, branch, autoReindex: auto })
            toast.success('Repository added — indexing started')
          }}
        />
      )}
    </div>
  )
}
