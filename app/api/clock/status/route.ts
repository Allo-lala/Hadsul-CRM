import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/backend/lib/db'
import { getCurrentUser } from '@/backend/lib/auth'
import { unauthorized, serverError } from '@/backend/lib/api'
import type { ClockRecord } from '@/shared/types'

// GET /api/clock/status
export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request)
  if (!user) return unauthorized()

  const sql = getDb()

  try {
    const rows = await sql`
      SELECT
        cr.id, cr.user_id, cr.care_home_id, cr.clock_in_time,
        cr.clock_out_time, cr.total_hours_worked, cr.status, cr.is_late
      FROM clock_records cr
      WHERE cr.user_id = ${user.id}
        AND cr.clock_out_time IS NULL
      ORDER BY cr.clock_in_time DESC
      LIMIT 1
    `

    if (rows.length === 0) {
      return NextResponse.json(null)
    }

    return NextResponse.json(rows[0] as ClockRecord)
  } catch (err) {
    console.error('[GET /api/clock/status]', err)
    return serverError()
  }
}
