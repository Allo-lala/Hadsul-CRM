import { auth, currentUser } from '@clerk/nextjs/server'
import { sql } from './db'

export type UserRole = 'super_admin' | 'care_home_admin' | 'manager' | 'senior_carer' | 'carer' | 'nurse' | 'domestic' | 'kitchen' | 'maintenance' | 'admin_staff'

export interface DbUser {
  id: string
  clerk_id: string
  care_home_id: string | null
  email: string
  first_name: string
  last_name: string
  phone: string | null
  role: UserRole
  job_title: string | null
  department: string | null
  is_active: boolean
  is_verified: boolean
}

// Get the current user from the database using Clerk auth
export async function getCurrentUser(): Promise<DbUser | null> {
  const { userId } = await auth()
  
  if (!userId) {
    return null
  }

  try {
    const users = await sql`
      SELECT * FROM users WHERE clerk_id = ${userId} AND is_active = true
    `
    return users[0] as DbUser || null
  } catch {
    return null
  }
}

// Check if user has required role
export function hasRole(user: DbUser | null, allowedRoles: UserRole[]): boolean {
  if (!user) return false
  return allowedRoles.includes(user.role)
}

// Check if user is a super admin
export function isSuperAdmin(user: DbUser | null): boolean {
  return hasRole(user, ['super_admin'])
}

// Check if user is a care home admin or higher
export function isCareHomeAdmin(user: DbUser | null): boolean {
  return hasRole(user, ['super_admin', 'care_home_admin', 'manager'])
}

// Check if user is staff (non-admin)
export function isStaff(user: DbUser | null): boolean {
  return hasRole(user, ['senior_carer', 'carer', 'nurse', 'domestic', 'kitchen', 'maintenance', 'admin_staff'])
}

// Get user's care home ID (for multi-tenant queries)
export async function getUserCareHomeId(): Promise<string | null> {
  const user = await getCurrentUser()
  return user?.care_home_id || null
}

// Sync Clerk user with database
export async function syncUserWithDatabase(clerkUserId: string): Promise<DbUser | null> {
  const clerkUser = await currentUser()
  
  if (!clerkUser) return null

  const email = clerkUser.emailAddresses[0]?.emailAddress
  if (!email) return null

  // Check if user exists
  const existingUsers = await sql`
    SELECT * FROM users WHERE clerk_id = ${clerkUserId}
  `

  if (existingUsers.length > 0) {
    // Update last login
    await sql`
      UPDATE users SET last_login_at = NOW() WHERE clerk_id = ${clerkUserId}
    `
    return existingUsers[0] as DbUser
  }

  // User doesn't exist - they need to be invited by an admin
  return null
}

// Create a new user (admin only - for invitation flow)
export async function createUser(data: {
  email: string
  firstName: string
  lastName: string
  role: UserRole
  careHomeId: string | null
  phone?: string
  jobTitle?: string
  department?: string
  hourlyRate?: number
  contractHours?: number
  contractType?: string
}): Promise<DbUser> {
  const result = await sql`
    INSERT INTO users (
      email, first_name, last_name, role, care_home_id, 
      phone, job_title, department, hourly_rate, contract_hours, contract_type
    ) VALUES (
      ${data.email}, ${data.firstName}, ${data.lastName}, ${data.role}, ${data.careHomeId},
      ${data.phone || null}, ${data.jobTitle || null}, ${data.department || null}, 
      ${data.hourlyRate || null}, ${data.contractHours || null}, ${data.contractType || null}
    )
    RETURNING *
  `
  return result[0] as DbUser
}

// Link Clerk user to database user after sign-in
export async function linkClerkUser(clerkUserId: string, email: string): Promise<DbUser | null> {
  const result = await sql`
    UPDATE users 
    SET clerk_id = ${clerkUserId}, is_verified = true, last_login_at = NOW()
    WHERE email = ${email} AND clerk_id IS NULL
    RETURNING *
  `
  return result[0] as DbUser || null
}
