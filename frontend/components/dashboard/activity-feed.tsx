"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/components/ui/card"
import { Avatar, AvatarFallback } from "@/frontend/components/ui/avatar"
import { Button } from "@/frontend/components/ui/button"
import { ScrollArea } from "@/frontend/components/ui/scroll-area"
import { cn } from "@/backend/lib/utils"
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  UserPlus,
  FileText,
  Calendar,
  ArrowRight,
} from "lucide-react"

export interface ActivityEvent {
  id: string
  type: 'clock-in' | 'clock-out'
  staff_name: string
  staff_role: string
  care_home_name: string | null
  care_home_id: string
  timestamp: string
  is_late: boolean
}

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

function formatRole(role: string): string {
  return role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

function formatTimestamp(iso: string): string {
  const date = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60_000)
  if (diffMins < 1) return "just now"
  if (diffMins < 60) return `${diffMins} min ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" })
}

function getInitials(name: string): string {
  return name.split(" ").map((p) => p[0]).join("").toUpperCase().slice(0, 2)
}

interface ActivityFeedProps {
  events?: ActivityEvent[]
}

export function ActivityFeed({ events }: ActivityFeedProps) {
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
            {!events || events.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No recent activity.</p>
            ) : (
              events.map((event) => {
                const Icon = typeIcons[event.type]
                const isLate = event.is_late
                const status = isLate ? "warning" : "success"
                const title = event.type === "clock-in"
                  ? (isLate ? "Late Clock In" : "Clock In")
                  : "Clock Out"
                const description = event.type === "clock-in"
                  ? `${event.staff_name} clocked in${event.care_home_name ? ` at ${event.care_home_name}` : ""}`
                  : `${event.staff_name} clocked out${event.care_home_name ? ` at ${event.care_home_name}` : ""}`

                return (
                  <div
                    key={event.id}
                    className="flex gap-4 rounded-lg border border-border bg-card/50 p-3 transition-colors hover:bg-muted/50"
                  >
                    <div
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border",
                        statusColors[status]
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-foreground">{title}</p>
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(event.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{description}</p>
                      <div className="flex items-center gap-2 pt-1">
                        <Avatar className="h-5 w-5">
                          <AvatarFallback className="bg-primary/10 text-[10px] text-primary">
                            {getInitials(event.staff_name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">
                          {formatRole(event.staff_role)}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
