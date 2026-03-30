"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { Calendar, Clock, MapPin, ArrowRight, UserX } from "lucide-react"

interface Shift {
  id: string
  date: string
  time: string
  location: string
  role: string
  staff?: {
    name: string
    avatar?: string
    initials: string
  }
  status: "assigned" | "unassigned" | "pending"
}

const shifts: Shift[] = [
  {
    id: "1",
    date: "Today",
    time: "14:00 - 22:00",
    location: "Wing A",
    role: "Care Assistant",
    staff: { name: "Sarah Johnson", initials: "SJ" },
    status: "assigned",
  },
  {
    id: "2",
    date: "Today",
    time: "22:00 - 06:00",
    location: "Wing B",
    role: "Night Nurse",
    status: "unassigned",
  },
  {
    id: "3",
    date: "Tomorrow",
    time: "06:00 - 14:00",
    location: "Wing A",
    role: "Senior Care Assistant",
    staff: { name: "Mike Peters", initials: "MP" },
    status: "assigned",
  },
  {
    id: "4",
    date: "Tomorrow",
    time: "14:00 - 22:00",
    location: "Wing C",
    role: "Care Assistant",
    status: "unassigned",
  },
  {
    id: "5",
    date: "Tomorrow",
    time: "06:00 - 14:00",
    location: "Wing B",
    role: "Nurse",
    staff: { name: "Emma Davis", initials: "ED" },
    status: "pending",
  },
  {
    id: "6",
    date: "Mar 25",
    time: "14:00 - 22:00",
    location: "Wing A",
    role: "Care Assistant",
    status: "unassigned",
  },
]

const statusStyles = {
  assigned: "bg-success/10 text-success border-success/30",
  unassigned: "bg-destructive/10 text-destructive border-destructive/30",
  pending: "bg-warning/10 text-warning border-warning/30",
}

const statusLabels = {
  assigned: "Assigned",
  unassigned: "Unassigned",
  pending: "Pending",
}

export function UpcomingShifts() {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Upcoming Shifts</CardTitle>
        <Button variant="ghost" size="sm" className="text-primary">
          View Rota <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[380px]">
          <div className="space-y-3 px-6 pb-4">
            {shifts.map((shift) => (
              <div
                key={shift.id}
                className={cn(
                  "rounded-lg border p-4 transition-all hover:shadow-md",
                  shift.status === "unassigned" ? "border-destructive/30 bg-destructive/5" : "border-border"
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className={statusStyles[shift.status]}>
                        {statusLabels[shift.status]}
                      </Badge>
                      <span className="text-xs font-medium text-muted-foreground">{shift.date}</span>
                    </div>
                    <p className="font-medium text-foreground">{shift.role}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {shift.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {shift.location}
                      </span>
                    </div>
                  </div>
                  {shift.staff ? (
                    <div className="flex items-center gap-2">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={shift.staff.avatar} />
                        <AvatarFallback className="bg-primary/10 text-xs text-primary">
                          {shift.staff.initials}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  ) : (
                    <Button size="sm" variant="outline" className="shrink-0">
                      <UserX className="mr-1 h-4 w-4" />
                      Assign
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
