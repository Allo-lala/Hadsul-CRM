"use client"

import { Badge } from "@/frontend/components/ui/badge"
import { Button } from "@/frontend/components/ui/button"
import { ScrollArea } from "@/frontend/components/ui/scroll-area"
import { Plus, Trash2, Bell, Clock, Loader2 } from "lucide-react"
import { cn } from "@/backend/lib/utils"
import type { CalendarEvent } from "@/app/api/calendar/route"

// ─── constants ────────────────────────────────────────────────────────────────

export const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
]
export const WEEK_DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]

export const EVENT_STYLES: Record<string, string> = {
  shift:      "bg-blue-500/15 border-blue-500/40 text-blue-600 dark:text-blue-400",
  meeting:    "bg-violet-500/15 border-violet-500/40 text-violet-600 dark:text-violet-400",
  review:     "bg-amber-500/15 border-amber-500/40 text-amber-600 dark:text-amber-400",
  training:   "bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400",
  inspection: "bg-red-500/15 border-red-500/40 text-red-600 dark:text-red-400",
  personal:   "bg-primary/15 border-primary/40 text-primary",
  reminder:   "bg-orange-500/15 border-orange-500/40 text-orange-600 dark:text-orange-400",
}

export const EVENT_DOT: Record<string, string> = {
  shift: "bg-blue-500", meeting: "bg-violet-500", review: "bg-amber-500",
  training: "bg-emerald-500", inspection: "bg-red-500",
  personal: "bg-primary", reminder: "bg-orange-500",
}

// ─── helpers ──────────────────────────────────────────────────────────────────

