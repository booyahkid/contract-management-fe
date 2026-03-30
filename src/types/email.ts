export interface Email {
  id: number
  contract_id?: number
  user_id: number
  to_email: string
  cc_emails?: string[]
  bcc_emails?: string[]
  subject: string
  body_text: string
  body_html?: string
  email_type: 'manual' | 'contract_due' | 'contract_created' | 'contract_updated'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  status: 'draft' | 'sent' | 'scheduled' | 'failed'
  sent_at?: string
  scheduled_send_at?: string
  error_message?: string
  created_at: string
  updated_at: string
  contract_name?: string
  contract_number?: string
  attachments?: EmailAttachment[]
}

export interface EmailAttachment {
  id: number
  email_id: number
  fileName: string
  originalName: string
  filePath: string
  fileSize: number
  mimeType: string
  created_at: string
}

export interface NewEmail {
  contractId?: number
  to: string
  cc?: string
  bcc?: string
  subject: string
  body: string
  bodyHtml?: string
  emailType?: 'manual' | 'contract_due' | 'contract_created' | 'contract_updated'
  priority?: 'low' | 'normal' | 'high' | 'urgent'
  scheduledSendAt?: string
}

export interface EmailTemplate {
  id: number
  user_id: number
  name: string
  subject_template: string
  body_template: string
  template_type: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface NewEmailTemplate {
  name: string
  subject_template: string
  body_template: string
  template_type: string
  is_active?: boolean
}

export interface EmailStats {
  totalSent: number
  totalScheduled: number
  totalFailed: number
  sentToday: number
  sentThisWeek: number
  sentThisMonth: number
  byPriority: {
    low: number
    normal: number
    high: number
    urgent: number
  }
  byType: {
    manual: number
    contract_due: number
    contract_created: number
    contract_updated: number
  }
}

export interface ContractDue {
  id: number
  contract_name: string
  contract_number: string
  end_date: string
  department: string
  pic_user_name: string
  vendor: string
  daysUntilExpiry: number
  lastReminderSent?: string
}

export interface NotificationPreferences {
  emailEnabled: boolean
  dueAlerts90Days: boolean
  dueAlerts30Days: boolean
  dueAlerts7Days: boolean
  digestFrequency: 'none' | 'daily' | 'weekly' | 'monthly'
  priority: 'low' | 'normal' | 'high' | 'urgent'
}
