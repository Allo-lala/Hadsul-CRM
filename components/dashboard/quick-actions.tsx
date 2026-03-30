"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Clock,
  Calendar,
  ClipboardPlus,
  UserPlus,
  FileText,
  AlertTriangle,
  MessageSquare,
  Wrench,
} from "lucide-react"

const actions = [
  {
    icon: Clock,
    label: "Clock In",
    description: "Start your shift",
    href: "/dashboard/clock",
  },
  {
    icon: Calendar,
    label: "View Rota",
    description: "Check schedules",
    href: "/dashboard/rota/manage",
  },
  {
    icon: ClipboardPlus,
    label: "Add Task",
    description: "Create new task",
    href: "/dashboard/tasks",
  },
  {
    icon: UserPlus,
    label: "Add Staff",
    description: "New employee",
    href: "/dashboard/setup/staff",
  },
  {
    icon: FileText,
    label: "Care Plan",
    description: "View or update",
    href: "/dashboard/setup/care-plans",
  },
  {
    icon: AlertTriangle,
    label: "Report Incident",
    description: "Log an incident",
    href: "/dashboard/reports/incidents",
  },
  {
    icon: MessageSquare,
    label: "Handover Notes",
    description: "Shift handover",
    href: "/dashboard/handover",
  },
  {
    icon: Wrench,
    label: "Maintenance",
    description: "Log issues",
    href: "/dashboard/maintenance",
  },
]

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {actions.map((action) => (
            <Button
              key={action.label}
              variant="outline"
              className="h-auto flex-col gap-2 p-4 hover:bg-primary/5 hover:border-primary/50"
              asChild
            >
              <a href={action.href}>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <action.icon className="h-5 w-5 text-primary" />
                </div>
                <span className="text-sm font-medium">{action.label}</span>
                <span className="text-xs text-muted-foreground">{action.description}</span>
              </a>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
