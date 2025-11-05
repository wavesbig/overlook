import { lazy } from 'react'
import type { RouteObject } from 'react-router-dom'
import { Navigate } from 'react-router-dom'
import { type Icon, IconDashboard } from '@tabler/icons-react'

// Route components (lazy for better code-splitting)

const Dashboard = lazy(() => import('@renderer/pages/Dashboard'))
// const Layouts = lazy(() => import('@renderer/pages/Layouts'))
const Settings = lazy(() => import('@renderer/pages/Settings'))

// 导航数据（纯元信息，供侧边栏使用）
export type AppNavItem = {
  title: string
  url: string
  icon?: Icon
}

export const appNavMain: AppNavItem[] = [
  { title: '主看板', url: '/dashboard', icon: IconDashboard }
  // { title: '布局管理', url: '/layouts', icon: IconLayoutGrid }
]

// 路由对象（供 useRoutes 使用）
export const routeChildren: RouteObject[] = [
  { path: '/', element: <Navigate to="/dashboard" replace /> },
  { path: '/dashboard', element: <Dashboard /> },
  // { path: '/layouts', element: <Layouts /> },
  { path: '/settings', element: <Settings /> }
]
