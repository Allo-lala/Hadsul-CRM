import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/backend/lib/db'
import { getCurrentUser } from '@/backend/lib/auth'
import { unauthorized, validationError, serverError } from '@/backend/lib/api'

// GET /api/auth/me
export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request)
  if (!user) return unauthorized()

  const db = getDb()

  // Fetch care home name if user belongs to one
  let careHomeName: string | null = null
  if (user.care_home_id) {
    try {
      const rows = await db`SELECT name FROM care_homes WHERE id = ${user.care_home_id} LIMIT 1`
      careHomeName = (rows[0] as { name: string } | undefined)?.name ?? null
    } catch {
      // non-fatal
    }
  }

  return NextResponse.json({
    id: user.id,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    role: user.role,
    care_home_id: user.care_home_id,
    care_home_name: careHomeName,
    phone: user.phone,
    job_title: user.job_title,
    department: user.department,
  })
}

// PATCH /api/auth/me — staff can update their own profile fields
export async function PATCH(request: NextRequest) {
  const user = await getCurrentUser(request)
  if (!user) return unauthorized()

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return validationError({ body: 'Invalid JSON' })
  }

  const sql = getDb()

  try {
    const rows = await sql`
      UPDATE users SET
        first_name        = COALESCE(${body.first_name as string | undefined ?? null}, first_name),
        last_name         = COALESCE(${body.last_name as string | undefined ?? null}, last_name),
        phone             = COALESCE(${body.phone as string | undefined ?? null}, phone),
        profile_image_url = COALESCE(${body.profile_image_url as string | undefined ?? null}, profile_image_url)
      WHERE id = ${user.id}
      RETURNING
        id, email, first_name, last_name, phone, role,
        care_home_id, job_title, department, profile_image_url,
        is_active, is_verified
    `
    return NextResponse.json(rows[0])
  } catch (err) {
    console.error('[PATCH /api/auth/me]', err)
    return serverError()
  }
}
