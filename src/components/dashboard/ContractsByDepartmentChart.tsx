'use client'

import useSWR from 'swr'
import { fetchContracts } from '@/lib/api/contracts'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Contract } from '@/types/contract'

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
  const { data, error, isLoading } = useSWR('contracts-by-department', fetcher, {
    refreshInterval: 300000, // Refresh every 5 minutes
    revalidateOnFocus: true
  })

  return (
    <div className="h-[300px] w-full">
      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
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
              <linearGradient id="departmentGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.4}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="department" 
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
              cursor={{ fill: 'rgba(139, 92, 246, 0.05)' }}
              labelStyle={{ color: '#374151', fontWeight: '600' }}
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
