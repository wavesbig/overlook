import { ReactNode } from 'react'
import {
  type Icon,
  IconChartBar,
  IconDashboard,
  IconFolder,
  IconListDetails,
  IconUsers
} from '@tabler/icons-react'

import Home from '@renderer/pages/Home'
import Dashboard from '@renderer/pages/Dashboard'
import Settings from '@renderer/pages/Settings'
import Lifecycle from '@renderer/pages/Lifecycle'
import Analytics from '@renderer/pages/Analytics'
import Projects from '@renderer/pages/Projects'
import Team from '@renderer/pages/Team'

export type AppRoute = {
  path: string
  element: React.JSX.Element
  title: string
  icon?: Icon
  showInNav?: boolean
}

export const appRoutes: AppRoute[] = [
  { path: '/', element: <Home />, title: 'Home' },
  {
    path: '/dashboard',
    element: <Dashboard />,
    title: 'Dashboard',
    icon: IconDashboard,
    showInNav: true
  },
  {
    path: '/lifecycle',
    element: <Lifecycle />,
    title: 'Lifecycle',
    icon: IconListDetails,
    showInNav: true
  },
  {
    path: '/analytics',
    element: <Analytics />,
    title: 'Analytics',
    icon: IconChartBar,
    showInNav: true
  },
  {
    path: '/projects',
    element: <Projects />,
    title: 'Projects',
    icon: IconFolder,
    showInNav: true
  },
  { path: '/team', element: <Team />, title: 'Team', icon: IconUsers, showInNav: true },
  { path: '/settings', element: <Settings />, title: 'Settings' }
]
