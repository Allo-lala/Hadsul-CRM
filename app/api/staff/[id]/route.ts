import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/backend/lib/db'
import { getCurrentUser, isCareHomeAdmin } from '@/backend/lib/auth'
import { unauthorized, forbidden, notFound, validationError, serverError } from '@/backend/lib/api'
import type { StaffMember, ClockRecord } from '@/shared/types'

// GET /api/staff/[id]
// Admins: any staff in their care home. Staff: own profile only.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser(request)
  if (!user) return unauthorized()

  const { id } = await params
  const isSelf = user.id === id

  // Allow admins OR the user fetching their own record
  if (!isCareHomeAdmin(user) && !isSelf) return forbidden()

  const db = getDb()

  try {
    const staffRows = (user.role === 'super_admin' || isSelf)
      ? await db`
          SELECT u.*,
            CASE WHEN cr.id IS NOT NULL THEN true ELSE false END AS is_clocked_in,
            cr.clock_in_time
          FROM users u
          LEFT JOIN clock_records cr ON cr.user_id = u.id AND cr.clock_out_time IS NULL
          WHERE u.id = ${id} LIMIT 1
        `
      : await db`
          SELECT u.*,
            CASE WHEN cr.id IS NOT NULL THEN true ELSE false END AS is_clocked_in,
            cr.clock_in_time
          FROM users u
          LEFT JOIN clock_records cr ON cr.user_id = u.id AND cr.clock_out_time IS NULL
          WHERE u.id = ${id} AND u.care_home_id = ${user.care_home_id} LIMIT 1
        `

    if (staffRows.length === 0) return notFound('Staff member not found')

    const clockHistory = await db`
      SELECT id, user_id, care_home_id, clock_in_time, clock_out_time, total_hours_worked, status
      FROM clock_records
      WHERE user_id = ${id} AND clock_in_time >= NOW() - INTERVAL '30 days'
      ORDER BY clock_in_time DESC
    `

    const weekHours = await db`
      SELECT COALESCE(SUM(total_hours_worked), 0)::numeric(5,2) AS hours_this_week
      FROM clock_records
      WHERE user_id = ${id}
        AND clock_in_time >= date_trunc('week', NOW())
        AND clock_out_time IS NOT NULL
    `

    const monthHours = await db`
      SELECT COALESCE(SUM(total_hours_worked), 0)::numeric(5,2) AS hours_this_month
      FROM clock_records
      WHERE user_id = ${id}
        AND clock_in_time >= date_trunc('month', NOW())
        AND clock_out_time IS NOT NULL
    `

    return NextResponse.json({
      ...(staffRows[0] as StaffMember),
      clock_history: clockHistory as ClockRecord[],
      hours_this_week: Number(weekHours[0]?.hours_this_week ?? 0),
      hours_this_month: Number(monthHours[0]?.hours_this_month ?? 0),
    })
  } catch (err) {
    console.error('[GET /api/staff/[id]]', err)
    return serverError()
  }
}

// PATCH /api/staff/[id] — admins only
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser(request)
  if (!user) return unauthorized()
  if (!isCareHomeAdmin(user)) return forbidden()

  const { id } = await params

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return validationError({ body: 'Invalid JSON' })
  }

  if (body.hourly_rate != null && (isNaN(Number(body.hourly_rate)) || Number(body.hourly_rate) < 0))
    return validationError({ hourly_rate: 'Must be a non-negative number' })
  if (body.contract_hours != null && (isNaN(Number(body.contract_hours)) || Number(body.contract_hours) < 0))
    return validationError({ contract_hours: 'Must be a non-negative number' })

  const db = getDb()

  try {
    const existing = user.role === 'super_admin'
      ? await db`SELECT id FROM users WHERE id = ${id} LIMIT 1`
      : await db`SELECT id FROM users WHERE id = ${id} AND care_home_id = ${user.care_home_id} LIMIT 1`

    if (existing.length === 0) return notFound('Staff member not found')

    const rows = await db`
      UPDATE users SET
        first_name        = COALESCE(${body.first_name as string | undefined ?? null}, first_name),
        last_name         = COALESCE(${body.last_name as string | undefined ?? null}, last_name),
        phone             = COALESCE(${body.phone as string | undefined ?? null}, phone),
        role              = COALESCE(${body.role as string | undefined ?? null}, role),
        job_title         = COALESCE(${body.job_title as string | undefined ?? null}, job_title),
        department        = COALESCE(${body.department as string | undefined ?? null}, department),
        hourly_rate       = COALESCE(${body.hourly_rate != null ? Number(body.hourly_rate) : null}, hourly_rate),
        contract_hours    = COALESCE(${body.contract_hours != null ? Number(body.contract_hours) : null}, contract_hours),
        contract_type     = COALESCE(${body.contract_type as string | undefined ?? null}, contract_type),
        profile_image_url = COALESCE(${body.profile_image_url as string | undefined ?? null}, profile_image_url),
        is_active         = COALESCE(${body.is_active != null ? Boolean(body.is_active) : null}, is_active)
      WHERE id = ${id}
      RETURNING *
    `
    return NextResponse.json(rows[0] as StaffMember)
  } catch (err) {
    console.error('[PATCH /api/staff/[id]]', err)
    return serverError()
  }
}
