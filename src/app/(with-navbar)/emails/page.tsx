 'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mail, Send, History, FileType, Bell, BarChart3 } from 'lucide-react'

export default function EmailsPage() {
  const router = useRouter()

  const emailFeatures = [
    {
      title: 'Compose Email',
      description: 'Send emails to vendors, partners, and stakeholders with contract information',
      icon: Mail,
      href: '/emails/compose',
      color: 'bg-blue-500'
    },
    {
      title: 'Email History',
      description: 'View all sent emails, track delivery status, and manage email records',
      icon: History,
      href: '/emails/history',
      color: 'bg-green-500'
    },
    {
      title: 'Email Templates',
      description: 'Create and manage reusable email templates for common communications',
      icon: FileType,
      href: '/emails/templates',
      color: 'bg-purple-500'
    },
    {
      title: 'Due Notifications',
      description: 'Manage automated notifications for contracts nearing expiration',
      icon: Bell,
      href: '/emails/notifications',
      color: 'bg-orange-500'
    }
  ]

  return (
    <div className="flex flex-col gap-6 p-6 w-full bg-background">
      {/* Header Section */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground">Email Management</h1>
        <p className="text-muted-foreground">
          Manage email communications for contracts, vendors, and automated notifications
        </p>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Send className="w-4 h-4" />
              Emails Sent Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">0</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <History className="w-4 h-4" />
              Total Email History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">0</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <FileType className="w-4 h-4" />
              Active Templates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">0</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Pending Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">0</div>
          </CardContent>
        </Card>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {emailFeatures.map((feature) => {
          const IconComponent = feature.icon
          return (
            <Card key={feature.href} className="shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${feature.color} flex items-center justify-center`}>
                    <IconComponent className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
                <Button 
                  onClick={() => router.push(feature.href)}
                  className="w-full"
                  variant="outline"
                >
                  Open {feature.title}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent Activity Placeholder */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Recent Email Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No recent email activity</p>
            <p className="text-sm">Start by composing your first email</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
