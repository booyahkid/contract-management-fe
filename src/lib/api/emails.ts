import api from '@/lib/api'
import { getToken } from '../auth'
import { 
  Email, 
  NewEmail, 
  EmailTemplate, 
  NewEmailTemplate, 
  EmailStats, 
  ContractDue, 
  NotificationPreferences 
} from '@/types/email'

// Send email (immediate, scheduled, or draft)
export async function sendEmail(emailData: NewEmail & { action: 'send' | 'schedule' | 'draft' }, attachments?: File[]): Promise<Email> {
  const token = getToken()
  
  const formData = new FormData()
  
  // Add email data
  Object.entries(emailData).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value.toString())
    }
  })
  
  // Add attachments if any
  if (attachments && attachments.length > 0) {
    attachments.forEach((file) => {
      formData.append('attachments', file)
    })
  }

  const response = await api.post('/emails/send', formData, {
    headers: {
      'Authorization': `Bearer ${token}`,
      // Don't set Content-Type - let browser set it with correct boundary for FormData
    },
  })
  
  return response.data
}

// Get email history for a specific contract
export async function getEmailHistory(contractId: number): Promise<Email[]> {
  const token = getToken()
  const response = await api.get(`/emails/history/contract/${contractId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  // Handle the response format: { emails: [...], pagination: {...} }
  return response.data.emails || []
}

// Get all email history
export async function getAllEmailHistory(): Promise<Email[]> {
  const token = getToken()
  const response = await api.get('/emails/history', {
    headers: { Authorization: `Bearer ${token}` },
  })
  // Handle the response format: { emails: [...], pagination: {...} }
  return response.data.emails || []
}

// Get email by ID
export async function getEmailById(emailId: number): Promise<Email> {
  const token = getToken()
  const response = await api.get(`/emails/${emailId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return response.data
}

// Update email (for drafts)
export async function updateEmail(emailId: number, emailData: Partial<Email>): Promise<Email> {
  const token = getToken()
  const response = await api.put(`/emails/${emailId}`, emailData, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return response.data
}

// Update draft and send/schedule it
export async function updateAndSendDraft(emailId: number, emailData: Partial<Email> & { action: 'send' | 'schedule' }, attachments?: File[]): Promise<Email> {
  const token = getToken()
  
  const formData = new FormData()
  
  // Add email data
  Object.entries(emailData).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        // Send arrays as JSON strings
        formData.append(key, JSON.stringify(value))
      } else {
        formData.append(key, value.toString())
      }
    }
  })
  
  // Add attachments if any
  if (attachments && attachments.length > 0) {
    attachments.forEach((file) => {
      formData.append('attachments', file)
    })
  }

  const response = await api.put(`/emails/${emailId}/send`, formData, {
    headers: {
      'Authorization': `Bearer ${token}`,
      // Don't set Content-Type - let browser set it with correct boundary for FormData
    },
  })
  
  return response.data
}

// Delete email
export async function deleteEmail(emailId: number): Promise<void> {
  const token = getToken()
  await api.delete(`/emails/${emailId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
}

// Email Templates
export async function getEmailTemplates(): Promise<EmailTemplate[]> {
  const token = getToken()
  const response = await api.get('/emails/templates', {
    headers: { Authorization: `Bearer ${token}` },
  })
  return response.data
}

export async function createEmailTemplate(templateData: NewEmailTemplate): Promise<EmailTemplate> {
  const token = getToken()
  const response = await api.post('/emails/templates', templateData, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return response.data
}

export async function updateEmailTemplate(templateId: number, templateData: Partial<NewEmailTemplate>): Promise<EmailTemplate> {
  const token = getToken()
  const response = await api.put(`/emails/templates/${templateId}`, templateData, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return response.data
}

export async function deleteEmailTemplate(templateId: number): Promise<void> {
  const token = getToken()
  await api.delete(`/emails/templates/${templateId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
}

// Contract due notifications
export async function getContractsDueSoon(): Promise<ContractDue[]> {
  const token = getToken()
  const response = await api.get('/emails/contracts/due-soon', {
    headers: { Authorization: `Bearer ${token}` },
  })
  return response.data
}

export async function sendDueReminder(contractId: number): Promise<Email> {
  const token = getToken()
  const response = await api.post(`/emails/contracts/${contractId}/due-reminder`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return response.data
}

// User preferences and stats
export async function updateNotificationPreferences(preferences: NotificationPreferences): Promise<NotificationPreferences> {
  const token = getToken()
  const response = await api.put('/emails/preferences', preferences, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return response.data
}

export async function getEmailStats(): Promise<EmailStats> {
  const token = getToken()
  const response = await api.get('/emails/stats', {
    headers: { Authorization: `Bearer ${token}` },
  })
  return response.data
}

// Download attachment (if needed)
export async function downloadEmailAttachment(attachmentId: number): Promise<Blob> {
  const token = getToken()
  const response = await api.get(`/emails/attachments/${attachmentId}/download`, {
    headers: { Authorization: `Bearer ${token}` },
    responseType: 'blob'
  })
  return response.data
}
