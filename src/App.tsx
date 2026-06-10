import { NavLink, Navigate, Route, Routes } from 'react-router-dom'
import { IndexingPage } from './pages/IndexingPage'
import { JobsPage } from './pages/JobsPage'

function NavItem({ to, label, icon }: { to: string; label: string; icon: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          isActive
            ? 'bg-blue-50 text-blue-700'
            : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
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
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="w-56 shrink-0 bg-white border-r border-slate-200 flex flex-col">
        <div className="px-5 py-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🤖</span>
            <div>
              <h1 className="font-bold text-slate-800 leading-tight">Zenfix</h1>
              <p className="text-[10px] text-slate-400 leading-tight">Bug → MR, Automatically</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          <NavItem to="/indexing" label="Repositories" icon="📦" />
          <NavItem to="/jobs" label="Jobs" icon="⚡" />
        </nav>

        <div className="p-4 border-t border-slate-100">
          <p className="text-xs text-slate-400 text-center">GreenNode Claw-a-thon 2025</p>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto p-8">
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
