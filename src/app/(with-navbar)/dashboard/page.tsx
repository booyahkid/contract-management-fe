'use client'

import useSWR from 'swr'
import { fetchContracts } from '@/lib/api/contracts'
import ContractsByDepartmentChart from '@/components/dashboard/ContractsByDepartmentChart'
import ContractsExpiringSoonList from '@/components/dashboard/ContractsExpiringSoonList'
import ContractsByDurationChart from '@/components/dashboard/ContractsByDurationChart'
import ExpiringContractsTrend from '@/components/dashboard/ExpiringContractsTrend'
import ContractsByCategory from '@/components/dashboard/ContractsByCategory'
import ContractCreationTrend from '@/components/dashboard/ContractCreationTrend'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Contract } from '@/types/contract'

interface DashboardData {
  contracts: Contract[]
  totalContractsThisYear: number
  activeContracts: number
  expiringSoonContracts: number
  contractsByDepartment: { department: string; count: number }[]
  contractsByCategory: { category: string; count: number }[]
  contractsByDuration: { duration: string; count: number }[]
  monthlyExpiringTrend: { month: string; count: number }[]
  monthlyCreationTrend: { month: string; count: number }[]
}

const fetcher = async (): Promise<DashboardData> => {
  const contracts = await fetchContracts()
  const now = new Date()
  const currentYear = now.getFullYear()
  const threeMonthsFromNow = new Date(now.getTime() + (90 * 24 * 60 * 60 * 1000))

  // Calculate metrics
  const totalContractsThisYear = contracts.filter(c => 
    new Date(c.start_date).getFullYear() === currentYear
  ).length

  const activeContracts = contracts.filter(c => 
    new Date(c.end_date) > now
  ).length

  const expiringSoonContracts = contracts.filter(c => 
    new Date(c.end_date) > now && new Date(c.end_date) <= threeMonthsFromNow
  ).length

  // Group by department
  const deptGroups = contracts.reduce((acc, contract) => {
    acc[contract.department] = (acc[contract.department] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  const contractsByDepartment = Object.entries(deptGroups).map(([dept, count]) => ({
    department: dept,
    count
  }))

  // Group by category
  const categoryGroups = contracts.reduce((acc, contract) => {
    const categories = []
    if (parseFloat(contract.ats_amount?.toString() || '0') > 0) categories.push('ATS')
    if (parseFloat(contract.jsl_amount?.toString() || '0') > 0) categories.push('JSL')
    if (parseFloat(contract.subscription_amount?.toString() || '0') > 0) categories.push('Subscription')
    
    categories.forEach(cat => {
      acc[cat] = (acc[cat] || 0) + 1
    })
    return acc
  }, {} as Record<string, number>)
  const contractsByCategory = Object.entries(categoryGroups).map(([category, count]) => ({
    category,
    count
  }))

  // Group by duration
  const durationGroups = contracts.reduce((acc, contract) => {
    const start = new Date(contract.start_date)
    const end = new Date(contract.end_date)
    const diffMonths = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30))
    
    let duration = ''
    if (diffMonths <= 6) duration = '1-6 bulan'
    else if (diffMonths <= 12) duration = '7-12 bulan'
    else if (diffMonths <= 24) duration = '1-2 tahun'
    else duration = '> 2 tahun'
    
    acc[duration] = (acc[duration] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  const contractsByDuration = Object.entries(durationGroups).map(([duration, count]) => ({
    duration,
    count
  }))

  // Monthly expiring trend (next 12 months)
  const monthlyExpiringTrend = Array.from({ length: 12 }, (_, i) => {
    const date = new Date(now.getFullYear(), now.getMonth() + i, 1)
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + i + 1, 1)
    const count = contracts.filter(c => {
      const endDate = new Date(c.end_date)
      return endDate >= date && endDate < nextMonth
    }).length
    
    return {
      month: date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }),
      count
    }
  })

  // Monthly creation trend (this year)
  const monthlyCreationTrend = Array.from({ length: 12 }, (_, i) => {
    const date = new Date(currentYear, i, 1)
    const nextMonth = new Date(currentYear, i + 1, 1)
    const count = contracts.filter(c => {
      const contractDate = new Date(c.start_date)
      return contractDate >= date && contractDate < nextMonth
    }).length
    
    return {
      month: date.toLocaleDateString('id-ID', { month: 'short' }),
      count
    }
  })

  return {
    contracts,
    totalContractsThisYear,
    activeContracts,
    expiringSoonContracts,
    contractsByDepartment,
    contractsByCategory,
    contractsByDuration,
    monthlyExpiringTrend,
    monthlyCreationTrend
  }
}

export default function DashboardPage() {
  const { data: dashboardData, error, isLoading } = useSWR<DashboardData>('dashboard-data', fetcher, {
    refreshInterval: 300000, // Refresh every 5 minutes
    revalidateOnFocus: true
  })

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-destructive">Gagal memuat data dashboard. Silakan refresh halaman.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6 w-full bg-background">
      {/* Header Section */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground">Dashboard Kontrak</h1>
        <p className="text-muted-foreground">Overview dan statistik kontrak perusahaan</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-foreground flex items-center gap-2">
              <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
              Total Kontrak Tahun Ini
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-foreground mb-2">
              {dashboardData?.totalContractsThisYear || 0}
            </div>
            <p className="text-sm text-muted-foreground">kontrak dibuat tahun ini</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-foreground flex items-center gap-2">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              Kontrak Aktif
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-foreground mb-2">
              {dashboardData?.activeContracts || 0}
            </div>
            <p className="text-sm text-muted-foreground">kontrak masih berlaku</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-foreground flex items-center gap-2">
              <span className="w-3 h-3 bg-orange-500 rounded-full"></span>
              Segera Berakhir
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-foreground mb-2">
              {dashboardData?.expiringSoonContracts || 0}
            </div>
            <p className="text-sm text-muted-foreground">berakhir dalam 3 bulan</p>
          </CardContent>
        </Card>
      </div>

      {/* Notifications Section */}
      <Card className="shadow-sm">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-3 h-3 bg-red-500 rounded-full"></span>
            <h2 className="text-2xl font-semibold text-foreground">Notifikasi & Peringatan</h2>
          </div>

          {/* Critical Notifications */}
          {dashboardData && dashboardData.expiringSoonContracts > 0 && (
            <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                <div>
                  <h3 className="font-semibold text-orange-800 dark:text-orange-200">Perhatian! Ada {dashboardData.expiringSoonContracts} kontrak akan berakhir dalam 3 bulan</h3>
                  <p className="text-sm text-orange-600 dark:text-orange-300">Pastikan untuk mempersiapkan perpanjangan atau penggantian kontrak</p>
                </div>
              </div>
            </div>
          )}
          
          {/* General Notifications */}
          <ContractsExpiringSoonList />
        </CardContent>
      </Card>

      {/* Charts Section */}
      <Card className="shadow-sm">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
            <h2 className="text-2xl font-semibold text-foreground">Analisis & Statistik Kontrak</h2>
          </div>
          
          <div className="space-y-6">
            {/* Top Row - Bar Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg text-foreground flex items-center gap-2">
                    <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
                    Distribusi Departemen
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ContractsByDepartmentChart />
                </CardContent>
              </Card>

              <Card className="shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg text-foreground flex items-center gap-2">
                    <span className="w-3 h-3 bg-emerald-500 rounded-full"></span>
                    Durasi Kontrak
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ContractsByDurationChart />
                </CardContent>
              </Card>
            </div>

            {/* Middle Row - Trend Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg text-foreground flex items-center gap-2">
                    <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                    Tren Pembuatan Kontrak
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ContractCreationTrend />
                </CardContent>
              </Card>

              <Card className="shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg text-foreground flex items-center gap-2">
                    <span className="w-3 h-3 bg-orange-600 rounded-full"></span>
                    Tren Jatuh Tempo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ExpiringContractsTrend />
                </CardContent>
              </Card>
            </div>

            {/* Bottom Row - Category Chart */}
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg text-foreground flex items-center gap-2">
                  <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                  Kategori Kontrak
                </CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <div className="w-full max-w-md">
                  <ContractsByCategory />
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
