'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Upload, FileText, Brain, CheckCircle, AlertCircle } from 'lucide-react'
import { createContract, extractContractData } from '@/lib/api/contracts'
import AuthGuard from '@/components/AuthGuard'
import { toast } from 'sonner'

interface ExtractedData {
  contract_type?: string
  contract_number?: string
  contract_name?: string
  category?: string
  contract_date?: string
  start_date?: string
  end_date?: string
  vendor?: string
  department?: string
  ats_amount?: number
  jsl_amount?: number
  subscription_amount?: number
  notes?: string
  pic_user_name?: string
  pic_ipm_name?: string
  sub_category?: string
  item?: string
}

interface FileMeta {
  original_name: string
  mime_type: string
  size: number
  file_path: string
}

export default function AIExtractPage() {
  const router = useRouter()
  const [step, setStep] = useState<'upload' | 'preview' | 'success'>('upload')
  const [loading, setLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [extractedData, setExtractedData] = useState<ExtractedData>({})
  const [fileMeta, setFileMeta] = useState<FileMeta | null>(null)
  const [error, setError] = useState<string>('')
  const [customItem, setCustomItem] = useState<string>('')

  const itemOptions = [
    'IBM',
    'Corebanking', 
    'Huawei',
    'Cisco',
    'Hitachi',
    'Dell',
    'Nice',
    'Aruba',
    'Oracle',
    'F5',
    'Verifone',
    'Ingenico',
    'Ivanti',
    'Samsung',
    'BMC',
    'Appdynamics',
    'Splunk',
    'Microsoft',
    'Exadata',
    'Uipath',
    'Vmware',
    'Nutanix',
    'Lain-lain'
  ]

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setError('')
    }
  }

  const handleExtract = async () => {
    if (!selectedFile) return

    setLoading(true)
    setError('')

    try {
      const result = await extractContractData(selectedFile)
      setExtractedData(result.extracted)
      setFileMeta(result.fileMeta)
      setStep('preview')
      toast.success('Data kontrak berhasil diekstrak dari dokumen')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      
      // Provide more helpful error messages
      let userFriendlyError = errorMessage
      if (errorMessage.includes('Failed to fetch')) {
        userFriendlyError = 'Cannot connect to server. Please check if the backend is running.'
      } else if (errorMessage.includes('401')) {
        userFriendlyError = 'Authentication failed. Please login again.'
      } else if (errorMessage.includes('404')) {
        userFriendlyError = 'Extract endpoint not found. Please check backend configuration.'
      } else if (errorMessage.includes('500')) {
        userFriendlyError = 'Server error during extraction. Please check backend logs.'
      }
      
      setError(userFriendlyError)
      toast.error(`Gagal mengekstrak data: ${userFriendlyError}`)
    } finally {
      setLoading(false)
    }
  }

  const handleFieldChange = (field: keyof ExtractedData, value: string | number) => {
    setExtractedData(prev => ({ ...prev, [field]: value }))
  }

  const handleCreateContract = async () => {
    setLoading(true)
    setError('')
    
    try {
      const contractData = {
        contract_type: extractedData.contract_type || 'Kontrak',
        contract_number: extractedData.contract_number || '',
        contract_name: extractedData.contract_name || '',
        category: extractedData.category || 'General',
        sub_category: extractedData.sub_category || '',
        item: extractedData.item === 'Lain-lain' ? customItem : (extractedData.item || ''),
        contract_date: extractedData.contract_date || '',
        start_date: extractedData.start_date || '',
        end_date: extractedData.end_date || '',
        ats_amount: parseFloat(extractedData.ats_amount?.toString() || '0'),
        jsl_amount: parseFloat(extractedData.jsl_amount?.toString() || '0'),
        subscription_amount: parseFloat(extractedData.subscription_amount?.toString() || '0'),
        notes: extractedData.notes || `Contract created from AI extraction of ${fileMeta?.original_name}`,
        department: extractedData.department || '',
        pic_user_name: extractedData.pic_user_name || '',
        pic_ipm_name: extractedData.pic_ipm_name || '',
        vendor: extractedData.vendor || '',
      }

      const contract = await createContract(contractData)
      console.log('✅ Contract created:', contract)
      
      // Note: File upload temporarily disabled due to network issues
      // The contract is created successfully, users can upload files manually later
      console.log('✅ Contract created successfully. File upload skipped due to backend connectivity.')
      toast.success('Kontrak berhasil dibuat! Anda dapat mengupload file secara manual nanti.')
      
      setStep('success')
      toast.success(`Kontrak "${contractData.contract_name}" berhasil dibuat dari ekstraksi AI`)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      
      // Provide more specific error messages
      let userFriendlyError = errorMessage
      if (errorMessage.includes('401')) {
        userFriendlyError = 'Authentication failed. Please login again.'
      } else if (errorMessage.includes('400')) {
        userFriendlyError = 'Invalid contract data. Please check all required fields.'
      } else if (errorMessage.includes('422')) {
        userFriendlyError = 'Validation failed. Please check the contract data format.'
      } else if (errorMessage.includes('500')) {
        userFriendlyError = 'Server error while creating contract. Please check backend logs.'
      } else if (errorMessage.includes('Failed to fetch')) {
        userFriendlyError = 'Cannot connect to server. Please check if the backend is running.'
      }
      
      setError(`Failed to create contract: ${userFriendlyError}`)
      toast.error(`Gagal membuat kontrak: ${userFriendlyError}`)
    } finally {
      setLoading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <AuthGuard>
      <div className="container mx-auto p-6 max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            AI Contract Extraction
          </h1>
          <p className="text-muted-foreground">Upload a contract document to automatically extract and fill contract data</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-8">
            <div className={`flex items-center gap-2 ${step === 'upload' ? 'text-blue-600 dark:text-blue-400' : step === 'preview' || step === 'success' ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'upload' ? 'bg-blue-600 dark:bg-blue-500 text-white' : step === 'preview' || step === 'success' ? 'bg-green-600 dark:bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                1
              </div>
              <span className="font-medium">Upload Document</span>
            </div>
            <div className={`w-16 h-1 ${step === 'preview' || step === 'success' ? 'bg-green-600 dark:bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
            <div className={`flex items-center gap-2 ${step === 'preview' ? 'text-blue-600 dark:text-blue-400' : step === 'success' ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'preview' ? 'bg-blue-600 dark:bg-blue-500 text-white' : step === 'success' ? 'bg-green-600 dark:bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                2
              </div>
              <span className="font-medium">Review & Edit</span>
            </div>
            <div className={`w-16 h-1 ${step === 'success' ? 'bg-green-600 dark:bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
            <div className={`flex items-center gap-2 ${step === 'success' ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'success' ? 'bg-green-600 dark:bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                3
              </div>
              <span className="font-medium">Contract Created</span>
            </div>
          </div>
        </div>

        {error && (
          <Card className="mb-6 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertCircle className="h-5 w-5" />
                <span>{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 1: Upload */}
        {step === 'upload' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Contract Document
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                <div className="space-y-4">
                  <FileText className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto" />
                  <div>
                    <Label htmlFor="file-upload" className="text-lg font-medium cursor-pointer">
                      Choose a contract file to upload
                    </Label>
                    <Input 
                      id="file-upload"
                      type="file"
                      onChange={handleFileSelect}
                      accept=".pdf,.doc,.docx"
                      className="mt-2 cursor-pointer"
                    />
                    <p className="text-sm text-muted-foreground mt-2">
                      Supported formats: PDF, DOC, DOCX
                    </p>
                  </div>

                  {selectedFile && (
                    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <div className="flex items-center gap-3 justify-center">
                        <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        <div className="text-left">
                          <p className="font-medium">{selectedFile.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatFileSize(selectedFile.size)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-center">
                <Button 
                  onClick={handleExtract}
                  disabled={!selectedFile || loading}
                  className="flex items-center gap-2"
                  size="lg"
                >
                  <Brain className="h-5 w-5" />
                  {loading ? 'Extracting Data...' : 'Extract Contract Data'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Preview & Edit */}
        {step === 'preview' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  Extracted Data - Review and Edit
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  AI has extracted the following data. Please review and edit as needed before creating the contract.
                </p>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Basic Information Section */}
                <div className="space-y-4">
                  <div className="border-b border-gray-200 dark:border-gray-700 pb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Basic Information</h3>
                    <p className="text-sm text-muted-foreground">Contract identification and classification</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contract_type">Contract Type</Label>
                      <Select value={extractedData.contract_type || 'Kontrak'} onValueChange={(value) => handleFieldChange('contract_type', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select contract type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Kontrak">Contract</SelectItem>
                          <SelectItem value="PO">PO</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contract_number">Contract Number</Label>
                      <Input 
                        value={extractedData.contract_number || ''} 
                        onChange={(e) => handleFieldChange('contract_number', e.target.value)} 
                        placeholder="e.g., CN-2024-001"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contract_name">Contract Name</Label>
                    <Input 
                      value={extractedData.contract_name || ''} 
                      onChange={(e) => handleFieldChange('contract_name', e.target.value)} 
                      placeholder="Enter contract name"
                    />
                  </div>
                </div>

                {/* Parties Section */}
                <div className="space-y-4">
                  <div className="border-b border-gray-200 dark:border-gray-700 pb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Parties & Contacts</h3>
                    <p className="text-sm text-muted-foreground">Department, vendor, and person in charge details</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <Select value={extractedData.department || ''} onValueChange={(value) => handleFieldChange('department', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="HSD">HSD</SelectItem>
                          <SelectItem value="NSD">NSD</SelectItem>
                          <SelectItem value="IGW">IGW</SelectItem>
                          <SelectItem value="CEO">CEO</SelectItem>
                          <SelectItem value="IPS">IPS</SelectItem>
                          <SelectItem value="OCD">OCD</SelectItem>
                          <SelectItem value="SMD">SMD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="vendor">Vendor</Label>
                      <Input 
                        value={extractedData.vendor || ''} 
                        onChange={(e) => handleFieldChange('vendor', e.target.value)} 
                        placeholder="Vendor name"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="pic_user_name">PIC User</Label>
                      <Input 
                        value={extractedData.pic_user_name || ''} 
                        onChange={(e) => handleFieldChange('pic_user_name', e.target.value)} 
                        placeholder="Person in charge from user side"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pic_ipm_name">PIC IPM</Label>
                      <Input 
                        value={extractedData.pic_ipm_name || ''} 
                        onChange={(e) => handleFieldChange('pic_ipm_name', e.target.value)} 
                        placeholder="Person in charge from IPM side"
                      />
                    </div>
                  </div>
                </div>

                {/* Timeline Section */}
                <div className="space-y-4">
                  <div className="border-b border-gray-200 dark:border-gray-700 pb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Timeline</h3>
                    <p className="text-sm text-muted-foreground">Contract dates and duration</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contract_date">Contract Date</Label>
                      <Input 
                        type="date" 
                        value={extractedData.contract_date || ''} 
                        onChange={(e) => handleFieldChange('contract_date', e.target.value)} 
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="start_date">Start Date</Label>
                      <Input 
                        type="date" 
                        value={extractedData.start_date || ''} 
                        onChange={(e) => handleFieldChange('start_date', e.target.value)} 
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="end_date">End Date</Label>
                      <Input 
                        type="date" 
                        value={extractedData.end_date || ''} 
                        onChange={(e) => handleFieldChange('end_date', e.target.value)} 
                      />
                    </div>
                  </div>
                </div>

                {/* Financial Section */}
                <div className="space-y-4">
                  <div className="border-b border-gray-200 dark:border-gray-700 pb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Financial Information</h3>
                    <p className="text-sm text-muted-foreground">Contract amounts and costs</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ats_amount">ATS Amount</Label>
                      <Input 
                        type="number" 
                        value={extractedData.ats_amount || ''} 
                        onChange={(e) => handleFieldChange('ats_amount', parseFloat(e.target.value) || 0)} 
                        placeholder="0"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="jsl_amount">JSL Amount</Label>
                      <Input 
                        type="number" 
                        value={extractedData.jsl_amount || ''} 
                        onChange={(e) => handleFieldChange('jsl_amount', parseFloat(e.target.value) || 0)} 
                        placeholder="0"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subscription_amount">Subscription Amount</Label>
                      <Input 
                        type="number" 
                        value={extractedData.subscription_amount || ''} 
                        onChange={(e) => handleFieldChange('subscription_amount', parseFloat(e.target.value) || 0)} 
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>

                {/* Category Section */}
                <div className="space-y-4">
                  <div className="border-b border-gray-200 dark:border-gray-700 pb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Classification</h3>
                    <p className="text-sm text-muted-foreground">Category and item details</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Input 
                        value={extractedData.category || ''} 
                        onChange={(e) => handleFieldChange('category', e.target.value)} 
                        placeholder="e.g., IT, Software, Hardware"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sub_category">Sub Category</Label>
                      <Input 
                        value={extractedData.sub_category || ''} 
                        onChange={(e) => handleFieldChange('sub_category', e.target.value)} 
                        placeholder="e.g., Network, Software License"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="item">Item Description</Label>
                    <Select 
                      value={extractedData.item || ''}
                      onValueChange={(value) => {
                        handleFieldChange('item', value)
                        if (value !== 'Lain-lain') {
                          setCustomItem('')
                        }
                      }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select item" />
                      </SelectTrigger>
                      <SelectContent>
                        {itemOptions.map((item) => (
                          <SelectItem key={item} value={item}>
                            {item}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {extractedData.item === 'Lain-lain' && (
                      <Input 
                        value={customItem} 
                        onChange={(e) => setCustomItem(e.target.value)} 
                        placeholder="Specify custom item"
                        className="mt-2"
                      />
                    )}
                  </div>
                </div>

                {/* Notes Section */}
                <div className="space-y-4">
                  <div className="border-b border-gray-200 dark:border-gray-700 pb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Additional Information</h3>
                    <p className="text-sm text-muted-foreground">Notes and comments</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea 
                      value={extractedData.notes || `Contract created from AI extraction of ${fileMeta?.original_name}`} 
                      onChange={(e) => handleFieldChange('notes', e.target.value)} 
                      placeholder="Add any additional notes..."
                      rows={3}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setStep('upload')}
                    disabled={loading}
                  >
                    Back to Upload
                  </Button>
                  <Button 
                    onClick={handleCreateContract}
                    disabled={loading}
                    className="flex items-center gap-2"
                  >
                    {loading ? 'Creating Contract...' : 'Create Contract'}
                  </Button>
                </div>

              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 3: Success */}
        {step === 'success' && (
          <Card className="border-green-200 dark:border-green-800 bg-gradient-to-b from-green-50 to-transparent dark:from-green-950/30 dark:to-transparent">
            <CardContent className="pt-6">
              <div className="text-center space-y-6">
                <div className="flex justify-center">
                  <div className="w-20 h-20 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-green-600 dark:text-green-400">Contract Created Successfully!</h2>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Your contract has been created from the AI-extracted data and saved to the database.
                  </p>
                </div>
                <div className="flex gap-4 justify-center pt-4">
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setStep('upload')
                      setSelectedFile(null)
                      setExtractedData({})
                      setFileMeta(null)
                      setError('')
                    }}
                    className="flex items-center gap-2"
                  >
                    <Brain className="h-4 w-4" />
                    Extract Another Contract
                  </Button>
                  <Button 
                    onClick={() => router.push('/contracts')}
                    className="flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    View All Contracts
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AuthGuard>
  )
}
