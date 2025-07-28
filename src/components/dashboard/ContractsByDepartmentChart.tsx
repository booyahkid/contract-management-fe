'use client'

import useSWR from 'swr'
import { fetchContracts } from '@/lib/api/contracts'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Contract } from '@/types/contract'
import { useTheme } from 'next-themes'

const fetcher = async () => {
  const contracts = await fetchContracts()
  
  // Group contracts by department
  const deptGroups = contracts.reduce((acc: Record<string, number>, contract: Contract) => {
    acc[contract.department] = (acc[contract.department] || 0) + 1
    return acc
  }, {})
  
  // Convert to array format for chart
  return Object.entries(deptGroups).map(([department, count]) => ({
    department,
    count
  }))
}

export default function ContractsByDepartmentChart() {
  const { resolvedTheme } = useTheme()
  const { data, error, isLoading } = useSWR('contracts-by-department', fetcher, {
    refreshInterval: 300000, // Refresh every 5 minutes
    revalidateOnFocus: true
  })

  const isDark = resolvedTheme === 'dark'
  const textColor = isDark ? '#e5e7eb' : '#6b7280'
  const tooltipBg = isDark ? '#374151' : '#ffffff'
  const tooltipTextColor = isDark ? '#f9fafb' : '#374151'

  return (
    <div className="h-[300px] w-full">
      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-destructive text-sm">Gagal memuat data</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={data} 
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            barCategoryGap="20%"
          >
            <defs>
              <linearGradient id="departmentGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.4}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="department" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: textColor }}
              dy={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: textColor }}
              dx={-10}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: tooltipBg,
                border: 'none',
                borderRadius: '12px',
                boxShadow: isDark ? '0 10px 25px rgba(0, 0, 0, 0.3)' : '0 10px 25px rgba(0, 0, 0, 0.1)',
                fontSize: '14px'
              }}
              cursor={{ fill: 'rgba(139, 92, 246, 0.05)' }}
              labelStyle={{ color: tooltipTextColor, fontWeight: '600' }}
            />
            <Bar 
              dataKey="count" 
              fill="url(#departmentGradient)" 
              radius={[6, 6, 0, 0]}
              stroke="#8b5cf6"
              strokeWidth={1}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
