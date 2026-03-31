import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getCurrentUser, isSuperAdmin } from '@/lib/auth'
import { unauthorized, forbidden, conflict, validationError, serverError } from '@/lib/api'
import type { CareHome } from '@/lib/types'

// GET /api/care-homes — super_admin only
// Returns all care homes with joined staff_count and clocked_in_count
export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request)
  if (!user) return unauthorized()
  if (!isSuperAdmin(user)) return forbidden()

  try {
    const rows = await sql`
      SELECT
        ch.*,
        COUNT(DISTINCT u.id)::int AS staff_count,
        COUNT(DISTINCT CASE WHEN cr.clock_out_time IS NULL THEN cr.id END)::int AS clocked_in_count
      FROM care_homes ch
      LEFT JOIN users u ON u.care_home_id = ch.id AND u.is_active = true
      LEFT JOIN clock_records cr ON cr.care_home_id = ch.id AND cr.clock_out_time IS NULL
      GROUP BY ch.id
      ORDER BY ch.name ASC
    `
    return NextResponse.json(rows as CareHome[])
  } catch (err) {
    console.error('[GET /api/care-homes]', err)
    return serverError()
  }
}

// POST /api/care-homes — super_admin only
// Creates a new care home after validating required fields and CQC uniqueness
export async function POST(request: NextRequest) {
  const user = await getCurrentUser(request)
  if (!user) return unauthorized()
  if (!isSuperAdmin(user)) return forbidden()

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return validationError({ body: 'Invalid JSON' })
  }

  // Validate required fields
  const errors: Record<string, string> = {}
  if (!body.name || typeof body.name !== 'string' || !body.name.trim()) errors.name = 'Name is required'
  if (!body.address || typeof body.address !== 'string' || !body.address.trim()) errors.address = 'Address is required'
  if (!body.city || typeof body.city !== 'string' || !body.city.trim()) errors.city = 'City is required'
  if (!body.postcode || typeof body.postcode !== 'string' || !body.postcode.trim()) errors.postcode = 'Postcode is required'
  if (!body.cqc_registration_number || typeof body.cqc_registration_number !== 'string' || !body.cqc_registration_number.trim()) {
    errors.cqc_registration_number = 'CQC registration number is required'
  }
  const capacity = Number(body.capacity)
  if (!body.capacity || isNaN(capacity) || capacity <= 0) errors.capacity = 'Capacity must be a positive number'

  if (Object.keys(errors).length > 0) return validationError(errors)

  try {
    // Check for duplicate CQC number
    const existing = await sql`
      SELECT id FROM care_homes WHERE cqc_registration_number = ${body.cqc_registration_number as string} LIMIT 1
    `
    if (existing.length > 0) {
      return conflict('A care home with this CQC number already exists')
    }

    const rows = await sql`
      INSERT INTO care_homes (name, address, city, postcode, phone, email, cqc_registration_number, capacity, status, logo_url)
      VALUES (
        ${(body.name as string).trim()},
        ${(body.address as string).trim()},
        ${(body.city as string).trim()},
        ${(body.postcode as string).trim()},
        ${(body.phone as string | undefined) ?? null},
        ${(body.email as string | undefined) ?? null},
        ${(body.cqc_registration_number as string).trim()},
        ${capacity},
        'active',
        ${(body.logo_url as string | undefined) ?? null}
      )
      RETURNING *
    `
    return NextResponse.json(rows[0] as CareHome, { status: 201 })
  } catch (err) {
    console.error('[POST /api/care-homes]', err)
    return serverError()
  }
}
