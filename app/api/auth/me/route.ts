import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { unauthorized } from '@/lib/api'

// GET /api/auth/me
// Returns the current authenticated user's id, name, role, and care_home_id
export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request)
  if (!user) return unauthorized()

  return NextResponse.json({
    id: user.id,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    role: user.role,
    care_home_id: user.care_home_id,
  })
}
