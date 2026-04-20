'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Root Page - Redirects to Login
 * 
 * Automatically redirects users to the login page on load.
 * This ensures users land directly on the authentication screen
 * without needing to click through a landing page.
 */
export default function RootPage() {
  const router = useRouter()

  useEffect(() => {
    router.push('/login')
  }, [router])

  return null
}
