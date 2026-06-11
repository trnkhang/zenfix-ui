import { NavLink, Navigate, Route, Routes } from 'react-router-dom'
import { IndexingPage } from './pages/IndexingPage'
import { JobsPage } from './pages/JobsPage'

function NavItem({ to, label, icon }: { to: string; label: string; icon: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
          isActive
            ? 'bg-blue-50 text-blue-700'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
        }`
      }
    >
      <span>{icon}</span>
      {label}
    </NavLink>
  )
}

export default function App() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="flex w-56 shrink-0 flex-col border-r border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-5 py-5">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🤖</span>
            <div>
              <h1 className="leading-tight font-bold text-slate-800">Zenfix</h1>
              <p className="text-[10px] leading-tight text-slate-400">Bug → MR, Automatically</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          <NavItem to="/indexing" label="Repositories" icon="📦" />
          <NavItem to="/jobs" label="Jobs" icon="⚡" />
        </nav>

        <div className="border-t border-slate-100 p-4">
          <p className="text-center text-xs text-slate-400">GreenNode Claw-a-thon 2025</p>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-6xl p-8">
          <Routes>
            <Route path="/" element={<Navigate to="/indexing" replace />} />
            <Route path="/indexing" element={<IndexingPage />} />
            <Route path="/jobs" element={<JobsPage />} />
          </Routes>
        </div>
      </main>
    </div>
  )
}
