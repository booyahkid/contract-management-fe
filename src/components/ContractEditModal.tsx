// components/EditContractModal.tsx
'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Contract } from '@/types/contract'
import { uploadContractFile } from '@/lib/api/contracts'
import { toast } from 'sonner'

interface EditContractModalProps {
  open: boolean
  onClose: () => void
  contract: Contract | null
  onSubmit: (data: Partial<Contract>) => Promise<void>
}

type ContractFormState = {
  contract_type: string
  contract_number: string
  contract_name: string
  department: string
  contract_date: string
  start_date: string
  end_date: string
  ats_amount: number
  jsl_amount: number
  subscription_amount: number
  category: string
  item: string
  custom_item: string
  vendor: string
  pic_user_name: string
  pic_ipm_name: string
  notes: string
}

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

export default function EditContractModal({ open, onClose, contract, onSubmit }: EditContractModalProps) {
  const [form, setForm] = useState<ContractFormState>({
    contract_type: '',
    contract_number: '',
    contract_name: '',
    department: '',
    contract_date: '',
    start_date: '',
    end_date: '',
    ats_amount: 0,
    jsl_amount: 0,
    subscription_amount: 0,
    category: '',
    item: '',
    custom_item: '',
    vendor: '',
    pic_user_name: '',
    pic_ipm_name: '',
    notes: '',
  })
  
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (contract) {
      setForm({
        contract_type: contract.contract_type || '',
        contract_number: contract.contract_number || '',
        contract_name: contract.contract_name || '',
        department: contract.department || '',
        contract_date: contract.contract_date || '',
        start_date: contract.start_date || '',
        end_date: contract.end_date || '',
        ats_amount: contract.ats_amount || 0,
        jsl_amount: contract.jsl_amount || 0,
        subscription_amount: contract.subscription_amount || 0,
        category: contract.sub_category || '',
        item: contract.item || '',
        custom_item: contract.item === 'Lain-lain' ? '' : '',
        vendor: contract.vendor || '',
        pic_user_name: contract.pic_user_name || '',
        pic_ipm_name: contract.pic_ipm_name || '',
        notes: contract.notes || '',
      })
    }
  }, [contract])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)
    
    try {
      console.log('Starting contract update...')
      // First update the contract
      const contractData = {
        contract_type: form.contract_type,
        contract_number: form.contract_number,
        contract_name: form.contract_name,
        department: form.department,
        contract_date: form.contract_date,
        start_date: form.start_date,
        end_date: form.end_date,
        ats_amount: parseFloat(form.ats_amount?.toString() || '0'),
        jsl_amount: parseFloat(form.jsl_amount?.toString() || '0'),
        subscription_amount: parseFloat(form.subscription_amount?.toString() || '0'),
        category: form.category,
        sub_category: form.category, // Map category to sub_category for backend compatibility
        item: form.item === 'Lain-lain' ? form.custom_item : form.item,
        vendor: form.vendor,
        pic_user_name: form.pic_user_name,
        pic_ipm_name: form.pic_ipm_name,
        notes: form.notes,
      }
      
      console.log('Contract data being sent:', contractData)
      await onSubmit(contractData)
      
      console.log('Contract updated successfully, now uploading files...')
      // Then upload any selected files
      if (selectedFiles && selectedFiles.length > 0 && contract?.id) {
        console.log(`Uploading ${selectedFiles.length} files to contract ${contract.id}`)
        for (let i = 0; i < selectedFiles.length; i++) {
          console.log(`Uploading file ${i + 1}/${selectedFiles.length}: ${selectedFiles[i].name}`)
          await uploadContractFile(contract.id, selectedFiles[i])
        }
        // Clear selected files after successful upload
        setSelectedFiles(null)
        if (document.getElementById('file-upload') as HTMLInputElement) {
          (document.getElementById('file-upload') as HTMLInputElement).value = ''
        }
        console.log('All files uploaded successfully')
      }
    } catch (error) {
      console.error('Error saving contract:', error)
      // Show user-friendly error message
      if (error instanceof Error) {
        toast.error(`Gagal menyimpan kontrak: ${error.message}`)
      } else {
        toast.error('Gagal menyimpan kontrak: Terjadi kesalahan yang tidak diketahui')
      }
    } finally {
      setUploading(false)
    }
  }

  if (!contract) return null

  return (
    <Dialog open={open} onOpenChange={(open) => {
      // Only allow closing if not uploading
      if (!open && !uploading) {
        onClose()
      }
    }}>
      <DialogContent className="max-w-4xl max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Edit Contract
            {uploading && <span className="text-sm text-orange-600 ml-2">(Uploading files...)</span>}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 p-2">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contract_type">Contract Type</Label>
                <Select value={form.contract_type} onValueChange={(value) => setForm(prev => ({ ...prev, contract_type: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Kontrak">Kontrak</SelectItem>
                    <SelectItem value="PO">PO</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contract_number">Contract Number</Label>
                <Input name="contract_number" value={form.contract_number} onChange={handleChange} required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contract_name">Contract Name</Label>
              <Input name="contract_name" value={form.contract_name} onChange={handleChange} required />
            </div>
          </div>

          {/* Parties & Contacts */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Parties & Contacts</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select value={form.department} onValueChange={(value) => setForm(prev => ({ ...prev, department: value }))}>
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
                <Input name="vendor" value={form.vendor} onChange={handleChange} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pic_user_name">PIC User</Label>
                <Input 
                  name="pic_user_name" 
                  value={form.pic_user_name} 
                  onChange={handleChange} 
                  placeholder="Person in charge from user side"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pic_ipm_name">PIC IPM</Label>
                <Input 
                  name="pic_ipm_name" 
                  value={form.pic_ipm_name} 
                  onChange={handleChange} 
                  placeholder="Person in charge from IPM side"
                />
              </div>
            </div>
          </div>

          {/* Classification */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Classification</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input name="category" value={form.category} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="item">Item</Label>
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
          </div>

          {/* Timeline */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Timeline</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contract_date">Contract Date</Label>
                <Input type="date" name="contract_date" value={form.contract_date} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date</Label>
                <Input type="date" name="start_date" value={form.start_date} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">End Date</Label>
                <Input type="date" name="end_date" value={form.end_date} onChange={handleChange} />
              </div>
            </div>
          </div>

          {/* Financial Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Financial Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ats_amount">ATS Amount</Label>
                <Input type="number" name="ats_amount" value={form.ats_amount} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jsl_amount">JSL Amount</Label>
                <Input type="number" name="jsl_amount" value={form.jsl_amount} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subscription_amount">Subscription Amount</Label>
                <Input type="number" name="subscription_amount" value={form.subscription_amount} onChange={handleChange} />
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Additional Information</h3>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea name="notes" value={form.notes} onChange={handleChange} rows={4} />
            </div>
          </div>

          {/* File Management Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Contract Documents</h3>
            <div className="space-y-2">
              <Label htmlFor="file-upload">Upload Additional Files</Label>
              <Input 
                id="file-upload"
                type="file"
                multiple
                onChange={(e) => setSelectedFiles(e.target.files)}
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
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={uploading}>
              {uploading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
