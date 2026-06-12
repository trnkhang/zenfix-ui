import type { ReactNode } from 'react'
import {
  RiBugLine,
  RiChat1Line,
  RiDashboard2Line,
  RiGitRepositoryLine,
} from 'react-icons/ri'

import { NavLink, useLocation } from 'react-router-dom'
import { ZenfixMark } from './ZenfixLogo'

interface NavItem {
  to: string
  label: string
  icon: ReactNode
  matchPaths?: string[]
}

const MAIN_NAV: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard',      icon: <RiDashboard2Line /> },
  { to: '/indexing',  label: 'Repositories',   icon: <RiGitRepositoryLine />, matchPaths: ['/repos'] },
  { to: '/jobs',      label: 'Investigations', icon: <RiBugLine /> },
  { to: '/chat',      label: 'Chat',           icon: <RiChat1Line /> },
]

function NavItemLink({ to, label, icon, matchPaths }: NavItem) {
  const { pathname } = useLocation()
  const extraActive = matchPaths?.some((p) => pathname.startsWith(p)) ?? false

  return (
    <NavLink
      to={to}
      className={({ isActive }) => {
        const active = isActive || extraActive
        return `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150 ${
          active
            ? 'bg-primary/8 text-primary font-semibold'
            : 'text-on-surface-variant hover:bg-surface-container'
        }`
      }}
    >
      <span className="text-[18px] shrink-0">{icon}</span>
      {label}
    </NavLink>
  )
}

export function Sidebar() {
  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-outline-variant bg-surface">
      {/* Logo */}
      <div className="flex h-14 shrink-0 items-center gap-3 border-b border-outline-variant/50 px-6">
        <ZenfixMark size={32} className="shrink-0" />
        <div>
          <h1 className="text-sm font-bold leading-tight text-primary" style={{ fontFamily: 'Geist, Inter, sans-serif' }}>
            Zenfix Engineering
          </h1>
          <p className="text-[11px] leading-tight text-on-surface-variant">Bug Report to Pull Request</p>
        </div>
      </div>

      {/* Main nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-0.5">
        {MAIN_NAV.map((item) => (
          <NavItemLink key={item.to} {...item} />
        ))}
      </nav>

    </aside>
  )
}
