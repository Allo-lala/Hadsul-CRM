import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { validatePasswordStrength, hashPassword } from '@/lib/password'
import { validateToken, consumeToken } from '@/lib/tokens'

export async function POST(request: NextRequest) {
  let body: { token?: unknown; password?: unknown }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ errors: { token: 'Invalid request body' } }, { status: 422 })
  }

  const token = typeof body.token === 'string' ? body.token.trim() : ''
  const password = typeof body.password === 'string' ? body.password : ''

  // Validate password strength first
  const strengthErrors = validatePasswordStrength(password)
  if (strengthErrors.length > 0) {
    return NextResponse.json({ errors: { password: strengthErrors } }, { status: 422 })
  }

  // Validate the token
  const tokenResult = await validateToken(token)
  if (!tokenResult) {
    return NextResponse.json(
      { error: 'This link has expired or has already been used.' },
      { status: 400 }
    )
  }

  // Hash the new password
  const passwordHash = await hashPassword(password)

  // Update user record
  await sql`
    UPDATE users
    SET password_hash = ${passwordHash}, is_verified = true
    WHERE id = ${tokenResult.userId}
  `

  // Consume (delete) the token so it cannot be reused
  await consumeToken(token)

  return NextResponse.json({ ok: true }, { status: 200 })
}
