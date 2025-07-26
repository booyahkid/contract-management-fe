'use client'

// import { useEffect } from 'react'
// import { useRouter } from 'next/navigation'

export default function NotFound() {
//   const router = useRouter()

//   useEffect(() => {
//     // Add special body class
//     document.body.classList.add('hide-navbar')

//     // Redirect after 3s
//     const timeout = setTimeout(() => {
//       router.push('/')
//     }, 3000)

//     return () => {
//       // Remove special body class when unmount
//       document.body.classList.remove('hide-navbar')
//       clearTimeout(timeout)
//     }
//   }, [router])

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="text-muted-foreground mb-2">The page you&apos;re looking for does not exist.</p>
      {/* <p className="text-sm text-gray-500">Redirecting to login...</p> */}
    </div>
  )
}
