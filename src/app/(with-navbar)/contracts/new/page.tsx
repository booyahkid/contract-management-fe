'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createContract } from '@/lib/api/contracts'
import AuthGuard from '@/components/AuthGuard'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

export default function CreateContractPage() {
  const router = useRouter()

  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    contract_type: '',
    contract_number: '',
    contract_name: '',
    department: '',
    contract_date: '',
    start_date: '',
    end_date: '',
    ats_amount: '',
    jsl_amount: '',
    subscription_amount: '',
    sub_category: '',
    item: '',
    custom_item: '',
    vendor: '',
    pic_user_name: '',
    pic_ipm_name: '',
    notes: '',
  })

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

  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFiles(e.target.files)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      // Create contract first
      const createdContract = await createContract({
        ...form,
        category: form.sub_category || 'General',
        item: form.item === 'Lain-lain' ? form.custom_item : form.item,
        ats_amount: parseFloat(form.ats_amount || '0'),
        jsl_amount: parseFloat(form.jsl_amount || '0'),
        subscription_amount: parseFloat(form.subscription_amount || '0'),
      })

      // Upload files if any
      if (selectedFiles && selectedFiles.length > 0 && createdContract?.id) {
        for (let i = 0; i < selectedFiles.length; i++) {
          const formData = new FormData()
          formData.append('file', selectedFiles[i])
          
          await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contracts/${createdContract.id}/files`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: formData
          })
        }
      }

      toast.success(`Kontrak "${createdContract.contract_name || form.contract_name}" berhasil dibuat`)
      router.push('/contracts')
    } catch (error) {
      toast.error('Gagal membuat kontrak. Silakan coba lagi.')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthGuard>
      <div className="container mx-auto p-6 max-w-4xl">
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
        <h1 className="text-2xl font-bold">Create New Contract</h1>
        <p className="text-muted-foreground">Fill in the details below to create a new contract</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Contract Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contract_type">Contract Type</Label>
                <Select onValueChange={(value) => setForm((prev) => ({ ...prev, contract_type: value }))}>
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
                  id="contract_number"
                  name="contract_number" 
                  value={form.contract_number} 
                  onChange={handleChange} 
                  placeholder="e.g., CN-2024-001"
                  required 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contract_name">Contract Name</Label>
              <Input 
                id="contract_name"
                name="contract_name" 
                value={form.contract_name} 
                onChange={handleChange} 
                placeholder="Enter contract name"
                required 
              />
            </div>
          </CardContent>
        </Card>

        {/* Department & Vendor */}
        <Card>
          <CardHeader>
            <CardTitle>Department & Vendor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select onValueChange={(value) => setForm((prev) => ({ ...prev, department: value }))}>
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
                  id="vendor"
                  name="vendor" 
                  value={form.vendor} 
                  onChange={handleChange} 
                  placeholder="Vendor name"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pic_user_name">PIC User</Label>
                <Input 
                  id="pic_user_name"
                  name="pic_user_name" 
                  value={form.pic_user_name} 
                  onChange={handleChange} 
                  placeholder="Person in charge from user side"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pic_ipm_name">PIC IPM</Label>
                <Input 
                  id="pic_ipm_name"
                  name="pic_ipm_name" 
                  value={form.pic_ipm_name} 
                  onChange={handleChange} 
                  placeholder="Person in charge from IPM side"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sub_category">Sub Category</Label>
                <Input 
                  id="sub_category"
                  name="sub_category" 
                  value={form.sub_category} 
                  onChange={handleChange} 
                  placeholder="e.g., Software, Hardware, Services"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="item">Item Description</Label>
                <Select 
                  value={form.item}
                  onValueChange={(value) => {
                    setForm((prev) => ({ 
                      ...prev, 
                      item: value,
                      custom_item: value === 'Lain-lain' ? prev.custom_item : ''
                    }))
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
                {form.item === 'Lain-lain' && (
                  <Input 
                    name="custom_item" 
                    value={form.custom_item} 
                    onChange={handleChange} 
                    placeholder="Specify custom item"
                    className="mt-2"
                  />
                )}
              </div>
            </div>
          </CardContent>
        </Card>        {/* Dates */}
        <Card>
          <CardHeader>
            <CardTitle>Contract Dates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contract_date">Contract Date</Label>
                <Input 
                  id="contract_date"
                  type="date" 
                  name="contract_date" 
                  value={form.contract_date} 
                  onChange={handleChange} 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date</Label>
                <Input 
                  id="start_date"
                  type="date" 
                  name="start_date" 
                  value={form.start_date} 
                  onChange={handleChange} 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_date">End Date</Label>
                <Input 
                  id="end_date"
                  type="date" 
                  name="end_date" 
                  value={form.end_date} 
                  onChange={handleChange} 
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial Information */}
        <Card>
          <CardHeader>
            <CardTitle>Financial Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ats_amount">ATS Amount</Label>
                <Input 
                  id="ats_amount"
                  name="ats_amount" 
                  value={form.ats_amount} 
                  onChange={handleChange} 
                  placeholder="0"
                  type="number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="jsl_amount">JSL Amount</Label>
                <Input 
                  id="jsl_amount"
                  name="jsl_amount" 
                  value={form.jsl_amount} 
                  onChange={handleChange} 
                  placeholder="0"
                  type="number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subscription_amount">Subscription Amount</Label>
                <Input 
                  id="subscription_amount"
                  name="subscription_amount" 
                  value={form.subscription_amount} 
                  onChange={handleChange} 
                  placeholder="0"
                  type="number"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea 
                id="notes"
                name="notes" 
                value={form.notes} 
                onChange={handleChange} 
                placeholder="Add any additional notes or descriptions..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* File Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="files">Contract Files</Label>
              <Input 
                id="files"
                type="file"
                multiple
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                className="cursor-pointer"
              />
              <p className="text-sm text-muted-foreground">
                You can upload multiple files. Supported formats: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG
              </p>
              {selectedFiles && selectedFiles.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium">Selected files:</p>
                  <ul className="text-sm text-muted-foreground">
                    {Array.from(selectedFiles).map((file, index) => (
                      <li key={index}>• {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-end">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Contract'}
          </Button>
        </div>
      </form>
    </div>
    </AuthGuard>
  )
}
