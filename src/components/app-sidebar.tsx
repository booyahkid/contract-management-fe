'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

// import { SearchForm } from '@/components/search-form'
import { ModeToggle } from '@/components/mode-toggle'
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
  LogOut,
  Brain,
  Mail,
  Send,
  History,
  FileType,
  Bell
} from 'lucide-react'
import { removeToken } from '@/lib/auth'
import { useRouter } from 'next/navigation'

const navMain = [
  {
    title: 'Dashboard',
    items: [
      { title: 'Dashboard', url: '/dashboard', icon: Home },
//      { title: 'Analytics', url: '/analytics', icon: BarChart3 },
    ],
  },
  {
    title: 'Contracts',
    items: [
      { title: 'New Contract', url: '/contracts/new', icon: Plus },
      { title: 'All Contracts', url: '/contracts', icon: FileText },
      //{ title: 'Expiring Soon', url: '/contracts/expiring', icon: AlertTriangle },
      { title: 'RAG Assistant', url: '/rag', icon: Brain },
    ],
  },
  {
    title: 'Email',
    items: [
      { title: 'Compose Email', url: '/emails/compose', icon: Mail },
      { title: 'Email History', url: '/emails/history', icon: History },
      { title: 'Templates', url: '/emails/templates', icon: FileType },
      //{ title: 'Due Notifications', url: '/emails/notifications', icon: Bell },
    ],
  },
  // {
  //   title: 'Management',
  //   items: [
  //     { title: 'Vendors', url: '/vendors', icon: Users },
  //     { title: 'Calendar', url: '/calendar', icon: Calendar },
  //   ],
  // },
  // {
  //   title: 'Settings',
  //   items: [
  //     { title: 'Profile', url: '/profile', icon: Settings },
  //   ],
  // },
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
            <div className="flex items-center justify-between w-full px-2">
              <ModeToggle />
              <SidebarMenuButton onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
                <span className='text-l'>Logout</span>
              </SidebarMenuButton>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
