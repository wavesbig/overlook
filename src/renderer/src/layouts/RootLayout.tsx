import { Outlet } from 'react-router-dom'
import { SidebarProvider, SidebarInset } from '@renderer/components/ui/sidebar'

import { ReactNode } from 'react'
import { AppSidebar, SiteHeader } from './components'

export default function RootLayout(): ReactNode {
  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 56)',
          '--header-height': 'calc(var(--spacing) * 12)'
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />

        <div className="flex flex-1 flex-col  p-4">
          <Outlet />
        </div>
      </SidebarInset>
      {/* <SidebarInset>
          <div className="flex-1 p-4">
            <Outlet />
          </div>
        </SidebarInset> */}
    </SidebarProvider>
  )
}
