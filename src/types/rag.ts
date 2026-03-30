export interface ChatMessage {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  sources?: ChatSource[]
  confidence?: number
}

export interface ChatSource {
  source: string
  chunk_index: number
  text: string
  relevance_score: number
  contract_id?: number
  section_type?: string
}

export interface ChatSession {
  id: string
  title: string
  messages: ChatMessage[]
  created_at: Date
  updated_at: Date
}

export interface DocumentMetadata {
  id: string
  filename: string
  document_type: string
  contract_id?: number
  chunks_count: number
  ingested_at: Date
  status: 'processing' | 'completed' | 'failed'
}

export interface RAGDocument {
  id: string
  text: string
  metadata: {
    source: string
    chunk_index: number
    section_type: string
    document_type: string
    contract_id?: number
  }
  embedding_status: 'pending' | 'completed' | 'failed'
}

export interface ContractIngestData {
  contract_id: number
  contract_number: string
  contract_name: string
  contract_type: string
  vendor: string
  category: string
  department: string
  notes: string
  start_date?: string
  end_date?: string
  ats_amount?: number
  jsl_amount?: number
  subscription_amount?: number
}

export interface RAGHealthStatus {
  status: string
  services: {
    ollama: {
      status: string
      model: string
      model_name: string
    }
    vector_db: {
      status: string
      document_count: number
      type: string
    }
    ocr: string
    pdf_converter: string
  }
}
