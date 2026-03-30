"use client"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import {
  Users,
  Clock,
  ClipboardList,
  Calendar,
  Building2,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Cake,
} from "lucide-react"

interface KPICardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ElementType
  trend?: {
    value: number
    isPositive: boolean
  }
  variant?: "default" | "warning" | "danger" | "success"
}

const variantStyles = {
  default: "bg-card border-border",
  warning: "bg-warning/10 border-warning/20",
  danger: "bg-destructive/10 border-destructive/20",
  success: "bg-success/10 border-success/20",
}

const iconStyles = {
  default: "bg-primary/10 text-primary",
  warning: "bg-warning/20 text-warning",
  danger: "bg-destructive/20 text-destructive",
  success: "bg-success/20 text-success",
}

function KPICard({ title, value, subtitle, icon: Icon, trend, variant = "default" }: KPICardProps) {
  return (
    <Card className={cn("border transition-all duration-200 hover:shadow-md", variantStyles[variant])}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-foreground">{value}</span>
              {trend && (
                <span
                  className={cn(
                    "flex items-center text-xs font-medium",
                    trend.isPositive ? "text-success" : "text-destructive"
                  )}
                >
                  {trend.isPositive ? (
                    <TrendingUp className="mr-0.5 h-3 w-3" />
                  ) : (
                    <TrendingDown className="mr-0.5 h-3 w-3" />
                  )}
                  {trend.value}%
                </span>
              )}
            </div>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          <div className={cn("rounded-xl p-3", iconStyles[variant])}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function KPICards() {
  const kpiData: KPICardProps[] = [
    {
      title: "Unassigned Shifts",
      value: 12,
      subtitle: "Next 7 days",
      icon: Calendar,
      variant: "warning",
    },
    {
      title: "Late Clock-ins",
      value: 3,
      subtitle: "Today",
      icon: Clock,
      variant: "danger",
    },
    {
      title: "Tasks Overdue",
      value: 7,
      subtitle: "Action required",
      icon: ClipboardList,
      variant: "danger",
    },
    {
      title: "Upcoming Birthdays",
      value: 4,
      subtitle: "This week",
      icon: Cake,
      variant: "default",
    },
    {
      title: "Reviews Due",
      value: 8,
      subtitle: "Next 7 days",
      icon: AlertTriangle,
      variant: "warning",
    },
    {
      title: "Weekly Rota Hours",
      value: "2,847",
      subtitle: "Hours scheduled",
      icon: Calendar,
      trend: { value: 5.2, isPositive: true },
      variant: "default",
    },
    {
      title: "Total Staff",
      value: 156,
      subtitle: "Active employees",
      icon: Users,
      trend: { value: 2.1, isPositive: true },
      variant: "success",
    },
    {
      title: "Care Homes",
      value: 3,
      subtitle: "Under management",
      icon: Building2,
      variant: "default",
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {kpiData.map((kpi, index) => (
        <KPICard key={index} {...kpi} />
      ))}
    </div>
  )
}
