import { useState, type FormEvent } from 'react'
import { RepoCard } from '../components/RepoCard'
import { StatsBar } from '../components/StatsBar'
import { useRepos } from '../hooks/useRepos'
import type { Repo } from '../lib/api'

interface AddRepoModalProps {
  onClose: () => void
  onAdd: (name: string, branch: string, autoReindex: boolean) => Promise<Repo>
}

function AddRepoModal({ onClose, onAdd }: AddRepoModalProps) {
  const [name, setName] = useState('')
  const [branch, setBranch] = useState('main')
  const [autoReindex, setAutoReindex] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">Add Repository</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1.5">
              Repository <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="owner/repo-name"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              autoFocus
            />
            <p className="text-xs text-slate-400 mt-1">e.g. acme-corp/payment-service</p>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1.5">Branch</label>
            <input
              type="text"
              placeholder="main"
              value={branch}
              onChange={e => setBranch(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={autoReindex}
              onChange={e => setAutoReindex(e.target.checked)}
              className="w-4 h-4 rounded accent-blue-500"
            />
            <div>
              <span className="text-sm font-medium text-slate-700">Auto re-index on push</span>
              <p className="text-xs text-slate-400">Re-index changed files when code is pushed</p>
            </div>
          </label>

          {err && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{err}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !name.trim()}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
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

  const filtered = repos.filter(r =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Repositories</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage indexed repos — the agent searches these to trace bugs.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={refresh}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            title="Refresh"
          >
            ↻
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
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
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full max-w-sm border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      )}

      {loading && (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <span className="animate-spin text-2xl mr-3">⟳</span> Loading…
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">
          ⚠️ {error}
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-5xl mb-4">📭</div>
          <h3 className="font-semibold text-slate-700">
            {searchQuery ? 'No repos match your search' : 'No repos indexed yet'}
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            {searchQuery ? 'Try a different name.' : 'Add a repo to get started.'}
          </p>
          {!searchQuery && (
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add your first repo
            </button>
          )}
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(repo => (
            <RepoCard
              key={repo.id}
              repo={repo}
              onReindex={reindex}
              onDelete={removeRepo}
            />
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
