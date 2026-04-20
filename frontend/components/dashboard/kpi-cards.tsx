"use client"

import { Card, CardContent } from "@/frontend/components/ui/card"
import { cn } from "@/backend/lib/utils"
import {
  Users,
  Clock,
  Building2,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
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

export interface KPICardsData {
  total_staff?: number
  clocked_in_now?: number
  late_today?: number
  hours_today?: number
  total_care_homes?: number
  expected_not_in?: number
  isSuperAdmin?: boolean
}

export function KPICards({ data }: { data?: KPICardsData }) {
  const kpiData: KPICardProps[] = data
    ? data.isSuperAdmin
      ? [
          {
            title: "Total Staff",
            value: data.total_staff ?? 0,
            subtitle: "Active employees",
            icon: Users,
            variant: "success",
          },
          {
            title: "Care Homes",
            value: data.total_care_homes ?? 0,
            subtitle: "Under management",
            icon: Building2,
            variant: "default",
          },
          {
            title: "Clocked In Now",
            value: data.clocked_in_now ?? 0,
            subtitle: "Across all homes",
            icon: Clock,
            variant: "default",
          },
          {
            title: "Hours Today",
            value: (data.hours_today ?? 0).toFixed(1),
            subtitle: "Platform-wide",
            icon: TrendingUp,
            variant: "default",
          },
        ]
      : [
          {
            title: "Total Staff",
            value: data.total_staff ?? 0,
            subtitle: "Active employees",
            icon: Users,
            variant: "success",
          },
          {
            title: "Clocked In Now",
            value: data.clocked_in_now ?? 0,
            subtitle: "Currently on site",
            icon: Clock,
            variant: "default",
          },
          {
            title: "Late Today",
            value: data.late_today ?? 0,
            subtitle: "Late arrivals",
            icon: AlertTriangle,
            variant: (data.late_today ?? 0) > 0 ? "danger" : "default",
          },
          {
            title: "Hours Today",
            value: (data.hours_today ?? 0).toFixed(1),
            subtitle: "Total hours worked",
            icon: TrendingUp,
            variant: "default",
          },
        ]
    : [
        {
          title: "Total Staff",
          value: "—",
          subtitle: "Loading…",
          icon: Users,
          variant: "default",
        },
        {
          title: "Clocked In Now",
          value: "—",
          subtitle: "Loading…",
          icon: Clock,
          variant: "default",
        },
        {
          title: "Late Today",
          value: "—",
          subtitle: "Loading…",
          icon: AlertTriangle,
          variant: "default",
        },
        {
          title: "Hours Today",
          value: "—",
          subtitle: "Loading…",
          icon: TrendingUp,
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
