export interface User {
  id: number
  name: string
  email: string
  role: 'admin' | 'user' | 'ipm' | string   // Adjust based on your app
  department?: string                       // Optional if not always present
  created_at?: string
  updated_at?: string
}
