'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Plus, Edit, Trash2, Copy, Eye } from 'lucide-react'
import { getEmailTemplates, createEmailTemplate, updateEmailTemplate, deleteEmailTemplate } from '@/lib/api/emails'
import { EmailTemplate, NewEmailTemplate } from '@/types/email'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showPreviewDialog, setShowPreviewDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null)
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null)
  const [formData, setFormData] = useState<NewEmailTemplate>({
    name: '',
    subject_template: '',
    body_template: '',
    template_type: 'manual',
    is_active: true
  })

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    try {
      setLoading(true)
      const templatesData = await getEmailTemplates()
      setTemplates(templatesData)
    } catch (error) {
      console.error('Failed to load templates:', error)
      toast.error('Failed to load email templates')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const newTemplate = await createEmailTemplate(formData)
      setTemplates(prev => [...prev, newTemplate])
      setShowCreateDialog(false)
      setFormData({
        name: '',
        subject_template: '',
        body_template: '',
        template_type: 'manual',
        is_active: true
      })
      toast.success('Template created successfully!')
    } catch (error) {
      console.error('Failed to create template:', error)
      toast.error('Failed to create template')
    }
  }

  const handleEditTemplate = (template: EmailTemplate) => {
    setEditingTemplate(template)
    setFormData({
      name: template.name,
      subject_template: template.subject_template,
      body_template: template.body_template,
      template_type: template.template_type,
      is_active: template.is_active
    })
    setShowEditDialog(true)
  }

  const handleUpdateTemplate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTemplate) return
    
    try {
      const updatedTemplate = await updateEmailTemplate(editingTemplate.id, formData)
      setTemplates(prev => prev.map(t => t.id === editingTemplate.id ? updatedTemplate : t))
      setShowEditDialog(false)
      setEditingTemplate(null)
      setFormData({
        name: '',
        subject_template: '',
        body_template: '',
        template_type: 'manual',
        is_active: true
      })
      toast.success('Template updated successfully!')
    } catch (error) {
      console.error('Failed to update template:', error)
      toast.error('Failed to update template')
    }
  }

  const handleDeleteTemplate = async (template: EmailTemplate) => {
    if (!confirm(`Are you sure you want to delete "${template.name}"? This action cannot be undone.`)) {
      return
    }
    
    try {
      await deleteEmailTemplate(template.id)
      setTemplates(prev => prev.filter(t => t.id !== template.id))
      toast.success('Template deleted successfully!')
    } catch (error) {
      console.error('Failed to delete template:', error)
      toast.error('Failed to delete template')
    }
  }

  const handleCopyTemplate = (template: EmailTemplate) => {
    setFormData({
      name: `${template.name} (Copy)`,
      subject_template: template.subject_template,
      body_template: template.body_template,
      template_type: template.template_type,
      is_active: true
    })
    setShowCreateDialog(true)
  }

  const extractVariables = (text: string): string[] => {
    const regex = /\{\{([^}]+)\}\}/g
    const variables: string[] = []
    let match

    while ((match = regex.exec(text)) !== null) {
      if (!variables.includes(match[1])) {
        variables.push(match[1])
      }
    }

    return variables
  }

  const handleSubjectChange = (value: string) => {
    setFormData(prev => ({ ...prev, subject_template: value }))
    // Extract variables from both subject and body
    const variables = [...extractVariables(value), ...extractVariables(formData.body_template)]
    setFormData(prev => ({ ...prev }))
  }

  const handleBodyChange = (value: string) => {
    setFormData(prev => ({ ...prev, body_template: value }))
    // Extract variables from both subject and body  
    const variables = [...extractVariables(formData.subject_template), ...extractVariables(value)]
    setFormData(prev => ({ ...prev }))
  }

  const getTypeColor = (emailType: string) => {
    const colors = {
      manual: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      contract_due: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      contract_created: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      contract_updated: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
    }
    return colors[emailType as keyof typeof colors] || colors.manual
  }

  const getTypeLabel = (emailType: string) => {
    const labels = {
      manual: 'Manual',
      contract_due: 'Due Reminder',
      contract_created: 'Contract Created',
      contract_updated: 'Contract Updated'
    }
    return labels[emailType as keyof typeof labels] || emailType
  }

  const defaultTemplates = [
    {
      name: 'Contract Due Reminder',
      subject: 'Contract Expiration Notice - {{contract_name}}',
      body: `Dear {{vendor}},

We hope this email finds you well.

This is to notify you that your contract "{{contract_name}}" (Contract Number: {{contract_number}}) is scheduled to expire on {{end_date}}.

To ensure continuity of services, please contact us to discuss renewal options or provide alternative arrangements.

Contract Details:
- Contract Name: {{contract_name}}
- Contract Number: {{contract_number}}
- End Date: {{end_date}}
- Department: {{department}}

Please reach out to us at your earliest convenience.

Best regards,
{{pic_user_name}}`,
      emailType: 'contract_due'
    },
    {
      name: 'Welcome Email',
      subject: 'Welcome to our Contract Management System',
      body: `Dear {{vendor}},

Welcome to our contract management system! We're excited to work with you.

Your contract "{{contract_name}}" has been successfully created and is now active in our system.

If you have any questions, please don't hesitate to contact us.

Best regards,
Contract Management Team`,
      emailType: 'contract_created'
    }
  ]

  if (loading) {
    return (
      <div className="flex flex-col gap-6 p-6 w-full bg-background">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6 w-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Email Templates</h1>
          <p className="text-muted-foreground">Create and manage reusable email templates</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Email Template</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateTemplate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Template Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Contract Due Reminder"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emailType">Template Type</Label>
                  <Select 
                    value={formData.template_type} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, template_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Manual</SelectItem>
                      <SelectItem value="contract_due">Due Reminder</SelectItem>
                      <SelectItem value="contract_created">Contract Created</SelectItem>
                      <SelectItem value="contract_updated">Contract Updated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  value={formData.subject_template}
                  onChange={(e) => handleSubjectChange(e.target.value)}
                  placeholder="e.g., Contract Expiration Notice - {{contract_name}}"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="body">Email Body *</Label>
                                <Textarea
                  id="body"
                  value={formData.body_template}
                  onChange={(e) => handleBodyChange(e.target.value)}
                  placeholder="Dear {{recipient_name}}, ..."
                  rows={6}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Available Variables</Label>
                <div className="text-xs text-muted-foreground">
                  You can use these variables in your template: {`{{contract_name}}, {{contract_number}}, {{vendor}}, {{end_date}}, {{department}}, {{pic_user_name}}, {{recipient_name}}`}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.is_active}
                  onCheckedChange={(checked: boolean) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="isActive">Active Template</Label>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Template</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Quick Templates */}
      {templates.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Get Started with Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Start with these common email templates. You can customize them or create your own.
            </p>
            <div className="space-y-2">
              {defaultTemplates.map((template, index) => (
                <Button 
                  key={index}
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => {
                    setFormData({
                      name: template.name,
                      subject_template: template.subject,
                      body_template: template.body,
                      template_type: template.emailType,
                      is_active: true
                    })
                    setShowCreateDialog(true)
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create &quot;{template.name}&quot; Template
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Templates Grid */}
      {templates.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <Card key={template.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge className={getTypeColor(template.template_type)}>
                        {getTypeLabel(template.template_type)}
                      </Badge>
                      {!template.is_active && (
                        <Badge variant="outline">Inactive</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-foreground">Subject:</p>
                  <p className="text-sm text-muted-foreground truncate">{template.subject_template}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-foreground">Preview:</p>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {template.body_template && template.body_template.substring(0, 100)}...
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      setSelectedTemplate(template)
                      setShowPreviewDialog(true)
                    }}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleEditTemplate(template)}
                    disabled={template.user_id === 1} // Disable for system templates
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleCopyTemplate(template)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleDeleteTemplate(template)}
                    disabled={template.user_id === 1} // Disable for system templates
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Template Preview: {selectedTemplate?.name}</DialogTitle>
          </DialogHeader>
          {selectedTemplate && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Type:</span> {getTypeLabel(selectedTemplate.template_type)}
                </div>
                <div>
                  <span className="font-medium">Status:</span> {selectedTemplate.is_active ? 'Active' : 'Inactive'}
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Subject:</Label>
                <div className="mt-1 p-2 bg-muted rounded text-sm">
                  {selectedTemplate.subject_template}
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Email Body:</Label>
                <div className="mt-1 p-4 bg-muted rounded text-sm whitespace-pre-wrap">
                  {selectedTemplate.body_template}
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Available Variables:</Label>
                <div className="mt-1 text-xs text-muted-foreground">
                  Common variables: {`{{contract_name}}, {{contract_number}}, {{vendor}}, {{end_date}}, {{department}}, {{pic_user_name}}, {{recipient_name}}`}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Template Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Template: {editingTemplate?.name}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateTemplate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Template Name *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Contract Due Reminder"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-type">Template Type</Label>
                <Select 
                  value={formData.template_type} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, template_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="contract_due">Due Reminder</SelectItem>
                    <SelectItem value="contract_created">Contract Created</SelectItem>
                    <SelectItem value="contract_updated">Contract Updated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-subject">Subject *</Label>
              <Input
                id="edit-subject"
                value={formData.subject_template}
                onChange={(e) => handleSubjectChange(e.target.value)}
                placeholder="e.g., Contract Expiration Notice - {{contract_name}}"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-body">Email Body *</Label>
              <Textarea
                id="edit-body"
                value={formData.body_template}
                onChange={(e) => handleBodyChange(e.target.value)}
                placeholder="Dear {{recipient_name}}, ..."
                rows={6}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Available Variables</Label>
              <div className="text-xs text-muted-foreground">
                You can use these variables in your template: {`{{contract_name}}, {{contract_number}}, {{vendor}}, {{end_date}}, {{department}}, {{pic_user_name}}, {{recipient_name}}`}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="edit-active"
                checked={formData.is_active}
                onCheckedChange={(checked: boolean) => setFormData(prev => ({ ...prev, is_active: checked }))}
              />
              <Label htmlFor="edit-active">Active Template</Label>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">Update Template</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
