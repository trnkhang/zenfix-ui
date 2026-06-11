import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { Sidebar } from './components/Sidebar'
import { ROUTES } from './routes/config'

export default function App() {
  const { pathname } = useLocation()
  const active = ROUTES.find((r) => r.path === pathname)

  return (
    <div className="flex min-h-screen bg-zinc-50">
      <Sidebar />

      <main className="flex-1 overflow-auto">
        {active && (
          <div className="border-b border-zinc-200 bg-white px-8 py-4">
            <div className="mx-auto max-w-6xl">
              <h2 className="text-sm font-semibold text-zinc-800">{active.label}</h2>
              <p className="text-xs text-zinc-400">{active.description}</p>
            </div>
          </div>
        )}

        <Routes>
          <Route path="/" element={<Navigate to="/indexing" replace />} />
          {ROUTES.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={
                route.fullWidth ? (
                  route.element
                ) : (
                  <div className="mx-auto max-w-6xl p-8">{route.element}</div>
                )
              }
            />
          ))}
        </Routes>
      </main>
    </div>
  )
}
