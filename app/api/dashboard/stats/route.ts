import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getCurrentUser, isCareHomeAdmin } from '@/lib/auth'
import { unauthorized, forbidden, serverError } from '@/lib/api'
import type { DashboardStats } from '@/lib/types'

// GET /api/dashboard/stats
// Returns KPI summary scoped by role.
// super_admin: total_staff, total_care_homes, clocked_in_now (all homes), hours_today (all homes)
// care_home_admin: total_staff (their home), clocked_in_now, late_today, expected_not_in, hours_today
// Requirements: 5.1, 6.1, 9.2, 9.4
export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request)
  if (!user) return unauthorized()
  if (!isCareHomeAdmin(user)) return forbidden()

  try {
    if (user.role === 'super_admin') {
      const [staffRow, homesRow, clockedInRow, hoursRow] = await Promise.all([
        sql`SELECT COUNT(*)::int AS total_staff FROM users WHERE is_active = true AND role NOT IN ('super_admin', 'care_home_admin', 'manager')`,
        sql`SELECT COUNT(*)::int AS total_care_homes FROM care_homes`,
        sql`SELECT COUNT(*)::int AS clocked_in_now FROM clock_records WHERE clock_out_time IS NULL`,
        sql`
          SELECT COALESCE(SUM(total_hours_worked), 0)::float AS hours_today
          FROM clock_records
          WHERE DATE(clock_in_time) = CURRENT_DATE
        `,
      ])

      const stats: DashboardStats = {
        total_staff: staffRow[0]?.total_staff ?? 0,
        total_care_homes: homesRow[0]?.total_care_homes ?? 0,
        clocked_in_now: clockedInRow[0]?.clocked_in_now ?? 0,
        late_today: 0,
        hours_today: Number(hoursRow[0]?.hours_today ?? 0),
      }

      return NextResponse.json(stats)
    }

    // care_home_admin / manager — scoped to their care home
    const careHomeId = user.care_home_id
    if (!careHomeId) return forbidden('No care home assigned')

    const [staffRow, clockedInRow, lateRow, hoursRow, shiftsRow, clockedInIdsRow] =
      await Promise.all([
        sql`
          SELECT COUNT(*)::int AS total_staff
          FROM users
          WHERE care_home_id = ${careHomeId} AND is_active = true
        `,
        sql`
          SELECT COUNT(*)::int AS clocked_in_now
          FROM clock_records
          WHERE care_home_id = ${careHomeId} AND clock_out_time IS NULL
        `,
        sql`
          SELECT COUNT(*)::int AS late_today
          FROM clock_records
          WHERE care_home_id = ${careHomeId}
            AND DATE(clock_in_time) = CURRENT_DATE
            AND is_late = true
        `,
        sql`
          SELECT COALESCE(SUM(total_hours_worked), 0)::float AS hours_today
          FROM clock_records
          WHERE care_home_id = ${careHomeId}
            AND DATE(clock_in_time) = CURRENT_DATE
        `,
        // Count staff with a shift scheduled today
        sql`
          SELECT COUNT(DISTINCT user_id)::int AS expected_today
          FROM shifts
          WHERE care_home_id = ${careHomeId}
            AND DATE(start_time) = CURRENT_DATE
        `,
        // IDs of staff currently clocked in
        sql`
          SELECT DISTINCT user_id
          FROM clock_records
          WHERE care_home_id = ${careHomeId} AND clock_out_time IS NULL
        `,
      ])

    const expectedToday: number = shiftsRow[0]?.expected_today ?? 0
    const clockedInNow: number = clockedInRow[0]?.clocked_in_now ?? 0
    const expectedNotIn = Math.max(0, expectedToday - clockedInNow)

    const stats: DashboardStats = {
      total_staff: staffRow[0]?.total_staff ?? 0,
      clocked_in_now: clockedInNow,
      late_today: lateRow[0]?.late_today ?? 0,
      hours_today: Number(hoursRow[0]?.hours_today ?? 0),
      expected_not_in: expectedNotIn,
    }

    return NextResponse.json(stats)
  } catch (err) {
    console.error('[GET /api/dashboard/stats]', err)
    return serverError()
  }
}
