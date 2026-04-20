import type { UserRole } from './auth'

export interface CareHome {
  id: string
  name: string
  address: string | null
  city: string | null
  postcode: string | null
  phone: string | null
  email: string | null
  cqc_rating: string | null
  cqc_registration_number: string | null
  capacity: number
  status: 'active' | 'inactive' | 'suspended'
  logo_url: string | null
  created_at: string
  // Computed/joined
  staff_count?: number
  clocked_in_count?: number
}

export interface StaffMember {
  id: string
  care_home_id: string | null
  email: string
  first_name: string
  last_name: string
  phone: string | null
  role: UserRole
  job_title: string | null
  department: string | null
  hourly_rate: number | null
  contract_hours: number | null
  contract_type: 'full_time' | 'part_time' | 'zero_hours' | 'bank' | 'agency' | null
  start_date: string | null
  profile_image_url: string | null
  is_active: boolean
  is_verified: boolean
  // Computed
  is_clocked_in?: boolean
  clock_in_time?: string | null
  hours_today?: number
  hours_this_week?: number
}

export interface ClockRecord {
  id: string
  user_id: string
  care_home_id: string
  clock_in_time: string
  clock_out_time: string | null
  total_hours_worked: number | null
  is_late?: boolean
  status: 'clocked_in' | 'on_break' | 'clocked_out' | 'adjusted'
  // Joined
  staff_name?: string
  staff_role?: string
}

export interface DashboardStats {
  total_staff: number
  clocked_in_now: number
  late_today: number
  hours_today: number
  // Super admin only
  total_care_homes?: number
  // Care home admin only
  expected_not_in?: number
}
