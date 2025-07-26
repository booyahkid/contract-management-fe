'use client'

import useSWR from 'swr'
import { fetchContracts } from '@/lib/api/contracts'
import { ResponsiveContainer, BarChart, XAxis, YAxis, Tooltip, Bar } from 'recharts'
import { Contract } from '@/types/contract'

const fetcher = async () => {
  const contracts = await fetchContracts()
  const now = new Date()
  
  // Generate monthly expiring trend for next 12 months
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const date = new Date(now.getFullYear(), now.getMonth() + i, 1)
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + i + 1, 1)
    
    const count = contracts.filter((contract: Contract) => {
      const endDate = new Date(contract.end_date)
      return endDate >= date && endDate < nextMonth
    }).length
    
    return {
      month: date.toLocaleDateString('id-ID', { month: 'short', year: i > 11 ? 'numeric' : undefined }),
      count
    }
  })
  
  return monthlyData
}

export default function ExpiringContractsTrend() {
  const { data, error, isLoading } = useSWR('expiring-contracts-trend', fetcher, {
    refreshInterval: 300000, // Refresh every 5 minutes
    revalidateOnFocus: true
  })

  return (
    <div className="h-[300px] w-full">
      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-red-500 text-sm">Gagal memuat data</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={data} 
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            barCategoryGap="20%"
          >
            <defs>
              <linearGradient id="expiringGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ea580c" stopOpacity={0.8}/>
                <stop offset="100%" stopColor="#ea580c" stopOpacity={0.4}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="month" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6b7280' }}
              dy={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6b7280' }}
              dx={-10}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                fontSize: '14px'
              }}
              cursor={{ fill: 'rgba(234, 88, 12, 0.05)' }}
              labelStyle={{ color: '#374151', fontWeight: '600' }}
            />
            <Bar 
              dataKey="count" 
              fill="url(#expiringGradient)" 
              radius={[6, 6, 0, 0]}
              stroke="#ea580c"
              strokeWidth={1}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
