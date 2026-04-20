import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/backend/lib/db'
import { getCurrentUser, isStaff } from '@/backend/lib/auth'
import { unauthorized, forbidden, serverError } from '@/backend/lib/api'

export interface StaffDashboardData {
  // Hours
  hours_today: number
  hours_this_week: number
  hours_this_month: number
  // Attendance — last 7 days
  attendance: { date: string; hours: number; clocked_in: boolean }[]
  // Shifts this week (from shifts table)
  shifts_this_week: {
    id: string
    shift_date: string
    start_time: string
    end_time: string
    status: string
  }[]
  // Clock history last 30 days
  clock_history: {
    id: string
    clock_in_time: string
    clock_out_time: string | null
    total_hours_worked: number | null
    is_late: boolean
  }[]
  // Announcements from care home admin
  announcements: {
    id: string
    title: string
    message: string
    created_at: string
  }[]
  // Current month calendar events
  calendar_events: {
    id: string
    title: string
    event_date: string
    start_time: string | null
    type: string
  }[]
}

export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request)
  if (!user) return unauthorized()
  if (!isStaff(user)) return forbidden()

  const db = getDb()

  try {
    // Hours today
    const todayHoursRows = await db`
      SELECT COALESCE(
        SUM(
          CASE
            WHEN clock_out_time IS NULL THEN EXTRACT(EPOCH FROM (NOW() - clock_in_time)) / 3600.0
            ELSE total_hours_worked
          END
        ), 0
      )::numeric(5,2) AS hours_today
      FROM clock_records
      WHERE user_id = ${user.id}
        AND clock_in_time >= CURRENT_DATE
    `

    // Hours this week
    const weekHoursRows = await db`
      SELECT COALESCE(SUM(total_hours_worked), 0)::numeric(5,2) AS hours_this_week
      FROM clock_records
      WHERE user_id = ${user.id}
        AND clock_in_time >= date_trunc('week', NOW())
        AND clock_out_time IS NOT NULL
    `

    // Hours this month
    const monthHoursRows = await db`
      SELECT COALESCE(SUM(total_hours_worked), 0)::numeric(5,2) AS hours_this_month
      FROM clock_records
      WHERE user_id = ${user.id}
        AND clock_in_time >= date_trunc('month', NOW())
        AND clock_out_time IS NOT NULL
    `

    // Attendance last 7 days — one row per day
    const attendanceRows = await db`
      SELECT
        to_char(d.day, 'YYYY-MM-DD') AS date,
        COALESCE(SUM(cr.total_hours_worked), 0)::numeric(5,2) AS hours,
        CASE WHEN COUNT(cr.id) > 0 THEN true ELSE false END AS clocked_in
      FROM generate_series(
        CURRENT_DATE - INTERVAL '6 days',
        CURRENT_DATE,
        INTERVAL '1 day'
      ) AS d(day)
      LEFT JOIN clock_records cr
        ON cr.user_id = ${user.id}
        AND DATE(cr.clock_in_time) = d.day
        AND cr.clock_out_time IS NOT NULL
      GROUP BY d.day
      ORDER BY d.day ASC
    `

    // Shifts this week
    const shiftsRows = await db`
      SELECT
        id,
        to_char(shift_date, 'YYYY-MM-DD') AS shift_date,
        start_time::text,
        end_time::text,
        status
      FROM shifts
      WHERE user_id = ${user.id}
        AND shift_date >= date_trunc('week', CURRENT_DATE)
        AND shift_date < date_trunc('week', CURRENT_DATE) + INTERVAL '7 days'
      ORDER BY shift_date ASC, start_time ASC
    `

    // Clock history last 30 days
    const clockHistoryRows = await db`
      SELECT
        id,
        clock_in_time,
        clock_out_time,
        total_hours_worked,
        COALESCE(is_late, false) AS is_late
      FROM clock_records
      WHERE user_id = ${user.id}
        AND clock_in_time >= NOW() - INTERVAL '30 days'
      ORDER BY clock_in_time DESC
    `

    // Announcements — notifications of type 'info' or 'success' sent to this user
    const announcementsRows = await db`
      SELECT id, title, message, created_at
      FROM notifications
      WHERE user_id = ${user.id}
        AND type IN ('info', 'success', 'warning')
      ORDER BY created_at DESC
      LIMIT 10
    `

    // Current month calendar events
    const now = new Date()
    const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
    const nextMonth = now.getMonth() === 11 ? 1 : now.getMonth() + 2
    const nextYear = now.getMonth() === 11 ? now.getFullYear() + 1 : now.getFullYear()
    const monthEnd = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`

    const calendarRows = user.care_home_id
      ? await db`
          SELECT id, title,
            to_char(event_date, 'YYYY-MM-DD') AS event_date,
            start_time::text, type
          FROM calendar_events
          WHERE event_date >= ${monthStart}::date
            AND event_date < ${monthEnd}::date
            AND (user_id = ${user.id} OR care_home_id = ${user.care_home_id})
          ORDER BY event_date ASC, start_time ASC NULLS LAST
        `
      : await db`
          SELECT id, title,
            to_char(event_date, 'YYYY-MM-DD') AS event_date,
            start_time::text, type
          FROM calendar_events
          WHERE event_date >= ${monthStart}::date
            AND event_date < ${monthEnd}::date
            AND user_id = ${user.id}
          ORDER BY event_date ASC, start_time ASC NULLS LAST
        `

    return NextResponse.json({
      hours_today: Number(todayHoursRows[0]?.hours_today ?? 0),
      hours_this_week: Number(weekHoursRows[0]?.hours_this_week ?? 0),
      hours_this_month: Number(monthHoursRows[0]?.hours_this_month ?? 0),
      attendance: attendanceRows,
      shifts_this_week: shiftsRows,
      clock_history: clockHistoryRows,
      announcements: announcementsRows,
      calendar_events: calendarRows,
    } as StaffDashboardData)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    const isTimeout = msg.includes('ETIMEDOUT') || msg.includes('ConnectTimeoutError') || msg.includes('fetch failed')
    if (isTimeout) {
      // Retry once after a short delay — Neon cold-start timeout
      return GET(request)
    }
    console.error('[GET /api/dashboard/staff-home]', err)
    return serverError()
  }
}
