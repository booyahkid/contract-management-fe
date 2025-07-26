'use client'

import useSWR from 'swr'
import { fetchContracts } from '@/lib/api/contracts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Contract } from '@/types/contract'

const fetcher = async () => {
  const contracts = await fetchContracts()
  const now = new Date()
  const threeMonthsFromNow = new Date(now.getTime() + (90 * 24 * 60 * 60 * 1000))
  
  const expiringSoonCount = contracts.filter((contract: Contract) => {
    const endDate = new Date(contract.end_date)
    return endDate > now && endDate <= threeMonthsFromNow
  }).length
  
  return { count: expiringSoonCount }
}

export default function ExpiringSoonCount() {
  const { data, error, isLoading } = useSWR('expiring-soon-count', fetcher, {
    refreshInterval: 300000, // Refresh every 5 minutes
    revalidateOnFocus: true
  })

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-base font-medium">Jatuh Tempo ≤ 3 Bulan</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : error ? (
          <p className="text-sm text-red-500">Failed to load</p>
        ) : (
          <p className="text-3xl font-bold text-yellow-600">{data?.count ?? 0}</p>
        )}
      </CardContent>
    </Card>
  )
}
