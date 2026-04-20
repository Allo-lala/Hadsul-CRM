import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/backend/lib/db'
import { getCurrentUser } from '@/backend/lib/auth'
import { unauthorized, notFound, validationError, serverError } from '@/backend/lib/api'

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

// GET /api/calendar/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser(request)
  if (!user) return unauthorized()

  const { id } = await params
  const sql = getDb()

  try {
    const rows = await sql`
      SELECT id, user_id, care_home_id, title, description,
        to_char(event_date, 'YYYY-MM-DD') AS event_date,
        start_time::text, end_time::text, type,
        reminder_minutes, is_all_day, created_by
      FROM calendar_events
      WHERE id = ${id} AND user_id = ${user.id}
      LIMIT 1
    `

    if (rows.length === 0) return notFound('Event not found')

    return NextResponse.json(rows[0] as CalendarEvent)
  } catch (err) {
    console.error('[GET /api/calendar/[id]]', err)
    return serverError()
  }
}

// DELETE /api/calendar/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser(request)
  if (!user) return unauthorized()

  const { id } = await params
  const sql = getDb()

  try {
    const result = await sql`
      DELETE FROM calendar_events
      WHERE id = ${id} AND user_id = ${user.id}
      RETURNING id
    `

    if (result.length === 0) return notFound('Event not found')

    return new NextResponse(null, { status: 204 })
  } catch (err) {
    console.error('[DELETE /api/calendar/[id]]', err)
    return serverError()
  }
}

// PATCH /api/calendar/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser(request)
  if (!user) return unauthorized()

  const { id } = await params

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return validationError({ body: 'Invalid JSON' })
  }

  const sql = getDb()

  try {
    const rows = await sql`
      UPDATE calendar_events SET
        title            = COALESCE(${body.title as string | undefined ?? null}, title),
        description      = COALESCE(${body.description as string | undefined ?? null}, description),
        event_date       = COALESCE(${body.event_date as string | undefined ?? null}::date, event_date),
        start_time       = COALESCE(${body.start_time as string | undefined ?? null}::time, start_time),
        end_time         = COALESCE(${body.end_time as string | undefined ?? null}::time, end_time),
        type             = COALESCE(${body.type as string | undefined ?? null}, type),
        reminder_minutes = COALESCE(${body.reminder_minutes != null ? Number(body.reminder_minutes) : null}, reminder_minutes),
        is_all_day       = COALESCE(${body.is_all_day != null ? Boolean(body.is_all_day) : null}, is_all_day)
      WHERE id = ${id} AND user_id = ${user.id}
      RETURNING
        id, user_id, care_home_id, title, description,
        to_char(event_date, 'YYYY-MM-DD') AS event_date,
        start_time::text, end_time::text, type,
        reminder_minutes, is_all_day, created_by
    `

    if (rows.length === 0) return notFound('Event not found')

    return NextResponse.json(rows[0] as CalendarEvent)
  } catch (err) {
    console.error('[PATCH /api/calendar/[id]]', err)
    return serverError()
  }
}
