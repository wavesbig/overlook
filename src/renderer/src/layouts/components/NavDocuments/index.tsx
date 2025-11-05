import { ReactNode } from 'react'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@renderer/components/ui/sidebar'
import { useGridStore } from '@renderer/store/grid'

export default function NavDocuments(): ReactNode {
  const { layouts, currentLayoutId, switchLayout, createLayout } = useGridStore()

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>布局</SidebarGroupLabel>
      <SidebarMenu>
        {layouts.map((l) => (
          <SidebarMenuItem key={l.id}>
            <SidebarMenuButton
              tooltip={l.name}
              isActive={l.id === currentLayoutId}
              onClick={() => switchLayout(l.id)}
            >
              <span className="truncate max-w-[180px]">{l.name}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
