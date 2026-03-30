import api from '@/lib/api'
import { getToken } from '../auth'

export interface FileInfo {
  id: string
  contract_id: string
  file_path: string
  original_name: string
  display_name?: string
  mime_type: string
  size: number
  size_formatted: string
  uploaded_at: string
  modified_at: string
  file_extension: string
  is_pdf: boolean
  is_image: boolean
  is_document: boolean
  can_preview: boolean
  download_url?: string
  view_url?: string
  pdf_analysis?: PDFAnalysis
}

export interface PDFAnalysis {
  needs_ocr: boolean
  text_content_ratio: number
  total_pages: number
  pages_with_text: number
  has_extractable_text: boolean
  extraction_method: string
  total_text_length: number
  processing_time_estimate?: string
  quality_score?: number
  error?: string
}

export interface UploadResponse {
  message: string
  file: FileInfo
}

export interface ExtractionResult {
  file_id: string
  extracted_text: string
  extraction_method: string
  character_count: number
  pages_processed: number
  analysis: PDFAnalysis
  extracted_at: string
}

// File Upload
export async function uploadFile(contractId: string, file: File): Promise<UploadResponse> {
  const token = getToken()
  
  const formData = new FormData()
  formData.append('file', file)

  const response = await api.post(`/contracts/${contractId}/files`, formData, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'multipart/form-data'
    }
  })

  return response.data
}

// List Files for Contract
export async function listFiles(contractId: string): Promise<FileInfo[]> {
  const token = getToken()

  const response = await api.get(`/contracts/${contractId}/files`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })

  return response.data
}

// Get File Details
export async function getFileDetails(fileId: string): Promise<FileInfo> {
  const token = getToken()

  const response = await api.get(`/contracts/files/${fileId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })

  return response.data
}

// Download File
export async function downloadFile(fileId: string, filename?: string): Promise<void> {
  const token = getToken()

  const response = await api.get(`/contracts/files/${fileId}/download`, {
    headers: {
      'Authorization': `Bearer ${token}`
    },
    responseType: 'blob'
  })

  // Create download link
  const url = window.URL.createObjectURL(new Blob([response.data]))
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename || fileId)
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

// View File (for preview)
export function getViewUrl(fileId: string): string {
  const token = getToken()
  return `${api.defaults.baseURL}/contracts/files/${fileId}/view?token=${token}`
}

// Get Thumbnail URL
export function getThumbnailUrl(fileId: string): string {
  const token = getToken()
  return `${api.defaults.baseURL}/contracts/files/${fileId}/thumbnail?token=${token}`
}

// Extract Text from PDF
export async function extractText(fileId: string): Promise<ExtractionResult> {
  const token = getToken()

  const response = await api.post(`/contracts/files/${fileId}/extract`, {}, {
    headers: {
      'Authorization': `Bearer ${token}`
    },
    timeout: 60000 // 60 seconds for text extraction
  })

  return response.data
}

// Delete File
export async function deleteFile(fileId: string): Promise<void> {
  const token = getToken()

  await api.delete(`/contracts/files/${fileId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
}

// Get File Extension Icon
export function getFileIcon(fileExtension: string): string {
  const iconMap: Record<string, string> = {
    '.pdf': '📄',
    '.doc': '📝',
    '.docx': '📝',
    '.txt': '📄',
    '.rtf': '📄',
    '.jpg': '🖼️',
    '.jpeg': '🖼️',
    '.png': '🖼️',
    '.gif': '🖼️',
    '.bmp': '🖼️',
    '.webp': '🖼️'
  }
  return iconMap[fileExtension.toLowerCase()] || '📎'
}

// Format File Size
export function formatFileSize(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  if (bytes === 0) return '0 Bytes'
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
}

// Check if file can be previewed
export function canPreviewFile(fileInfo: FileInfo): boolean {
  return fileInfo.can_preview || fileInfo.is_pdf || fileInfo.is_image
}

// Get file type description
export function getFileTypeDescription(fileInfo: FileInfo): string {
  if (fileInfo.is_pdf) return 'PDF Document'
  if (fileInfo.is_image) return 'Image File'
  if (fileInfo.is_document) return 'Document'
  return 'File'
}
