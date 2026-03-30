import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { createPasswordResetToken } from '@/lib/tokens'
import { sendPasswordResetEmail } from '@/lib/email'
import type { DbUser } from '@/lib/auth'

const UNIFORM_MESSAGE = 'If that email is registered, you will receive a reset link.'

export async function POST(request: NextRequest) {
  let body: { email?: unknown }

  try {
    body = await request.json()
  } catch {
    // Still return uniform response to prevent enumeration
    return NextResponse.json({ message: UNIFORM_MESSAGE }, { status: 200 })
  }

  const email = typeof body.email === 'string' ? body.email.trim() : ''

  // Always respond the same way regardless of whether the email exists
  if (email) {
    try {
      const rows = await sql`
        SELECT id, first_name, last_name, email FROM users
        WHERE email = ${email} AND is_active = true
        LIMIT 1
      `

      if (rows.length > 0) {
        const user = rows[0] as Pick<DbUser, 'id' | 'first_name' | 'last_name' | 'email'>
        const rawToken = await createPasswordResetToken(user.id, 1)
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
        const resetLink = `${baseUrl}/reset-password?token=${rawToken}`

        // Fire-and-forget — don't let email errors affect the response
        sendPasswordResetEmail(
          user.email,
          `${user.first_name} ${user.last_name}`,
          resetLink
        ).catch(() => {
          // Silently ignore email delivery errors
        })
      }
    } catch {
      // Silently ignore DB errors — always return uniform response
    }
  }

  return NextResponse.json({ message: UNIFORM_MESSAGE }, { status: 200 })
}
