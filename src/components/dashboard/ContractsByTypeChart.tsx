'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

interface ContractsByTypeChartProps {
  data?: { type: string; count: number; budget: number }[]
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c']

interface TooltipProps {
  active?: boolean
  payload?: Array<{
    payload: { type: string; count: number; budget: number }
  }>
}

const CustomTooltip = ({ active, payload }: TooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-800">{data.type}</p>
        <p className="text-sm text-gray-600">
          Total Kontrak: <span className="font-medium">{data.count}</span>
        </p>
        <p className="text-sm text-gray-600">
          Total Anggaran: <span className="font-medium">Rp {data.budget.toLocaleString('id-ID')}</span>
        </p>
      </div>
    )
  }
  return null
}

export default function ContractsByTypeChart({ data = [] }: ContractsByTypeChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Tidak ada data untuk ditampilkan
      </div>
    )
  }

    // Sort by count and take top 8
  const sortedData = data
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={sortedData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ type, percent, cx, cy, midAngle, innerRadius, outerRadius }) => {
              if (!percent || percent < 0.05) return ''
              if (!midAngle || !cx || !cy || !innerRadius || !outerRadius) return ''
              
              const RADIAN = Math.PI / 180
              const radius = innerRadius + (outerRadius - innerRadius) * 0.6
              const x = cx + radius * Math.cos(-midAngle * RADIAN)
              const y = cy + radius * Math.sin(-midAngle * RADIAN)
              
              const shortName = type && type.length > 6 ? type.substring(0, 6) + '...' : type || ''
              
              return (
                <text 
                  x={x} 
                  y={y} 
                  fill="white" 
                  textAnchor={x > cx ? 'start' : 'end'} 
                  dominantBaseline="central"
                  style={{ fontSize: '7px', fontWeight: 'bold', textShadow: '1px 1px 1px rgba(0,0,0,0.8)' }}
                >
                  {shortName}
                </text>
              )
            }}
            outerRadius={120}
            fill="#8884d8"
            dataKey="count"
            nameKey="type"
          >
            {sortedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ 
              fontSize: '10px',
              paddingTop: '10px',
              lineHeight: '1.2'
            }}
            iconSize={8}
            layout="horizontal"
            align="center"
            verticalAlign="bottom"
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}