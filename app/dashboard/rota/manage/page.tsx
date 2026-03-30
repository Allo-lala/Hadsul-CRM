"use client"

import { useState } from "react"
import { Header } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar,
  Users,
  Clock,
  AlertTriangle,
  Download,
  Filter,
} from "lucide-react"
import { cn } from "@/lib/utils"

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const dates = ["24", "25", "26", "27", "28", "29", "30"]
const fullDates = ["Mar 24", "Mar 25", "Mar 26", "Mar 27", "Mar 28", "Mar 29", "Mar 30"]

interface StaffShift {
  id: string
  staffName: string
  staffInitials: string
  role: string
  shifts: {
    [key: string]: {
      type: "morning" | "afternoon" | "night" | "off" | "leave"
      time?: string
      location?: string
    } | null
  }
}

const staffShifts: StaffShift[] = [
  {
    id: "1",
    staffName: "Sarah Johnson",
    staffInitials: "SJ",
    role: "Senior Nurse",
    shifts: {
      Mon: { type: "morning", time: "07:00-15:00", location: "Wing A" },
      Tue: { type: "morning", time: "07:00-15:00", location: "Wing A" },
      Wed: { type: "afternoon", time: "15:00-23:00", location: "Wing A" },
      Thu: { type: "morning", time: "07:00-15:00", location: "Wing A" },
      Fri: { type: "off" },
      Sat: { type: "morning", time: "07:00-15:00", location: "Wing A" },
      Sun: { type: "off" },
    },
  },
  {
    id: "2",
    staffName: "Mike Peters",
    staffInitials: "MP",
    role: "Care Assistant",
    shifts: {
      Mon: { type: "afternoon", time: "15:00-23:00", location: "Wing B" },
      Tue: { type: "afternoon", time: "15:00-23:00", location: "Wing B" },
      Wed: { type: "off" },
      Thu: { type: "afternoon", time: "15:00-23:00", location: "Wing B" },
      Fri: { type: "afternoon", time: "15:00-23:00", location: "Wing B" },
      Sat: { type: "off" },
      Sun: { type: "afternoon", time: "15:00-23:00", location: "Wing B" },
    },
  },
  {
    id: "3",
    staffName: "Emma Davis",
    staffInitials: "ED",
    role: "Nurse",
    shifts: {
      Mon: { type: "morning", time: "07:00-15:00", location: "Wing A" },
      Tue: { type: "leave" },
      Wed: { type: "leave" },
      Thu: { type: "morning", time: "07:00-15:00", location: "Wing A" },
      Fri: { type: "morning", time: "07:00-15:00", location: "Wing A" },
      Sat: { type: "off" },
      Sun: { type: "off" },
    },
  },
  {
    id: "4",
    staffName: "Tom Wilson",
    staffInitials: "TW",
    role: "Care Assistant",
    shifts: {
      Mon: { type: "night", time: "23:00-07:00", location: "Wing C" },
      Tue: { type: "night", time: "23:00-07:00", location: "Wing C" },
      Wed: { type: "night", time: "23:00-07:00", location: "Wing C" },
      Thu: { type: "off" },
      Fri: { type: "off" },
      Sat: { type: "night", time: "23:00-07:00", location: "Wing C" },
      Sun: { type: "night", time: "23:00-07:00", location: "Wing C" },
    },
  },
  {
    id: "5",
    staffName: "Lisa Brown",
    staffInitials: "LB",
    role: "Senior Care Assistant",
    shifts: {
      Mon: { type: "morning", time: "07:00-15:00", location: "Wing B" },
      Tue: { type: "morning", time: "07:00-15:00", location: "Wing B" },
      Wed: { type: "morning", time: "07:00-15:00", location: "Wing B" },
      Thu: { type: "afternoon", time: "15:00-23:00", location: "Wing B" },
      Fri: { type: "off" },
      Sat: { type: "off" },
      Sun: { type: "morning", time: "07:00-15:00", location: "Wing B" },
    },
  },
  {
    id: "6",
    staffName: "Rachel Green",
    staffInitials: "RG",
    role: "Night Nurse",
    shifts: {
      Mon: { type: "off" },
      Tue: { type: "off" },
      Wed: { type: "night", time: "23:00-07:00", location: "All Wings" },
      Thu: { type: "night", time: "23:00-07:00", location: "All Wings" },
      Fri: { type: "night", time: "23:00-07:00", location: "All Wings" },
      Sat: { type: "night", time: "23:00-07:00", location: "All Wings" },
      Sun: { type: "night", time: "23:00-07:00", location: "All Wings" },
    },
  },
  {
    id: "7",
    staffName: "James Taylor",
    staffInitials: "JT",
    role: "Maintenance",
    shifts: {
      Mon: { type: "morning", time: "08:00-16:00", location: "Facilities" },
      Tue: { type: "morning", time: "08:00-16:00", location: "Facilities" },
      Wed: { type: "morning", time: "08:00-16:00", location: "Facilities" },
      Thu: { type: "morning", time: "08:00-16:00", location: "Facilities" },
      Fri: { type: "morning", time: "08:00-16:00", location: "Facilities" },
      Sat: { type: "off" },
      Sun: { type: "off" },
    },
  },
]

