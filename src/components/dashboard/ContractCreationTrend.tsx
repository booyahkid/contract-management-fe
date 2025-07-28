'use client'

import useSWR from 'swr'
import { fetchContracts } from '@/lib/api/contracts'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Contract } from '@/types/contract'

const fetcher = async () => {
  const contracts = await fetchContracts()
  const currentYear = new Date().getFullYear()
  
  // Generate monthly creation trend for current year
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const date = new Date(currentYear, i, 1)
    const nextMonth = new Date(currentYear, i + 1, 1)
    
    const count = contracts.filter((contract: Contract) => {
      const contractDate = new Date(contract.start_date)
      return contractDate >= date && contractDate < nextMonth
    }).length
    
    return {
      month: date.toLocaleDateString('id-ID', { month: 'short' }),
      count
    }
  })
  
  return monthlyData
}

export default function ContractCreationTrend() {
  const { data, error, isLoading } = useSWR('contract-creation-trend', fetcher, {
    refreshInterval: 300000, // Refresh every 5 minutes
    revalidateOnFocus: true
  })

  return (
    <div className="h-[300px] w-full">
      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
              <linearGradient id="creationGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.4}/>
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
              cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
              labelStyle={{ color: '#374151', fontWeight: '600' }}
            />
            <Bar 
              dataKey="count" 
              fill="url(#creationGradient)" 
              radius={[6, 6, 0, 0]}
              stroke="#3b82f6"
              strokeWidth={1}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}