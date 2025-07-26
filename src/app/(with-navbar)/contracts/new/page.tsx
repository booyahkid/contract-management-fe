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
    vendor: '',
    notes: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await createContract({
        ...form,
        category: form.sub_category || 'General',
        ats_amount: parseFloat(form.ats_amount || '0'),
        jsl_amount: parseFloat(form.jsl_amount || '0'),
        subscription_amount: parseFloat(form.subscription_amount || '0'),
      })
      router.push('/contracts')
    } catch (error) {
      alert('Failed to create contract')
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
                    <SelectItem value="PO">Purchase Order</SelectItem>
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
                    <SelectItem value="IT Department">IT Department</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="HR">Human Resources</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="General Affairs">General Affairs</SelectItem>
                    <SelectItem value="Security">Security</SelectItem>
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
                <Input 
                  id="item"
                  name="item" 
                  value={form.item} 
                  onChange={handleChange} 
                  placeholder="Item or service details"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dates */}
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
