'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Download, Upload, FileText, Trash2 } from 'lucide-react'
import { uploadContractFile, getContractFiles, downloadContractFile, deleteContractFile } from '@/lib/api/contracts'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction
} from "@/components/ui/alert-dialog"

interface ContractFile {
  id: number
  contract_id: number
  file_path: string
  original_name: string
  mime_type: string
  size: number
  uploaded_at: string
}

interface ContractFileManagerProps {
  contractId: number
  onFilesChange?: (selectedFiles: FileList | null) => void
  selectedFiles?: FileList | null
  isEditing?: boolean
  onUploadFiles?: () => Promise<void>
}

export default function ContractFileManager({ contractId, onFilesChange, selectedFiles: externalSelectedFiles, isEditing = false }: ContractFileManagerProps) {
  const [files, setFiles] = useState<ContractFile[]>([])
  const [uploading, setUploading] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)

  // Use external selected files if provided
  const currentSelectedFiles = externalSelectedFiles || selectedFiles

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    setSelectedFiles(files)
    if (onFilesChange) {
      onFilesChange(files)
    }
  }

  useEffect(() => {
    // Fetch files for the contract
    const fetchFiles = async () => {
      try {
        if (contractId) {
          const data = await getContractFiles(contractId)
          setFiles(data)
        }
      } catch (error) {
        console.error('Failed to fetch files:', error)
      }
    }

    if (contractId) {
      fetchFiles()
    }
  }, [contractId])

  // Fetch files function for use in upload
  const refetchFiles = async () => {
    try {
      if (contractId) {
        const data = await getContractFiles(contractId)
        setFiles(data)
      }
    } catch (error) {
      console.error('Failed to fetch files:', error)
    }
  }

  // Upload files
  const handleUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) return

    setUploading(true)
    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        await uploadContractFile(contractId, selectedFiles[i])
      }
      
      // Reset file selection and refresh list
      setSelectedFiles(null)
      if (document.getElementById('file-upload') as HTMLInputElement) {
        (document.getElementById('file-upload') as HTMLInputElement).value = ''
      }
      await refetchFiles()
      toast.success(`${selectedFiles.length} file(s) berhasil diupload`)
    } catch (error) {
      console.error('Upload failed:', error)
      toast.error('Gagal mengupload file. Silakan coba lagi.')
    } finally {
      setUploading(false)
    }
  }

  // Download file
  const handleDownload = async (fileId: number, fileName: string) => {
    try {
      const blob = await downloadContractFile(fileId)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success(`File "${fileName}" berhasil didownload`)
    } catch (error) {
      console.error('Download failed:', error)
      toast.error('Gagal mendownload file. Silakan coba lagi.')
    }
  }

  // Delete file
  const handleDelete = async (fileId: number, fileName: string) => {
    try {
      await deleteContractFile(fileId)
      await refetchFiles() // Refresh the file list
      toast.success(`File "${fileName}" berhasil dihapus`)
    } catch (error) {
      console.error('Delete failed:', error)
      toast.error('Gagal menghapus file. Silakan coba lagi.')
    }
  }

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Get file icon based on mime type
  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) return '📄'
    if (mimeType.includes('image')) return '🖼️'
    if (mimeType.includes('word')) return '📝'
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊'
    return '📁'
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Contract Documents
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Section */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file-upload">Upload New Files</Label>
              <Input 
                id="file-upload"
                type="file"
                multiple
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                className="cursor-pointer"
              />
              <p className="text-sm text-muted-foreground">
                Supported formats: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG
              </p>
            </div>

            {currentSelectedFiles && currentSelectedFiles.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Selected files:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {Array.from(currentSelectedFiles).map((file, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span>{getFileIcon(file.type)}</span>
                      <span>{file.name}</span>
                      <span className="text-xs">({formatFileSize(file.size)})</span>
                    </li>
                  ))}
                </ul>
                {!isEditing && (
                  <Button 
                    onClick={handleUpload}
                    disabled={uploading}
                    className="flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    {uploading ? 'Uploading...' : 'Upload Files'}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Files List */}
        <div className="space-y-2">
          <h4 className="font-medium">Uploaded Documents</h4>
          {files.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No files uploaded yet.</p>
          ) : (
            <div className="space-y-2">
              {files.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{getFileIcon(file.mime_type)}</span>
                    <div>
                      <p className="font-medium text-sm">{file.original_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)} • Uploaded {new Date(file.uploaded_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(file.id, file.original_name)}
                      className="flex items-center gap-1"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Hapus File</AlertDialogTitle>
                          <AlertDialogDescription>
                            Apakah Anda yakin ingin menghapus file <span className="font-bold">&quot;{file.original_name}&quot;</span>? 
                            Tindakan ini tidak dapat dibatalkan.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(file.id, file.original_name)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Hapus
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
