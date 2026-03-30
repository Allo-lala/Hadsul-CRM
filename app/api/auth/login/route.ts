import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { verifyPassword } from '@/lib/password'
import { signSession, getRedirectForRole, type DbUser } from '@/lib/auth'

const GENERIC_ERROR = 'Invalid email or password'
const SESSION_COOKIE = 'session'
const SESSION_MAX_AGE = 7 * 24 * 60 * 60 // 7 days in seconds

export async function POST(request: NextRequest) {
  let body: { email?: unknown; password?: unknown }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ errors: { email: 'Invalid request body' } }, { status: 422 })
  }

  const email = typeof body.email === 'string' ? body.email.trim() : ''
  const password = typeof body.password === 'string' ? body.password : ''

  // Validate: neither field may be empty/whitespace
  const fieldErrors: Record<string, string> = {}
  if (!email) fieldErrors.email = 'Email is required'
  if (!password.trim()) fieldErrors.password = 'Password is required'

  if (Object.keys(fieldErrors).length > 0) {
    return NextResponse.json({ errors: fieldErrors }, { status: 422 })
  }

  // Look up user by email
  let user: DbUser | undefined
  try {
    const rows = await sql`
      SELECT * FROM users WHERE email = ${email} LIMIT 1
    `
    user = rows[0] as DbUser | undefined
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }

  if (!user) {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 })
  }

  // Check is_active
  if (!user.is_active) {
    return NextResponse.json(
      { error: 'Your account has been disabled. Contact your administrator.' },
      { status: 401 }
    )
  }

  // Verify password
  if (!user.password_hash) {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 })
  }

  const passwordValid = await verifyPassword(password, user.password_hash)
  if (!passwordValid) {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 })
  }

  // Sign JWT session
  const token = await signSession({
    userId: user.id,
    email: user.email,
    role: user.role,
    careHomeId: user.care_home_id,
  })

  const response = NextResponse.json({ redirectTo: getRedirectForRole(user.role) })

  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  })

  return response
}
