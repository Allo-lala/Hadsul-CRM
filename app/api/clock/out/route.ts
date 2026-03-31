import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { unauthorized, serverError } from '@/lib/api'
import type { ClockRecord } from '@/lib/types'

// POST /api/clock/out
// Closes the open clock record for the authenticated user.
// Calculates total_hours_worked = EXTRACT(EPOCH FROM (clock_out - clock_in)) / 3600
export async function POST(request: NextRequest) {
  const user = await getCurrentUser(request)
  if (!user) return unauthorized()

  // Fresh DB client per request — avoids Neon ETIMEDOUT on idle connections
  const sql = getDb()

  try {
    const openRows = await sql`
      SELECT id, clock_in_time
      FROM clock_records
      WHERE user_id = ${user.id}
        AND clock_out_time IS NULL
      ORDER BY clock_in_time DESC
      LIMIT 1
    `

    if (openRows.length === 0) {
      return NextResponse.json({ error: 'No active clock record found' }, { status: 400 })
    }

    const recordId = openRows[0].id as string

    const rows = await sql`
      UPDATE clock_records
      SET
        clock_out_time = NOW(),
        total_hours_worked = EXTRACT(EPOCH FROM (NOW() - clock_in_time)) / 3600.0,
        status = 'clocked_out',
        updated_at = NOW()
      WHERE id = ${recordId}
      RETURNING
        id, user_id, care_home_id, clock_in_time, clock_out_time,
        total_hours_worked, status, is_late
    `

    return NextResponse.json(rows[0] as ClockRecord)
  } catch (err) {
    console.error('[POST /api/clock/out]', err)
    return serverError()
  }
}
