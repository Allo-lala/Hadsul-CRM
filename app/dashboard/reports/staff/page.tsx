"use client"

import { Header } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  Users,
  FileSignature,
  Download,
  Star,
} from "lucide-react"
import { cn } from "@/lib/utils"

const completionData = [
  { name: "Sarah Johnson", initials: "SJ", tasks: 98, clockIn: 100, signatures: 95, overall: 97 },
  { name: "Mike Peters", initials: "MP", tasks: 92, clockIn: 85, signatures: 88, overall: 88 },
  { name: "Emma Davis", initials: "ED", tasks: 96, clockIn: 98, signatures: 100, overall: 98 },
  { name: "Tom Wilson", initials: "TW", tasks: 78, clockIn: 72, signatures: 80, overall: 77 },
  { name: "Lisa Brown", initials: "LB", tasks: 100, clockIn: 100, signatures: 100, overall: 100 },
  { name: "Rachel Green", initials: "RG", tasks: 94, clockIn: 96, signatures: 92, overall: 94 },
  { name: "James Taylor", initials: "JT", tasks: 88, clockIn: 90, signatures: 85, overall: 88 },
]

const weeklyTrend = [
  { week: "Week 1", onTime: 156, late: 8, early: 12 },
  { week: "Week 2", onTime: 162, late: 5, early: 9 },
  { week: "Week 3", onTime: 158, late: 10, early: 8 },
  { week: "Week 4", onTime: 168, late: 4, early: 6 },
]

const overdueSignatures = [
  { id: "1", staffName: "Tom Wilson", staffInitials: "TW", document: "Care Plan - Mrs. Thompson", dueDate: "Mar 20", daysOverdue: 4 },
  { id: "2", staffName: "Mike Peters", staffInitials: "MP", document: "Medication Log - Wing B", dueDate: "Mar 22", daysOverdue: 2 },
  { id: "3", staffName: "James Taylor", staffInitials: "JT", document: "Safety Checklist", dueDate: "Mar 23", daysOverdue: 1 },
]

const getScoreColor = (score: number) => {
  if (score >= 95) return "text-success"
  if (score >= 85) return "text-chart-1"
  if (score >= 70) return "text-warning"
  return "text-destructive"
}

const getProgressColor = (score: number) => {
  if (score >= 95) return "bg-success"
  if (score >= 85) return "bg-chart-1"
  if (score >= 70) return "bg-warning"
  return "bg-destructive"
}

export default function StaffReportsPage() {
  return (
    <div className="min-h-screen">
      <Header title="Staff Reports" subtitle="Staff performance and compliance metrics" />

      <div className="p-6 space-y-6">
        {/* Overview Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Avg Completion Score</p>
                  <p className="text-3xl font-bold tracking-tight text-success">92%</p>
                  <p className="text-xs text-muted-foreground">Across all staff</p>
                </div>
                <div className="rounded-xl bg-success/10 p-3">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Clock-in Integrity</p>
                  <p className="text-3xl font-bold tracking-tight text-chart-1">94%</p>
                  <p className="text-xs text-muted-foreground">On-time arrivals</p>
                </div>
                <div className="rounded-xl bg-chart-1/10 p-3">
                  <Clock className="h-5 w-5 text-chart-1" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Overdue Signatures</p>
                  <p className="text-3xl font-bold tracking-tight text-warning">3</p>
                  <p className="text-xs text-muted-foreground">Requires attention</p>
                </div>
                <div className="rounded-xl bg-warning/10 p-3">
                  <FileSignature className="h-5 w-5 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Top Performers</p>
                  <p className="text-3xl font-bold tracking-tight text-primary">12</p>
                  <p className="text-xs text-muted-foreground">Score above 95%</p>
                </div>
                <div className="rounded-xl bg-primary/10 p-3">
                  <Star className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Clock-in Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Clock-in Trends</CardTitle>
              <CardDescription>Weekly attendance breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyTrend}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="week" tick={{ fill: "var(--muted-foreground)" }} />
                    <YAxis tick={{ fill: "var(--muted-foreground)" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: "var(--radius)",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="onTime" fill="var(--chart-1)" name="On Time" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="late" fill="var(--chart-5)" name="Late" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="early" fill="var(--chart-3)" name="Early" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Overdue Signatures */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Overdue Signatures</CardTitle>
                  <CardDescription>Documents requiring signatures</CardDescription>
                </div>
                <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
                  {overdueSignatures.length} Pending
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {overdueSignatures.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg border border-warning/30 bg-warning/5 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-warning/20 text-warning text-xs">
                          {item.staffInitials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{item.staffName}</p>
                        <p className="text-sm text-muted-foreground">{item.document}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">
                        {item.daysOverdue} days overdue
                      </Badge>
                      <p className="mt-1 text-xs text-muted-foreground">Due: {item.dueDate}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Completion Scores Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Staff Completion Scores</CardTitle>
                <CardDescription>Individual performance metrics</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Select defaultValue="all">
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Staff</SelectItem>
                    <SelectItem value="nurses">Nurses</SelectItem>
                    <SelectItem value="care-assistants">Care Assistants</SelectItem>
                    <SelectItem value="support">Support Staff</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff Member</TableHead>
                    <TableHead>Task Completion</TableHead>
                    <TableHead>Clock-in Integrity</TableHead>
                    <TableHead>Signatures</TableHead>
                    <TableHead>Overall Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {completionData.map((staff) => (
                    <TableRow key={staff.name}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary/10 text-xs text-primary">
                              {staff.initials}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{staff.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Progress value={staff.tasks} className={cn("h-2 w-20", getProgressColor(staff.tasks))} />
                          <span className={cn("text-sm font-medium", getScoreColor(staff.tasks))}>
                            {staff.tasks}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Progress value={staff.clockIn} className={cn("h-2 w-20", getProgressColor(staff.clockIn))} />
                          <span className={cn("text-sm font-medium", getScoreColor(staff.clockIn))}>
                            {staff.clockIn}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Progress value={staff.signatures} className={cn("h-2 w-20", getProgressColor(staff.signatures))} />
                          <span className={cn("text-sm font-medium", getScoreColor(staff.signatures))}>
                            {staff.signatures}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "font-semibold",
                            staff.overall >= 95
                              ? "bg-success/10 text-success border-success/30"
                              : staff.overall >= 85
                              ? "bg-chart-1/10 text-chart-1 border-chart-1/30"
                              : staff.overall >= 70
                              ? "bg-warning/10 text-warning border-warning/30"
                              : "bg-destructive/10 text-destructive border-destructive/30"
                          )}
                        >
                          {staff.overall}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
