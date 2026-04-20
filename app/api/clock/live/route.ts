import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/backend/lib/db'
import { getCurrentUser, isCareHomeAdmin } from '@/backend/lib/auth'
import { unauthorized, forbidden, serverError } from '@/backend/lib/api'
import type { ClockRecord } from '@/shared/types'

// GET /api/clock/live
// Returns all open clock records for the admin's care home, joined with
// staff name and role, plus computed elapsed_minutes.
// Requirements: 5.1, 5.2, 9.4
export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request)
  if (!user) return unauthorized()
  if (!isCareHomeAdmin(user)) return forbidden()

  // super_admin may optionally filter by a specific care home via query param
  const { searchParams } = new URL(request.url)
  const careHomeId =
    user.role === 'super_admin'
      ? (searchParams.get('care_home_id') ?? null)
      : user.care_home_id

  if (!careHomeId) {
    return NextResponse.json({ error: 'No care home context' }, { status: 400 })
  }

  try {
    const rows = await sql`
      SELECT
        cr.id,
        cr.user_id,
        cr.care_home_id,
        cr.clock_in_time,
        cr.clock_out_time,
        cr.total_hours_worked,
        cr.status,
        cr.is_late,
        CONCAT(u.first_name, ' ', u.last_name) AS staff_name,
        u.role                                  AS staff_role,
        EXTRACT(EPOCH FROM (NOW() - cr.clock_in_time)) / 60 AS elapsed_minutes
      FROM clock_records cr
      JOIN users u ON u.id = cr.user_id
      WHERE cr.care_home_id = ${careHomeId}
        AND cr.clock_out_time IS NULL
      ORDER BY cr.clock_in_time ASC
    `

    return NextResponse.json(rows as (ClockRecord & { elapsed_minutes: number })[])
  } catch (err) {
    console.error('[GET /api/clock/live]', err)
    return serverError()
  }
}
