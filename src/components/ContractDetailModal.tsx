'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Contract } from '@/types/contract'
import { formatIDRCurrency } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Calendar, Building2, User, DollarSign, FileText, Tag } from 'lucide-react'

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
          <DialogTitle className="text-2xl font-bold text-gray-900">
            {contract.contract_name}
          </DialogTitle>
          <div className="flex items-center gap-2">
            <Badge variant={contract.contract_type === 'Kontrak' ? 'default' : 'secondary'}>
              {contract.contract_type}
            </Badge>
            <span className="text-sm text-gray-500">•</span>
            <span className="text-sm text-gray-600 font-mono">{contract.contract_number}</span>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Contract Information Section */}
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Informasi Kontrak
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DetailItem 
                  icon={<Building2 className="h-4 w-4 text-gray-500" />}
                  label="Departemen" 
                  value={contract.department} 
                />
                <DetailItem 
                  icon={<Building2 className="h-4 w-4 text-gray-500" />}
                  label="Rekanan" 
                  value={contract.vendor} 
                />
                <DetailItem 
                  icon={<Tag className="h-4 w-4 text-gray-500" />}
                  label="Sub Kategori" 
                  value={contract.sub_category || '-'} 
                />
                <DetailItem 
                  icon={<Tag className="h-4 w-4 text-gray-500" />}
                  label="Kategori" 
                >
                  <div className="flex flex-wrap gap-1">
                    {categories.map((c, i) => (
                      <Badge 
                        key={i} 
                        variant="outline" 
                        className={`text-xs ${
                          c === 'ATS' ? 'border-blue-200 text-blue-700 bg-blue-50' :
                          c === 'JSL' ? 'border-green-200 text-green-700 bg-green-50' :
                          'border-purple-200 text-purple-700 bg-purple-50'
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
                <Calendar className="h-5 w-5 text-green-600" />
                Periode Kontrak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DetailItem 
                  icon={<Calendar className="h-4 w-4 text-gray-500" />}
                  label="Tanggal Mulai" 
                  value={formatDate(contract.start_date)} 
                />
                <DetailItem 
                  icon={<Calendar className="h-4 w-4 text-gray-500" />}
                  label="Tanggal Akhir" 
                  value={formatDate(contract.end_date)} 
                />
              </div>
              
              {/* Duration Display */}
              <Separator className="my-4" />
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Durasi Kontrak</div>
                <div className="text-lg font-semibold text-gray-900">
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
                <DollarSign className="h-5 w-5 text-emerald-600" />
                Informasi Finansial
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Financial Items List */}
                <div className="space-y-3">
                  {atsAmount > 0 && (
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-blue-700 font-medium">ATS Amount</span>
                      </div>
                      <span className="text-blue-700 font-bold">{formatIDRCurrency(atsAmount)}</span>
                    </div>
                  )}
                  {jslAmount > 0 && (
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-green-700 font-medium">JSL Amount</span>
                      </div>
                      <span className="text-green-700 font-bold">{formatIDRCurrency(jslAmount)}</span>
                    </div>
                  )}
                  {subscriptionAmount > 0 && (
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        <span className="text-purple-700 font-medium">Subscription</span>
                      </div>
                      <span className="text-purple-700 font-bold">{formatIDRCurrency(subscriptionAmount)}</span>
                    </div>
                  )}
                </div>
                
                {/* Total */}
                <Separator />
                <div className="bg-gray-900 rounded-lg p-4 text-white">
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
                <User className="h-5 w-5 text-purple-600" />
                Person In Charge (PIC)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DetailItem 
                  icon={<User className="h-4 w-4 text-gray-500" />}
                  label="PIC User" 
                  value={contract.pic_user_name} 
                />
                <DetailItem 
                  icon={<User className="h-4 w-4 text-gray-500" />}
                  label="PIC IPM" 
                  value={contract.pic_ipm_name} 
                />
              </div>
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
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
        {icon}
        {label}
      </div>
      <div className="text-gray-900">
        {children || value}
      </div>
    </div>
  )
}
