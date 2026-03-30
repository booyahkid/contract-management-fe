'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { AlertCircle, Paperclip, Send, Save, Clock, X, Mail } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { sendEmail, getEmailTemplates, getEmailById, updateEmail, updateAndSendDraft } from '@/lib/api/emails'
import { fetchContracts, fetchContractById } from '@/lib/api/contracts'
import { Contract } from '@/types/contract'
import { EmailTemplate, NewEmail } from '@/types/email'
import { toast } from 'sonner'

export default function ComposeEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const contractIdParam = searchParams.get('contractId')
  const emailIdParam = searchParams.get('emailId') // For editing drafts

  const [loading, setLoading] = useState(false)
  const [isEditingDraft, setIsEditingDraft] = useState(false)
  const [draftEmailId, setDraftEmailId] = useState<number | null>(null)
  const [contracts, setContracts] = useState<Contract[]>([])
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null)
  const [attachments, setAttachments] = useState<File[]>([])
  const [formData, setFormData] = useState<NewEmail & { action: 'send' | 'schedule' | 'draft' }>({
    to: '',
    cc: '',
    bcc: '',
    subject: '',
    body: '',
    priority: 'normal',
    action: 'send'
  })
  const [scheduledDateTime, setScheduledDateTime] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (emailIdParam) {
      loadDraftEmail(parseInt(emailIdParam))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emailIdParam])

  useEffect(() => {
    if (contractIdParam && contracts.length > 0) {
      const contract = contracts.find(c => c.id === parseInt(contractIdParam))
      if (contract) {
        setSelectedContract(contract)
        setFormData(prev => ({ ...prev, contractId: contract.id }))
      }
    }
  }, [contractIdParam, contracts])

  const loadData = async () => {
    try {
      const [contractsData, templatesData] = await Promise.all([
        fetchContracts(),
        getEmailTemplates()
      ])
      setContracts(contractsData)
      setTemplates(templatesData)
    } catch (error) {
      console.error('Failed to load data:', error)
      toast.error('Failed to load contracts and templates')
    }
  }

  const loadDraftEmail = async (emailId: number) => {
    try {
      setLoading(true)
      const email = await getEmailById(emailId)
      
      if (email.status !== 'draft') {
        toast.error('Only draft emails can be edited')
        router.push('/emails/history')
        return
      }

      setIsEditingDraft(true)
      setDraftEmailId(emailId)
      setFormData({
        to: email.to_email,
        cc: email.cc_emails?.join(', ') || '',
        bcc: email.bcc_emails?.join(', ') || '',
        subject: email.subject,
        body: email.body_text,
        priority: email.priority,
        action: 'draft'
      })

      if (email.scheduled_send_at) {
        const scheduledDate = new Date(email.scheduled_send_at)
        setScheduledDateTime(scheduledDate.toISOString().slice(0, 16))
        setFormData(prev => ({ ...prev, action: 'schedule' }))
      }

      // Load contract if associated
      if (email.contract_id) {
        try {
          const contract = await fetchContractById(email.contract_id.toString())
          setSelectedContract(contract)
          setFormData(prev => ({ ...prev, contractId: contract.id }))
        } catch (error) {
          console.error('Failed to load contract:', error)
          // Don't fail the whole operation if contract loading fails
        }
      }
    } catch (error) {
      console.error('Failed to load draft email:', error)
      toast.error('Failed to load draft email')
      router.push('/emails/history')
    } finally {
      setLoading(false)
    }
  }

  const handleContractChange = async (contractId: string) => {
    if (!contractId || contractId === 'none') {
      setSelectedContract(null)
      setFormData(prev => ({ ...prev, contractId: undefined }))
      return
    }

    try {
      const contract = await fetchContractById(contractId)
      setSelectedContract(contract)
      setFormData(prev => ({ ...prev, contractId: contract.id }))
    } catch (error) {
      console.error('Failed to load contract:', error)
      toast.error('Failed to load contract details')
    }
  }

  const handleTemplateChange = (templateId: string) => {
    if (!templateId) return

    const template = templates.find(t => t.id === parseInt(templateId))
    if (template) {
      let subject = template.subject_template
      let body = template.body_template

      // Replace template variables with contract data
      if (selectedContract) {
        subject = subject
          .replace(/\{\{contract_name\}\}/g, selectedContract.contract_name)
          .replace(/\{\{contract_number\}\}/g, selectedContract.contract_number)
          .replace(/\{\{vendor\}\}/g, selectedContract.vendor)
          .replace(/\{\{end_date\}\}/g, new Date(selectedContract.end_date).toLocaleDateString())

        body = body
          .replace(/\{\{contract_name\}\}/g, selectedContract.contract_name)
          .replace(/\{\{contract_number\}\}/g, selectedContract.contract_number)
          .replace(/\{\{vendor\}\}/g, selectedContract.vendor)
          .replace(/\{\{end_date\}\}/g, new Date(selectedContract.end_date).toLocaleDateString())
          .replace(/\{\{department\}\}/g, selectedContract.department)
          .replace(/\{\{pic_user_name\}\}/g, selectedContract.pic_user_name || '')
      }

      setFormData(prev => ({
        ...prev,
        subject,
        body
      }))
    }
  }

  const handleAttachmentAdd = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      const newAttachments = Array.from(files)
      setAttachments(prev => [...prev, ...newAttachments])
    }
  }

  const handleAttachmentRemove = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isEditingDraft && draftEmailId) {
        // For editing drafts, we handle differently based on action
        if (formData.action === 'draft') {
          // Just update the draft
          const updateData = {
            to_email: formData.to,
            cc_emails: formData.cc ? formData.cc.split(',').map(email => email.trim()) : [],
            bcc_emails: formData.bcc ? formData.bcc.split(',').map(email => email.trim()) : [],
            subject: formData.subject,
            body_text: formData.body,
            priority: formData.priority
          }
          
          await updateEmail(draftEmailId, updateData)
          toast.success('Draft updated successfully!')
        } else {
          // Update draft and send/schedule it (this prevents duplication)
          const updateData = {
            to_email: formData.to,
            cc_emails: formData.cc ? formData.cc.split(',').map(email => email.trim()) : [],
            bcc_emails: formData.bcc ? formData.bcc.split(',').map(email => email.trim()) : [],
            subject: formData.subject,
            body_text: formData.body,
            priority: formData.priority,
            scheduled_send_at: formData.action === 'schedule' ? scheduledDateTime : undefined,
            action: formData.action
          }

          await updateAndSendDraft(draftEmailId, updateData, attachments)
          
          const actionText = formData.action === 'send' ? 'sent' : 'scheduled'
          toast.success(`Email ${actionText} successfully!`)
        }
      } else {
        // Create new email
        const emailData = {
          ...formData,
          scheduledSendAt: formData.action === 'schedule' ? scheduledDateTime : undefined
        }

        await sendEmail(emailData, attachments)
        
        const actionText = formData.action === 'send' ? 'sent' : 
                          formData.action === 'schedule' ? 'scheduled' : 'saved as draft'
        
        toast.success(`Email ${actionText} successfully!`)
      }
      
      router.push('/emails/history')
    } catch (error) {
      console.error('Failed to process email:', error)
      toast.error('Failed to process email. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const isFormValid = () => {
    // For drafts, we don't require all fields to be filled
    if (formData.action === 'draft') {
      return true // Drafts can be saved with minimal information
    }
    
    // For sending or scheduling, require all essential fields
    const basicRequirements = formData.to && formData.subject && formData.body
    const scheduleRequirement = formData.action !== 'schedule' || scheduledDateTime
    
    return basicRequirements && scheduleRequirement
  }

  return (
    <div className="flex flex-col gap-6 p-6 w-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {isEditingDraft ? 'Edit Draft Email' : 'Compose Email'}
          </h1>
          <p className="text-muted-foreground">
            {isEditingDraft ? 'Edit and send your draft email' : 'Send emails to vendors, partners, and stakeholders'}
          </p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          Back
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Email Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Email Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Recipients */}
                <div className="space-y-2">
                  <Label htmlFor="to">To *</Label>
                  <Input
                    id="to"
                    type="email"
                    value={formData.to}
                    onChange={(e) => setFormData(prev => ({ ...prev, to: e.target.value }))}
                    placeholder="recipient@example.com"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cc">CC</Label>
                    <Input
                      id="cc"
                      type="email"
                      value={formData.cc}
                      onChange={(e) => setFormData(prev => ({ ...prev, cc: e.target.value }))}
                      placeholder="cc@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bcc">BCC</Label>
                    <Input
                      id="bcc"
                      type="email"
                      value={formData.bcc}
                      onChange={(e) => setFormData(prev => ({ ...prev, bcc: e.target.value }))}
                      placeholder="bcc@example.com"
                    />
                  </div>
                </div>

                {/* Subject */}
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Email subject"
                    required
                  />
                </div>

                {/* Priority */}
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select 
                    value={formData.priority} 
                    onValueChange={(value: 'low' | 'normal' | 'high' | 'urgent') => 
                      setFormData(prev => ({ ...prev, priority: value }))
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

                {/* Email Body */}
                <div className="space-y-2">
                  <Label htmlFor="body">Message *</Label>
                  <Textarea
                    id="body"
                    value={formData.body}
                    onChange={(e) => setFormData(prev => ({ ...prev, body: e.target.value }))}
                    placeholder="Write your email message here..."
                    rows={12}
                    required
                  />
                </div>

                {/* Attachments */}
                <div className="space-y-2">
                  <Label>Attachments</Label>
                  <div className="space-y-2">
                    <Input
                      type="file"
                      multiple
                      onChange={handleAttachmentAdd}
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.gif,.zip,.rar"
                    />
                    {attachments.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {attachments.map((file, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            <Paperclip className="w-3 h-3" />
                            <span className="text-xs">{file.name}</span>
                            <button
                              type="button"
                              onClick={() => handleAttachmentRemove(index)}
                              className="ml-1 hover:text-destructive"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contract Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Contract Context</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Contract (Optional)</Label>
                  <Select 
                    value={selectedContract?.id.toString() || 'none'} 
                    onValueChange={handleContractChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a contract" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No contract</SelectItem>
                      {contracts
                        .filter(contract => contract.id && contract.contract_name) // Filter out contracts without id or name
                        .map((contract) => (
                        <SelectItem key={contract.id} value={contract.id.toString()}>
                          {contract.contract_name} ({contract.contract_number})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedContract && (
                  <div className="p-3 bg-muted rounded-lg text-sm">
                    <p><strong>Name:</strong> {selectedContract.contract_name}</p>
                    <p><strong>Number:</strong> {selectedContract.contract_number}</p>
                    <p><strong>Vendor:</strong> {selectedContract.vendor}</p>
                    <p><strong>End Date:</strong> {new Date(selectedContract.end_date).toLocaleDateString()}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Email Template */}
            <Card>
              <CardHeader>
                <CardTitle>Use Template</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Template</Label>
                  <Select onValueChange={handleTemplateChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates
                        .filter(template => template.id && template.name) // Filter out templates without id or name
                        .map((template) => (
                        <SelectItem key={template.id} value={template.id.toString()}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Action Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Send Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Action</Label>
                  <Select 
                    value={formData.action} 
                    onValueChange={(value: 'send' | 'schedule' | 'draft') => 
                      setFormData(prev => ({ ...prev, action: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="send">Send Now</SelectItem>
                      <SelectItem value="schedule">Schedule Send</SelectItem>
                      <SelectItem value="draft">Save as Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.action === 'schedule' && (
                  <div className="space-y-2">
                    <Label htmlFor="scheduledDateTime">Schedule Date & Time *</Label>
                    <Input
                      id="scheduledDateTime"
                      type="datetime-local"
                      value={scheduledDateTime}
                      onChange={(e) => setScheduledDateTime(e.target.value)}
                      min={new Date().toISOString().slice(0, 16)}
                      required
                    />
                  </div>
                )}

                <Separator />

                <div className="space-y-2">
                  <Button 
                    type="submit" 
                    disabled={!isFormValid() || loading}
                    className="w-full"
                  >
                    {loading ? (
                      'Processing...'
                    ) : (
                      <>
                        {formData.action === 'send' && <Send className="w-4 h-4 mr-2" />}
                        {formData.action === 'schedule' && <Clock className="w-4 h-4 mr-2" />}
                        {formData.action === 'draft' && <Save className="w-4 h-4 mr-2" />}
                        {isEditingDraft ? (
                          formData.action === 'send' ? 'Send Email' : 
                          formData.action === 'schedule' ? 'Schedule Email' : 'Update Draft'
                        ) : (
                          formData.action === 'send' ? 'Send Email' : 
                          formData.action === 'schedule' ? 'Schedule Email' : 'Save Draft'
                        )}
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {!isFormValid() && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {formData.action === 'draft' 
                ? 'You can save as draft with partial information.' 
                : 'Please fill in all required fields before sending the email.'}
            </AlertDescription>
          </Alert>
        )}
      </form>
    </div>
  )
}
