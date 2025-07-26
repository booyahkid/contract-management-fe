'use client'

import useSWR from 'swr'
import Link from 'next/link'
import { fetchContracts } from '@/lib/api/contracts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Contract } from '@/types/contract'

const fetcher = async () => {
  const contracts = await fetchContracts()
  const now = new Date()
  const sixMonthsFromNow = new Date(now.getTime() + (180 * 24 * 60 * 60 * 1000))
  
  // Filter contracts expiring within 6 months and sort by expiration date
  return contracts
    .filter((contract: Contract) => {
      const endDate = new Date(contract.end_date)
      return endDate > now && endDate <= sixMonthsFromNow
    })
    .sort((a: Contract, b: Contract) => new Date(a.end_date).getTime() - new Date(b.end_date).getTime())
    .slice(0, 10) // Show only top 10
}

export default function ExpiringContractsList() {
  const { data, error, isLoading } = useSWR('expiring-contracts-list', fetcher, {
    refreshInterval: 300000, // Refresh every 5 minutes
    revalidateOnFocus: true
  })

  const formatDaysRemaining = (endDate: string) => {
    const now = new Date()
    const end = new Date(endDate)
    const diffDays = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays <= 0) return 'Expired'
    if (diffDays === 1) return '1 hari lagi'
    if (diffDays <= 30) return `${diffDays} hari lagi`
    
    const months = Math.floor(diffDays / 30)
    const remainingDays = diffDays % 30
    
    if (months === 1 && remainingDays === 0) return '1 bulan lagi'
    if (remainingDays === 0) return `${months} bulan lagi`
    return `${months} bulan ${remainingDays} hari lagi`
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-base font-medium">Kontrak Akan Jatuh Tempo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {isLoading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : error ? (
          <p className="text-red-500">Gagal memuat data</p>
        ) : !data || data.length === 0 ? (
          <p className="text-muted-foreground">Tidak ada kontrak yang jatuh tempo dalam 6 bulan.</p>
        ) : (
          <ul className="space-y-2">
            {data.map((contract: Contract) => (
              <li key={contract.id} className="flex justify-between items-start border-b pb-2">
                <div className="flex-1">
                  <Link href={`/contracts/${contract.id}`} className="text-blue-600 hover:underline font-medium">
                    {contract.contract_name}
                  </Link>
                  <div className="text-xs text-gray-500 mt-1">
                    {contract.contract_number} • {contract.department}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-medium text-orange-600">
                    {formatDaysRemaining(contract.end_date)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(contract.end_date).toLocaleDateString('id-ID')}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
