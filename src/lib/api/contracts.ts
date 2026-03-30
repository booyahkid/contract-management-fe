import api from '@/lib/api'
import { getToken } from '../auth'
import { Contract } from '@/types/contract'
import { NewContract } from '@/types/contract'
import { AxiosError } from 'axios'

export async function fetchContracts(): Promise<Contract[]> {
  const response = await api.get('/contracts')
  return response.data
}

export async function fetchContractById(id: string): Promise<Contract> {
  const token = getToken()
  const res = await api.get(`/contracts/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data
}

export async function getContractById(id: string) {
  const res = await fetch(`/api/contracts/${id}`)
  if (!res.ok) throw new Error('Failed to fetch contract')
  return res.json()
}

export async function deleteContract(id: number): Promise<void> {
  const token = getToken()
  await api.delete(`/contracts/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

export async function createContract(data: NewContract) {
  const token = getToken()
  
  console.log('Creating contract with data:', data)
  
  const res = await api.post('/contracts', data, {
    headers: { 
      'Authorization': `Bearer ${token}`
    }
  })

  console.log('Contract created successfully:', res.data)
  return res.data
}

export async function updateContract(id: number, data: Partial<Contract>) {
  const token = getToken()

  console.log('Updating contract ID:', id)
  console.log('Updating contract with data:', JSON.stringify(data, null, 2))

  try {
    const response = await api.put(`/contracts/${id}`, data, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    console.log('Contract updated successfully:', response.data)
    return response.data
  } catch (error: unknown) {
    console.error('Contract update error:', error)
    if (error instanceof AxiosError && error.response) {
      console.error('Error response status:', error.response.status)
      console.error('Error response data:', error.response.data)
    }
    throw error
  }
}

export async function extractContractData(file: File) {
  const token = getToken()
  
  const formData = new FormData()
  formData.append('file', file)

  const response = await api.post('/contracts/extract-preview', formData, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })

  if (!response.data.extracted) {
    throw new Error('No extracted data received from server')
  }
  
  return response.data
}

// File upload functions
export async function uploadContractFile(contractId: number, file: File) {
  try {
    console.log('🚀 Starting file upload for contract:', contractId, 'file:', file.name)
    
    const formData = new FormData()
    formData.append('file', file)

    // Don't manually set Authorization header - let the interceptor handle it
    // Don't set Content-Type - let browser set it with correct boundary
    const response = await api.post(`/contracts/${contractId}/files`, formData)
    
    console.log('✅ File upload successful:', response.data)
    
    // Check for processing warnings but don't throw errors
    if (response.data?.file?.rag_integration?.success === false) {
      console.warn('⚠️ RAG integration failed:', response.data.file.rag_integration.error)
    }
    
    if (response.data?.file?.pdf_analysis?.error) {
      console.warn('⚠️ PDF analysis failed:', response.data.file.pdf_analysis.error)
    }
    
    return response.data
  } catch (error) {
    console.error('❌ File upload failed:', error)
    
    // Only throw for actual upload failures, not processing warnings
    if (error instanceof Error) {
      // Check if it's a real server error vs processing issue
      const isRealError = error.message.includes('Network Error') || 
                         error.message.includes('Failed to fetch') ||
                         error.message.includes('500') ||
                         error.message.includes('401') ||
                         error.message.includes('403') ||
                         error.message.includes('404')
      
      if (isRealError) {
        throw error
      } else {
        // Log but don't throw for processing warnings
        console.warn('Upload completed with processing warnings:', error.message)
        return { 
          message: 'File uploaded with warnings', 
          warnings: [error.message],
          file: { id: Date.now().toString() } // Fallback file info
        }
      }
    }
    
    throw error
  }
}

export async function getContractFiles(contractId: number) {
  const response = await api.get(`/contracts/${contractId}/files`)
  return response.data
}

export async function downloadContractFile(fileId: number) {
  const response = await api.get(`/contracts/files/${fileId}/download`, {
    responseType: 'blob'
  })
  return response.data
}

export async function deleteContractFile(fileId: number) {
  const response = await api.delete(`/contracts/files/${fileId}`)
  return response.data
}


