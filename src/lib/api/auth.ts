import api from '@/lib/api'
import { LoginPayload, LoginResponse } from '@/types/auth'

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  try {
    const response = await api.post('/auth/login', payload)
    
    // Backend returns { token }, but frontend expects { token, user }
    // So we'll adapt the response
    return {
      token: response.data.token,
      user: { id: 0, email: payload.email, name: '', role: '' } // Placeholder until we get user data
    }
  } catch (error: unknown) {
    console.error('Login error:', error)
    
    // Handle different types of errors
    if (error && typeof error === 'object' && 'response' in error) {
      // Server responded with error status
      const axiosError = error as { response: { data?: { message?: string }, status?: number } }
      
      if (axiosError.response?.status === 401) {
        throw new Error('Email atau password salah')
      } else if (axiosError.response?.status === 400) {
        throw new Error('Data login tidak valid')
      } else if (axiosError.response?.status && axiosError.response.status >= 500) {
        throw new Error('Server sedang bermasalah, coba lagi nanti')
      }
      
      const message = axiosError.response?.data?.message || 'Login gagal'
      throw new Error(message)
    } else if (error && typeof error === 'object' && 'request' in error) {
      // Request was made but no response received
      throw new Error('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.')
    } else {
      // Something else happened
      throw new Error('Terjadi kesalahan tidak terduga')
    }
  }
}

export async function logout(): Promise<void> {
  try {
    // Optional: if your backend supports logout API (e.g. revoking token)
    await api.post('/auth/logout')
  } catch (error) {
    // Logout can fail silently
    console.error('Logout error:', error)
  }
}