export function toDateKey(d: Date | string): string {
  const date = d instanceof Date ? d : new Date(typeof d === 'string' && d.length === 10 ? d + 'T00:00:00' : d)
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`
}

export function sameDay(a: Date, b: Date) {
  return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate()
}

export function getWeekDates(anchor: Date): Date[] {
  const start = new Date(anchor)
  start.setDate(anchor.getDate() - anchor.getDay())
  return Array.from({length:7},(_,i)=>{ const d=new Date(start); d.setDate(start.getDate()+i); return d })
}

export function fmt12(time: string|null): string {
  if (!time) return ""
  const [h,m] = time.split(":").map(Number)
  return `${h%12||12}:${String(m).padStart(2,"0")} ${h>=12?"PM":"AM"}`
}

// ─── EventChip ────────────────────────────────────────────────────────────────

export function EventChip({ ev, onDelete, deleting }: {
  ev: CalendarEvent
  onDelete?: (id: string) => void
  deleting?: string | null
}) {
  return (
    <div className={cn("group flex items-center justify-between gap-1 rounded border px-1.5 py-0.5 text-[11px] font-medium", EVENT_STYLES[ev.type] ?? EVENT_STYLES.personal)}>
      <span className="truncate">
        {ev.start_time && <span className="mr-1 opacity-70">{fmt12(ev.start_time)}</span>}
        {ev.title}
        {ev.reminder_minutes != null && <Bell className="ml-1 inline h-2.5 w-2.5 opacity-60" />}
      </span>
      {onDelete && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(ev.id) }}
          className="hidden group-hover:flex items-center shrink-0 opacity-60 hover:opacity-100"
        >
          {deleting === ev.id
            ? <Loader2 className="h-3 w-3 animate-spin" />
            : <Trash2 className="h-3 w-3" />}
        </button>
      )}
    </div>
  )
}

// ─── YearView ─────────────────────────────────────────────────────────────────

export function YearView({ year, today, eventsByDate, onSelectMonth }: {
  year: number
  today: Date
  eventsByDate: Record<string, CalendarEvent[]>
  onSelectMonth: (m: number) => void
}) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {MONTHS.map((name, mi) => {
        const firstDay = new Date(year, mi, 1).getDay()
        const days = new Date(year, mi+1, 0).getDate()
        const hasEvents = Array.from({length:days},(_,i)=>{
          const key = `${year}-${String(mi+1).padStart(2,"0")}-${String(i+1).padStart(2,"0")}`
          return (eventsByDate[key]?.length ?? 0) > 0
        }).some(Boolean)

        return (
          <button
            key={mi}
            onClick={() => onSelectMonth(mi)}
            className="rounded-lg border border-border bg-card p-3 text-left hover:bg-muted/50 transition-colors"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold">{name}</span>
              {hasEvents && <span className="h-2 w-2 rounded-full bg-primary" />}
            </div>
            <div className="grid grid-cols-7 gap-px text-[9px] text-muted-foreground mb-1">
              {WEEK_DAYS.map(d => <span key={d} className="text-center">{d[0]}</span>)}
            </div>
            <div className="grid grid-cols-7 gap-px">
              {Array.from({length: firstDay}, (_,i) => <span key={`e${i}`} />)}
              {Array.from({length: days}, (_,i) => {
                const d = i+1
                const key = `${year}-${String(mi+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`
                const isToday = today.getFullYear()===year && today.getMonth()===mi && today.getDate()===d
                const dot = (eventsByDate[key]?.length ?? 0) > 0
                return (
                  <span key={d} className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-full text-[9px]",
                    isToday && "bg-primary text-primary-foreground font-bold",
                    dot && !isToday && "font-semibold text-foreground"
                  )}>
                    {d}
                    {dot && !isToday && <span className="absolute mt-3 h-1 w-1 rounded-full bg-primary" />}
                  </span>
                )
              })}
            </div>
          </button>
        )
      })}
    </div>
  )
}

// ─── MonthView ────────────────────────────────────────────────────────────────

export function MonthView({ year, month, today, selectedDate, eventsByDate, loading, onSelectDate, onAddEvent }: {
  year: number; month: number; today: Date; selectedDate: Date
  eventsByDate: Record<string, CalendarEvent[]>
  loading: boolean
  onSelectDate: (d: Date) => void
  onAddEvent: (d: Date) => void
}) {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month+1, 0).getDate()
  const prevDays = new Date(year, month, 0).getDate()

  const cells: { date: Date; current: boolean }[] = []
  for (let i = firstDay-1; i >= 0; i--) {
    cells.push({ date: new Date(year, month-1, prevDays-i), current: false })
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(year, month, d), current: true })
  }
  while (cells.length % 7 !== 0) {
    cells.push({ date: new Date(year, month+1, cells.length - daysInMonth - firstDay + 1), current: false })
  }

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="grid grid-cols-7 border-b border-border">
        {WEEK_DAYS.map(d => (
          <div key={d} className="py-2 text-center text-xs font-medium text-muted-foreground">{d}</div>
        ))}
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid grid-cols-7">
          {cells.map((cell, idx) => {
            const key = toDateKey(cell.date)
            const dayEvents = eventsByDate[key] ?? []
            const isToday = sameDay(cell.date, today)
            const isSelected = sameDay(cell.date, selectedDate)
            return (
              <div
                key={idx}
                onClick={() => cell.current && onSelectDate(cell.date)}
                className={cn(
                  "min-h-[100px] border-b border-r border-border p-1.5 transition-colors",
                  cell.current ? "cursor-pointer hover:bg-muted/40" : "bg-muted/20",
                  isToday && "bg-primary/5",
                  isSelected && cell.current && "ring-2 ring-inset ring-primary"
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full text-xs",
                    isToday ? "bg-primary text-primary-foreground font-bold" : "text-foreground",
                    !cell.current && "text-muted-foreground"
                  )}>
                    {cell.date.getDate()}
                  </span>
                  {cell.current && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onAddEvent(cell.date) }}
                      className="hidden group-hover:flex h-5 w-5 items-center justify-center rounded hover:bg-primary/10 text-muted-foreground hover:text-primary"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  )}
                </div>
                <div className="space-y-0.5">
                  {dayEvents.slice(0,3).map(ev => (
                    <div key={ev.id} className={cn("truncate rounded px-1 py-0.5 text-[10px] font-medium border", EVENT_STYLES[ev.type] ?? EVENT_STYLES.personal)}>
                      {ev.start_time && <span className="mr-1 opacity-70">{fmt12(ev.start_time)}</span>}
                      {ev.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <p className="pl-1 text-[10px] text-muted-foreground">+{dayEvents.length-3} more</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── WeekView ─────────────────────────────────────────────────────────────────

export function WeekView({ anchor, today, eventsByDate, loading, onSelectDate, onAddEvent }: {
  anchor: Date; today: Date
  eventsByDate: Record<string, CalendarEvent[]>
  loading: boolean
  onSelectDate: (d: Date) => void
  onAddEvent: (d: Date) => void
}) {
  const days = getWeekDates(anchor)
  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="grid grid-cols-7 border-b border-border">
        {days.map((d, i) => {
          const isToday = sameDay(d, today)
          return (
            <div key={i} className="py-3 text-center">
              <p className="text-xs text-muted-foreground">{WEEK_DAYS[d.getDay()]}</p>
              <button
                onClick={() => onSelectDate(d)}
                className={cn(
                  "mx-auto mt-1 flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors hover:bg-muted",
                  isToday && "bg-primary text-primary-foreground hover:bg-primary/90"
                )}
              >
                {d.getDate()}
              </button>
            </div>
          )
        })}
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid grid-cols-7 divide-x divide-border min-h-[400px]">
          {days.map((d, i) => {
            const key = toDateKey(d)
            const dayEvents = eventsByDate[key] ?? []
            return (
              <div key={i} className="p-2 space-y-1">
                {dayEvents.length === 0 ? (
                  <button
                    onClick={() => onAddEvent(d)}
                    className="w-full rounded border border-dashed border-border py-2 text-xs text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                  >
                    <Plus className="mx-auto h-3 w-3" />
                  </button>
                ) : (
                  <>
                    {dayEvents.map(ev => (
                      <div key={ev.id} className={cn("rounded border px-1.5 py-1 text-[11px] font-medium", EVENT_STYLES[ev.type] ?? EVENT_STYLES.personal)}>
                        {ev.start_time && <p className="opacity-70">{fmt12(ev.start_time)}</p>}
                        <p className="truncate">{ev.title}</p>
                      </div>
                    ))}
                    <button onClick={() => onAddEvent(d)} className="w-full text-[10px] text-muted-foreground hover:text-primary">
                      + Add
                    </button>
                  </>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── DayView ──────────────────────────────────────────────────────────────────

export function DayView({ date, today, events, loading, onAddEvent, onDelete, onEdit, deleting }: {
  date: Date; today: Date
  events: CalendarEvent[]
  loading: boolean
  onAddEvent: () => void
  onDelete: (id: string) => void
  onEdit: (ev: CalendarEvent) => void
  deleting: string | null
}) {
  const isToday = sameDay(date, today)
  return (
    <div className="rounded-lg border border-border bg-card">
      <div className={cn("flex items-center justify-between border-b border-border px-6 py-4", isToday && "bg-primary/5")}>
        <div>
          <p className="text-xs text-muted-foreground">{WEEK_DAYS[date.getDay()]}</p>
          <p className="text-2xl font-bold">{date.getDate()} {MONTHS[date.getMonth()]} {date.getFullYear()}</p>
        </div>
        <Button size="sm" onClick={onAddEvent}>
          <Plus className="mr-1.5 h-4 w-4" /> Add Event
        </Button>
      </div>
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-muted-foreground">No events for this day</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={onAddEvent}>
              <Plus className="mr-1.5 h-4 w-4" /> Add Event
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map(ev => (
              <div
                key={ev.id}
                onClick={() => onEdit(ev)}
                className={cn("flex items-start gap-4 rounded-lg border p-4 cursor-pointer hover:shadow-md transition-shadow", EVENT_STYLES[ev.type] ?? EVENT_STYLES.personal)}
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className={cn("text-xs capitalize", EVENT_STYLES[ev.type] ?? EVENT_STYLES.personal)}>
                      {ev.type}
                    </Badge>
                    <span className="font-semibold">{ev.title}</span>
                  </div>
                  {(ev.start_time || ev.end_time) && (
                    <p className="flex items-center gap-1.5 text-sm opacity-80">
                      <Clock className="h-3.5 w-3.5" />
                      {fmt12(ev.start_time)}{ev.end_time && ` – ${fmt12(ev.end_time)}`}
                    </p>
                  )}
                  {ev.reminder_minutes != null && (
                    <p className="flex items-center gap-1.5 text-xs opacity-70">
                      <Bell className="h-3 w-3" />
                      {ev.reminder_minutes === 0 ? "At time of event" : `${ev.reminder_minutes} min before`}
                    </p>
                  )}
                  {ev.description && <p className="text-sm opacity-80">{ev.description}</p>}
                </div>
                <button
                  onClick={e => { e.stopPropagation(); onDelete(ev.id) }}
                  className="shrink-0 opacity-50 hover:opacity-100 transition-opacity"
                >
                  {deleting === ev.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── ScheduleView ─────────────────────────────────────────────────────────────

export function ScheduleView({ events, loading, onDelete, onEdit, deleting, onAddEvent }: {
  events: CalendarEvent[]
  loading: boolean
  onDelete: (id: string) => void
  onEdit: (ev: CalendarEvent) => void
  deleting: string | null
  onAddEvent: () => void
}) {
  const sorted = [...events].sort((a,b) => a.event_date.localeCompare(b.event_date) || (a.start_time ?? "").localeCompare(b.start_time ?? ""))

  const grouped: Record<string, CalendarEvent[]> = {}
  for (const ev of sorted) {
    const key = ev.event_date.slice(0,10)
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(ev)
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <p className="font-semibold">Upcoming Events</p>
        <Button size="sm" onClick={onAddEvent}>
          <Plus className="mr-1.5 h-4 w-4" /> Add Event
        </Button>
      </div>
      <ScrollArea className="h-[600px]">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : Object.keys(grouped).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-muted-foreground">No events this month</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={onAddEvent}>
              <Plus className="mr-1.5 h-4 w-4" /> Add Event
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {Object.entries(grouped).map(([dateKey, dayEvents]) => {
              const d = new Date(dateKey + "T00:00:00")
              return (
                <div key={dateKey} className="px-6 py-4">
                  <p className="mb-3 text-sm font-semibold text-muted-foreground">
                    {WEEK_DAYS[d.getDay()]}, {d.getDate()} {MONTHS[d.getMonth()]} {d.getFullYear()}
                  </p>
                  <div className="space-y-2">
                    {dayEvents.map(ev => (
                      <div
                        key={ev.id}
                        onClick={() => onEdit(ev)}
                        className={cn("flex items-center gap-3 rounded-lg border px-4 py-3 cursor-pointer hover:shadow-md transition-shadow", EVENT_STYLES[ev.type] ?? EVENT_STYLES.personal)}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium truncate">{ev.title}</span>
                            <Badge variant="outline" className={cn("text-[10px] capitalize shrink-0", EVENT_STYLES[ev.type] ?? EVENT_STYLES.personal)}>
                              {ev.type}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 mt-0.5 text-xs opacity-70">
                            {ev.start_time && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {fmt12(ev.start_time)}{ev.end_time && ` – ${fmt12(ev.end_time)}`}
                              </span>
                            )}
                            {ev.reminder_minutes != null && (
                              <span className="flex items-center gap-1">
                                <Bell className="h-3 w-3" />
                                {ev.reminder_minutes === 0 ? "At event" : `${ev.reminder_minutes}m before`}
                              </span>
                            )}
                          </div>
                        </div>
                        <button onClick={e => { e.stopPropagation(); onDelete(ev.id) }} className="shrink-0 opacity-50 hover:opacity-100">
                          {deleting === ev.id
                            ? <Loader2 className="h-4 w-4 animate-spin" />
                            : <Trash2 className="h-4 w-4" />}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