const shiftStyles = {
  morning: "bg-chart-1/20 border-chart-1/40 text-chart-1",
  afternoon: "bg-chart-2/20 border-chart-2/40 text-chart-2",
  night: "bg-chart-4/20 border-chart-4/40 text-chart-4",
  off: "bg-muted/50 border-border text-muted-foreground",
  leave: "bg-warning/20 border-warning/40 text-warning",
}

const shiftLabels = {
  morning: "Morning",
  afternoon: "Afternoon",
  night: "Night",
  off: "Day Off",
  leave: "Leave",
}

export default function ManageRotaPage() {
  const [selectedWeek, setSelectedWeek] = useState("current")
  const [selectedDepartment, setSelectedDepartment] = useState("all")

  return (
    <div className="min-h-screen">
      <Header title="Manage Rota" subtitle="Schedule and manage staff shifts" />

      <div className="p-6 space-y-6">
        {/* Stats Row */}
        <div className="grid gap-4 sm:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">156</p>
                  <p className="text-xs text-muted-foreground">Total Staff</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-1/10">
                  <Calendar className="h-5 w-5 text-chart-1" />
                </div>
                <div>
                  <p className="text-2xl font-bold">432</p>
                  <p className="text-xs text-muted-foreground">Shifts This Week</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold">12</p>
                  <p className="text-xs text-muted-foreground">Unassigned Shifts</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                  <Clock className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">2,847h</p>
                  <p className="text-xs text-muted-foreground">Hours Scheduled</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rota Grid */}
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <Button variant="outline" size="icon">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-center">
                  <p className="font-semibold">Week of March 24, 2025</p>
                  <p className="text-sm text-muted-foreground">Current Week</p>
                </div>
                <Button variant="outline" size="icon">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    <SelectItem value="wing-a">Wing A</SelectItem>
                    <SelectItem value="wing-b">Wing B</SelectItem>
                    <SelectItem value="wing-c">Wing C</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Shift
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="w-full">
              <div className="min-w-[900px]">
                {/* Header Row */}
                <div className="grid grid-cols-8 border-b bg-muted/30">
                  <div className="p-4 font-medium text-muted-foreground">Staff Member</div>
                  {days.map((day, index) => (
                    <div
                      key={day}
                      className={cn(
                        "p-4 text-center",
                        index === 0 && "bg-primary/5"
                      )}
                    >
                      <p className="font-medium">{day}</p>
                      <p className="text-sm text-muted-foreground">{fullDates[index]}</p>
                    </div>
                  ))}
                </div>

                {/* Staff Rows */}
                {staffShifts.map((staff) => (
                  <div key={staff.id} className="grid grid-cols-8 border-b hover:bg-muted/20">
                    <div className="flex items-center gap-3 p-4">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-xs text-primary">
                          {staff.staffInitials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{staff.staffName}</p>
                        <p className="text-xs text-muted-foreground">{staff.role}</p>
                      </div>
                    </div>
                    {days.map((day, index) => {
                      const shift = staff.shifts[day]
                      return (
                        <div
                          key={day}
                          className={cn(
                            "p-2 flex items-center justify-center",
                            index === 0 && "bg-primary/5"
                          )}
                        >
                          {shift ? (
                            <div
                              className={cn(
                                "w-full rounded-lg border p-2 text-center cursor-pointer transition-all hover:shadow-md",
                                shiftStyles[shift.type]
                              )}
                            >
                              <p className="text-xs font-medium">{shiftLabels[shift.type]}</p>
                              {shift.time && (
                                <p className="text-[10px] mt-0.5 opacity-80">{shift.time}</p>
                              )}
                            </div>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-full w-full border border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Legend */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-6">
              <span className="text-sm font-medium text-muted-foreground">Legend:</span>
              {Object.entries(shiftLabels).map(([key, label]) => (
                <div key={key} className="flex items-center gap-2">
                  <div
                    className={cn(
                      "h-4 w-4 rounded border",
                      shiftStyles[key as keyof typeof shiftStyles]
                    )}
                  />
                  <span className="text-sm text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
