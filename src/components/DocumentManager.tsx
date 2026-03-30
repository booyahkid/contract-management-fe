import React, { useState, useEffect, useCallback } from 'react'
import { 
  uploadFile, 
  listFiles, 
  downloadFile, 
  extractText, 
  deleteFile,
  getViewUrl,
  getFileIcon,
  canPreviewFile,
  getFileTypeDescription,
  type FileInfo,
  type ExtractionResult 
} from '@/lib/api/files'

interface DocumentManagerProps {
  contractId: string
}

export default function DocumentManager({ contractId }: DocumentManagerProps) {
  const [files, setFiles] = useState<FileInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [extracting, setExtracting] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<FileInfo | null>(null)
  const [extractedText, setExtractedText] = useState<ExtractionResult | null>(null)

  // Load files on component mount
  const loadFiles = useCallback(async () => {
    try {
      setLoading(true)
      const fileList = await listFiles(contractId)
      setFiles(fileList)
    } catch (error) {
      console.error('Failed to load files:', error)
    } finally {
      setLoading(false)
    }
  }, [contractId])

  useEffect(() => {
    loadFiles()
  }, [loadFiles])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)
      const result = await uploadFile(contractId, file)
      console.log('File uploaded:', result)
      
      // Reload files list
      await loadFiles()
      
      // Clear input
      event.target.value = ''
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleDownload = async (file: FileInfo) => {
    try {
      await downloadFile(file.id, file.display_name || file.original_name)
    } catch (error) {
      console.error('Download failed:', error)
      alert('Download failed. Please try again.')
    }
  }

  const handleExtractText = async (file: FileInfo) => {
    if (!file.is_pdf) {
      alert('Text extraction is only available for PDF files')
      return
    }

    try {
      setExtracting(file.id)
      const result = await extractText(file.id)
      setExtractedText(result)
      setSelectedFile(file)
    } catch (error) {
      console.error('Text extraction failed:', error)
      alert('Text extraction failed. Please try again.')
    } finally {
      setExtracting(null)
    }
  }

  const handleDelete = async (file: FileInfo) => {
    if (!confirm(`Are you sure you want to delete "${file.original_name}"?`)) {
      return
    }

    try {
      await deleteFile(file.id)
      await loadFiles() // Reload files list
    } catch (error) {
      console.error('Delete failed:', error)
      alert('Delete failed. Please try again.')
    }
  }

  const handlePreview = (file: FileInfo) => {
    if (canPreviewFile(file)) {
      const viewUrl = getViewUrl(file.id)
      window.open(viewUrl, '_blank')
    } else {
      alert('Preview not available for this file type')
    }
  }

  return (
    <div className="document-manager p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">📁 Document Manager</h2>
        
        {/* File Upload */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input
            type="file"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
            id="file-upload"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          />
          <label 
            htmlFor="file-upload" 
            className={`cursor-pointer ${uploading ? 'opacity-50' : ''}`}
          >
            <div className="text-4xl mb-2">📤</div>
            <div className="text-lg font-medium">
              {uploading ? 'Uploading...' : 'Click to upload files'}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Supports PDF, images, and documents
            </div>
          </label>
        </div>
      </div>

      {/* Files List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">📋 Uploaded Files ({files.length})</h3>
        
        {loading ? (
          <div className="text-center py-8">Loading files...</div>
        ) : files.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No files uploaded yet
          </div>
        ) : (
          <div className="grid gap-4">
            {files.map((file) => (
              <div 
                key={file.id} 
                className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getFileIcon(file.file_extension)}</span>
                    <div>
                      <div className="font-medium">{file.display_name || file.original_name}</div>
                      <div className="text-sm text-gray-500">
                        {getFileTypeDescription(file)} • {file.size_formatted} 
                        {file.pdf_analysis && (
                          <span className="ml-2">
                            • {file.pdf_analysis.total_pages} pages
                            • {file.pdf_analysis.extraction_method}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400">
                        Uploaded: {new Date(file.uploaded_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {/* Preview Button */}
                    {canPreviewFile(file) && (
                      <button
                        onClick={() => handlePreview(file)}
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                        title="Preview file"
                      >
                        👁️ View
                      </button>
                    )}
                    
                    {/* Extract Text Button */}
                    {file.is_pdf && (
                      <button
                        onClick={() => handleExtractText(file)}
                        disabled={extracting === file.id}
                        className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm disabled:opacity-50"
                        title="Extract text content"
                      >
                        {extracting === file.id ? '⏳' : '📝'} Extract
                      </button>
                    )}
                    
                    {/* Download Button */}
                    <button
                      onClick={() => handleDownload(file)}
                      className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
                      title="Download file"
                    >
                      💾 Download
                    </button>
                    
                    {/* Delete Button */}
                    <button
                      onClick={() => handleDelete(file)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                      title="Delete file"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>

                {/* PDF Analysis Info */}
                {file.pdf_analysis && !file.pdf_analysis.error && (
                  <div className="mt-3 p-3 bg-gray-50 rounded text-sm">
                    <div className="font-medium mb-1">📊 PDF Analysis:</div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>Pages: {file.pdf_analysis.total_pages}</div>
                      <div>Text Ratio: {(file.pdf_analysis.text_content_ratio * 100).toFixed(1)}%</div>
                      <div>Method: {file.pdf_analysis.extraction_method}</div>
                      <div>OCR Needed: {file.pdf_analysis.needs_ocr ? 'Yes' : 'No'}</div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Extracted Text Modal */}
      {extractedText && selectedFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  📝 Extracted Text: {selectedFile.display_name || selectedFile.original_name}
                </h3>
                <button
                  onClick={() => setExtractedText(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <div className="text-sm text-gray-500 mt-1">
                Method: {extractedText.extraction_method} • 
                Characters: {extractedText.character_count.toLocaleString()} • 
                Pages: {extractedText.pages_processed}
              </div>
            </div>
            <div className="p-4 max-h-96 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm font-mono">
                {extractedText.extracted_text}
              </pre>
            </div>
            <div className="p-4 border-t bg-gray-50">
              <button
                onClick={() => navigator.clipboard.writeText(extractedText.extracted_text)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                📋 Copy to Clipboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
