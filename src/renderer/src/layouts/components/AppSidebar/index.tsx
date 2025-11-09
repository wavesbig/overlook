'use client'

import * as React from 'react'
import {
  IconCamera,
  IconFileAi,
  IconFileDescription,
  IconInnerShadowTop,
  IconSettings
} from '@tabler/icons-react'

import { NavDocuments, NavSecondary } from '../index'
// import { appNavMain } from '@renderer/routes'

// import { NavUser } from '@renderer/components/nav-user'
import {
  Sidebar,
  SidebarContent,
  // SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@renderer/components/ui/sidebar'

const data = {
  user: {
    name: 'wavesbig',
    email: 'wavesbig@qq.com'
    // avatar: '/avatars/wavesbig.jpg'
  },
  // navMain: appNavMain,
  navMain: [],
  navClouds: [
    {
      title: 'Capture',
      icon: IconCamera,
      isActive: true,
      url: '#',
      items: [
        {
          title: 'Active Proposals',
          url: '#'
        },
        {
          title: 'Archived',
          url: '#'
        }
      ]
    },
    {
      title: 'Proposal',
      icon: IconFileDescription,
      url: '#',
      items: [
        {
          title: 'Active Proposals',
          url: '#'
        },
        {
          title: 'Archived',
          url: '#'
        }
      ]
    },
    {
      title: 'Prompts',
      icon: IconFileAi,
      url: '#',
      items: [
        {
          title: 'Active Proposals',
          url: '#'
        },
        {
          title: 'Archived',
          url: '#'
        }
      ]
    }
  ],
  navSecondary: [
    {
      title: '设置',
      url: '/settings',
      icon: IconSettings
    }

    // {
    //   title: 'Search',
    //   url: '#',
    //   icon: IconSearch
    // }
  ]
}

export default function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>): React.ReactNode {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:p-1.5!">
              <a href="#">
                <IconInnerShadowTop className="size-5!" />
                <span className="text-base font-semibold">Overlook</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {/* <NavMain items={data.navMain} /> */}
        <NavDocuments />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      {/* <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter> */}
    </Sidebar>
  )
}
