import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/backend/lib/db'
import { getCurrentUser } from '@/backend/lib/auth'
import { unauthorized, validationError, serverError } from '@/backend/lib/api'

export interface SupportMessage {
  id: string
  sender_id: string
  sender_name: string
  sender_role: string
  message: string
  created_at: string
  is_from_staff: boolean
}

// GET /api/support — get conversation between this staff and their care home admin
export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request)
  if (!user) return unauthorized()

  if (!user.care_home_id) return NextResponse.json([])

  const db = getDb()
  try {
    const rows = await db`
      SELECT
        sm.id,
        sm.sender_id,
        u.first_name || ' ' || u.last_name AS sender_name,
        u.role AS sender_role,
        sm.message,
        sm.created_at,
        CASE WHEN u.role NOT IN ('super_admin','care_home_admin','manager') THEN true ELSE false END AS is_from_staff
      FROM support_messages sm
      JOIN users u ON u.id = sm.sender_id
      WHERE sm.care_home_id = ${user.care_home_id}
        AND (sm.staff_id = ${user.id} OR sm.sender_id = ${user.id})
      ORDER BY sm.created_at ASC
      LIMIT 100
    `
    return NextResponse.json(rows as SupportMessage[])
  } catch (err) {
    console.error('[GET /api/support]', err)
    return serverError()
  }
}

// POST /api/support — send a message to the care home admin
export async function POST(request: NextRequest) {
  const user = await getCurrentUser(request)
  if (!user) return unauthorized()

  if (!user.care_home_id) return validationError({ care_home_id: 'Not assigned to a care home' })

  let body: { message?: string }
  try { body = await request.json() } catch { return validationError({ body: 'Invalid JSON' }) }

  if (!body.message?.trim()) return validationError({ message: 'Message is required' })

  const db = getDb()
  try {
    // Ensure support_messages table exists (created lazily)
    await db`
      CREATE TABLE IF NOT EXISTS support_messages (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        care_home_id UUID NOT NULL REFERENCES care_homes(id) ON DELETE CASCADE,
        staff_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        message TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `

    const rows = await db`
      INSERT INTO support_messages (care_home_id, staff_id, sender_id, message)
      VALUES (${user.care_home_id}, ${user.id}, ${user.id}, ${body.message!.trim()})
      RETURNING id, sender_id, message, created_at
    `

    // Notify care home admins
    const admins = await db`
      SELECT id FROM users
      WHERE care_home_id = ${user.care_home_id}
        AND role IN ('care_home_admin','manager')
        AND is_active = true
      LIMIT 5
    `
    const staffName = `${user.first_name} ${user.last_name}`
    for (const admin of admins) {
      await db`
        INSERT INTO notifications (user_id, care_home_id, title, message, type)
        VALUES (${admin.id as string}, ${user.care_home_id}, 'New message from staff',
          ${`${staffName} sent you a message`}, 'info')
      `
    }

    return NextResponse.json({ ...rows[0], sender_name: staffName, sender_role: user.role, is_from_staff: true }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/support]', err)
    return serverError()
  }
}
