import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { validateToken } from '@/lib/tokens'
import type { DbUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token') ?? ''

  if (!token) {
    return NextResponse.json({ valid: false }, { status: 200 })
  }

  const result = await validateToken(token)

  if (!result) {
    return NextResponse.json({ valid: false }, { status: 200 })
  }

  // Fetch the user's email to return alongside the valid flag
  try {
    const rows = await sql`
      SELECT email FROM users WHERE id = ${result.userId} LIMIT 1
    `

    if (rows.length === 0) {
      return NextResponse.json({ valid: false }, { status: 200 })
    }

    const user = rows[0] as Pick<DbUser, 'email'>
    return NextResponse.json({ valid: true, email: user.email }, { status: 200 })
  } catch {
    return NextResponse.json({ valid: false }, { status: 200 })
  }
}
