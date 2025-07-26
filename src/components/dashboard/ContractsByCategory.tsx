'use client'

import useSWR from 'swr'
import { fetchContracts } from '@/lib/api/contracts'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Contract } from '@/types/contract'

const COLORS = [
  '#3b82f6', // Blue
  '#8b5cf6', // Purple
  '#10b981', // Green
  '#f59e0b', // Orange
  '#ef4444', // Red
  '#06b6d4', // Cyan
  '#84cc16', // Lime
  '#f97316'  // Orange-600
]

interface CategoryData {
  category: string
  count: number
  percentage?: number
}

const fetcher = async (): Promise<CategoryData[]> => {
  const contracts = await fetchContracts()
  
  // Group contracts by category based on amounts (each contract counts only once)
  const categoryGroups = contracts.reduce((acc: Record<string, number>, contract: Contract) => {
    const atsAmount = parseFloat(contract.ats_amount?.toString() || '0')
    const jslAmount = parseFloat(contract.jsl_amount?.toString() || '0')
    const subscriptionAmount = parseFloat(contract.subscription_amount?.toString() || '0')
    
    // Categorize each contract into only one category based on priority
    if (atsAmount > 0) {
      acc['ATS'] = (acc['ATS'] || 0) + 1
    } else if (jslAmount > 0) {
      acc['JSL'] = (acc['JSL'] || 0) + 1
    } else if (subscriptionAmount > 0) {
      acc['Subscription'] = (acc['Subscription'] || 0) + 1
    } else {
      // If no specific amounts, categorize as 'Other'
      acc['Other'] = (acc['Other'] || 0) + 1
    }
    
    return acc
  }, {})
  
  // Convert to array format for chart with percentages
  const total = Object.values(categoryGroups).reduce((sum, count) => sum + count, 0)
  return Object.entries(categoryGroups).map(([category, count]) => ({
    category,
    count,
    percentage: Math.round((count / total) * 100)
  }))
}

interface TooltipProps {
  active?: boolean
  payload?: Array<{
    payload: CategoryData
  }>
}

const CustomTooltip = ({ active, payload }: TooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-white border-none rounded-xl shadow-lg p-4">
        <p className="font-semibold text-gray-800">{data.category}</p>
        <p className="text-gray-600">
          <span className="font-medium">{data.count}</span> kontrak ({data.percentage}%)
        </p>
      </div>
    )
  }
  return null
}

export default function ContractsByCategory() {
  const { data, error, isLoading } = useSWR<CategoryData[]>('contracts-by-category', fetcher, {
    refreshInterval: 300000, // Refresh every 5 minutes
    revalidateOnFocus: true
  })

  return (
    <div className="h-[300px] w-full">
      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-red-500 text-sm">Gagal memuat data</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <defs>
              {COLORS.map((color, index) => (
                <linearGradient key={index} id={`gradient-${index}`} x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.8}/>
                  <stop offset="100%" stopColor={color} stopOpacity={0.6}/>
                </linearGradient>
              ))}
            </defs>
            <Pie
              data={data}
              dataKey="count"
              nameKey="category"
              cx="50%"
              cy="45%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              stroke="none"
            >
              {data?.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={`url(#gradient-${index % COLORS.length})`}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              iconType="circle"
              wrapperStyle={{
                fontSize: '12px',
                color: '#6b7280'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
