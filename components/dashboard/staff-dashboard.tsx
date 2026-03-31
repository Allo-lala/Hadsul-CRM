"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Clock, TrendingUp, Calendar, CheckCircle2, XCircle,
  ChevronLeft, ChevronRight, Bell, AlertTriangle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { apiRequest } from "@/lib/api"
import type { StaffDashboardData } from "@/app/api/dashboard/staff-home/route"

const WEEK_DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
]

const EVENT_COLORS: Record<string, string> = {
  shift:      "bg-blue-500/20 text-blue-600 dark:text-blue-400",
  meeting:    "bg-violet-500/20 text-violet-600",
  personal:   "bg-primary/20 text-primary",
  reminder:   "bg-orange-500/20 text-orange-600",
  training:   "bg-emerald-500/20 text-emerald-600",
  inspection: "bg-red-500/20 text-red-600",
  review:     "bg-amber-500/20 text-amber-600",
}

function fmt12(t: string | null) {
  if (!t) return ""
  const [h, m] = t.split(":").map(Number)
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`
}

function formatDate(iso: string) {
  const d = new Date(iso + "T00:00:00")
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
  })
}

// ─── Attendance bar chart (last 7 days) ──────────────────────────────────────
function AttendanceChart({ data }: { data: StaffDashboardData["attendance"] }) {
  const max = Math.max(...data.map(d => Number(d.hours)), 8)
  return (
    <div className="flex items-end gap-2 h-28 pt-2">
      {data.map((day, i) => {
        const pct = max > 0 ? (Number(day.hours) / max) * 100 : 0
        const d = new Date(day.date + "T00:00:00")
        const isToday = day.date === new Date().toISOString().slice(0, 10)
        return (
          <div key={i} className="flex flex-1 flex-col items-center gap-1">
            <div className="w-full flex flex-col justify-end" style={{ height: "80px" }}>
              <div
                className={cn(
                  "w-full rounded-t transition-all",
                  day.clocked_in ? (isToday ? "bg-primary" : "bg-primary/60") : "bg-muted"
                )}
                style={{ height: `${Math.max(pct, day.clocked_in ? 8 : 4)}%` }}
                title={`${Number(day.hours).toFixed(1)}h`}
              />
            </div>
            <span className={cn("text-[10px]", isToday ? "font-bold text-primary" : "text-muted-foreground")}>
              {WEEK_DAYS_SHORT[d.getDay()]}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// ─── Auto-sliding announcements banner ───────────────────────────────────────
function AnnouncementsBanner({ items }: { items: StaffDashboardData["announcements"] }) {
  const [idx, setIdx] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (items.length <= 1) return
    timerRef.current = setInterval(() => setIdx(i => (i + 1) % items.length), 4000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [items.length])

  if (items.length === 0) return null

  const current = items[idx]
  return (
    <div className="relative overflow-hidden rounded-lg border border-primary/20 bg-primary/5 px-5 py-3">
      <div className="flex items-center gap-3">
        <Bell className="h-4 w-4 shrink-0 text-primary" />
        <div className="flex-1 min-w-0">
          <span className="font-semibold text-sm text-foreground">{current.title}: </span>
          <span className="text-sm text-muted-foreground">{current.message}</span>
        </div>
        {items.length > 1 && (
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={() => setIdx(i => (i - 1 + items.length) % items.length)} className="p-1 hover:text-primary">
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <span className="text-xs text-muted-foreground">{idx + 1}/{items.length}</span>
            <button onClick={() => setIdx(i => (i + 1) % items.length)} className="p-1 hover:text-primary">
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
      {/* Progress dots */}
      {items.length > 1 && (
        <div className="flex gap-1 mt-2 justify-center">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={cn("h-1.5 rounded-full transition-all", i === idx ? "w-4 bg-primary" : "w-1.5 bg-primary/30")}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Mini month calendar ──────────────────────────────────────────────────────
function MiniMonthCalendar({ events }: { events: StaffDashboardData["calendar_events"] }) {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = now.getDate()

  const eventDates = new Set(events.map(e => e.event_date.slice(0, 10)))

  const cells: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  return (
    <div>
      <p className="text-sm font-semibold mb-2">{MONTHS[month]} {year}</p>
      <div className="grid grid-cols-7 gap-px text-[10px] text-muted-foreground mb-1">
        {WEEK_DAYS_SHORT.map(d => <span key={d} className="text-center">{d[0]}</span>)}
      </div>
      <div className="grid grid-cols-7 gap-px">
        {cells.map((d, i) => {
          if (!d) return <span key={i} />
          const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`
          const hasEvent = eventDates.has(key)
          const isToday = d === today
          return (
            <div key={i} className="relative flex flex-col items-center">
              <span className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full text-[11px]",
                isToday && "bg-primary text-primary-foreground font-bold",
                !isToday && hasEvent && "font-semibold text-foreground",
                !isToday && !hasEvent && "text-muted-foreground"
              )}>
                {d}
              </span>
              {hasEvent && !isToday && (
                <span className="absolute bottom-0 h-1 w-1 rounded-full bg-primary" />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Main staff dashboard ─────────────────────────────────────────────────────
export function StaffDashboard({ firstName }: { firstName: string }) {
  const [data, setData] = useState<StaffDashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiRequest<StaffDashboardData>("/api/dashboard/staff-home").then(({ data: d }) => {
      if (d) setData(d)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-32 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    )
  }

  if (!data) return <div className="p-6 text-sm text-destructive">Could not load dashboard.</div>

  const attendanceRate = data.attendance.length > 0
    ? Math.round((data.attendance.filter(d => d.clocked_in).length / data.attendance.length) * 100)
    : 0

  return (
    <div className="p-6 space-y-6">
      {/* Announcements */}
      {data.announcements.length > 0 && (
        <AnnouncementsBanner items={data.announcements} />
      )}

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Hours Today</p>
                <p className="text-2xl font-bold">{Number(data.hours_today).toFixed(1)}h</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-success/10">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">This Week</p>
                <p className="text-2xl font-bold">{Number(data.hours_this_week).toFixed(1)}h</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-chart-2/10">
                <Calendar className="h-5 w-5 text-chart-2" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold">{Number(data.hours_this_month).toFixed(1)}h</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Attendance chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Attendance — Last 7 Days</CardTitle>
              <Badge variant="outline" className={cn(
                "text-xs",
                attendanceRate >= 80 ? "border-success/30 bg-success/10 text-success" :
                attendanceRate >= 50 ? "border-amber-500/30 bg-amber-500/10 text-amber-600" :
                "border-destructive/30 bg-destructive/10 text-destructive"
              )}>
                {attendanceRate}% attendance
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <AttendanceChart data={data.attendance} />
            <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-primary/60" />Worked</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-muted" />No record</span>
            </div>
          </CardContent>
        </Card>

        {/* Mini calendar */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <MiniMonthCalendar events={data.calendar_events} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Shifts this week */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Shifts This Week</CardTitle>
          </CardHeader>
          <CardContent>
            {data.shifts_this_week.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No shifts scheduled this week</p>
            ) : (
              <div className="space-y-2">
                {data.shifts_this_week.map(shift => {
                  const d = new Date(shift.shift_date + "T00:00:00")
                  const isToday = shift.shift_date === new Date().toISOString().slice(0, 10)
                  return (
                    <div key={shift.id} className={cn(
                      "flex items-center justify-between rounded-lg border px-4 py-3",
                      isToday ? "border-primary/30 bg-primary/5" : "border-border"
                    )}>
                      <div>
                        <p className={cn("text-sm font-medium", isToday && "text-primary")}>
                          {WEEK_DAYS_SHORT[d.getDay()]}, {d.getDate()} {MONTHS[d.getMonth()]}
                          {isToday && <span className="ml-2 text-xs font-normal">(Today)</span>}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {fmt12(shift.start_time)} – {fmt12(shift.end_time)}
                        </p>
                      </div>
                      <Badge variant="outline" className={cn(
                        "text-xs capitalize",
                        shift.status === "completed" ? "border-success/30 bg-success/10 text-success" :
                        shift.status === "in_progress" ? "border-primary/30 bg-primary/10 text-primary" :
                        shift.status === "no_show" ? "border-destructive/30 bg-destructive/10 text-destructive" :
                        "border-border text-muted-foreground"
                      )}>
                        {shift.status.replace(/_/g, " ")}
                      </Badge>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Clock history */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Clock History — Last 30 Days</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[280px] px-6">
              {data.clock_history.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No records yet</p>
              ) : (
                <div className="space-y-2 py-2">
                  {data.clock_history.map(rec => (
                    <div key={rec.id} className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        {rec.clock_out_time
                          ? <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                          : <Clock className="h-4 w-4 shrink-0 text-primary" />}
                        <div>
                          <p className="text-xs font-medium">{formatDateTime(rec.clock_in_time)}</p>
                          {rec.clock_out_time && (
                            <p className="text-[10px] text-muted-foreground">
                              Out: {new Date(rec.clock_out_time).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {rec.is_late && (
                          <Badge variant="outline" className="text-[10px] border-destructive/30 bg-destructive/10 text-destructive">
                            <AlertTriangle className="mr-1 h-2.5 w-2.5" />Late
                          </Badge>
                        )}
                        <span className="text-xs font-semibold">
                          {rec.total_hours_worked != null ? `${Number(rec.total_hours_worked).toFixed(1)}h` : "—"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* This month's schedule events */}
      {data.calendar_events.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Schedule This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {data.calendar_events.map(ev => (
                <div key={ev.id} className={cn("flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm", EVENT_COLORS[ev.type] ?? EVENT_COLORS.personal)}>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{ev.title}</p>
                    <p className="text-xs opacity-70">{formatDate(ev.event_date)}{ev.start_time ? ` · ${fmt12(ev.start_time)}` : ""}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
