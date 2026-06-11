import type { ReactNode } from 'react'
import { RiChat1Line, RiFlashlightLine, RiGitRepositoryLine } from 'react-icons/ri'
import { ChatPage } from '../pages/ChatPage'
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
    path: '/indexing',
    label: 'Repositories',
    description: 'Manage indexed repos for the agent',
    icon: <RiGitRepositoryLine />,
    element: <IndexingPage />,
  },
  {
    path: '/jobs',
    label: 'Jobs',
    description: 'Live investigation & fix pipeline',
    icon: <RiFlashlightLine />,
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
