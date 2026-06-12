import type { ReactNode } from 'react'
import {
  RiBugLine,
  RiChat1Line,
  RiDashboard2Line,
  RiGitRepositoryLine,
} from 'react-icons/ri'
import { ChatPage } from '../pages/ChatPage'
import { DashboardPage } from '../pages/DashboardPage'
import { IndexingPage } from '../pages/IndexingPage'
import { JobsPage } from '../pages/JobsPage'

export interface RouteConfig {
  path: string
  label: string
  description: string
  icon: ReactNode
  element: ReactNode
  fullWidth?: boolean
}

export const ROUTES: RouteConfig[] = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    description: 'System health and active investigations',
    icon: <RiDashboard2Line />,
    element: <DashboardPage />,
  },
  {
    path: '/indexing',
    label: 'Repositories',
    description: 'Manage connected codebases for the agent',
    icon: <RiGitRepositoryLine />,
    element: <IndexingPage />,
  },
  {
    path: '/jobs',
    label: 'Investigations',
    description: 'Live investigation and fix pipeline runs',
    icon: <RiBugLine />,
    element: <JobsPage />,
  },
  {
    path: '/chat',
    label: 'Chat',
    description: 'Ask the model about indexed repos',
    icon: <RiChat1Line />,
    element: <ChatPage />,
    fullWidth: true,
  },
]
