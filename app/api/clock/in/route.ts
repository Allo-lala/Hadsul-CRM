import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { unauthorized, conflict, serverError } from '@/lib/api'
import type { ClockRecord } from '@/lib/types'

// POST /api/clock/in
// Creates a new clock record for the authenticated user.
// Rejects with 409 if an open record already exists (Requirement 4.4).
// Detects late arrival vs scheduled shift (Requirement 4.5).
export async function POST(request: NextRequest) {
  const user = await getCurrentUser(request)
  if (!user) return unauthorized()

  // User must belong to a care home to clock in
  if (!user.care_home_id) {
    return conflict('You are not assigned to a care home')
  }

  try {
    // Check for existing open clock record (Requirement 4.4)
    const openRecords = await sql`
      SELECT id FROM clock_records
      WHERE user_id = ${user.id}
        AND clock_out_time IS NULL
      LIMIT 1
    `

    if (openRecords.length > 0) {
      return conflict('You are already clocked in')
    }

    // Detect late arrival: check for a shift today (Requirement 4.5)
    const shiftRows = await sql`
      SELECT id, start_time
      FROM shifts
      WHERE user_id = ${user.id}
        AND shift_date = CURRENT_DATE
        AND status NOT IN ('cancelled', 'no_show')
      ORDER BY start_time ASC
      LIMIT 1
    `

    let isLate = false
    const shiftId: string | null = shiftRows.length > 0 ? (shiftRows[0].id as string) : null

    if (shiftRows.length > 0) {
      // Compare NOW() to shift start_time + 15 minutes
      const lateCheckRows = await sql`
        SELECT (NOW()::time > (${shiftRows[0].start_time as string}::time + INTERVAL '15 minutes')) AS is_late
      `
      isLate = Boolean(lateCheckRows[0]?.is_late)
    }

    // Insert the clock record
    const rows = await sql`
      INSERT INTO clock_records (
        user_id, care_home_id, shift_id, clock_in_time, status, is_late
      ) VALUES (
        ${user.id},
        ${user.care_home_id},
        ${shiftId},
        NOW(),
        'clocked_in',
        ${isLate}
      )
      RETURNING
        id, user_id, care_home_id, clock_in_time, clock_out_time,
        total_hours_worked, status, is_late
    `

    const record = rows[0] as ClockRecord

    // If late, notify the care home admin (Requirement 5.4)
    if (isLate && user.care_home_id) {
      const adminRows = await sql`
        SELECT id FROM users
        WHERE care_home_id = ${user.care_home_id}
          AND role IN ('care_home_admin', 'manager')
          AND is_active = true
        LIMIT 5
      `

      if (adminRows.length > 0) {
        const staffName = `${user.first_name} ${user.last_name}`
        for (const admin of adminRows) {
          await sql`
            INSERT INTO notifications (user_id, care_home_id, title, message, type)
            VALUES (
              ${admin.id as string},
              ${user.care_home_id},
              'Late Arrival',
              ${`${staffName} clocked in late.`},
              'warning'
            )
          `
        }
      }
    }

    return NextResponse.json(record, { status: 201 })
  } catch (err) {
    console.error('[POST /api/clock/in]', err)
    return serverError()
  }
}
