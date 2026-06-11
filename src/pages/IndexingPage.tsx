import { useState } from 'react'
import { RiAddLine, RiAlertLine, RiInboxLine, RiRefreshLine } from 'react-icons/ri'
import { RepoCard } from '../components/RepoCard'
import { useToast } from '../components/Toast'
import { RepoCardSkeleton } from '../components/Skeleton'
import { StatsBar } from '../components/StatsBar'
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
  const [url, setUrl] = useState('')
  const [branch, setBranch] = useState('master')
  const [autoReindex, setAutoReindex] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [err, setErr] = useState<string | null>(null)

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4">
          <h2 className="font-semibold text-zinc-800">Add Repository</h2>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700">
              GitHub URL <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="https://github.com/owner/repo"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm outline-none focus:border-zinc-400 focus:bg-white"
              required
              autoFocus
            />
            {url && (
              <div className="mt-2 flex items-center gap-1.5">
                {parsed ? (
                  <>
                    <span className="text-xs text-emerald-600">✓</span>
                    <span className="text-xs text-zinc-500">
                      <span className="font-medium text-zinc-700">{parsed.author}</span>
                      <span className="text-zinc-300"> / </span>
                      <span className="font-medium text-zinc-700">{parsed.project}</span>
                    </span>
                  </>
                ) : (
                  <span className="text-xs text-red-500">Invalid GitHub URL</span>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700">Branch</label>
            <input
              type="text"
              placeholder="main"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm outline-none focus:border-zinc-400 focus:bg-white"
            />
          </div>

          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={autoReindex}
              onChange={(e) => setAutoReindex(e.target.checked)}
              className="h-4 w-4 rounded accent-zinc-800"
            />
            <div>
              <span className="text-sm font-medium text-zinc-700">Auto re-index on push</span>
              <p className="text-xs text-zinc-400">Re-index changed files when code is pushed</p>
            </div>
          </label>

          {err && (
            <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">
              {err}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !parsed}
              className="flex-1 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
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
  const { repos, stats, loading, error, addRepo, reindex, removeRepo, refresh } = useRepos()
  const toast = useToast()
  const [showModal, setShowModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

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

  const filtered = repos.filter((r) => r.name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Repositories</h1>
          <p className="mt-0.5 text-sm text-zinc-500">
            Manage indexed repos — the agent searches these to trace bugs.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refresh}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-400 transition-colors hover:bg-white hover:text-zinc-600"
            title="Refresh"
          >
            <RiRefreshLine className="text-base" />
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
          >
            <RiAddLine /> Add Repo
          </button>
        </div>
      </div>

      {stats && <StatsBar stats={stats} />}

      {repos.length > 4 && (
        <input
          type="search"
          placeholder="Filter repositories…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full max-w-sm rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-400"
        />
      )}

      {loading && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <RepoCardSkeleton key={i} />
          ))}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
          <RiAlertLine className="shrink-0" /> {error}
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <RiInboxLine className="mb-3 text-5xl text-zinc-300" />
          <h3 className="font-semibold text-zinc-700">
            {searchQuery ? 'No repos match your search' : 'No repos indexed yet'}
          </h3>
          <p className="mt-1 text-sm text-zinc-400">
            {searchQuery ? 'Try a different name.' : 'Add a repo to get started.'}
          </p>
          {!searchQuery && (
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
            >
              Add your first repo
            </button>
          )}
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((repo) => (
            <RepoCard key={repo.id} repo={repo} onReindex={handleReindex} onDelete={handleDelete} />
          ))}
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
