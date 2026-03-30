"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Clock,
  LogIn,
  LogOut,
  MapPin,
  Calendar,
  Timer,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Coffee,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface ClockRecord {
  id: string
  staffName: string
  staffInitials: string
  action: "clock-in" | "clock-out" | "break-start" | "break-end"
  time: string
  date: string
  location: string
  status: "on-time" | "late" | "early"
  shift: string
}

const clockRecords: ClockRecord[] = [
  {
    id: "1",
    staffName: "Sarah Johnson",
    staffInitials: "SJ",
    action: "clock-in",
    time: "06:58 AM",
    date: "Today",
    location: "Main Entrance",
    status: "on-time",
    shift: "Morning (07:00 - 15:00)",
  },
  {
    id: "2",
    staffName: "Mike Peters",
    staffInitials: "MP",
    action: "clock-in",
    time: "07:15 AM",
    date: "Today",
    location: "Side Entrance",
    status: "late",
    shift: "Morning (07:00 - 15:00)",
  },
  {
    id: "3",
    staffName: "Lisa Brown",
    staffInitials: "LB",
    action: "clock-in",
    time: "06:45 AM",
    date: "Today",
    location: "Main Entrance",
    status: "early",
    shift: "Morning (07:00 - 15:00)",
  },
  {
    id: "4",
    staffName: "James Taylor",
    staffInitials: "JT",
    action: "clock-in",
    time: "08:00 AM",
    date: "Today",
    location: "Main Entrance",
    status: "on-time",
    shift: "Day (08:00 - 16:00)",
  },
  {
    id: "5",
    staffName: "Emma Davis",
    staffInitials: "ED",
    action: "clock-out",
    time: "03:05 PM",
    date: "Yesterday",
    location: "Main Entrance",
    status: "on-time",
    shift: "Morning (07:00 - 15:00)",
  },
  {
    id: "6",
    staffName: "Rachel Green",
    staffInitials: "RG",
    action: "clock-out",
    time: "06:00 AM",
    date: "Today",
    location: "Side Entrance",
    status: "on-time",
    shift: "Night (22:00 - 06:00)",
  },
]

const myShift = {
  date: "Today",
  time: "07:00 AM - 03:00 PM",
  role: "Senior Nurse",
  location: "Wing A",
  status: "in-progress",
  clockedIn: true,
  clockInTime: "06:58 AM",
  hoursWorked: 5.5,
  totalHours: 8,
  breaksTaken: 1,
  breakMinutes: 30,
}

const statusStyles = {
  "on-time": "bg-success/10 text-success border-success/30",
  late: "bg-destructive/10 text-destructive border-destructive/30",
  early: "bg-warning/10 text-warning border-warning/30",
}

const statusLabels = {
  "on-time": "On Time",
  late: "Late",
  early: "Early",
}

const actionIcons = {
  "clock-in": LogIn,
  "clock-out": LogOut,
  "break-start": Coffee,
  "break-end": Coffee,
}

export default function ClockPage() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isClockedIn, setIsClockedIn] = useState(myShift.clockedIn)
  const [isOnBreak, setIsOnBreak] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const progress = (myShift.hoursWorked / myShift.totalHours) * 100

  return (
    <div className="min-h-screen">
      <Header title="Clock In / Out" subtitle="Track your working hours and breaks" />

      <div className="p-6 space-y-6">
        {/* Current Time & Clock Actions */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Clock Widget */}
          <Card className="lg:col-span-1">
            <CardContent className="flex flex-col items-center justify-center p-8">
              <div className="mb-6 text-center">
                <p className="text-6xl font-bold tracking-tight text-foreground">
                  {currentTime.toLocaleTimeString("en-GB", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                <p className="mt-2 text-lg text-muted-foreground">
                  {currentTime.toLocaleDateString("en-GB", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </p>
              </div>

              <div className="flex w-full flex-col gap-3">
                {!isClockedIn ? (
                  <Button
                    size="lg"
                    className="h-14 text-lg"
                    onClick={() => setIsClockedIn(true)}
                  >
                    <LogIn className="mr-2 h-5 w-5" />
                    Clock In
                  </Button>
                ) : (
                  <>
                    <Button
                      size="lg"
                      variant={isOnBreak ? "default" : "outline"}
                      className="h-12"
                      onClick={() => setIsOnBreak(!isOnBreak)}
                    >
                      <Coffee className="mr-2 h-5 w-5" />
                      {isOnBreak ? "End Break" : "Start Break"}
                    </Button>
                    <Button
                      size="lg"
                      variant="destructive"
                      className="h-14 text-lg"
                      onClick={() => setIsClockedIn(false)}
                    >
                      <LogOut className="mr-2 h-5 w-5" />
                      Clock Out
                    </Button>
                  </>
                )}
              </div>

              {isClockedIn && (
                <div className="mt-6 flex items-center gap-2 text-sm text-success">
                  <CheckCircle2 className="h-4 w-4" />
                  Clocked in at {myShift.clockInTime}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Today's Shift */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Today&apos;s Shift</CardTitle>
              <CardDescription>Your scheduled shift and progress</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Shift Time</p>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="font-medium">{myShift.time}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Role</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span className="font-medium">{myShift.role}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Location</p>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span className="font-medium">{myShift.location}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge className="bg-success/10 text-success border-success/30">
                    In Progress
                  </Badge>
                </div>
              </div>

              {/* Progress */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Shift Progress</span>
                  <span className="text-sm font-medium">
                    {myShift.hoursWorked}h / {myShift.totalHours}h
                  </span>
                </div>
                <Progress value={progress} className="h-3" />
              </div>

              {/* Stats */}
              <div className="grid gap-4 sm:grid-cols-3">
                <Card className="bg-muted/50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Timer className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{myShift.hoursWorked}h</p>
                        <p className="text-xs text-muted-foreground">Hours Worked</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-muted/50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                        <Coffee className="h-5 w-5 text-warning" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{myShift.breakMinutes}m</p>
                        <p className="text-xs text-muted-foreground">Break Time</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-muted/50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                        <TrendingUp className="h-5 w-5 text-success" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">38.5h</p>
                        <p className="text-xs text-muted-foreground">This Week</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Clock History */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Clock History</CardTitle>
                <CardDescription>Recent clock in/out records across all staff</CardDescription>
              </div>
              <Tabs defaultValue="all" className="w-auto">
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="today">Today</TabsTrigger>
                  <TabsTrigger value="late">Late</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff Member</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Shift</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clockRecords.map((record) => {
                    const ActionIcon = actionIcons[record.action]
                    return (
                      <TableRow key={record.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-primary/10 text-xs text-primary">
                                {record.staffInitials}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{record.staffName}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <ActionIcon
                              className={cn(
                                "h-4 w-4",
                                record.action === "clock-in" ? "text-success" : "text-muted-foreground"
                              )}
                            />
                            <span className="capitalize">{record.action.replace("-", " ")}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{record.time}</p>
                            <p className="text-xs text-muted-foreground">{record.date}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {record.shift}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {record.location}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={statusStyles[record.status]}>
                            {statusLabels[record.status]}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
