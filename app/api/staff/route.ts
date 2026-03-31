import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getCurrentUser, isCareHomeAdmin } from '@/lib/auth'
import { unauthorized, forbidden, conflict, validationError, serverError } from '@/lib/api'
import { createPasswordResetToken } from '@/lib/tokens'
import { sendWelcomeEmail } from '@/lib/email'
import type { StaffMember } from '@/lib/types'

// GET /api/staff
// super_admin: returns all staff across all care homes
// care_home_admin/manager: returns only staff in their care home
export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request)
  if (!user) return unauthorized()
  if (!isCareHomeAdmin(user)) return forbidden()

  try {
    const rows = user.role === 'super_admin'
      ? await sql`
          SELECT
            u.id, u.care_home_id, u.email, u.first_name, u.last_name, u.phone,
            u.role, u.job_title, u.department, u.hourly_rate, u.contract_hours,
            u.contract_type, u.is_active, u.is_verified, u.start_date,
            CASE WHEN cr_open.id IS NOT NULL THEN true ELSE false END AS is_clocked_in,
            cr_open.clock_in_time,
            COALESCE(
              EXTRACT(EPOCH FROM (NOW() - cr_today.clock_in_time)) / 3600.0, 0
            )::numeric(5,2) AS hours_today,
            COALESCE(
              (
                SELECT SUM(total_hours_worked)
                FROM clock_records
                WHERE user_id = u.id
                  AND clock_in_time >= date_trunc('week', NOW())
                  AND clock_out_time IS NOT NULL
              ), 0
            )::numeric(5,2) AS hours_this_week
          FROM users u
          LEFT JOIN clock_records cr_open
            ON cr_open.user_id = u.id AND cr_open.clock_out_time IS NULL
          LEFT JOIN clock_records cr_today
            ON cr_today.user_id = u.id
            AND cr_today.clock_in_time >= CURRENT_DATE
            AND cr_today.clock_out_time IS NULL
          WHERE u.role NOT IN ('super_admin', 'care_home_admin')
          ORDER BY u.last_name ASC, u.first_name ASC
        `
      : await sql`
          SELECT
            u.id, u.care_home_id, u.email, u.first_name, u.last_name, u.phone,
            u.role, u.job_title, u.department, u.hourly_rate, u.contract_hours,
            u.contract_type, u.is_active, u.is_verified, u.start_date,
            CASE WHEN cr_open.id IS NOT NULL THEN true ELSE false END AS is_clocked_in,
            cr_open.clock_in_time,
            COALESCE(
              EXTRACT(EPOCH FROM (NOW() - cr_today.clock_in_time)) / 3600.0, 0
            )::numeric(5,2) AS hours_today,
            COALESCE(
              (
                SELECT SUM(total_hours_worked)
                FROM clock_records
                WHERE user_id = u.id
                  AND clock_in_time >= date_trunc('week', NOW())
                  AND clock_out_time IS NOT NULL
              ), 0
            )::numeric(5,2) AS hours_this_week
          FROM users u
          LEFT JOIN clock_records cr_open
            ON cr_open.user_id = u.id AND cr_open.clock_out_time IS NULL
          LEFT JOIN clock_records cr_today
            ON cr_today.user_id = u.id
            AND cr_today.clock_in_time >= CURRENT_DATE
            AND cr_today.clock_out_time IS NULL
          WHERE u.care_home_id = ${user.care_home_id}
            AND u.role NOT IN ('super_admin', 'care_home_admin')
          ORDER BY u.last_name ASC, u.first_name ASC
        `

    return NextResponse.json(rows as StaffMember[])
  } catch (err) {
    console.error('[GET /api/staff]', err)
    return serverError()
  }
}

// POST /api/staff
// Creates a new staff member scoped to the admin's care home (or specified care_home_id for super_admin)
// Sets is_verified=false, password_hash=null, generates 24h setup token, sends welcome email
export async function POST(request: NextRequest) {
  const user = await getCurrentUser(request)
  if (!user) return unauthorized()
  if (!isCareHomeAdmin(user)) return forbidden()

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return validationError({ body: 'Invalid JSON' })
  }

  // Validate required fields (Requirement 3.1)
  const errors: Record<string, string> = {}
  if (!body.first_name || typeof body.first_name !== 'string' || !body.first_name.trim())
    errors.first_name = 'First name is required'
  if (!body.last_name || typeof body.last_name !== 'string' || !body.last_name.trim())
    errors.last_name = 'Last name is required'
  if (!body.email || typeof body.email !== 'string' || !body.email.trim())
    errors.email = 'Email is required'
  if (!body.role || typeof body.role !== 'string' || !body.role.trim())
    errors.role = 'Role is required'

  if (Object.keys(errors).length > 0) return validationError(errors)

  // Scope care_home_id: super_admin can specify, others use their own
  const careHomeId =
    user.role === 'super_admin'
      ? (body.care_home_id as string | undefined) ?? null
      : user.care_home_id

  if (!careHomeId) {
    return validationError({ care_home_id: 'Care home is required' })
  }

  try {
    // Check for duplicate email (Requirement 3.5)
    const existing = await sql`
      SELECT id FROM users WHERE email = ${(body.email as string).trim().toLowerCase()} LIMIT 1
    `
    if (existing.length > 0) {
      return conflict('A user with this email already exists')
    }

    // Create user with is_verified=false and no password_hash (Requirement 3.1)
    const rows = await sql`
      INSERT INTO users (
        email, first_name, last_name, role, care_home_id,
        phone, job_title, department, hourly_rate, contract_hours, contract_type,
        profile_image_url, is_active, is_verified, password_hash
      ) VALUES (
        ${(body.email as string).trim().toLowerCase()},
        ${(body.first_name as string).trim()},
        ${(body.last_name as string).trim()},
        ${(body.role as string).trim()},
        ${careHomeId},
        ${(body.phone as string | undefined) ?? null},
        ${(body.job_title as string | undefined) ?? null},
        ${(body.department as string | undefined) ?? null},
        ${body.hourly_rate != null ? Number(body.hourly_rate) : null},
        ${body.contract_hours != null ? Number(body.contract_hours) : null},
        ${(body.contract_type as string | undefined) ?? null},
        ${(body.profile_image_url as string | undefined) ?? null},
        true,
        false,
        null
      )
      RETURNING *
    `

    const created = rows[0] as { id: string; email: string; first_name: string; last_name: string }

    // Generate 24h setup token and send welcome email (Requirement 3.1)
    const rawToken = await createPasswordResetToken(created.id, 24)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const setupLink = `${appUrl}/reset-password?token=${rawToken}`

    await sendWelcomeEmail(
      created.email,
      `${created.first_name} ${created.last_name}`,
      setupLink
    )

    return NextResponse.json(created as StaffMember, { status: 201 })
  } catch (err) {
    console.error('[POST /api/staff]', err)
    return serverError()
  }
}
