'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { fetchContracts } from '@/lib/api/contracts'
import ContractsByDepartmentChart from '@/components/dashboard/ContractsByDepartmentChart'
import ContractsExpiringSoonList from '@/components/dashboard/ContractsExpiringSoonList'
import ExpiringContractsTrend from '@/components/dashboard/ExpiringContractsTrend'
import ContractsByPrincipalChart from '@/components/dashboard/ContractsByPrincipalChart'
import ContractsByVendorChart from '@/components/dashboard/ContractsByVendorChart'
import ContractsByTypeChart from '@/components/dashboard/ContractsByTypeChart'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Contract } from '@/types/contract'

interface DashboardData {
  contracts: Contract[]
  totalContractsThisYear: number
  activeContracts: number
  dueSoonContracts: number
  expiredContracts: number
  contractsByDepartment: { department: string; count: number; budget: number }[]
  contractsByPrincipal: { principal: string; count: number; budget: number }[]
  contractsByVendor: { vendor: string; count: number; budget: number }[]
  contractsByType: { type: string; count: number; budget: number }[]
  monthlyExpiringTrend: { month: string; count: number }[]
  departments: string[]
}

const fetcher = async (key: string, year: number, department?: string): Promise<DashboardData> => {
  try {
    // Use the new backend endpoints with year filtering
    const [
      contractsRes,
      totalRes,
      activeRes,
      dueSoonRes,
      expiredRes
    ] = await Promise.all([
      fetch('/api/contracts'),
      fetch(`/api/contracts/dashboard/summary/total-this-year?year=${year}`),
      fetch(`/api/contracts/dashboard/summary/active?year=${year}`),
      fetch(`/api/contracts/dashboard/summary/due-soon?year=${year}&months=3`),
      fetch(`/api/contracts/dashboard/summary/expired?year=${year}`)
    ])

    let contracts = await contractsRes.json()
    
    // Filter by year and optionally by department
    contracts = contracts.filter((c: Contract) => {
      const contractYear = new Date(c.start_date).getFullYear()
      const yearMatch = contractYear === year
      const deptMatch = !department || department === 'all' || c.department === department
      return yearMatch && deptMatch
    })

    const totalData = await totalRes.json()
    const activeData = await activeRes.json()
    const dueSoonData = await dueSoonRes.json()
    const expiredData = await expiredRes.json()

    // Get unique departments
    const allContracts = await fetch('/api/contracts').then(res => res.json())
    const departments = [...new Set(allContracts.map((c: Contract) => c.department))].sort() as string[]

    // Calculate budget helper function
    const calculateBudget = (contract: Contract): number => {
      const ats = parseFloat(contract.ats_amount?.toString() || '0')
      const jsl = parseFloat(contract.jsl_amount?.toString() || '0')
      const subscription = parseFloat(contract.subscription_amount?.toString() || '0')
      return ats + jsl + subscription
    }

    // Calculate metrics from filtered contracts
    const contractsByDepartment = contracts.reduce((acc: { department: string; count: number; budget: number }[], contract: Contract) => {
      const existing = acc.find(item => item.department === contract.department)
      const budget = calculateBudget(contract)
      if (existing) {
        existing.count += 1
        existing.budget += budget
      } else {
        acc.push({ department: contract.department, count: 1, budget })
      }
      return acc
    }, [])

    // Group by principal (using item as principal)
    const principalGroups = contracts.reduce((acc: Record<string, { count: number; budget: number }>, contract: Contract) => {
      const principal = contract.item || 'Unknown'
      const budget = calculateBudget(contract)
      if (!acc[principal]) {
        acc[principal] = { count: 0, budget: 0 }
      }
      acc[principal].count += 1
      acc[principal].budget += budget
      return acc
    }, {})
    const contractsByPrincipal = Object.entries(principalGroups).map(([principal, data]) => ({
      principal,
      count: (data as { count: number; budget: number }).count,
      budget: (data as { count: number; budget: number }).budget
    }))

    // Group by vendor (business partner)
    const vendorGroups = contracts.reduce((acc: Record<string, { count: number; budget: number }>, contract: Contract) => {
      const vendor = contract.vendor || 'Unknown'
      const budget = calculateBudget(contract)
      if (!acc[vendor]) {
        acc[vendor] = { count: 0, budget: 0 }
      }
      acc[vendor].count += 1
      acc[vendor].budget += budget
      return acc
    }, {})
    const contractsByVendor = Object.entries(vendorGroups).map(([vendor, data]) => ({
      vendor,
      count: (data as { count: number; budget: number }).count,
      budget: (data as { count: number; budget: number }).budget
    }))

    // Group by contract categories (JSL, ATS, Subscription)
    const typeGroups = contracts.reduce((acc: Record<string, { count: number; budget: number }>, contract: Contract) => {
      const atsAmount = parseFloat(contract.ats_amount?.toString() || '0')
      const jslAmount = parseFloat(contract.jsl_amount?.toString() || '0')
      const subscriptionAmount = parseFloat(contract.subscription_amount?.toString() || '0')
      
      // Categorize based on which amount is present (can be multiple categories per contract)
      if (atsAmount > 0) {
        if (!acc['ATS']) acc['ATS'] = { count: 0, budget: 0 }
        acc['ATS'].count += 1
        acc['ATS'].budget += atsAmount
      }
      if (jslAmount > 0) {
        if (!acc['JSL']) acc['JSL'] = { count: 0, budget: 0 }
        acc['JSL'].count += 1
        acc['JSL'].budget += jslAmount
      }
      if (subscriptionAmount > 0) {
        if (!acc['Subscription']) acc['Subscription'] = { count: 0, budget: 0 }
        acc['Subscription'].count += 1
        acc['Subscription'].budget += subscriptionAmount
      }
      
      return acc
    }, {})
    const contractsByType = Object.entries(typeGroups).map(([type, data]) => ({
      type,
      count: (data as { count: number; budget: number }).count,
      budget: (data as { count: number; budget: number }).budget
    }))

    // Monthly expiring trend (filtered by year and department)
    const now = new Date()
    const monthlyExpiringTrend = Array.from({ length: 12 }, (_, i) => {
      const date = new Date(year, i, 1)
      const nextMonth = new Date(year, i + 1, 1)
      const count = contracts.filter((c: Contract) => {
        const endDate = new Date(c.end_date)
        return endDate >= date && endDate < nextMonth
      }).length
      
      return {
        month: date.toLocaleDateString('id-ID', { month: 'short' }),
        count
      }
    })

    return {
      contracts,
      totalContractsThisYear: department && department !== 'all' ? contracts.length : (totalData.total_contracts || 0),
      activeContracts: department && department !== 'all' ? 
        contracts.filter((c: Contract) => new Date(c.end_date) > now).length : 
        (activeData.active_contracts || 0),
      dueSoonContracts: department && department !== 'all' ? 
        contracts.filter((c: Contract) => {
          const endDate = new Date(c.end_date)
          const threeMonthsFromNow = new Date(now.getTime() + (90 * 24 * 60 * 60 * 1000))
          return endDate > now && endDate <= threeMonthsFromNow
        }).length : 
        (dueSoonData.due_soon_contracts || 0),
      expiredContracts: department && department !== 'all' ? 
        contracts.filter((c: Contract) => new Date(c.end_date) <= now).length : 
        (expiredData.expired_contracts || 0),
      contractsByDepartment,
      contractsByPrincipal,
      contractsByVendor,
      contractsByType,
      monthlyExpiringTrend,
      departments
    }
  } catch (error: unknown) {
    // Fallback to client-side calculation if backend endpoints are not available
    console.warn('Backend endpoints not available, falling back to client-side calculation:', error)
    const allContracts = await fetchContracts()
    
    // Filter contracts by year and department
    const contracts = allContracts.filter((c: Contract) => {
      const contractYear = new Date(c.start_date).getFullYear()
      const yearMatch = contractYear === year
      const deptMatch = !department || department === 'all' || c.department === department
      return yearMatch && deptMatch
    })

    const now = new Date()
    const threeMonthsFromNow = new Date(now.getTime() + (90 * 24 * 60 * 60 * 1000))

    // Get unique departments
    const departments = [...new Set(allContracts.map((c: Contract) => c.department))].sort() as string[]

    // Calculate budget helper function
    const calculateBudget = (contract: Contract): number => {
      const ats = parseFloat(contract.ats_amount?.toString() || '0')
      const jsl = parseFloat(contract.jsl_amount?.toString() || '0')
      const subscription = parseFloat(contract.subscription_amount?.toString() || '0')
      return ats + jsl + subscription
    }

    // Calculate metrics
    const totalContractsThisYear = contracts.length

    const activeContracts = contracts.filter(c => 
      new Date(c.end_date) > now
    ).length

    const dueSoonContracts = contracts.filter(c => 
      new Date(c.end_date) > now && new Date(c.end_date) <= threeMonthsFromNow
    ).length

    const expiredContracts = contracts.filter(c => 
      new Date(c.end_date) <= now
    ).length

    // Group by department with budget
    const deptGroups = contracts.reduce((acc: Record<string, { count: number; budget: number }>, contract: Contract) => {
      const budget = calculateBudget(contract)
      if (!acc[contract.department]) {
        acc[contract.department] = { count: 0, budget: 0 }
      }
      acc[contract.department].count += 1
      acc[contract.department].budget += budget
      return acc
    }, {})
    const contractsByDepartment = Object.entries(deptGroups).map(([dept, data]) => ({
      department: dept,
      count: data.count,
      budget: data.budget
    }))

    // Group by principal (using item)
    const principalGroups = contracts.reduce((acc: Record<string, { count: number; budget: number }>, contract: Contract) => {
      const principal = contract.item || 'Unknown'
      const budget = calculateBudget(contract)
      if (!acc[principal]) {
        acc[principal] = { count: 0, budget: 0 }
      }
      acc[principal].count += 1
      acc[principal].budget += budget
      return acc
    }, {})
    const contractsByPrincipal = Object.entries(principalGroups).map(([principal, data]) => ({
      principal,
      count: data.count,
      budget: data.budget
    }))

    // Group by vendor
    const vendorGroups = contracts.reduce((acc: Record<string, { count: number; budget: number }>, contract: Contract) => {
      const vendor = contract.vendor || 'Unknown'
      const budget = calculateBudget(contract)
      if (!acc[vendor]) {
        acc[vendor] = { count: 0, budget: 0 }
      }
      acc[vendor].count += 1
      acc[vendor].budget += budget
      return acc
    }, {})
    const contractsByVendor = Object.entries(vendorGroups).map(([vendor, data]) => ({
      vendor,
      count: data.count,
      budget: data.budget
    }))

    // Group by contract categories (JSL, ATS, Subscription)
    const typeGroups = contracts.reduce((acc: Record<string, { count: number; budget: number }>, contract: Contract) => {
      const atsAmount = parseFloat(contract.ats_amount?.toString() || '0')
      const jslAmount = parseFloat(contract.jsl_amount?.toString() || '0')
      const subscriptionAmount = parseFloat(contract.subscription_amount?.toString() || '0')
      
      // Categorize based on which amount is present (can be multiple categories per contract)
      if (atsAmount > 0) {
        if (!acc['ATS']) acc['ATS'] = { count: 0, budget: 0 }
        acc['ATS'].count += 1
        acc['ATS'].budget += atsAmount
      }
      if (jslAmount > 0) {
        if (!acc['JSL']) acc['JSL'] = { count: 0, budget: 0 }
        acc['JSL'].count += 1
        acc['JSL'].budget += jslAmount
      }
      if (subscriptionAmount > 0) {
        if (!acc['Subscription']) acc['Subscription'] = { count: 0, budget: 0 }
        acc['Subscription'].count += 1
        acc['Subscription'].budget += subscriptionAmount
      }
      
      return acc
    }, {})
    const contractsByType = Object.entries(typeGroups).map(([type, data]) => ({
      type,
      count: data.count,
      budget: data.budget
    }))

    const monthlyExpiringTrend = Array.from({ length: 12 }, (_, i) => {
      const date = new Date(year, i, 1)
      const nextMonth = new Date(year, i + 1, 1)
      const count = contracts.filter(c => {
        const endDate = new Date(c.end_date)
        return endDate >= date && endDate < nextMonth
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
      dueSoonContracts,
      expiredContracts,
      contractsByDepartment,
      contractsByPrincipal,
      contractsByVendor,
      contractsByType,
      monthlyExpiringTrend,
      departments
    }
  }
}

export default function DashboardPage() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all')
  
  const { data: dashboardData, error, isLoading } = useSWR<DashboardData>(
    ['dashboard-data', selectedYear, selectedDepartment], 
    ([key, year, department]: [string, number, string]) => fetcher(key, year, department),
    {
      refreshInterval: 300000, // Refresh every 5 minutes
      revalidateOnFocus: true
    }
  )

  // Generate year options (current year and 4 years back)
  const yearOptions = Array.from({ length: 5 }, (_, i) => {
    const year = new Date().getFullYear() - i
    return year
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
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-foreground">Dashboard Kontrak</h1>
          <p className="text-muted-foreground">Overview dan statistik kontrak perusahaan</p>
        </div>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-foreground">Filter Tahun:</label>
            <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Pilih tahun" />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-foreground">Filter Departemen:</label>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Pilih departemen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Departemen</SelectItem>
                {dashboardData?.departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-foreground flex items-center gap-2">
              <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
              Total Kontrak Tahun {selectedYear}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-foreground mb-2">
              {dashboardData?.totalContractsThisYear || 0}
            </div>
            <p className="text-sm text-muted-foreground">kontrak dibuat tahun {selectedYear}</p>
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
            <p className="text-sm text-muted-foreground">kontrak masih berlaku di tahun {selectedYear}</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-foreground flex items-center gap-2">
              <span className="w-3 h-3 bg-orange-500 rounded-full"></span>
              Akan Berakhir
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-foreground mb-2">
              {dashboardData?.dueSoonContracts || 0}
            </div>
            <p className="text-sm text-muted-foreground">Kontrak akan berakhir</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-foreground flex items-center gap-2">
              <span className="w-3 h-3 bg-red-500 rounded-full"></span>
              Expired
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-foreground mb-2">
              {dashboardData?.expiredContracts || 0}
            </div>
            <p className="text-sm text-muted-foreground">Kontrak Expired</p>
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
          {/* {dashboardData && dashboardData.dueSoonContracts > 0 && (
            <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                <div>
                  <h3 className="font-semibold text-orange-800 dark:text-orange-200">Perhatian! Ada {dashboardData.dueSoonContracts} kontrak akan berakhir dalam 3 bulan pertama {selectedYear}</h3>
                  <p className="text-sm text-orange-600 dark:text-orange-300">Pastikan untuk mempersiapkan perpanjangan atau penggantian kontrak</p>
                </div>
              </div>
            </div>
          )} */}
          
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
            {/* First Row - Distribution Pie Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg text-foreground flex items-center gap-2">
                    <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                    Distribusi Principal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ContractsByPrincipalChart data={dashboardData?.contractsByPrincipal} />
                </CardContent>
              </Card>

              <Card className="shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg text-foreground flex items-center gap-2">
                    <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                    Distribusi Business Partner
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ContractsByVendorChart data={dashboardData?.contractsByVendor} />
                </CardContent>
              </Card>

              <Card className="shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg text-foreground flex items-center gap-2">
                    <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
                    Distribusi Kategori Kontrak
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ContractsByTypeChart data={dashboardData?.contractsByType} />
                </CardContent>
              </Card>
            </div>

            {/* Second Row - Bar Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg text-foreground flex items-center gap-2">
                    <span className="w-3 h-3 bg-indigo-500 rounded-full"></span>
                    Jumlah Kontrak per Departemen
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ContractsByDepartmentChart />
                </CardContent>
              </Card>

              <Card className="shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg text-foreground flex items-center gap-2">
                    <span className="w-3 h-3 bg-orange-500 rounded-full"></span>
                    Kontrak Jatuh Tempo per Bulan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ExpiringContractsTrend />
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
