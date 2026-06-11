import type { ReactNode } from 'react'
import { RiRobot2Line } from 'react-icons/ri'
import { NavLink } from 'react-router-dom'
import { ROUTES } from '../routes/config'

function NavItem({ to, label, icon }: { to: string; label: string; icon: ReactNode }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
          isActive
            ? 'bg-white/10 text-white'
            : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'
        }`
      }
    >
      <span className="text-base">{icon}</span>
      {label}
    </NavLink>
  )
}

export function Sidebar() {
  return (
    <aside className="flex w-56 shrink-0 flex-col bg-zinc-900">
      <div className="px-5 py-5">
        <div className="flex items-center gap-2.5">
          <RiRobot2Line className="text-xl text-white" />
          <div>
            <h1 className="text-sm font-semibold leading-tight text-white">Zenfix</h1>
            <p className="text-[10px] leading-tight text-zinc-500">Bug → MR, Automatically</p>
          </div>
        </div>
      </div>

      <div className="mx-4 h-px bg-zinc-800" />

      <nav className="flex-1 space-y-0.5 p-3 pt-4">
        <p className="mb-2 px-3 text-[10px] font-semibold tracking-widest text-zinc-600 uppercase">
          Navigation
        </p>
        {ROUTES.map((route) => (
          <NavItem key={route.path} to={route.path} label={route.label} icon={route.icon} />
        ))}
      </nav>

      <div className="p-4">
        <p className="text-center text-[11px] text-zinc-600">GreenNode Claw-a-thon 2025</p>
      </div>
    </aside>
  )
}
