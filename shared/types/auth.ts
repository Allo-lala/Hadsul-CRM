export type UserRole =
  | 'super_admin'
  | 'care_home_admin'
  | 'manager'
  | 'senior_carer'
  | 'carer'
  | 'nurse'
  | 'domestic'
  | 'kitchen'
  | 'maintenance'
  | 'admin_staff'

export interface DbUser {
  id: string
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
  password_hash: string | null
}

export interface SessionPayload {
  userId: string
  email: string
  role: UserRole
  careHomeId: string | null
  iat?: number
  exp?: number
}
