import api from '@/lib/api'
import { getToken } from '../auth'

// 1. Total Kontrak Tahun Ini
export async function fetchTotalContractsThisYear(): Promise<number> {
  const token = getToken()
  const res = await api.get('/summary/total-this-year', {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data.total
}

// 2. Jumlah Kontrak yang Aktif
export async function fetchActiveContracts(): Promise<number> {
  const token = getToken()
  const res = await api.get('/summary/active', {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data.total
}


// 3. Jumlah Kontrak Jatuh Tempo dalam 3 Bulan
export async function fetchDueSoonContractsCount(): Promise<number> {
  const token = getToken()
  const res = await api.get('/summary/due-soon', {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data.total
}

// 4. Daftar Kontrak Jatuh Tempo
export async function fetchDueSoonContractsList() {
  const token = getToken()
  const res = await api.get('/due-soon', {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data
}

// 5. Grup Kontrak Berdasarkan Departemen
export async function fetchContractsByDepartment() {
  const token = getToken()
  const res = await api.get('/group-by-department', {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data
}

// 6. Notifikasi Kontrak Jatuh Tempo (sama seperti due-soon list)
export async function fetchDueSoonNotifications() {
  const token = getToken()
  const res = await api.get('/notifications/due-soon', {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data
}

// 7. Grup Kontrak Berdasarkan Durasi
export async function fetchContractsByDuration() {
  const token = getToken()
  const res = await api.get('/group-by-duration', {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data
}

// 8. Kontrak Jatuh Tempo Setiap Bulan
export async function fetchExpiringContractsByMonth() {
  const token = getToken()
  const res = await api.get('/due-by-month', {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data
}

// 9. Grup Kontrak Berdasarkan Kategori
export async function fetchContractsByCategory() {
  const token = getToken()
  const res = await api.get('/group-by-category', {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data
}

// 10. Tren Pembuatan Kontrak per Bulan
export async function fetchContractCreationTrend() {
  const token = getToken()
  const res = await api.get('/created-by-month', {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data
}
