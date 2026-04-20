import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/backend/lib/db'
import { getCurrentUser, isCareHomeAdmin } from '@/backend/lib/auth'
import { unauthorized, forbidden, serverError } from '@/backend/lib/api'

export interface ActivityEvent {
  id: string
  type: 'clock-in' | 'clock-out'
  staff_name: string
  staff_role: string
  care_home_name: string | null
  care_home_id: string
  timestamp: string
  is_late: boolean
}

// GET /api/dashboard/activity
// Returns the 20 most recent clock-in and clock-out events.
// super_admin: across all care homes (includes care_home_name)
// care_home_admin: scoped to their care home
// Requirements: 6.3, 9.4
export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request)
  if (!user) return unauthorized()
  if (!isCareHomeAdmin(user)) return forbidden()

  try {
    let rows: ActivityEvent[]

    if (user.role === 'super_admin') {
      // Clock-in events + clock-out events unioned, most recent 20 across all homes
      rows = await sql`
        SELECT
          cr.id,
          'clock-in'                              AS type,
          CONCAT(u.first_name, ' ', u.last_name)  AS staff_name,
          u.role                                  AS staff_role,
          ch.name                                 AS care_home_name,
          cr.care_home_id,
          cr.clock_in_time                        AS timestamp,
          COALESCE(cr.is_late, false)             AS is_late
        FROM clock_records cr
        JOIN users u ON u.id = cr.user_id
        JOIN care_homes ch ON ch.id = cr.care_home_id
        UNION ALL
        SELECT
          cr.id || '-out'                         AS id,
          'clock-out'                             AS type,
          CONCAT(u.first_name, ' ', u.last_name)  AS staff_name,
          u.role                                  AS staff_role,
          ch.name                                 AS care_home_name,
          cr.care_home_id,
          cr.clock_out_time                       AS timestamp,
          false                                   AS is_late
        FROM clock_records cr
        JOIN users u ON u.id = cr.user_id
        JOIN care_homes ch ON ch.id = cr.care_home_id
        WHERE cr.clock_out_time IS NOT NULL
        ORDER BY timestamp DESC
        LIMIT 20
      ` as unknown as ActivityEvent[]
    } else {
      const careHomeId = user.care_home_id
      if (!careHomeId) return forbidden('No care home assigned')

      rows = await sql`
        SELECT
          cr.id,
          'clock-in'                              AS type,
          CONCAT(u.first_name, ' ', u.last_name)  AS staff_name,
          u.role                                  AS staff_role,
          NULL::text                              AS care_home_name,
          cr.care_home_id,
          cr.clock_in_time                        AS timestamp,
          COALESCE(cr.is_late, false)             AS is_late
        FROM clock_records cr
        JOIN users u ON u.id = cr.user_id
        WHERE cr.care_home_id = ${careHomeId}
        UNION ALL
        SELECT
          cr.id || '-out'                         AS id,
          'clock-out'                             AS type,
          CONCAT(u.first_name, ' ', u.last_name)  AS staff_name,
          u.role                                  AS staff_role,
          NULL::text                              AS care_home_name,
          cr.care_home_id,
          cr.clock_out_time                       AS timestamp,
          false                                   AS is_late
        FROM clock_records cr
        JOIN users u ON u.id = cr.user_id
        WHERE cr.care_home_id = ${careHomeId}
          AND cr.clock_out_time IS NOT NULL
        ORDER BY timestamp DESC
        LIMIT 20
      ` as unknown as ActivityEvent[]
    }

    return NextResponse.json(rows)
  } catch (err) {
    console.error('[GET /api/dashboard/activity]', err)
    return serverError()
  }
}
