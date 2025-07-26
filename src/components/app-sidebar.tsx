'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

// import { SearchForm } from '@/components/search-form'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'

import { 
  Home, 
  FileText, 
  Plus, 
  BarChart3, 
  Settings, 
  Users, 
  Calendar,
  AlertTriangle,
  LogOut
} from 'lucide-react'
import { removeToken } from '@/lib/auth'
import { useRouter } from 'next/navigation'

const navMain = [
  {
    title: 'Dashboard',
    items: [
      { title: 'Overview', url: '/dashboard', icon: Home },
      { title: 'Analytics', url: '/analytics', icon: BarChart3 },
    ],
  },
  {
    title: 'Contracts',
    items: [
      { title: 'All Contracts', url: '/contracts', icon: FileText },
      { title: 'New Contract', url: '/contracts/new', icon: Plus },
      { title: 'Expiring Soon', url: '/contracts/expiring', icon: AlertTriangle },
    ],
  },
  {
    title: 'Management',
    items: [
      { title: 'Vendors', url: '/vendors', icon: Users },
      { title: 'Calendar', url: '/calendar', icon: Calendar },
    ],
  },
  {
    title: 'Settings',
    items: [
      { title: 'Profile', url: '/profile', icon: Settings },
    ],
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = () => {
    removeToken()
    router.push('/')
  }

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className="font-bold text-lg px-4 py-2 flex items-center gap-2">
          <span>IGW</span>
        </div>
        {/* <SearchForm /> */}
      </SidebarHeader>
      <SidebarContent>
        {navMain.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive = pathname === item.url
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <Link href={item.url} className="flex items-center gap-2">
                          <item.icon className="w-4 h-4" />
                          {item.title}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout} className="w-full">
              <LogOut className="w-4 h-4" />
              <span className='text-l'>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
