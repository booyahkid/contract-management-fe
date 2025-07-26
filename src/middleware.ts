// middleware.ts
import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value

  const protectedPaths = ['/contracts', '/dashboard', '/settings']
  const currentPath = req.nextUrl.pathname

  const isProtected = protectedPaths.some((path) =>
    currentPath.startsWith(path)
  )

  if (isProtected && !token) {
    const loginUrl = new URL('/', req.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

// 👇 This must be exported at the BOTTOM of the middleware file
export const config = {
  matcher: ['/contracts/:path*', '/dashboard/:path*'],
}
