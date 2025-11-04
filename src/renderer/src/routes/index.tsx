import { lazy } from 'react'
import type { RouteObject } from 'react-router-dom'
import {
  type Icon,
  IconChartBar,
  IconDashboard,
  IconFolder,
  IconListDetails,
  IconUsers
} from '@tabler/icons-react'

// Route components (lazy for better code-splitting)
const Home = lazy(() => import('@renderer/pages/Home'))
const Dashboard = lazy(() => import('@renderer/pages/Dashboard'))
const Settings = lazy(() => import('@renderer/pages/Settings'))
const Lifecycle = lazy(() => import('@renderer/pages/Lifecycle'))
const Analytics = lazy(() => import('@renderer/pages/Analytics'))
const Projects = lazy(() => import('@renderer/pages/Projects'))
const Team = lazy(() => import('@renderer/pages/Team'))

// 导航数据（纯元信息，供侧边栏使用）
export type AppNavItem = {
  title: string
  url: string
  icon?: Icon
}

export const appNavMain: AppNavItem[] = [
  { title: 'Dashboard', url: '/dashboard', icon: IconDashboard },
  { title: 'Lifecycle', url: '/lifecycle', icon: IconListDetails },
  { title: 'Analytics', url: '/analytics', icon: IconChartBar },
  { title: 'Projects', url: '/projects', icon: IconFolder },
  { title: 'Team', url: '/team', icon: IconUsers }
]

// 路由对象（供 useRoutes 使用）
export const routeChildren: RouteObject[] = [
  { path: '/', element: <Home /> },
  { path: '/dashboard', element: <Dashboard /> },
  { path: '/lifecycle', element: <Lifecycle /> },
  { path: '/analytics', element: <Analytics /> },
  { path: '/projects', element: <Projects /> },
  { path: '/team', element: <Team /> },
  { path: '/settings', element: <Settings /> }
]
