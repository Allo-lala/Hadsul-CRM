import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getCurrentUser, isSuperAdmin } from '@/lib/auth'
import { unauthorized, forbidden, notFound, validationError, serverError } from '@/lib/api'
import type { CareHome } from '@/lib/types'

// GET /api/care-homes/[id] — super_admin only
// Returns a single care home with assigned admin details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser(request)
  if (!user) return unauthorized()
  if (!isSuperAdmin(user)) return forbidden()

  const { id } = await params

  try {
    const rows = await sql`
      SELECT
        ch.*,
        COUNT(DISTINCT u.id)::int AS staff_count,
        COUNT(DISTINCT CASE WHEN cr.clock_out_time IS NULL THEN cr.id END)::int AS clocked_in_count,
        json_agg(
          DISTINCT jsonb_build_object(
            'id', admin.id,
            'first_name', admin.first_name,
            'last_name', admin.last_name,
            'email', admin.email,
            'phone', admin.phone
          )
        ) FILTER (WHERE admin.id IS NOT NULL) AS admins
      FROM care_homes ch
      LEFT JOIN users u ON u.care_home_id = ch.id AND u.is_active = true
      LEFT JOIN clock_records cr ON cr.care_home_id = ch.id AND cr.clock_out_time IS NULL
      LEFT JOIN users admin ON admin.care_home_id = ch.id AND admin.role = 'care_home_admin' AND admin.is_active = true
      WHERE ch.id = ${id}
      GROUP BY ch.id
    `

    if (rows.length === 0) return notFound('Care home not found')

    return NextResponse.json(rows[0] as CareHome)
  } catch (err) {
    console.error('[GET /api/care-homes/[id]]', err)
    return serverError()
  }
}

// PATCH /api/care-homes/[id] — super_admin only
// Updates care home fields and returns the updated record
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser(request)
  if (!user) return unauthorized()
  if (!isSuperAdmin(user)) return forbidden()

  const { id } = await params

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return validationError({ body: 'Invalid JSON' })
  }

  // Validate capacity if provided
  if (body.capacity !== undefined) {
    const capacity = Number(body.capacity)
    if (isNaN(capacity) || capacity <= 0) {
      return validationError({ capacity: 'Capacity must be a positive number' })
    }
  }

  // Validate status if provided
  const validStatuses = ['active', 'inactive', 'suspended']
  if (body.status !== undefined && !validStatuses.includes(body.status as string)) {
    return validationError({ status: 'Status must be active, inactive, or suspended' })
  }

  try {
    // Check care home exists
    const existing = await sql`SELECT id FROM care_homes WHERE id = ${id} LIMIT 1`
    if (existing.length === 0) return notFound('Care home not found')

    const rows = await sql`
      UPDATE care_homes SET
        name = COALESCE(${body.name as string | undefined ?? null}, name),
        address = COALESCE(${body.address as string | undefined ?? null}, address),
        city = COALESCE(${body.city as string | undefined ?? null}, city),
        postcode = COALESCE(${body.postcode as string | undefined ?? null}, postcode),
        phone = COALESCE(${body.phone as string | undefined ?? null}, phone),
        email = COALESCE(${body.email as string | undefined ?? null}, email),
        cqc_rating = COALESCE(${body.cqc_rating as string | undefined ?? null}, cqc_rating),
        capacity = COALESCE(${body.capacity != null ? Number(body.capacity) : null}, capacity),
        status = COALESCE(${body.status as string | undefined ?? null}, status),
        logo_url = COALESCE(${body.logo_url as string | undefined ?? null}, logo_url)
      WHERE id = ${id}
      RETURNING *
    `

    return NextResponse.json(rows[0] as CareHome)
  } catch (err) {
    console.error('[PATCH /api/care-homes/[id]]', err)
    return serverError()
  }
}
