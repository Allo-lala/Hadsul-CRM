import { Header } from "@/components/dashboard/header"
import { KPICards } from "@/components/dashboard/kpi-cards"
import { HoursChart, ClockInChart, StaffDistributionChart, WeeklyTrendChart } from "@/components/dashboard/charts"
import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { UpcomingShifts } from "@/components/dashboard/upcoming-shifts"

export default function DashboardPage() {
  return (
    <div className="min-h-screen">
      <Header 
        title="Dashboard" 
        subtitle="Welcome back, John. Here's what's happening at Sunrise Care Home." 
      />
      
      <div className="p-6 space-y-6">
        {/* KPI Cards */}
        <KPICards />
        
        {/* Quick Actions */}
        <QuickActions />
        
        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-3">
          <HoursChart />
          <ClockInChart />
        </div>
        
        {/* Activity & Shifts Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          <ActivityFeed />
          <UpcomingShifts />
        </div>
        
        {/* Staff Distribution & Trend */}
        <div className="grid gap-6 lg:grid-cols-3">
          <StaffDistributionChart />
          <div className="lg:col-span-2">
            <WeeklyTrendChart />
          </div>
        </div>
      </div>
    </div>
  )
}
