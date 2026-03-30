"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  UserPlus,
  FileText,
  Calendar,
  ArrowRight,
} from "lucide-react"

interface Activity {
  id: string
  type: "clock-in" | "clock-out" | "task" | "incident" | "new-staff" | "care-plan" | "shift"
  title: string
  description: string
  timestamp: string
  user?: {
    name: string
    avatar?: string
    initials: string
  }
  status?: "success" | "warning" | "danger"
}

const activities: Activity[] = [
  {
    id: "1",
    type: "clock-in",
    title: "Clock In",
    description: "Sarah Johnson clocked in for morning shift",
    timestamp: "2 min ago",
    user: { name: "Sarah Johnson", initials: "SJ" },
    status: "success",
  },
  {
    id: "2",
    type: "clock-in",
    title: "Late Clock In",
    description: "Mike Peters clocked in 15 minutes late",
    timestamp: "8 min ago",
    user: { name: "Mike Peters", initials: "MP" },
    status: "warning",
  },
  {
    id: "3",
    type: "task",
    title: "Task Completed",
    description: "Medication round completed - Wing A",
    timestamp: "15 min ago",
    user: { name: "Emma Davis", initials: "ED" },
    status: "success",
  },
  {
    id: "4",
    type: "incident",
    title: "Incident Reported",
    description: "Minor fall reported - Room 203",
    timestamp: "32 min ago",
    user: { name: "Tom Wilson", initials: "TW" },
    status: "danger",
  },
  {
    id: "5",
    type: "care-plan",
    title: "Care Plan Updated",
    description: "Care plan review completed for Mrs. Thompson",
    timestamp: "1 hour ago",
    user: { name: "Lisa Brown", initials: "LB" },
    status: "success",
  },
  {
    id: "6",
    type: "new-staff",
    title: "New Staff Added",
    description: "Alex Miller joined as Care Assistant",
    timestamp: "2 hours ago",
    user: { name: "Alex Miller", initials: "AM" },
    status: "success",
  },
  {
    id: "7",
    type: "shift",
    title: "Shift Swap Approved",
    description: "Evening shift swap approved between nurses",
    timestamp: "3 hours ago",
    status: "success",
  },
  {
    id: "8",
    type: "clock-out",
    title: "Clock Out",
    description: "Night shift team completed their duties",
    timestamp: "4 hours ago",
    status: "success",
  },
]

const typeIcons = {
  "clock-in": Clock,
  "clock-out": Clock,
  task: CheckCircle2,
  incident: AlertCircle,
  "new-staff": UserPlus,
  "care-plan": FileText,
  shift: Calendar,
}

const statusColors = {
  success: "bg-success/10 text-success border-success/20",
  warning: "bg-warning/10 text-warning border-warning/20",
  danger: "bg-destructive/10 text-destructive border-destructive/20",
}

export function ActivityFeed() {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Activity</CardTitle>
        <Button variant="ghost" size="sm" className="text-primary">
          View All <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px] px-6">
          <div className="space-y-4 pb-4">
            {activities.map((activity) => {
              const Icon = typeIcons[activity.type]
              return (
                <div
                  key={activity.id}
                  className="flex gap-4 rounded-lg border border-border bg-card/50 p-3 transition-colors hover:bg-muted/50"
                >
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border",
                      statusColors[activity.status || "success"]
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground">{activity.title}</p>
                      <span className="text-xs text-muted-foreground">{activity.timestamp}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{activity.description}</p>
                    {activity.user && (
                      <div className="flex items-center gap-2 pt-1">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={activity.user.avatar} />
                          <AvatarFallback className="bg-primary/10 text-[10px] text-primary">
                            {activity.user.initials}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">{activity.user.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
