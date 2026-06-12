import { RiSearchLine } from 'react-icons/ri'
import { Navigate, Route, Routes } from 'react-router-dom'
import { Sidebar } from './components/Sidebar'
import { RepoDetailPage } from './pages/RepoDetailPage'
import { ROUTES } from './routes/config'

function TopBar() {
  return (
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center border-b border-outline-variant bg-surface/80 px-10 backdrop-blur-md">
      <div className="relative w-72">
        <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm" />
        <input
          type="text"
          placeholder="Search..."
          className="w-full rounded-full border-none bg-surface-container py-2 pl-9 pr-4 text-sm text-on-surface outline-none transition-all focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20"
        />
      </div>
    </header>
  )
}

export default function App() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar />

        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            {ROUTES.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={
                  route.fullWidth ? (
                    route.element
                  ) : (
                    <div className="mx-auto max-w-[1280px] px-10 py-10">
                      {route.element}
                    </div>
                  )
                }
              />
            ))}
            <Route
              path="/repos/:repoId"
              element={
                <div className="mx-auto max-w-[1280px] px-10 py-10">
                  <RepoDetailPage />
                </div>
              }
            />
          </Routes>
        </main>
      </div>
    </div>
  )
}
