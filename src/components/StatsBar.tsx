import type { RepoStats } from '../types'

interface Props {
  stats: RepoStats
}

function StatItem({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="flex flex-1 flex-col gap-0.5 rounded-xl border border-zinc-200 bg-white px-5 py-4">
      <span className="text-xl font-bold text-zinc-800">{value}</span>
      <span className="text-xs text-zinc-400 uppercase tracking-wide">{label}</span>
    </div>
  )
}

export function StatsBar({ stats }: Props) {
  return (
    <div className="flex gap-3">
      <StatItem label="Total Repos"   value={stats.totalRepos} />
      <StatItem label="Indexed"       value={stats.indexedRepos} />
      <StatItem label="Total Chunks"  value={stats.totalChunks.toLocaleString()} />
      <StatItem label="Active Jobs"   value={stats.activeJobs} />
    </div>
  )
}
