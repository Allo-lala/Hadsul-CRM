"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"

const hoursData = [
  { day: "Mon", scheduled: 420, worked: 415, overtime: 12 },
  { day: "Tue", scheduled: 385, worked: 390, overtime: 8 },
  { day: "Wed", scheduled: 410, worked: 408, overtime: 15 },
  { day: "Thu", scheduled: 395, worked: 385, overtime: 5 },
  { day: "Fri", scheduled: 430, worked: 425, overtime: 18 },
  { day: "Sat", scheduled: 380, worked: 382, overtime: 10 },
  { day: "Sun", scheduled: 350, worked: 345, overtime: 6 },
]

const clockInData = [
  { time: "06:00", onTime: 12, late: 1 },
  { time: "07:00", onTime: 28, late: 3 },
  { time: "08:00", onTime: 15, late: 2 },
  { time: "14:00", onTime: 22, late: 1 },
  { time: "15:00", onTime: 18, late: 0 },
  { time: "22:00", onTime: 14, late: 2 },
]

const staffDistribution = [
  { name: "Nurses", value: 35, color: "var(--chart-1)" },
  { name: "Care Assistants", value: 65, color: "var(--chart-2)" },
  { name: "Support Staff", value: 28, color: "var(--chart-3)" },
  { name: "Admin", value: 12, color: "var(--chart-4)" },
  { name: "Management", value: 8, color: "var(--chart-5)" },
]

const weeklyTrend = [
  { week: "Week 1", tasks: 156, incidents: 4, reviews: 12 },
  { week: "Week 2", tasks: 168, incidents: 2, reviews: 8 },
  { week: "Week 3", tasks: 145, incidents: 5, reviews: 15 },
  { week: "Week 4", tasks: 172, incidents: 1, reviews: 10 },
]

export function HoursChart() {
  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader>
        <CardTitle>Weekly Hours Overview</CardTitle>
        <CardDescription>Scheduled vs actual hours worked this week</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={hoursData}>
              <defs>
                <linearGradient id="scheduled" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="worked" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="day" className="text-xs" tick={{ fill: "var(--muted-foreground)" }} />
              <YAxis className="text-xs" tick={{ fill: "var(--muted-foreground)" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                }}
                labelStyle={{ color: "var(--foreground)" }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="scheduled"
                stroke="var(--chart-1)"
                fill="url(#scheduled)"
                strokeWidth={2}
                name="Scheduled"
              />
              <Area
                type="monotone"
                dataKey="worked"
                stroke="var(--chart-2)"
                fill="url(#worked)"
                strokeWidth={2}
                name="Worked"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

export function ClockInChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Clock-in Analytics</CardTitle>
        <CardDescription>On-time vs late arrivals by shift</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={clockInData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="time" className="text-xs" tick={{ fill: "var(--muted-foreground)" }} />
              <YAxis className="text-xs" tick={{ fill: "var(--muted-foreground)" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                }}
                labelStyle={{ color: "var(--foreground)" }}
              />
              <Legend />
              <Bar dataKey="onTime" fill="var(--chart-1)" name="On Time" radius={[4, 4, 0, 0]} />
              <Bar dataKey="late" fill="var(--chart-5)" name="Late" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

export function StaffDistributionChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Staff Distribution</CardTitle>
        <CardDescription>Breakdown by role type</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={staffDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={4}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {staffDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                }}
                labelStyle={{ color: "var(--foreground)" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex flex-wrap justify-center gap-4">
          {staffDistribution.map((item) => (
            <div key={item.name} className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-xs text-muted-foreground">{item.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function WeeklyTrendChart() {
  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Monthly Activity Trend</CardTitle>
        <CardDescription>Tasks completed, incidents reported, and reviews conducted</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weeklyTrend}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="week" className="text-xs" tick={{ fill: "var(--muted-foreground)" }} />
              <YAxis className="text-xs" tick={{ fill: "var(--muted-foreground)" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                }}
                labelStyle={{ color: "var(--foreground)" }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="tasks"
                stroke="var(--chart-1)"
                strokeWidth={2}
                dot={{ fill: "var(--chart-1)", strokeWidth: 2 }}
                name="Tasks Completed"
              />
              <Line
                type="monotone"
                dataKey="incidents"
                stroke="var(--chart-5)"
                strokeWidth={2}
                dot={{ fill: "var(--chart-5)", strokeWidth: 2 }}
                name="Incidents"
              />
              <Line
                type="monotone"
                dataKey="reviews"
                stroke="var(--chart-2)"
                strokeWidth={2}
                dot={{ fill: "var(--chart-2)", strokeWidth: 2 }}
                name="Reviews"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
