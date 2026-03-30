import api from '@/lib/api'
import { getToken } from '../auth'
import { ContractIngestData } from '@/types/rag'

export interface ChatRequest {
  question: string
  session_id?: string
  max_results?: number
  contract_id?: number
}

export interface ChatResponse {
  answer: string
  sources: Array<{
    source: string
    chunk_index: number
    text: string
    relevance_score: number
  }>
  session_id?: string
  confidence?: number
}

export interface IngestRequest {
  contract_id?: number
}

export interface SearchRequest {
  query: string
  limit?: number
  contract_id?: number
}

// RAG Chat Functions
export async function askQuestion(request: ChatRequest): Promise<ChatResponse> {
  const token = getToken()

  const response = await api.post('/rag/ask', request, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })

  return response.data
}

export async function searchDocuments(request: SearchRequest) {
  const token = getToken()

  const response = await api.post('/rag/search', request, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })

  return response.data
}

// Document Ingestion Functions
export async function ingestDocument(file: File, contractId?: number) {
  const token = getToken()
  
  const formData = new FormData()
  formData.append('file', file)
  if (contractId) {
    formData.append('contract_id', contractId.toString())
  }

  const response = await api.post('/rag/ingest', formData, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })

  return response.data
}

export async function ingestContractData(contractData: ContractIngestData) {
  const token = getToken()

  const response = await api.post('/rag/ingest-contract', contractData, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })

  return response.data
}

// Knowledge Base Management
export async function getIngestedDocuments() {
  const token = getToken()

  const response = await api.get('/rag/documents', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })

  return response.data
}

export async function deleteDocument(documentId: string) {
  const token = getToken()

  const response = await api.delete(`/rag/documents/${documentId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })

  return response.data
}

// RAG Health Check
export async function ragHealthCheck() {
  const token = getToken()

  const response = await api.get('/rag/health', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })

  return response.data
}
