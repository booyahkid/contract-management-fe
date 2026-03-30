'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Bell, Calendar, Send, AlertTriangle, Settings, CheckCircle, Clock } from 'lucide-react'
import { getContractsDueSoon, sendDueReminder, updateNotificationPreferences } from '@/lib/api/emails'
import { ContractDue, NotificationPreferences } from '@/types/email'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'

export default function NotificationsPage() {
  const [contractsDue, setContractsDue] = useState<ContractDue[]>([])
  const [loading, setLoading] = useState(true)
  const [sendingReminders, setSendingReminders] = useState<Set<number>>(new Set())
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    emailEnabled: true,
    dueAlerts90Days: true,
    dueAlerts30Days: true,
    dueAlerts7Days: true,
    digestFrequency: 'weekly',
    priority: 'normal'
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const dueSoonData = await getContractsDueSoon()
      setContractsDue(dueSoonData)
    } catch (error) {
      console.error('Failed to load due contracts:', error)
      toast.error('Failed to load contracts due soon')
    } finally {
      setLoading(false)
    }
  }

  const handleSendReminder = async (contractId: number) => {
    setSendingReminders(prev => new Set([...prev, contractId]))
    
    try {
      await sendDueReminder(contractId)
      toast.success('Due reminder sent successfully!')
      
      // Update the contract to show reminder was sent
      setContractsDue(prev => 
        prev.map(contract => 
          contract.id === contractId 
            ? { ...contract, lastReminderSent: new Date().toISOString() }
            : contract
        )
      )
    } catch (error) {
      console.error('Failed to send reminder:', error)
      toast.error('Failed to send reminder')
    } finally {
      setSendingReminders(prev => {
        const newSet = new Set(prev)
        newSet.delete(contractId)
        return newSet
      })
    }
  }

  const handleUpdatePreferences = async (newPreferences: Partial<NotificationPreferences>) => {
    try {
      const updatedPrefs = { ...preferences, ...newPreferences }
      await updateNotificationPreferences(updatedPrefs)
      setPreferences(updatedPrefs)
      toast.success('Notification preferences updated!')
    } catch (error) {
      console.error('Failed to update preferences:', error)
      toast.error('Failed to update preferences')
    }
  }

  const getDaysUntilExpiryColor = (days: number) => {
    if (days <= 7) return 'text-red-600 dark:text-red-400'
    if (days <= 30) return 'text-orange-600 dark:text-orange-400'
    if (days <= 90) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-gray-600 dark:text-gray-400'
  }

  const getDaysUntilExpiryBadge = (days: number) => {
    if (days <= 7) return <Badge variant="destructive">Critical</Badge>
    if (days <= 30) return <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">Warning</Badge>
    if (days <= 90) return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Notice</Badge>
    return <Badge variant="secondary">Upcoming</Badge>
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-6 p-6 w-full bg-background">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          <div>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-40 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6 w-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Due Notifications</h1>
          <p className="text-muted-foreground">Manage contract expiration notifications and alerts</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Critical (≤7 days)</p>
                <p className="text-2xl font-bold text-red-600">
                  {contractsDue.filter(c => c.daysUntilExpiry <= 7).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Warning (≤30 days)</p>
                <p className="text-2xl font-bold text-orange-600">
                  {contractsDue.filter(c => c.daysUntilExpiry <= 30 && c.daysUntilExpiry > 7).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Notice (≤90 days)</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {contractsDue.filter(c => c.daysUntilExpiry <= 90 && c.daysUntilExpiry > 30).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Due Soon</p>
                <p className="text-2xl font-bold text-blue-600">{contractsDue.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contracts Due Soon */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Contracts Due Soon
              </CardTitle>
            </CardHeader>
            <CardContent>
              {contractsDue.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No contracts due soon</p>
                  <p className="text-sm">All contracts are within their valid periods</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Contract</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Days Left</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contractsDue.map((contract) => (
                      <TableRow key={contract.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{contract.contract_name}</div>
                            <div className="text-xs text-muted-foreground">{contract.contract_number}</div>
                          </div>
                        </TableCell>
                        <TableCell>{contract.vendor}</TableCell>
                        <TableCell>{formatDate(contract.end_date)}</TableCell>
                        <TableCell>
                          <span className={getDaysUntilExpiryColor(contract.daysUntilExpiry)}>
                            {contract.daysUntilExpiry} days
                          </span>
                        </TableCell>
                        <TableCell>{getDaysUntilExpiryBadge(contract.daysUntilExpiry)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={sendingReminders.has(contract.id)}
                              onClick={() => handleSendReminder(contract.id)}
                            >
                              <Send className="w-4 h-4 mr-1" />
                              {sendingReminders.has(contract.id) ? 'Sending...' : 'Send Reminder'}
                            </Button>
                            {contract.lastReminderSent && (
                              <div className="text-xs text-muted-foreground">
                                Last sent: {formatDate(contract.lastReminderSent)}
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Notification Settings */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Email Notifications */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="emailEnabled">Email Notifications</Label>
                  <Switch
                    id="emailEnabled"
                    checked={preferences.emailEnabled}
                    onCheckedChange={(checked) => handleUpdatePreferences({ emailEnabled: checked })}
                  />
                </div>

                {preferences.emailEnabled && (
                  <div className="pl-4 space-y-3 border-l-2 border-muted">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="dueAlerts90Days" className="text-sm">90 days before expiry</Label>
                      <Switch
                        id="dueAlerts90Days"
                        checked={preferences.dueAlerts90Days}
                        onCheckedChange={(checked) => handleUpdatePreferences({ dueAlerts90Days: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="dueAlerts30Days" className="text-sm">30 days before expiry</Label>
                      <Switch
                        id="dueAlerts30Days"
                        checked={preferences.dueAlerts30Days}
                        onCheckedChange={(checked) => handleUpdatePreferences({ dueAlerts30Days: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="dueAlerts7Days" className="text-sm">7 days before expiry</Label>
                      <Switch
                        id="dueAlerts7Days"
                        checked={preferences.dueAlerts7Days}
                        onCheckedChange={(checked) => handleUpdatePreferences({ dueAlerts7Days: checked })}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Digest Settings */}
              <div className="space-y-3">
                <Label>Email Digest Frequency</Label>
                <Select 
                  value={preferences.digestFrequency} 
                  onValueChange={(value: 'none' | 'daily' | 'weekly' | 'monthly') => 
                    handleUpdatePreferences({ digestFrequency: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Never</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Priority Settings */}
              <div className="space-y-3">
                <Label>Default Email Priority</Label>
                <Select 
                  value={preferences.priority} 
                  onValueChange={(value: 'low' | 'normal' | 'high' | 'urgent') => 
                    handleUpdatePreferences({ priority: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => {
                  contractsDue
                    .filter(c => c.daysUntilExpiry <= 7)
                    .forEach(contract => handleSendReminder(contract.id))
                }}
                disabled={contractsDue.filter(c => c.daysUntilExpiry <= 7).length === 0}
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Send All Critical Reminders
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => {
                  contractsDue
                    .filter(c => c.daysUntilExpiry <= 30)
                    .forEach(contract => handleSendReminder(contract.id))
                }}
                disabled={contractsDue.filter(c => c.daysUntilExpiry <= 30).length === 0}
              >
                <Clock className="w-4 h-4 mr-2" />
                Send All Warning Reminders
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
