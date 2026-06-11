import { useState } from 'react'
import { RepoCard } from '../components/RepoCard'
import { StatsBar } from '../components/StatsBar'
import { useRepos } from '../hooks/useRepos'

interface AddRepoModalProps {
  onClose: () => void
  onAdd: (name: string, branch: string, autoReindex: boolean) => Promise<unknown>
}

function AddRepoModal({ onClose, onAdd }: AddRepoModalProps) {
  const [name, setName] = useState('')
  const [branch, setBranch] = useState('main')
  const [autoReindex, setAutoReindex] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setSubmitting(true)
    setErr(null)
    try {
      await onAdd(name.trim(), branch.trim() || 'main', autoReindex)
      onClose()
    } catch (error) {
      setErr(error instanceof Error ? error.message : 'Failed to add repo')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="font-semibold text-slate-800">Add Repository</h2>
          <button
            onClick={onClose}
            className="text-xl leading-none text-slate-400 hover:text-slate-600"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Repository <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="owner/repo-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
              autoFocus
            />
            <p className="mt-1 text-xs text-slate-400">e.g. acme-corp/payment-service</p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Branch</label>
            <input
              type="text"
              placeholder="main"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={autoReindex}
              onChange={(e) => setAutoReindex(e.target.checked)}
              className="h-4 w-4 rounded accent-blue-500"
            />
            <div>
              <span className="text-sm font-medium text-slate-700">Auto re-index on push</span>
              <p className="text-xs text-slate-400">Re-index changed files when code is pushed</p>
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
              className="flex-1 rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !name.trim()}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
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
  const [showModal, setShowModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const filtered = repos.filter((r) => r.name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Repositories</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Manage indexed repos — the agent searches these to trace bugs.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={refresh}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            title="Refresh"
          >
            ↻
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
          >
            <span>+</span> Add Repo
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
          className="w-full max-w-sm rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      )}

      {loading && (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <span className="mr-3 animate-spin text-2xl">⟳</span> Loading…
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
          ⚠️ {error}
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 text-5xl">📭</div>
          <h3 className="font-semibold text-slate-700">
            {searchQuery ? 'No repos match your search' : 'No repos indexed yet'}
          </h3>
          <p className="mt-1 text-sm text-slate-400">
            {searchQuery ? 'Try a different name.' : 'Add a repo to get started.'}
          </p>
          {!searchQuery && (
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              Add your first repo
            </button>
          )}
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((repo) => (
            <RepoCard key={repo.id} repo={repo} onReindex={reindex} onDelete={removeRepo} />
          ))}
        </div>
      )}

      {showModal && (
        <AddRepoModal
          onClose={() => setShowModal(false)}
          onAdd={(name, branch, auto) => addRepo({ name, branch, autoReindex: auto })}
        />
      )}
    </div>
  )
}
