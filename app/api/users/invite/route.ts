import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { sql } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has admin permissions
    const adminUser = await sql`
      SELECT * FROM users 
      WHERE clerk_id = ${userId} 
      AND role IN ('super_admin', 'care_home_admin', 'manager')
      AND is_active = true
    `

    if (adminUser.length === 0) {
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
      contractType 
    } = body

    // Validate required fields
    if (!email || !firstName || !lastName || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' }, 
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await sql`
      SELECT * FROM users WHERE email = ${email}
    `

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'A user with this email already exists' }, 
        { status: 409 }
      )
    }

    // Create user in database (without clerk_id - will be linked on first sign-in)
    const newUser = await sql`
      INSERT INTO users (
        email, first_name, last_name, role, care_home_id,
        phone, job_title, department, hourly_rate, contract_hours, contract_type,
        is_active, is_verified
      ) VALUES (
        ${email}, ${firstName}, ${lastName}, ${role}, ${careHomeId || null},
        ${phone || null}, ${jobTitle || null}, ${department || null},
        ${hourlyRate || null}, ${contractHours || null}, ${contractType || null},
        true, false
      )
      RETURNING *
    `

    // Create Clerk invitation
    const client = await clerkClient()
    const invitation = await client.invitations.createInvitation({
      emailAddress: email,
      redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/sign-in`,
      publicMetadata: {
        dbUserId: newUser[0].id,
        role: role,
        careHomeId: careHomeId,
      },
    })

    // Log the action
    await sql`
      INSERT INTO audit_logs (care_home_id, user_id, action, entity_type, entity_id, new_values)
      VALUES (
        ${careHomeId || null}, 
        (SELECT id FROM users WHERE clerk_id = ${userId}),
        'user_invited',
        'user',
        ${newUser[0].id}::uuid,
        ${JSON.stringify({ email, firstName, lastName, role })}::jsonb
      )
    `

    return NextResponse.json({
      success: true,
      user: newUser[0],
      invitationId: invitation.id,
    })
  } catch (error) {
    console.error('Error inviting user:', error)
    return NextResponse.json(
      { error: 'Failed to invite user' }, 
      { status: 500 }
    )
  }
}
