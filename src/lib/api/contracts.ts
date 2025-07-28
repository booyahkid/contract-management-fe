import api from '@/lib/api'
import { getToken } from '../auth'
import { Contract } from '@/types/contract'
import { NewContract } from '@/types/contract'

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
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
  
  console.log('Creating contract with data:', data)
  console.log('API URL:', `${apiUrl}/api/contracts`)
  
  const res = await fetch(`${apiUrl}/api/contracts`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data),
  })

  console.log('Create contract response status:', res.status)

  if (!res.ok) {
    const errorText = await res.text()
    console.error('Create contract error response:', errorText)
    
    // Try to parse error details
    let errorMessage = `HTTP ${res.status}: Failed to create contract`
    try {
      const errorJson = JSON.parse(errorText)
      errorMessage = errorJson.message || errorJson.error || errorMessage
    } catch {
      // Use status text if not JSON
      errorMessage = `HTTP ${res.status}: ${res.statusText || errorText}`
    }
    
    throw new Error(errorMessage)
  }

  const result = await res.json()
  console.log('Contract created successfully:', result)
  return result
}

export async function updateContract(id: number, data: Partial<Contract>) {
  const token = getToken()
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

  console.log('Updating contract with data:', data)
  console.log('API URL:', `${apiUrl}/api/contracts/${id}`)

  const response = await fetch(`${apiUrl}/api/contracts/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })

  console.log('Update contract response status:', response.status)

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Update contract error response:', errorText)
    
    // Try to parse error details
    let errorMessage = `HTTP ${response.status}: Failed to update contract`
    try {
      const errorJson = JSON.parse(errorText)
      errorMessage = errorJson.message || errorJson.error || errorMessage
    } catch {
      // Use status text if not JSON
      errorMessage = `HTTP ${response.status}: ${response.statusText || errorText}`
    }
    
    throw new Error(errorMessage)
  }

  const result = await response.json()
  console.log('Contract updated successfully:', result)
  return result
}

export async function extractContractData(file: File) {
  const token = getToken()
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
  
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${apiUrl}/api/contracts/extract-preview`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  })

  if (!response.ok) {
    const errorText = await response.text()
    
    // Try to parse as JSON for more detailed error
    let errorDetails = errorText
    try {
      const errorJson = JSON.parse(errorText)
      errorDetails = errorJson.message || errorJson.error || errorText
    } catch {
      // Use raw text if not JSON
    }
    
    throw new Error(`HTTP ${response.status}: ${errorDetails}`)
  }

  const result = await response.json()
  
  if (!result.extracted) {
    throw new Error('No extracted data received from server')
  }
  
  return result
}

// File upload functions
export async function uploadContractFile(contractId: number, file: File) {
  const token = getToken()
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
  
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${apiUrl}/api/contracts/${contractId}/files`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Failed to upload file: ${errorText}`)
  }

  return response.json()
}

export async function getContractFiles(contractId: number) {
  const token = getToken()
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

  const response = await fetch(`${apiUrl}/api/contracts/${contractId}/files`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })

  if (!response.ok) {
    throw new Error('Failed to fetch contract files')
  }

  return response.json()
}

export async function downloadContractFile(fileId: number) {
  const token = getToken()
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

  const response = await fetch(`${apiUrl}/api/contracts/files/${fileId}/download`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })

  if (!response.ok) {
    throw new Error('Failed to download file')
  }

  return response.blob()
}

export async function deleteContractFile(fileId: number) {
  const token = getToken()
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

  const response = await fetch(`${apiUrl}/api/contracts/files/${fileId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })

  if (!response.ok) {
    throw new Error('Failed to delete file')
  }

  return response.json()
}


