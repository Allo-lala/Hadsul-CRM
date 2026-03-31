import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { unauthorized, serverError } from '@/lib/api'

export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'error' | 'success' | 'task' | 'shift' | 'incident'
  is_read: boolean
  created_at: string
}

function isTimeoutError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err)
  return msg.includes('ETIMEDOUT') || msg.includes('ConnectTimeoutError') || msg.includes('fetch failed')
}

async function queryNotifications(userId: string) {
  const db = getDb()
  const rows = await db`
    SELECT id, title, message, type, is_read, created_at
    FROM notifications
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
    LIMIT 50
  `
  return rows as Notification[]
}

// GET /api/notifications
export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request)
  if (!user) return unauthorized()

  try {
    return NextResponse.json(await queryNotifications(user.id))
  } catch (err) {
    if (isTimeoutError(err)) {
      try {
        await new Promise(r => setTimeout(r, 700))
        return NextResponse.json(await queryNotifications(user.id))
      } catch (err2) {
        console.error('[GET /api/notifications] retry failed', err2)
        return serverError()
      }
    }
    console.error('[GET /api/notifications]', err)
    return serverError()
  }
}

// PATCH /api/notifications — mark all as read
export async function PATCH(request: NextRequest) {
  const user = await getCurrentUser(request)
  if (!user) return unauthorized()

  const db = getDb()
  try {
    await db`UPDATE notifications SET is_read = true WHERE user_id = ${user.id}`
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[PATCH /api/notifications]', err)
    return serverError()
  }
}
