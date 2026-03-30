'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  FileText, 
  Upload, 
  Trash2, 
  Search, 
  Database,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { 
  ingestDocument, 
  getIngestedDocuments, 
  deleteDocument,
  searchDocuments,
  ragHealthCheck
} from '@/lib/api/rag'
import { DocumentMetadata, RAGHealthStatus } from '@/types/rag'
import { toast } from 'sonner'

interface DocumentManagerProps {
  contractId?: number
}

export function DocumentManager({ contractId }: DocumentManagerProps) {
  const [documents, setDocuments] = useState<DocumentMetadata[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Array<{
    text: string
    score: number
    metadata?: {
      source: string
      chunk_index: number
      section_type: string
    }
  }>>([])
  const [isSearching, setIsSearching] = useState(false)
  const [healthStatus, setHealthStatus] = useState<RAGHealthStatus | null>(null)

  useEffect(() => {
    loadDocuments()
    checkHealth()
  }, [])

  const loadDocuments = async () => {
    try {
      setIsLoading(true)
      const data = await getIngestedDocuments()
      setDocuments(data.documents || [])
    } catch (error) {
      console.error('Failed to load documents:', error)
      toast.error('Gagal memuat dokumen')
    } finally {
      setIsLoading(false)
    }
  }

  const checkHealth = async () => {
    try {
      const status = await ragHealthCheck()
      setHealthStatus(status)
    } catch (error) {
      console.error('Failed to check RAG health:', error)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Hanya file PDF yang didukung')
      return
    }

    try {
      setIsUploading(true)
      await ingestDocument(file, contractId)
      toast.success('Dokumen berhasil diupload dan diproses')
      loadDocuments()
    } catch (error) {
      console.error('Upload failed:', error)
      toast.error('Gagal mengupload dokumen')
    } finally {
      setIsUploading(false)
      // Reset input
      event.target.value = ''
    }
  }

  const handleDeleteDocument = async (documentId: string) => {
    try {
      await deleteDocument(documentId)
      toast.success('Dokumen berhasil dihapus')
      loadDocuments()
    } catch (error) {
      console.error('Delete failed:', error)
      toast.error('Gagal menghapus dokumen')
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    try {
      setIsSearching(true)
      const results = await searchDocuments({
        query: searchQuery,
        limit: 10,
        contract_id: contractId
      })
      setSearchResults(results.results || [])
    } catch (error) {
      console.error('Search failed:', error)
      toast.error('Gagal melakukan pencarian')
    } finally {
      setIsSearching(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500'
      case 'processing': return 'bg-yellow-500'
      case 'failed': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'processing': return <Loader2 className="h-4 w-4 animate-spin" />
      case 'failed': return <AlertCircle className="h-4 w-4" />
      default: return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Health Status */}
      {healthStatus && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              RAG System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <Badge className={healthStatus.services.ollama.status === 'connected' ? 'bg-green-500' : 'bg-red-500'}>
                  {healthStatus.services.ollama.status}
                </Badge>
                <p className="text-sm text-muted-foreground mt-1">Ollama</p>
              </div>
              <div className="text-center">
                <Badge className={healthStatus.services.vector_db.status === 'connected' ? 'bg-green-500' : 'bg-red-500'}>
                  {healthStatus.services.vector_db.document_count} docs
                </Badge>
                <p className="text-sm text-muted-foreground mt-1">Vector DB</p>
              </div>
              <div className="text-center">
                <Badge className={healthStatus.services.ocr === 'available' ? 'bg-green-500' : 'bg-red-500'}>
                  {healthStatus.services.ocr}
                </Badge>
                <p className="text-sm text-muted-foreground mt-1">OCR</p>
              </div>
              <div className="text-center">
                <Badge className={healthStatus.services.pdf_converter === 'available' ? 'bg-green-500' : 'bg-red-500'}>
                  {healthStatus.services.pdf_converter}
                </Badge>
                <p className="text-sm text-muted-foreground mt-1">PDF Converter</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Document Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Dokumen untuk RAG
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="file-upload">Upload PDF</Label>
              <Input
                id="file-upload"
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="mt-1"
              />
              {isUploading && (
                <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Memproses dokumen...
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Pencarian Dokumen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari dalam dokumen..."
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={isSearching}>
              {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </div>

          {searchResults.length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="font-medium">Hasil Pencarian:</h4>
              {searchResults.map((result, index) => (
                <Card key={index} className="bg-blue-50 border-blue-200">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{result.metadata?.source}</span>
                      <Badge variant="outline">
                        Score: {Math.round(result.score * 100)}%
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{result.text}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Document List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Dokumen Terindeks ({documents.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Belum ada dokumen yang diindeks</p>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">{doc.filename}</p>
                      <p className="text-sm text-muted-foreground">
                        {doc.chunks_count} chunks • {doc.ingested_at ? new Date(doc.ingested_at).toLocaleDateString() : 'Unknown date'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(doc.status)}>
                      {getStatusIcon(doc.status)}
                      {doc.status}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteDocument(doc.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
