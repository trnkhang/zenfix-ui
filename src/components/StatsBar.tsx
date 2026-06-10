import type { RepoStats } from '../lib/api'

export interface StatsBarProps {
  stats: RepoStats
}

interface StatItemProps {
  label: string
  value: number | string
  color?: string
}

function StatItem({ label, value, color = 'text-slate-800' }: StatItemProps) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className={`text-2xl font-bold ${color}`}>{value}</span>
      <span className="text-xs text-slate-500 uppercase tracking-wide">{label}</span>
    </div>
  )
}

export function StatsBar({ stats }: StatsBarProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl px-6 py-4 flex items-center gap-8 shadow-sm">
      <StatItem label="Total Repos" value={stats.totalRepos} />
      <div className="w-px h-10 bg-slate-100" />
      <StatItem label="Indexed" value={stats.indexedRepos} color="text-emerald-600" />
      <div className="w-px h-10 bg-slate-100" />
      <StatItem
        label="Total Chunks"
        value={stats.totalChunks.toLocaleString()}
        color="text-blue-600"
      />
      <div className="w-px h-10 bg-slate-100" />
      <StatItem
        label="Active Jobs"
        value={stats.activeJobs}
        color={stats.activeJobs > 0 ? 'text-amber-600' : 'text-slate-800'}
      />
    </div>
  )
}
