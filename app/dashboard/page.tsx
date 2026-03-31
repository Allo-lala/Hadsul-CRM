import { cookies } from 'next/headers'
import { Header } from "@/components/dashboard/header"
import { KPICards } from "@/components/dashboard/kpi-cards"
import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { LiveAttendance } from "@/components/dashboard/live-attendance"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { getCurrentUser, isSuperAdmin } from '@/lib/auth'
import type { DashboardStats } from '@/lib/types'
import type { ActivityEvent } from '@/components/dashboard/activity-feed'
import type { CareHome } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, Users, Clock } from 'lucide-react'

async function fetchStats(cookieHeader: string): Promise<DashboardStats | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/api/dashboard/stats`, {
      headers: { cookie: cookieHeader },
      cache: 'no-store',
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

async function fetchActivity(cookieHeader: string): Promise<ActivityEvent[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/api/dashboard/activity`, {
      headers: { cookie: cookieHeader },
      cache: 'no-store',
    })
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

async function fetchCareHomes(cookieHeader: string): Promise<CareHome[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/api/care-homes`, {
      headers: { cookie: cookieHeader },
      cache: 'no-store',
    })
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const cookieHeader = cookieStore.toString()

  const user = await getCurrentUser()
  const superAdmin = isSuperAdmin(user)

  const [stats, activity, careHomes] = await Promise.all([
    fetchStats(cookieHeader),
    fetchActivity(cookieHeader),
    superAdmin ? fetchCareHomes(cookieHeader) : Promise.resolve([]),
  ])

  const firstName = user?.first_name ?? 'there'
  const subtitle = superAdmin
    ? `Welcome back, ${firstName}. Here's your platform overview.`
    : `Welcome back, ${firstName}. Here's what's happening today.`

  return (
    <div className="min-h-screen">
      <Header title="Dashboard" subtitle={subtitle} />

      <div className="p-6 space-y-6">
        {/* KPI Cards — Requirements 5.1, 6.1 */}
        <KPICards data={stats ? { ...stats, isSuperAdmin: superAdmin } : undefined} />

        {/* Quick Actions */}
        <QuickActions />

        {/* Live Attendance for care home admins — Requirement 5.2 */}
        {!superAdmin && (
          <LiveAttendance />
        )}

        {/* Super admin: per-care-home summary — Requirement 6.2 */}
        {superAdmin && careHomes.length > 0 && (
          <div>
            <h2 className="mb-3 text-base font-semibold text-foreground">Care Homes Overview</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {careHomes.map((home) => (
                <Card key={home.id} className="border">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                      <Building2 className="h-4 w-4 text-primary" />
                      {home.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex gap-6 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {home.staff_count ?? 0} staff
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {home.clocked_in_count ?? 0} clocked in
                    </span>
                    <span>
                      {home.capacity > 0
                        ? `${Math.round(((home.clocked_in_count ?? 0) / home.capacity) * 100)}% occupancy`
                        : '—'}
                    </span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Activity Feed — Requirement 6.3 */}
        <div className="grid gap-6 lg:grid-cols-2">
          <ActivityFeed events={activity} />
        </div>
      </div>
    </div>
  )
}
