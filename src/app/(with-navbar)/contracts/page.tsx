'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Contract } from '@/types/contract'
import { fetchContracts } from '@/lib/api/contracts'
import { deleteContract } from '@/lib/api/contracts'
import { updateContract } from '@/lib/api/contracts'
import ContractDetailModal from '@/components/ContractDetailModal'
import ContractEditModal from '@/components/ContractEditModal'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction
} from "@/components/ui/alert-dialog"
import { 
  Eye, 
  Edit3, 
  Trash2, 
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Plus
} from 'lucide-react'

function SkeletonTable() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div className="flex gap-4" key={i}>
          <Skeleton className="h-4 w-10" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  )
}

export default function AllContractsPage() {
  const router = useRouter()
  useEffect(() => {
    fetchContracts()
      .then(setContracts)
      .catch((err: unknown) => {
        console.error("Error fetching contracts:", err)
        router.push('/')
      })
  }, [router])

  const [contracts, setContracts] = useState<Contract[] | null>(null)
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null)
  
  // View modal
  const [modalOpen, setModalOpen] = useState(false)
  const openModal = (contract: Contract) => {
  setSelectedContract(contract)
  setModalOpen(true)
  }

  // Edit modal
  const [editModalOpen, setEditModalOpen] = useState(false)

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')       // e.g., Kontrak / PO
  const [filterDept, setFilterDept] = useState('all')
  const [hideExpired, setHideExpired] = useState(false)

  // Filter categories for dropdown
  const [filterCategories, setFilterCategories] = useState<string[]>([])

  // Filter contracts based on search term and filters
  const filteredContracts = contracts?.filter((c) => {
    const matchesSearch =
      c.contract_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.contract_number.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = filterType !== 'all' ? c.contract_type === filterType : true
    const matchesDept = filterDept !== 'all' ? c.department === filterDept : true

    // Check if contract is expired
    const endDate = new Date(c.end_date)
    const today = new Date()
    const isExpired = endDate < today
    const matchesExpiredFilter = hideExpired ? !isExpired : true

    const matchesCategory =
      filterCategories.length === 0 ||
      (() => {
        const contractCategories = []
        if (c.ats_amount && c.ats_amount > 0) contractCategories.push('ATS')
        if (c.jsl_amount && c.jsl_amount > 0) contractCategories.push('JSL')
        if (c.subscription_amount && c.subscription_amount > 0) contractCategories.push('Subscription')

        // Cek apakah kategori kontrak *setara* dengan filter yang dipilih (urutan tidak penting)
        return (
          contractCategories.length === filterCategories.length &&
          contractCategories.every((cat) => filterCategories.includes(cat))
        )
      })()

    return matchesSearch && matchesType && matchesDept && matchesExpiredFilter && matchesCategory
  })


  // Sorting
  const [sortField, setSortField] = useState<string | null>('end_date')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [clickCount, setClickCount] = useState<{ [key: string]: number }>({})
  
  const handleSort = (field: keyof Contract) => {
    const currentClicks = clickCount[field] || 0
    const newClickCount = currentClicks + 1
    
    setClickCount(prev => ({ ...prev, [field]: newClickCount }))
    
    if (newClickCount === 3) {
      // Reset sorting on third click
      setSortField(null)
      setSortDirection('asc')
      setClickCount(prev => ({ ...prev, [field]: 0 }))
    } else if (sortField === field) {
      // Toggle direction on second click
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      // Set new field and ascending direction on first click
      setSortField(field)
      setSortDirection('asc')
      // Reset other field click counts
      setClickCount({ [field]: 1 })
    }
  }
  const sortedContracts = [...(filteredContracts || [])].sort((a, b) => {
    if (!sortField) return 0

    const valA = a[sortField as keyof Contract]
    const valB = b[sortField as keyof Contract]

    // Special handling for date fields
    if (sortField === 'end_date' || sortField === 'start_date') {
      const dateA = new Date(valA as string).getTime()
      const dateB = new Date(valB as string).getTime()
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA
    }

    if (typeof valA === 'number' && typeof valB === 'number') {
      return sortDirection === 'asc' ? valA - valB : valB - valA
    }

    return sortDirection === 'asc'
      ? String(valA).localeCompare(String(valB))
      : String(valB).localeCompare(String(valA))
  })

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)

  const paginatedContracts = sortedContracts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )
  const pageCount = filteredContracts ? Math.ceil(filteredContracts.length / pageSize) : 0

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 bg-background">
      <Card>
        <CardHeader className="flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className='text-2xl font-bold'>Daftar Kontrak</CardTitle>

          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center w-full sm:w-auto">
            {/* Pagination Controls */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Baris per Halaman:</span>
              <Select
                value={pageSize.toString()}
                onValueChange={(value) => {
                  setPageSize(Number(value))
                  setCurrentPage(1)
                }}
              >
                <SelectTrigger className="w-24">
                  <SelectValue placeholder="Select rows" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => router.push('/contracts/new')} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                New Contract
              </Button>
              <Button 
                onClick={() => router.push('/contracts/ai-extract')} 
                variant="outline"
                className="flex items-center gap-2 bg-blue-500 text-white hover:bg-blue-600 hover:text-white dark:bg-blue-600 dark:text-white dark:hover:bg-blue-700 dark:hover:text-white"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                AI Extract
              </Button>
            </div>
          </div>
        </CardHeader>
          <CardContent>
          <div className="mb-4 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
              <Input
                type="text"
                placeholder="Search by name or number"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full sm:w-64"
              />

              <Select value={filterType} onValueChange={(val) => {
                setFilterType(val)
                setCurrentPage(1)
              }}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue >
                    {filterType === 'all' ? 'Filter by type' : filterType}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="Kontrak">Kontrak</SelectItem>
                  <SelectItem value="PO">PO</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterDept} onValueChange={(val) => {
                setFilterDept(val)
                setCurrentPage(1)
              }}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue >
                    {filterDept === 'all' ? 'Filter by department' : filterDept}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="HSD">HSD</SelectItem>
                  <SelectItem value="NSD">NSD</SelectItem>
                  <SelectItem value="IGW">IGW</SelectItem>
                  <SelectItem value="CEO">CEO</SelectItem>
                  <SelectItem value="IPS">IPS</SelectItem>
                  <SelectItem value="OCD">OCD</SelectItem>
                  <SelectItem value="SMD">SMD</SelectItem>
                  {/* Add more departments as needed */}
                </SelectContent>
              </Select>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Kategori:</span>

                {['ATS', 'JSL', 'Subscription'].map((cat) => (
                  <label key={cat} className="flex items-center gap-1 text-sm">
                    <input
                      type="checkbox"
                      checked={filterCategories.includes(cat)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFilterCategories([...filterCategories, cat])
                        } else {
                          setFilterCategories(filterCategories.filter((c) => c !== cat))
                        }
                        setCurrentPage(1)
                      }}
                    />
                    {cat}
                  </label>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={hideExpired}
                    onChange={(e) => {
                      setHideExpired(e.target.checked)
                      setCurrentPage(1)
                    }}
                  />
                  <span className="text-muted-foreground">Sembunyikan Expired</span>
                </label>
              </div>

              <Button variant="ghost" onClick={() => {
                setSearchTerm('')
                setFilterType('all')
                setFilterDept('all')
                setFilterCategories([])
                setHideExpired(false)
                setCurrentPage(1)
              }} className="w-full sm:w-auto">
                Reset Filters
              </Button>
            </div>
          </div>
          
          {
          !contracts ? (
            <SkeletonTable />
          ) : filteredContracts?.length === 0 ? (
            <p className="text-muted-foreground">Tidak ada kontrak.</p>
          ) : (
          
          <div className="rounded-lg border overflow-hidden">
            <div className="overflow-x-auto">
              <Table className="w-full min-w-[1200px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12 text-xs font-semibold py-4">No</TableHead>

                    <TableHead
                      onClick={() => handleSort('contract_type')}
                      className="text-xs font-semibold cursor-pointer select-none w-20 py-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        Tipe
                        {sortField === 'contract_type' ? (
                          sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                        ) : (
                          <ArrowUpDown className="h-3 w-3 opacity-50" />
                        )}
                      </div>
                    </TableHead>

                    <TableHead
                      onClick={() => handleSort('department')}
                      className="text-xs font-semibold cursor-pointer select-none w-20 py-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        Dept
                        {sortField === 'department' ? (
                          sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                        ) : (
                          <ArrowUpDown className="h-3 w-3 opacity-50" />
                        )}
                      </div>
                    </TableHead>

                    <TableHead
                      onClick={() => handleSort('contract_number')}
                      className="text-xs font-semibold cursor-pointer select-none w-28 py-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        No Kontrak
                        {sortField === 'contract_number' ? (
                          sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                        ) : (
                          <ArrowUpDown className="h-3 w-3 opacity-50" />
                        )}
                      </div>
                    </TableHead>

                    <TableHead
                      onClick={() => handleSort('contract_name')}
                      className="text-xs font-semibold cursor-pointer select-none w-48 py-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        Nama Kontrak
                        {sortField === 'contract_name' ? (
                          sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                        ) : (
                          <ArrowUpDown className="h-3 w-3 opacity-50" />
                        )}
                      </div>
                    </TableHead>

                    <TableHead
                      onClick={() => handleSort('end_date')}
                      className="text-xs font-semibold cursor-pointer select-none w-28 py-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        Jatuh Tempo
                        {sortField === 'end_date' ? (
                          sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                        ) : (
                          <ArrowUpDown className="h-3 w-3 opacity-50" />
                        )}
                      </div>
                    </TableHead>

                    <TableHead
                      onClick={() => handleSort('ats_amount')}
                      className="text-xs font-semibold cursor-pointer select-none w-28 py-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        Nilai Total
                        {sortField === 'ats_amount' ? (
                          sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                        ) : (
                          <ArrowUpDown className="h-3 w-3 opacity-50" />
                        )}
                      </div>
                    </TableHead>

                    <TableHead className="w-24 text-xs font-semibold py-4">Kategori</TableHead>

                    <TableHead
                      onClick={() => handleSort('vendor')}
                      className="text-xs font-semibold cursor-pointer select-none w-28 py-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        Rekanan
                        {sortField === 'vendor' ? (
                          sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                        ) : (
                          <ArrowUpDown className="h-3 w-3 opacity-50" />
                        )}
                      </div>
                    </TableHead>

                    <TableHead className="w-20 text-xs font-semibold py-4">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedContracts?.map((c, i) => {
                    const index = (currentPage - 1) * pageSize + i
                    const endDate = new Date(c.end_date)
                    const today = new Date()
                    const diffDays = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

                    const formatRemaining = (days: number) => {
                      const months = Math.floor(days / 30)
                      const remainingDays = days % 30
                      return days <= 0 ? 'Hari ini' : `${months > 0 ? `${months} bulan ` : ''}${remainingDays} hari lagi`
                    }

                    const atsAmount = parseFloat(c.ats_amount?.toString() || '0')
                    const jslAmount = parseFloat(c.jsl_amount?.toString() || '0')
                    const subscriptionAmount = parseFloat(c.subscription_amount?.toString() || '0')
                    const total = atsAmount + jslAmount + subscriptionAmount

                    const formattedTotal = total.toLocaleString('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      minimumFractionDigits: 0,
                    })

                    const categories = []
                    if (atsAmount > 0) categories.push('ATS')
                    if (jslAmount > 0) categories.push('JSL')
                    if (subscriptionAmount > 0) categories.push('Subscription')

                    return (
                      <TableRow key={c.id} className="border-b hover:bg-muted/50 transition-colors">
                        <TableCell className="text-xs text-muted-foreground py-4 font-medium">{index + 1}</TableCell>
                        <TableCell className="text-xs py-4">
                          <Badge variant={c.contract_type === 'Kontrak' ? 'default' : 'secondary'} className="text-xs">
                            {c.contract_type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-foreground py-4 font-medium" title={c.department}>
                          <div className="truncate">{c.department}</div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground py-4 font-mono" title={c.contract_number}>
                          <div className="truncate">{c.contract_number}</div>
                        </TableCell>
                        <TableCell className="text-xs text-foreground py-4 font-medium" title={c.contract_name}>
                          <div className="truncate max-w-[200px]">{c.contract_name}</div>
                        </TableCell>
                        <TableCell className="text-xs py-4">
                          {(() => {
                            const endDateFormatted = endDate.toLocaleDateString('id-ID', { 
                              year: 'numeric', 
                              month: 'short' 
                            })
                            
                            if (diffDays < 0) {
                              return (
                                <div className="flex flex-col">
                                  <Badge variant="secondary" className="text-xs mb-1">Expired</Badge>
                                  <span className="text-xs text-muted-foreground">{endDateFormatted}</span>
                                </div>
                              )
                            } else if (diffDays <= 30) {
                              return (
                                <div className="flex flex-col">
                                  <Badge variant="secondary" className="text-xs bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 mb-1" title={formatRemaining(diffDays)}>
                                    {diffDays <= 7 ? `${diffDays}h` : `${Math.ceil(diffDays/7)}w`}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">{endDateFormatted}</span>
                                </div>
                              )
                            } else if (diffDays <= 90) {
                              return (
                                <div className="flex flex-col">
                                  <Badge variant="secondary" className="text-xs bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 mb-1" title={formatRemaining(diffDays)}>
                                    {Math.ceil(diffDays/30)}m
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">{endDateFormatted}</span>
                                </div>
                              )
                            } else {
                              return (
                                <div className="flex flex-col">
                                  <span className="text-xs text-muted-foreground mb-1" title={formatRemaining(diffDays)}>
                                    {Math.ceil(diffDays/30)}m
                                  </span>
                                  <span className="text-xs text-muted-foreground">{endDateFormatted}</span>
                                </div>
                              )
                            }
                          })()}
                        </TableCell>
                        <TableCell className="text-xs text-foreground py-4 font-medium" title={formattedTotal}>
                          <div className="truncate">{formattedTotal}</div>
                        </TableCell>
                        <TableCell className="text-xs py-4">
                          <div className="flex flex-wrap gap-1">
                            {categories.map((cat, idx) => (
                              <Badge 
                                key={idx} 
                                variant="outline" 
                                className={`text-xs ${
                                  cat === 'ATS' ? 'border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/20' :
                                  cat === 'JSL' ? 'border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-950/20' :
                                  'border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/20'
                                }`}
                              >
                                {cat}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-foreground py-4 font-medium" title={c.vendor}>
                          <div className="truncate">{c.vendor}</div>
                        </TableCell>
                        <TableCell className="text-xs py-4">
                          <div className="flex items-center gap-1">
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => openModal(c)} 
                              className="h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-950/20 hover:text-blue-700 dark:hover:text-blue-300"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => {
                                setSelectedContract(c)
                                setEditModalOpen(true)
                              }} 
                              className="h-8 w-8 p-0 hover:bg-green-100 dark:hover:bg-green-950/20 hover:text-green-700 dark:hover:text-green-300"
                              title="Edit Contract"
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-950/20 hover:text-red-700 dark:hover:text-red-300"
                                  title="Delete Contract"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Hapus Kontrak</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Apakah kamu yakin ingin menghapus kontrak <span className='font-bold'>{c.contract_name}</span>? Tindakan ini tidak dapat dibatalkan.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Batal</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={async () => {
                                      try {
                                        await deleteContract(c.id)
                                        setContracts(prev => prev?.filter(item => item.id !== c.id) || [])
                                        toast.success(`Kontrak "${c.contract_name}" berhasil dihapus`)
                                      } catch (err) {
                                        toast.error("Gagal menghapus kontrak. Silakan coba lagi.")
                                        console.error(err)
                                      }
                                    }}
                                    className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
                                  >
                                    Hapus
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
          )}
          
          

          {pageCount > 1 && (
            <div className="flex justify-center pt-4 overflow-x-auto">
              <div className="flex gap-2 min-w-fit">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                >
                  Previous
                </Button>

                {Array.from({ length: pageCount }).map((_, i) => (
                  <Button
                    key={i}
                    variant={currentPage === i + 1 ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </Button>
                ))}

                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === pageCount}
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, pageCount))
                  }
                >
                  Next
                </Button>
              </div>
            </div>
          )}

        </CardContent>
      </Card>

      <ContractDetailModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        contract={selectedContract}
      />

      <ContractEditModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        contract={selectedContract}
        onSubmit={async (updatedData) => {
          try {
            if (!selectedContract) return
            await updateContract(selectedContract.id, updatedData)  // Make sure updateContract API exists
            // Refresh list
            const updated = await fetchContracts()
            setContracts(updated)
            setEditModalOpen(false)
            toast.success(`Kontrak "${selectedContract.contract_name}" berhasil diperbarui`)
          } catch (err) {
            console.error('Failed to update contract:', err)
            toast.error('Gagal memperbarui kontrak. Silakan coba lagi.')
          }
        }}
      />

    </div>
  )
}

