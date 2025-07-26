import Cookies from 'js-cookie'

export const TOKEN_KEY = 'token'

export function saveToken(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token)
    Cookies.set(TOKEN_KEY, token, { expires: 7 })
  }
}

export function getToken(): string | null {
  if (typeof window !== 'undefined') {
    // Try cookies first, then localStorage as fallback
    return Cookies.get(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY)
  }
  return null
}


export function removeToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY)
    Cookies.remove(TOKEN_KEY)
  }
}

export function isAuthenticated(): boolean {
  return !!getToken()
}