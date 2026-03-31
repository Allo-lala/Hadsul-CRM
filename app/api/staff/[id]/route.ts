import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getCurrentUser, isCareHomeAdmin } from '@/lib/auth'
import { unauthorized, forbidden, notFound, validationError, serverError } from '@/lib/api'
import type { StaffMember, ClockRecord } from '@/lib/types'

// GET /api/staff/[id]
// Returns staff profile with clock history for past 30 days, hours this week and month
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser(request)
  if (!user) return unauthorized()
  if (!isCareHomeAdmin(user)) return forbidden()

  const { id } = await params

  try {
    // Fetch staff member, scoped by care_home_id for non-super_admin
    const staffRows = user.role === 'super_admin'
      ? await sql`
          SELECT
            u.*,
            CASE WHEN cr_open.id IS NOT NULL THEN true ELSE false END AS is_clocked_in,
            cr_open.clock_in_time
          FROM users u
          LEFT JOIN clock_records cr_open
            ON cr_open.user_id = u.id AND cr_open.clock_out_time IS NULL
          WHERE u.id = ${id}
          LIMIT 1
        `
      : await sql`
          SELECT
            u.*,
            CASE WHEN cr_open.id IS NOT NULL THEN true ELSE false END AS is_clocked_in,
            cr_open.clock_in_time
          FROM users u
          LEFT JOIN clock_records cr_open
            ON cr_open.user_id = u.id AND cr_open.clock_out_time IS NULL
          WHERE u.id = ${id}
            AND u.care_home_id = ${user.care_home_id}
          LIMIT 1
        `

    if (staffRows.length === 0) return notFound('Staff member not found')

    // Clock history for past 30 days (Requirement 7.2)
    const clockHistory = await sql`
      SELECT
        id, user_id, care_home_id, clock_in_time, clock_out_time,
        total_hours_worked, status
      FROM clock_records
      WHERE user_id = ${id}
        AND clock_in_time >= NOW() - INTERVAL '30 days'
      ORDER BY clock_in_time DESC
    `

    // Hours this week (Requirement 7.3)
    const weekHoursRows = await sql`
      SELECT COALESCE(SUM(total_hours_worked), 0)::numeric(5,2) AS hours_this_week
      FROM clock_records
      WHERE user_id = ${id}
        AND clock_in_time >= date_trunc('week', NOW())
        AND clock_out_time IS NOT NULL
    `

    // Hours this month (Requirement 7.3)
    const monthHoursRows = await sql`
      SELECT COALESCE(SUM(total_hours_worked), 0)::numeric(5,2) AS hours_this_month
      FROM clock_records
      WHERE user_id = ${id}
        AND clock_in_time >= date_trunc('month', NOW())
        AND clock_out_time IS NOT NULL
    `

    const staffMember = staffRows[0] as StaffMember & {
      clock_history: ClockRecord[]
      hours_this_week: number
      hours_this_month: number
    }

    return NextResponse.json({
      ...staffMember,
      clock_history: clockHistory as ClockRecord[],
      hours_this_week: Number(weekHoursRows[0]?.hours_this_week ?? 0),
      hours_this_month: Number(monthHoursRows[0]?.hours_this_month ?? 0),
    })
  } catch (err) {
    console.error('[GET /api/staff/[id]]', err)
    return serverError()
  }
}

// PATCH /api/staff/[id]
// Updates staff member fields; setting is_active=false prevents login (Requirement 3.4)
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

  // Validate hourly_rate if provided
  if (body.hourly_rate !== undefined && body.hourly_rate !== null) {
    const rate = Number(body.hourly_rate)
    if (isNaN(rate) || rate < 0) {
      return validationError({ hourly_rate: 'Hourly rate must be a non-negative number' })
    }
  }

  // Validate contract_hours if provided
  if (body.contract_hours !== undefined && body.contract_hours !== null) {
    const hours = Number(body.contract_hours)
    if (isNaN(hours) || hours < 0) {
      return validationError({ contract_hours: 'Contract hours must be a non-negative number' })
    }
  }

  // Validate contract_type if provided
  const validContractTypes = ['full_time', 'part_time', 'zero_hours', 'bank', 'agency']
  if (
    body.contract_type !== undefined &&
    body.contract_type !== null &&
    !validContractTypes.includes(body.contract_type as string)
  ) {
    return validationError({ contract_type: 'Invalid contract type' })
  }

  try {
    // Check staff member exists and is accessible to this admin
    const existing = user.role === 'super_admin'
      ? await sql`SELECT id FROM users WHERE id = ${id} LIMIT 1`
      : await sql`SELECT id FROM users WHERE id = ${id} AND care_home_id = ${user.care_home_id} LIMIT 1`

    if (existing.length === 0) return notFound('Staff member not found')

    const rows = await sql`
      UPDATE users SET
        first_name    = COALESCE(${body.first_name as string | undefined ?? null}, first_name),
        last_name     = COALESCE(${body.last_name as string | undefined ?? null}, last_name),
        phone         = COALESCE(${body.phone as string | undefined ?? null}, phone),
        role          = COALESCE(${body.role as string | undefined ?? null}, role),
        job_title     = COALESCE(${body.job_title as string | undefined ?? null}, job_title),
        department    = COALESCE(${body.department as string | undefined ?? null}, department),
        hourly_rate   = COALESCE(${body.hourly_rate != null ? Number(body.hourly_rate) : null}, hourly_rate),
        contract_hours = COALESCE(${body.contract_hours != null ? Number(body.contract_hours) : null}, contract_hours),
        contract_type = COALESCE(${body.contract_type as string | undefined ?? null}, contract_type),
        profile_image_url = COALESCE(${body.profile_image_url as string | undefined ?? null}, profile_image_url),
        is_active     = COALESCE(${body.is_active != null ? Boolean(body.is_active) : null}, is_active)
      WHERE id = ${id}
      RETURNING *
    `

    return NextResponse.json(rows[0] as StaffMember)
  } catch (err) {
    console.error('[PATCH /api/staff/[id]]', err)
    return serverError()
  }
}
