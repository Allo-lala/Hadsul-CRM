import { NextRequest, NextResponse } from 'next/server'
import { verifySession, UserRole } from './lib/auth'

// ---------------------------------------------------------------------------
// Public routes — no session required
// ---------------------------------------------------------------------------
const PUBLIC_PATHS = [
  '/',
  '/login',
  '/forgot-password',
  '/reset-password',
  '/api/auth/login',
  '/api/auth/logout',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/auth/verify-token',
  '/api/webhooks',
]

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + '/') || pathname.startsWith(p + '?')
  )
}

// ---------------------------------------------------------------------------
// Route permission map
// Each entry maps a path prefix to the set of roles that may access it.
// A super_admin can access everything — that is handled separately below.
// ---------------------------------------------------------------------------
const ROUTE_PERMISSIONS: Array<{ prefix: string; allowed: UserRole[] }> = [
  // System-wide admin pages
  {
    prefix: '/dashboard/users',
    allowed: ['super_admin', 'care_home_admin', 'manager'],
  },
  {
    prefix: '/dashboard/care-homes',
    allowed: ['super_admin'],
  },
  {
    prefix: '/dashboard/reports',
    allowed: ['super_admin', 'care_home_admin', 'manager'],
  },
  // Staff-accessible dashboard areas
  {
    prefix: '/dashboard',
    allowed: [
      'super_admin',
      'care_home_admin',
      'manager',
      'senior_carer',
      'carer',
      'nurse',
      'domestic',
      'kitchen',
      'maintenance',
      'admin_staff',
    ],
  },
  // API routes that require elevated roles
  {
    prefix: '/api/users/invite',
    allowed: ['super_admin', 'care_home_admin', 'manager'],
  },
]

/**
 * Returns true when the given role is permitted to access the given pathname.
 * super_admin always has access to every route.
 */
export function isRolePermitted(role: UserRole, pathname: string): boolean {
  if (role === 'super_admin') return true

  // Find the most-specific matching prefix (longest match wins)
  const matches = ROUTE_PERMISSIONS.filter((entry) =>
    pathname === entry.prefix || pathname.startsWith(entry.prefix + '/') || pathname.startsWith(entry.prefix + '?')
  )

  if (matches.length === 0) {
    // No explicit rule — allow by default (public/unprotected resource)
    return true
  }

  // Use the most specific (longest prefix) rule
  const best = matches.reduce((a, b) => (a.prefix.length >= b.prefix.length ? a : b))
  return best.allowed.includes(role)
}

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------
export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Always allow public paths through
  if (isPublicPath(pathname)) {
    return NextResponse.next()
  }

  // Read the session cookie
  const sessionToken = request.cookies.get('session')?.value ?? null

  if (!sessionToken) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Verify the JWT
  const payload = await verifySession(sessionToken)

  if (!payload) {
    // Tampered or expired — clear cookie and redirect
    const loginUrl = new URL('/login', request.url)
    const response = NextResponse.redirect(loginUrl)
    response.cookies.set('session', '', { maxAge: 0, path: '/' })
    return response
  }

  // Check role-based access
  if (!isRolePermitted(payload.role, pathname)) {
    const forbiddenUrl = new URL('/403', request.url)
    return NextResponse.redirect(forbiddenUrl)
  }

  // Attach user context to downstream request headers
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-user-id', payload.userId)
  requestHeaders.set('x-user-role', payload.role)
  requestHeaders.set('x-care-home-id', payload.careHomeId ?? '')

  return NextResponse.next({ request: { headers: requestHeaders } })
}

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
