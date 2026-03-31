import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { unauthorized, validationError, serverError } from '@/lib/api'

export interface CalendarEvent {
  id: string
  user_id: string
  care_home_id: string | null
  title: string
  description: string | null
  event_date: string
  start_time: string | null
  end_time: string | null
  type: 'shift' | 'meeting' | 'review' | 'training' | 'inspection' | 'personal' | 'reminder'
  reminder_minutes: number | null
  is_all_day: boolean
  created_by: string | null
}

function monthRange(year: number, month: number): { start: string; end: string } {
  const start = `${year}-${String(month).padStart(2, '0')}-01`
  const nextMonth = month === 12 ? 1 : month + 1
  const nextYear = month === 12 ? year + 1 : year
  const end = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`
  return { start, end }
}

// GET /api/calendar?year=2026&month=3
export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request)
  if (!user) return unauthorized()

  const { searchParams } = new URL(request.url)
  const year = parseInt(searchParams.get('year') ?? String(new Date().getFullYear()))
  const month = parseInt(searchParams.get('month') ?? String(new Date().getMonth() + 1))

  if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
    return validationError({ month: 'Invalid year or month' })
  }

  const { start, end } = monthRange(year, month)
  const sql = getDb()

  try {
    const rows = user.care_home_id
      ? await sql`
          SELECT id, user_id, care_home_id, title, description,
            to_char(event_date, 'YYYY-MM-DD') AS event_date,
            start_time::text, end_time::text, type,
            reminder_minutes, is_all_day, created_by
          FROM calendar_events
          WHERE event_date >= ${start}::date
            AND event_date < ${end}::date
            AND (
              user_id = ${user.id}
              OR (care_home_id = ${user.care_home_id} AND created_by != ${user.id})
            )
          ORDER BY event_date ASC, start_time ASC NULLS LAST
        `
      : await sql`
          SELECT id, user_id, care_home_id, title, description,
            to_char(event_date, 'YYYY-MM-DD') AS event_date,
            start_time::text, end_time::text, type,
            reminder_minutes, is_all_day, created_by
          FROM calendar_events
          WHERE event_date >= ${start}::date
            AND event_date < ${end}::date
            AND user_id = ${user.id}
          ORDER BY event_date ASC, start_time ASC NULLS LAST
        `

    return NextResponse.json(rows as CalendarEvent[])
  } catch (err) {
    console.error('[GET /api/calendar]', err)
    return serverError()
  }
}

// POST /api/calendar
export async function POST(request: NextRequest) {
  const user = await getCurrentUser(request)
  if (!user) return unauthorized()

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return validationError({ body: 'Invalid JSON' })
  }

  const errors: Record<string, string> = {}
  if (!body.title || typeof body.title !== 'string' || !body.title.trim())
    errors.title = 'Title is required'
  if (!body.event_date || typeof body.event_date !== 'string')
    errors.event_date = 'Date is required'
  if (Object.keys(errors).length > 0) return validationError(errors)

  const sql = getDb()

  try {
    const rows = await sql`
      INSERT INTO calendar_events (
        user_id, care_home_id, title, description, event_date,
        start_time, end_time, type, reminder_minutes, is_all_day, created_by
      ) VALUES (
        ${user.id},
        ${user.care_home_id},
        ${(body.title as string).trim()},
        ${(body.description as string | undefined) ?? null},
        ${body.event_date as string},
        ${(body.start_time as string | undefined) ?? null},
        ${(body.end_time as string | undefined) ?? null},
        ${(body.type as string | undefined) ?? 'personal'},
        ${body.reminder_minutes != null ? Number(body.reminder_minutes) : null},
        ${Boolean(body.is_all_day)},
        ${user.id}
      )
      RETURNING
        id, user_id, care_home_id, title, description,
        to_char(event_date, 'YYYY-MM-DD') AS event_date,
        start_time::text, end_time::text, type,
        reminder_minutes, is_all_day, created_by
    `
    return NextResponse.json(rows[0] as CalendarEvent, { status: 201 })
  } catch (err) {
    console.error('[POST /api/calendar]', err)
    return serverError()
  }
}

// DELETE /api/calendar?id=xxx
export async function DELETE(request: NextRequest) {
  const user = await getCurrentUser(request)
  if (!user) return unauthorized()

  const id = new URL(request.url).searchParams.get('id')
  if (!id) return validationError({ id: 'Event id is required' })

  const sql = getDb()

  try {
    await sql`
      DELETE FROM calendar_events
      WHERE id = ${id} AND user_id = ${user.id}
    `
    return new NextResponse(null, { status: 204 })
  } catch (err) {
    console.error('[DELETE /api/calendar]', err)
    return serverError()
  }
}
