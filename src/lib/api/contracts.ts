import api from '@/lib/api'
import { getToken } from '../auth'
import { Contract } from '@/types/contract'
import { NewContract } from '@/types/contract'

export async function fetchContracts(): Promise<Contract[]> {
  const response = await api.get('/contracts')
  return response.data
}

export async function fetchContractById(id: string): Promise<Contract> {
  const token = getToken()
  const res = await api.get(`/contracts/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data
}

export async function getContractById(id: string) {
  const res = await fetch(`/api/contracts/${id}`)
  if (!res.ok) throw new Error('Failed to fetch contract')
  return res.json()
}

export async function deleteContract(id: number): Promise<void> {
  const token = getToken()
  await api.delete(`/contracts/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

export async function createContract(data: NewContract) {
  const res = await fetch('/api/contracts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    throw new Error('Failed to create contract')
  }

  return res.json()
}

export async function updateContract(id: number, data: Partial<Contract>) {
  const token = getToken()

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/contracts/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to update contract')
  }

  return response.json()
}


