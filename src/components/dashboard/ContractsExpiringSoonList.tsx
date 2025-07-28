'use client'

import { useState } from 'react'
import useSWR from 'swr'
import Link from 'next/link'
import { fetchContracts } from '@/lib/api/contracts'
import { Contract } from '@/types/contract'
import ContractDetailModal from '@/components/ContractDetailModal'

const fetcher = async () => {
  const contracts = await fetchContracts()
  const now = new Date()
  const threeMonthsFromNow = new Date(now.getTime() + (90 * 24 * 60 * 60 * 1000))
  
  // Filter contracts expiring within 3 months and sort by expiration date
  return contracts
    .filter((contract: Contract) => {
      const endDate = new Date(contract.end_date)
      return endDate > now && endDate <= threeMonthsFromNow
    })
    .sort((a: Contract, b: Contract) => new Date(a.end_date).getTime() - new Date(b.end_date).getTime())
    .slice(0, 5) // Show only top 5 for notifications
}

export default function ContractsExpiringSoonList() {
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const { data, error, isLoading } = useSWR('contracts-expiring-soon-notifications', fetcher, {
    refreshInterval: 300000, // Refresh every 5 minutes
    revalidateOnFocus: true
  })

  const openModal = (contract: Contract) => {
    setSelectedContract(contract)
    setModalOpen(true)
  }

  const formatDaysRemaining = (endDate: string) => {
    const now = new Date()
    const end = new Date(endDate)
    const diffDays = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays <= 0) return 'Expired'
    if (diffDays === 1) return '1 hari lagi'
    if (diffDays <= 7) return `${diffDays} hari lagi`
    if (diffDays <= 30) return `${diffDays} hari lagi`
    
    const weeks = Math.floor(diffDays / 7)
    if (weeks <= 4) return `${weeks} minggu lagi`
    
    const months = Math.floor(diffDays / 30)
    return `${months} bulan lagi`
  }

  return (
    <div className="p-4">
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-destructive text-sm">Gagal memuat notifikasi</p>
        </div>
      ) : !data || data.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="font-medium text-foreground mb-1">Semua Kontrak Aman</h3>
          <p className="text-sm text-muted-foreground">Tidak ada kontrak yang akan berakhir dalam 3 bulan ke depan</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-orange-200 dark:border-orange-800">
            <h4 className="font-medium text-orange-800 dark:text-orange-200">Segera Berakhir ({data.length})</h4>
            <span className="text-xs bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 px-2 py-1 rounded-full">
              Urgent
            </span>
          </div>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {data.map((contract: Contract, index: number) => (
              <div key={contract.id} className={`p-3 rounded-lg border-l-4 ${
                index === 0 ? 'border-red-400 bg-red-50 dark:bg-red-950/20' : 
                index === 1 ? 'border-orange-400 bg-orange-50 dark:bg-orange-950/20' : 
                'border-yellow-400 bg-yellow-50 dark:bg-yellow-950/20'
              }`}>
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <button
                      onClick={() => openModal(contract)}
                      className="font-medium text-foreground hover:text-primary hover:underline block truncate text-left w-full"
                      title={contract.contract_name}
                    >
                      {contract.contract_name}
                    </button>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                        {contract.contract_number}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {contract.department}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-right ml-3 flex-shrink-0">
                    <div className={`text-sm font-semibold ${
                      index === 0 ? 'text-red-600 dark:text-red-400' : 
                      index === 1 ? 'text-orange-600 dark:text-orange-400' : 
                      'text-yellow-600 dark:text-yellow-400'
                    }`}>
                      {formatDaysRemaining(contract.end_date)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(contract.end_date).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {data.length >= 5 && (
            <div className="pt-3 border-t border-orange-200 dark:border-orange-800">
              <Link 
                href="/contracts?filter=expiring"
                className="block w-full text-center py-2 text-sm text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-950/20 rounded-md transition-colors"
              >
                Lihat semua kontrak yang akan berakhir →
              </Link>
            </div>
          )}
        </div>
      )}

      <ContractDetailModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        contract={selectedContract}
      />
    </div>
  )
}
