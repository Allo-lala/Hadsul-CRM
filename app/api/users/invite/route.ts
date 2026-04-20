import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, isCareHomeAdmin } from '@/backend/lib/auth'
import { createPasswordResetToken } from '@/backend/lib/tokens'
import { sendWelcomeEmail } from '@/backend/lib/email'
import { sql } from '@/backend/lib/db'

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser(req)

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!isCareHomeAdmin(currentUser)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await req.json()
    const {
      email,
      firstName,
      lastName,
      role,
      careHomeId,
      phone,
      jobTitle,
      department,
      hourlyRate,
      contractHours,
      contractType,
    } = body

    if (!email || !firstName || !lastName || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Super admins can assign any care home; care home admins are restricted to their own
    const assignedCareHomeId =
      currentUser.role === 'super_admin'
        ? careHomeId || null
        : currentUser.care_home_id

    // Check for duplicate email
    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${email}
    `
    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 409 }
      )
    }

    // Create user record with no password hash and is_verified = false
    const newUser = await sql`
      INSERT INTO users (
        email, first_name, last_name, role, care_home_id,
        phone, job_title, department, hourly_rate, contract_hours, contract_type,
        is_active, is_verified
      ) VALUES (
        ${email}, ${firstName}, ${lastName}, ${role}, ${assignedCareHomeId},
        ${phone || null}, ${jobTitle || null}, ${department || null},
        ${hourlyRate || null}, ${contractHours || null}, ${contractType || null},
        true, false
      )
      RETURNING *
    `

    const created = newUser[0]

    // Generate a 24-hour setup token and send welcome email
    const rawToken = await createPasswordResetToken(created.id, 24)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const setupLink = `${appUrl}/reset-password?token=${rawToken}`

    await sendWelcomeEmail(email, `${firstName} ${lastName}`, setupLink)

    return NextResponse.json({ success: true, user: created })
  } catch (error) {
    console.error('Error inviting user:', error)
    return NextResponse.json({ error: 'Failed to invite user' }, { status: 500 })
  }
}
