'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Mail, Search, Filter, Eye, Trash2, Calendar, User, Send, Clock, CheckCircle, XCircle, Paperclip } from 'lucide-react'
import { getAllEmailHistory, deleteEmail, getEmailById } from '@/lib/api/emails'
import { Email } from '@/types/email'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'

export default function EmailHistoryPage() {
  const router = useRouter()
  const [emails, setEmails] = useState<Email[]>([])
  const [filteredEmails, setFilteredEmails] = useState<Email[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [viewEmailId, setViewEmailId] = useState<number | null>(null)
  const [viewEmailData, setViewEmailData] = useState<Email | null>(null)
  const [loadingViewEmail, setLoadingViewEmail] = useState(false)

  useEffect(() => {
    loadEmails()
  }, [])

  useEffect(() => {
    filterEmails()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emails, searchTerm, statusFilter, priorityFilter, typeFilter])

  const loadEmails = async () => {
    try {
      setLoading(true)
      const emailData = await getAllEmailHistory()
      // Ensure emailData is an array
      if (Array.isArray(emailData)) {
        setEmails(emailData)
      } else {
        console.error('Email data is not an array:', emailData)
        setEmails([])
        toast.error('Invalid email data format received')
      }
    } catch (error) {
      console.error('Failed to load email history:', error)
      setEmails([]) // Reset to empty array on error
      toast.error('Failed to load email history')
    } finally {
      setLoading(false)
    }
  }

  const filterEmails = () => {
    // Ensure emails is an array before filtering
    if (!Array.isArray(emails)) {
      console.error('Emails is not an array:', emails)
      setFilteredEmails([])
      return
    }

    let filtered = emails

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(email =>
        email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        email.to_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (email.contract_name || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(email => email.status === statusFilter)
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(email => email.priority === priorityFilter)
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(email => email.email_type === typeFilter)
    }

    setFilteredEmails(filtered)
  }

  const handleDeleteEmail = async (emailId: number) => {
    if (!confirm('Are you sure you want to delete this email?')) return

    try {
      await deleteEmail(emailId)
      setEmails(prev => prev.filter(email => email.id !== emailId))
      toast.success('Email deleted successfully')
    } catch (error) {
      console.error('Failed to delete email:', error)
      toast.error('Failed to delete email')
    }
  }

  const handleViewEmail = async (emailId: number) => {
    try {
      setLoadingViewEmail(true)
      setViewEmailId(emailId)
      const emailData = await getEmailById(emailId)
      setViewEmailData(emailData)
    } catch (error) {
      console.error('Failed to load email details:', error)
      toast.error('Failed to load email details')
    } finally {
      setLoadingViewEmail(false)
    }
  }

  const handleCloseViewEmail = () => {
    setViewEmailId(null)
    setViewEmailData(null)
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      sent: 'default',
      draft: 'secondary',
      scheduled: 'outline',
      failed: 'destructive'
    } as const

    const colors = {
      sent: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      draft: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
      scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    }

    return (
      <Badge variant={variants[status as keyof typeof variants]} className={colors[status as keyof typeof colors]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const getPriorityBadge = (priority: string) => {
    const colors = {
      low: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
      normal: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400',
      high: 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400',
      urgent: 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400'
    }

    return (
      <Badge variant="outline" className={colors[priority as keyof typeof colors]}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    )
  }

  const getTypeIcon = (emailType: string) => {
    switch (emailType) {
      case 'manual':
        return <User className="w-4 h-4" />
      case 'contract_due':
        return <Calendar className="w-4 h-4" />
      case 'contract_created':
      case 'contract_updated':
        return <Send className="w-4 h-4" />
      default:
        return <Mail className="w-4 h-4" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-6 p-6 w-full bg-background">
        <Skeleton className="h-8 w-64" />
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
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6 w-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Email History</h1>
          <p className="text-muted-foreground">View and manage all sent emails</p>
        </div>
        <Button onClick={() => router.push('/emails/compose')}>
          <Mail className="w-4 h-4 mr-2" />
          Compose New
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Send className="w-4 h-4 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Sent</p>
                <p className="text-2xl font-bold">{Array.isArray(emails) ? emails.filter(e => e.status === 'sent').length : 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Scheduled</p>
                <p className="text-2xl font-bold">{Array.isArray(emails) ? emails.filter(e => e.status === 'scheduled').length : 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-sm text-muted-foreground">Drafts</p>
                <p className="text-2xl font-bold">{Array.isArray(emails) ? emails.filter(e => e.status === 'draft').length : 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Failed</p>
                <p className="text-2xl font-bold">{Array.isArray(emails) ? emails.filter(e => e.status === 'failed').length : 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search emails..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="contract_due">Due Reminder</SelectItem>
                <SelectItem value="contract_created">Contract Created</SelectItem>
                <SelectItem value="contract_updated">Contract Updated</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('')
                setStatusFilter('all')
                setPriorityFilter('all')
                setTypeFilter('all')
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Email List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Email History ({filteredEmails.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredEmails.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No emails found</p>
              <p className="text-sm">Try adjusting your filters or compose your first email</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Contract</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmails.map((email) => (
                  <TableRow key={email.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTypeIcon(email.email_type)}
                        <span className="text-xs text-muted-foreground">
                          {email.email_type.replace('_', ' ')}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {email.subject}
                        {email.attachments && email.attachments.length > 0 && (
                          <Paperclip className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{email.to_email}</TableCell>
                    <TableCell>{getStatusBadge(email.status)}</TableCell>
                    <TableCell>{getPriorityBadge(email.priority)}</TableCell>
                    <TableCell>
                      {email.contract_name ? (
                        <div className="text-xs">
                          <div className="font-medium">{email.contract_name}</div>
                          <div className="text-muted-foreground">{email.contract_number}</div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs">
                      <div>{formatDate(email.sent_at || email.created_at)}</div>
                      {email.scheduled_send_at && email.status === 'scheduled' && (
                        <div className="text-muted-foreground">
                          Scheduled: {formatDate(email.scheduled_send_at)}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleViewEmail(email.id)}
                          disabled={loadingViewEmail && viewEmailId === email.id}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {email.status === 'draft' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => router.push(`/emails/compose?emailId=${email.id}`)}
                          >
                            Edit
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDeleteEmail(email.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* View Email Modal */}
      <Dialog open={viewEmailData !== null} onOpenChange={(open) => {
        if (!open) handleCloseViewEmail()
      }}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Email Details
            </DialogTitle>
          </DialogHeader>
          
          {viewEmailData && (
            <div className="space-y-6">
              {/* Email Header */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                    <div className="mt-1">{getStatusBadge(viewEmailData.status)}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Priority</Label>
                    <div className="mt-1">{getPriorityBadge(viewEmailData.priority)}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Type</Label>
                    <div className="mt-1 flex items-center gap-2">
                      {getTypeIcon(viewEmailData.email_type)}
                      <span className="text-sm">{viewEmailData.email_type.replace('_', ' ')}</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Date</Label>
                    <div className="mt-1 text-sm">{formatDate(viewEmailData.sent_at || viewEmailData.created_at)}</div>
                  </div>
                </div>
              </div>

              {/* Recipients */}
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">To</Label>
                  <div className="mt-1 text-sm font-mono bg-muted p-2 rounded">{viewEmailData.to_email}</div>
                </div>
                
                {viewEmailData.cc_emails && viewEmailData.cc_emails.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">CC</Label>
                    <div className="mt-1 text-sm font-mono bg-muted p-2 rounded">
                      {Array.isArray(viewEmailData.cc_emails) 
                        ? viewEmailData.cc_emails.join(', ')
                        : viewEmailData.cc_emails}
                    </div>
                  </div>
                )}
                
                {viewEmailData.bcc_emails && viewEmailData.bcc_emails.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">BCC</Label>
                    <div className="mt-1 text-sm font-mono bg-muted p-2 rounded">
                      {Array.isArray(viewEmailData.bcc_emails) 
                        ? viewEmailData.bcc_emails.join(', ')
                        : viewEmailData.bcc_emails}
                    </div>
                  </div>
                )}
              </div>

              {/* Subject */}
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Subject</Label>
                <div className="mt-1 text-lg font-semibold">{viewEmailData.subject}</div>
              </div>

              {/* Contract Info */}
              {viewEmailData.contract_name && (
                <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <Label className="text-sm font-medium text-muted-foreground">Related Contract</Label>
                  <div className="mt-2">
                    <div className="font-medium">{viewEmailData.contract_name}</div>
                    <div className="text-sm text-muted-foreground">{viewEmailData.contract_number}</div>
                  </div>
                </div>
              )}

              {/* Email Body */}
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Message</Label>
                <div className="mt-2 p-4 bg-muted rounded-lg">
                  <div className="whitespace-pre-wrap text-sm">{viewEmailData.body_text}</div>
                </div>
              </div>

              {/* Attachments */}
              {viewEmailData.attachments && viewEmailData.attachments.length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Attachments</Label>
                  <div className="mt-2 space-y-2">
                    {viewEmailData.attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                        <Paperclip className="w-4 h-4" />
                        <span className="text-sm">{attachment.fileName}</span>
                        <span className="text-xs text-muted-foreground">
                          ({(attachment.fileSize / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Scheduled Send */}
              {viewEmailData.scheduled_send_at && (
                <div className="p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
                  <Label className="text-sm font-medium text-muted-foreground">Scheduled Send Time</Label>
                  <div className="mt-1 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">{formatDate(viewEmailData.scheduled_send_at)}</span>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {viewEmailData.error_message && (
                <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                  <Label className="text-sm font-medium text-red-600 dark:text-red-400">Error</Label>
                  <div className="mt-1 text-sm text-red-600 dark:text-red-400">{viewEmailData.error_message}</div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
