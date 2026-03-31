import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { getDb } from './db'

export type UserRole =
  | 'super_admin'
  | 'care_home_admin'
  | 'manager'
  | 'senior_carer'
  | 'carer'
  | 'nurse'
  | 'domestic'
  | 'kitchen'
  | 'maintenance'
  | 'admin_staff'

export interface DbUser {
  id: string
  care_home_id: string | null
  email: string
  first_name: string
  last_name: string
  phone: string | null
  role: UserRole
  job_title: string | null
  department: string | null
  is_active: boolean
  is_verified: boolean
  password_hash: string | null
}

export interface SessionPayload {
  userId: string
  email: string
  role: UserRole
  careHomeId: string | null
  iat?: number
  exp?: number
}

const SESSION_COOKIE = 'session'
const SESSION_DURATION_SECONDS = 7 * 24 * 60 * 60 // 7 days

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET environment variable is not set')
  return new TextEncoder().encode(secret)
}

/**
 * Signs a session payload into a JWT using HS256.
 */
export async function signSession(payload: SessionPayload): Promise<string> {
  const secret = getJwtSecret()
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(secret)
}

/**
 * Verifies a JWT session token. Returns the decoded payload or null on any error.
 */
export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const secret = getJwtSecret()
    const { payload } = await jwtVerify(token, secret)
    return payload as unknown as SessionPayload
  } catch {
    return null
  }
}

/**
 * Reads the session cookie and returns the current authenticated user from the DB,
 * or null if unauthenticated / user not found.
 */
export async function getCurrentUser(request?: Request): Promise<DbUser | null> {
  let token: string | undefined

  if (request) {
    // Edge runtime path (middleware / API routes)
    const cookieHeader = request.headers.get('cookie') ?? ''
    const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${SESSION_COOKIE}=([^;]+)`))
    token = match?.[1]
  } else {
    // Server component path
    const cookieStore = await cookies()
    token = cookieStore.get(SESSION_COOKIE)?.value
  }

  if (!token) return null

  const payload = await verifySession(token)
  if (!payload?.userId) return null

  try {
    const sql = getDb()
    const rows = await sql`
      SELECT * FROM users WHERE id = ${payload.userId} AND is_active = true LIMIT 1
    `
    return (rows[0] as DbUser) ?? null
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// Role helpers
// ---------------------------------------------------------------------------

export function hasRole(user: DbUser | null, allowedRoles: UserRole[]): boolean {
  if (!user) return false
  return allowedRoles.includes(user.role)
}

export function isSuperAdmin(user: DbUser | null): boolean {
  return hasRole(user, ['super_admin'])
}

export function isCareHomeAdmin(user: DbUser | null): boolean {
  return hasRole(user, ['super_admin', 'care_home_admin', 'manager'])
}

export function isStaff(user: DbUser | null): boolean {
  return hasRole(user, [
    'senior_carer',
    'carer',
    'nurse',
    'domestic',
    'kitchen',
    'maintenance',
    'admin_staff',
  ])
}

/**
 * Returns the appropriate dashboard redirect path for a given role.
 */
export function getRedirectForRole(role: UserRole): string {
  switch (role) {
    case 'super_admin':
      return '/dashboard'
    case 'care_home_admin':
    case 'manager':
      return '/dashboard'
    default:
      return '/dashboard'
  }
}
