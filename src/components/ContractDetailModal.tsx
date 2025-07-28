'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Contract } from '@/types/contract'
import { formatIDRCurrency } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Calendar, Building2, User, DollarSign, FileText, Tag, Download } from 'lucide-react'
import { useState, useEffect } from 'react'
import { getContractFiles, downloadContractFile } from '@/lib/api/contracts'

interface ContractFile {
  id: number
  contract_id: number
  file_path: string
  original_name: string
  mime_type: string
  size: number
  uploaded_at: string
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)

  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function ContractDetailModal({
  open,
  onClose,
  contract,
}: {
  open: boolean
  onClose: () => void
  contract: Contract | null
}) {
  const [files, setFiles] = useState<ContractFile[]>([])

  useEffect(() => {
    const fetchFiles = async () => {
      if (!contract?.id) return
      
      try {
        const data = await getContractFiles(contract.id)
        setFiles(data)
      } catch (error) {
        console.error('Failed to fetch files:', error)
      }
    }

    if (open && contract) {
      fetchFiles()
    }
  }, [open, contract])

  const handleDownload = async (fileId: number, filename: string) => {
    try {
      const blob = await downloadContractFile(fileId)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to download file:', error)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) return '📄'
    if (mimeType.includes('image')) return '🖼️'
    if (mimeType.includes('word')) return '📝'
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊'
    return '📁'
  }

  if (!contract) return null

  const atsAmount = parseFloat(contract.ats_amount?.toString() || '0')
  const jslAmount = parseFloat(contract.jsl_amount?.toString() || '0')
  const subscriptionAmount = parseFloat(contract.subscription_amount?.toString() || '0')
  const total = atsAmount + jslAmount + subscriptionAmount

  const categories = []
  if (contract.ats_amount > 0) categories.push('ATS')
  if (contract.jsl_amount > 0) categories.push('JSL')
  if (contract.subscription_amount > 0) categories.push('Subscription')

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-none max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-bold text-foreground">
            {contract.contract_name}
          </DialogTitle>
          <div className="flex items-center gap-2">
            <Badge variant={contract.contract_type === 'Kontrak' ? 'default' : 'secondary'}>
              {contract.contract_type}
            </Badge>
            <span className="text-sm text-muted-foreground">•</span>
            <span className="text-sm text-muted-foreground font-mono">{contract.contract_number}</span>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Contract Information Section */}
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Informasi Kontrak
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DetailItem 
                  icon={<Building2 className="h-4 w-4 text-muted-foreground" />}
                  label="Departemen" 
                  value={contract.department} 
                />
                <DetailItem 
                  icon={<Building2 className="h-4 w-4 text-muted-foreground" />}
                  label="Rekanan" 
                  value={contract.vendor} 
                />
                <DetailItem 
                  icon={<Tag className="h-4 w-4 text-muted-foreground" />}
                  label="Sub Kategori" 
                  value={contract.sub_category || '-'} 
                />
                <DetailItem 
                  icon={<Tag className="h-4 w-4 text-muted-foreground" />}
                  label="Kategori" 
                >
                  <div className="flex flex-wrap gap-1">
                    {categories.map((c, i) => (
                      <Badge 
                        key={i} 
                        variant="outline" 
                        className={`text-xs ${
                          c === 'ATS' ? 'border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/20' :
                          c === 'JSL' ? 'border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-950/20' :
                          'border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/20'
                        }`}
                      >
                        {c}
                      </Badge>
                    ))}
                  </div>
                </DetailItem>
              </div>
            </CardContent>
          </Card>

          {/* Timeline Section */}
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Periode Kontrak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DetailItem 
                  icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
                  label="Tanggal Mulai" 
                  value={formatDate(contract.start_date)} 
                />
                <DetailItem 
                  icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
                  label="Tanggal Akhir" 
                  value={formatDate(contract.end_date)} 
                />
              </div>
              
              {/* Duration Display */}
              <Separator className="my-4" />
              <div className="bg-muted rounded-lg p-4">
                <div className="text-sm text-muted-foreground mb-1">Durasi Kontrak</div>
                <div className="text-lg font-semibold text-foreground">
                  {(() => {
                    const start = new Date(contract.start_date)
                    const end = new Date(contract.end_date)
                    const diffMonths = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30))
                    
                    if (diffMonths <= 6) return `${diffMonths} bulan`
                    if (diffMonths <= 12) return `${diffMonths} bulan`
                    if (diffMonths <= 24) return `${Math.round(diffMonths/12)} tahun`
                    return `${Math.round(diffMonths/12)} tahun`
                  })()}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial Section */}
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Informasi Finansial
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Financial Items List */}
                <div className="space-y-3">
                  {atsAmount > 0 && (
                    <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-blue-700 dark:text-blue-300 font-medium">ATS Amount</span>
                      </div>
                      <span className="text-blue-700 dark:text-blue-300 font-bold">{formatIDRCurrency(atsAmount)}</span>
                    </div>
                  )}
                  {jslAmount > 0 && (
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-green-700 dark:text-green-300 font-medium">JSL Amount</span>
                      </div>
                      <span className="text-green-700 dark:text-green-300 font-bold">{formatIDRCurrency(jslAmount)}</span>
                    </div>
                  )}
                  {subscriptionAmount > 0 && (
                    <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        <span className="text-purple-700 dark:text-purple-300 font-medium">Subscription</span>
                      </div>
                      <span className="text-purple-700 dark:text-purple-300 font-bold">{formatIDRCurrency(subscriptionAmount)}</span>
                    </div>
                  )}
                </div>
                
                {/* Total */}
                <Separator />
                <div className="bg-primary text-primary-foreground rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-l font-medium">Total Nilai Kontrak</span>
                    <span className="text-l font-bold">{formatIDRCurrency(total)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* PIC Section */}
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Person In Charge (PIC)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DetailItem 
                  icon={<User className="h-4 w-4 text-muted-foreground" />}
                  label="PIC User" 
                  value={contract.pic_user_name} 
                />
                <DetailItem 
                  icon={<User className="h-4 w-4 text-muted-foreground" />}
                  label="PIC IPM" 
                  value={contract.pic_ipm_name} 
                />
              </div>
            </CardContent>
          </Card>

          {/* Files Section */}
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Contract Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              {files.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">No documents attached to this contract.</p>
              ) : (
                <div className="space-y-3">
                  {files.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{getFileIcon(file.mime_type)}</span>
                        <div>
                          <p className="font-medium text-sm">{file.original_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(file.size)} • Uploaded {new Date(file.uploaded_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(file.id, file.original_name)}
                        className="flex items-center gap-1 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Helper component for detail items with icons
function DetailItem({ 
  icon, 
  label, 
  value, 
  children 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value?: string; 
  children?: React.ReactNode 
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="text-foreground">
        {children || value}
      </div>
    </div>
  )
}
