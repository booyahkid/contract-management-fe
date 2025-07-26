'use client'

import useSWR from 'swr'
import { fetchContracts } from '@/lib/api/contracts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Contract } from '@/types/contract'

const fetcher = async () => {
  const contracts = await fetchContracts()
  const currentYear = new Date().getFullYear()
  const totalThisYear = contracts.filter((contract: Contract) => {
    const createdDate = new Date(contract.created_at || contract.start_date)
    return createdDate.getFullYear() === currentYear
  }).length
  
  return { total: totalThisYear }
}

export default function TotalContractsThisYear() {
  const { data, error, isLoading } = useSWR('total-contracts-this-year', fetcher, {
    refreshInterval: 300000, // Refresh every 5 minutes
    revalidateOnFocus: true
  })

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-base font-medium">Total Kontrak Tahun Ini</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : error ? (
          <p className="text-sm text-red-500">Failed to load</p>
        ) : (
          <p className="text-3xl font-bold text-primary">{data?.total ?? 0}</p>
        )}
      </CardContent>
    </Card>
  )
}
