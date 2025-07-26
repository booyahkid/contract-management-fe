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

interface EditContractModalProps {
  open: boolean
  onClose: () => void
  contract: Contract | null
  onSubmit: (data: ContractFormState) => Promise<void>
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
  vendor: string
  notes: string
}

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
    vendor: '',
    notes: '',
  })

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
        vendor: contract.vendor || '',
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
    await onSubmit({
      ...form,
      ats_amount: parseFloat(form.ats_amount?.toString() || '0'),
      jsl_amount: parseFloat(form.jsl_amount?.toString() || '0'),
      subscription_amount: parseFloat(form.subscription_amount?.toString() || '0'),
    })
  }

  if (!contract) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Contract</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 p-2">

          {/* Basic Info */}
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

          {/* Department and Vendor */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select value={form.department} onValueChange={(value) => setForm(prev => ({ ...prev, department: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IT Department">IT Department</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                  <SelectItem value="HR">HR</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="General Affairs">General Affairs</SelectItem>
                  <SelectItem value="Security">Security</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="vendor">Vendor</Label>
              <Input name="vendor" value={form.vendor} onChange={handleChange} />
            </div>
          </div>

          {/* Dates */}
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

          {/* Financial */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ats_amount">ATS</Label>
              <Input type="number" name="ats_amount" value={form.ats_amount} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="jsl_amount">JSL</Label>
              <Input type="number" name="jsl_amount" value={form.jsl_amount} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subscription_amount">Subscription</Label>
              <Input type="number" name="subscription_amount" value={form.subscription_amount} onChange={handleChange} />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea name="notes" value={form.notes} onChange={handleChange} rows={4} />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
