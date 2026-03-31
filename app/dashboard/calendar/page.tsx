"use client"

import { useState, useEffect, useCallback } from "react"
import { Header } from "@/components/dashboard/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { ChevronLeft, ChevronRight, Plus, Bell, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { apiRequest } from "@/lib/api"
import type { CalendarEvent } from "@/app/api/calendar/route"
import {
  MONTHS, toDateKey, sameDay, getWeekDates,
  YearView, MonthView, WeekView, DayView, ScheduleView,
} from "@/components/dashboard/calendar-views"

type ViewMode = "year" | "month" | "week" | "day" | "schedule"

const REMINDER_OPTIONS = [
  { value: "0",    label: "At time of event" },
  { value: "5",    label: "5 minutes before" },
  { value: "10",   label: "10 minutes before" },
  { value: "15",   label: "15 minutes before" },
  { value: "30",   label: "30 minutes before" },
  { value: "60",   label: "1 hour before" },
  { value: "1440", label: "1 day before" },
]

export default function CalendarPage() {
  const today = new Date()
  const [view, setView] = useState<ViewMode>("month")
  const [anchor, setAnchor] = useState(new Date(today.getFullYear(), today.getMonth(), today.getDate()))
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date>(today)

  const [addOpen, setAddOpen] = useState(false)
  const [addForm, setAddForm] = useState({
    title: "", description: "",
    event_date: toDateKey(today),
    start_time: "", end_time: "",
    type: "personal", reminder_minutes: "", is_all_day: false,
  })
  const [addError, setAddError] = useState<string | null>(null)
  const [addSaving, setAddSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  const fetchEvents = useCallback(async (year: number, month: number, wide = false) => {
    setLoading(true)
    if (wide) {
      // Schedule view: fetch 6 months from today
      const now = new Date()
      const results: CalendarEvent[] = []
      for (let i = 0; i < 6; i++) {
        const y = now.getFullYear() + Math.floor((now.getMonth() + i) / 12)
        const m = ((now.getMonth() + i) % 12) + 1
        const { data } = await apiRequest<CalendarEvent[]>(`/api/calendar?year=${y}&month=${m}`)
        if (data) results.push(...data)
      }
      // Deduplicate by id
      const seen = new Set<string>()
      setEvents(results.filter(e => { if (seen.has(e.id)) return false; seen.add(e.id); return true }))
    } else {
      const { data, status } = await apiRequest<CalendarEvent[]>(`/api/calendar?year=${year}&month=${month + 1}`)
      if (data !== null) setEvents(data)
      else if (status === 401 || status === 500) {
        await new Promise(r => setTimeout(r, 800))
        const retry = await apiRequest<CalendarEvent[]>(`/api/calendar?year=${year}&month=${month + 1}`)
        if (retry.data !== null) setEvents(retry.data)
      }
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchEvents(anchor.getFullYear(), anchor.getMonth(), view === "schedule")
  }, [anchor, view, fetchEvents])

  const eventsByDate = events.reduce<Record<string, CalendarEvent[]>>((acc, ev) => {
    const key = ev.event_date.slice(0, 10)
    if (!acc[key]) acc[key] = []
    acc[key].push(ev)
    return acc
  }, {})

  function navigate(dir: 1 | -1) {
    const d = new Date(anchor)
    if (view === "month" || view === "year") d.setMonth(d.getMonth() + dir)
    else if (view === "week" || view === "schedule") d.setDate(d.getDate() + dir * 7)
    else d.setDate(d.getDate() + dir)
    setAnchor(d)
  }

  function goToday() {
    const t = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    setAnchor(t)
    setSelectedDate(today)
  }

  function openAdd(date?: Date | string) {
    const d = date instanceof Date ? date : (date ? new Date(date + 'T00:00:00') : selectedDate)
    setAddForm({
      title: "", description: "",
      event_date: toDateKey(d),
      start_time: "", end_time: "",
      type: "personal", reminder_minutes: "", is_all_day: false,
    })
    setAddError(null)
    setAddOpen(true)
  }

  async function handleAddEvent() {
    if (!addForm.title.trim()) { setAddError("Title is required"); return }
    setAddSaving(true)
    setAddError(null)
    const payload: Record<string, unknown> = {
      title: addForm.title.trim(),
      event_date: addForm.event_date,
      type: addForm.type,
      is_all_day: addForm.is_all_day,
    }
    if (addForm.description.trim()) payload.description = addForm.description.trim()
    if (!addForm.is_all_day && addForm.start_time) payload.start_time = addForm.start_time
    if (!addForm.is_all_day && addForm.end_time) payload.end_time = addForm.end_time
    if (addForm.reminder_minutes !== "" && addForm.reminder_minutes !== "none") payload.reminder_minutes = Number(addForm.reminder_minutes)

    const { data, error } = await apiRequest<CalendarEvent>("/api/calendar", {
      method: "POST",
      body: JSON.stringify(payload),
    })
    setAddSaving(false)
    if (error) { setAddError(error); return }
    if (data) { setEvents(prev => [...prev, data]); setAddOpen(false) }
  }

  async function handleDelete(id: string) {
    setDeleting(id)
    await apiRequest(`/api/calendar?id=${id}`, { method: "DELETE" })
    setEvents(prev => prev.filter(e => e.id !== id))
    setDeleting(null)
  }

  function getTitle(): string {
    if (view === "month" || view === "year") return `${MONTHS[anchor.getMonth()]} ${anchor.getFullYear()}`
    if (view === "week") {
      const days = getWeekDates(anchor)
      return `${MONTHS[days[0].getMonth()]} ${days[0].getDate()} – ${days[6].getDate()}, ${days[6].getFullYear()}`
    }
    if (view === "day") return anchor.toLocaleDateString("en-GB", { weekday:"long", day:"numeric", month:"long", year:"numeric" })
    return `${MONTHS[anchor.getMonth()]} ${anchor.getFullYear()}`
  }

  return (
    <div className="min-h-screen">
      <Header title="My Schedule" subtitle="Your shifts, events, and reminders" />

      <div className="p-6 space-y-4">
        {/* toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToday}>Today</Button>
            <Button variant="outline" size="icon" onClick={() => navigate(1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <span className="ml-2 text-base font-semibold">{getTitle()}</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex rounded-md border border-border overflow-hidden">
              {(["year","month","week","day","schedule"] as ViewMode[]).map(v => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium capitalize transition-colors",
                    view === v ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-muted"
                  )}
                >
                  {v}
                </button>
              ))}
            </div>
            <Button size="sm" onClick={() => openAdd()}>
              <Plus className="mr-1.5 h-4 w-4" /> Add Event
            </Button>
          </div>
        </div>

        {/* views */}
        {view === "year" && (
          <YearView
            year={anchor.getFullYear()}
            today={today}
            eventsByDate={eventsByDate}
            onSelectMonth={(m) => { setAnchor(new Date(anchor.getFullYear(), m, 1)); setView("month") }}
          />
        )}
        {view === "month" && (
          <MonthView
            year={anchor.getFullYear()}
            month={anchor.getMonth()}
            today={today}
            selectedDate={selectedDate}
            eventsByDate={eventsByDate}
            loading={loading}
            onSelectDate={(d) => { setSelectedDate(d); setView("day"); setAnchor(d) }}
            onAddEvent={openAdd}
          />
        )}
        {view === "week" && (
          <WeekView
            anchor={anchor}
            today={today}
            eventsByDate={eventsByDate}
            loading={loading}
            onSelectDate={(d) => { setSelectedDate(d); setView("day"); setAnchor(d) }}
            onAddEvent={openAdd}
          />
        )}
        {view === "day" && (
          <DayView
            date={anchor}
            today={today}
            events={eventsByDate[toDateKey(anchor)] ?? []}
            loading={loading}
            onAddEvent={() => openAdd(anchor)}
            onDelete={handleDelete}
            deleting={deleting}
          />
        )}
        {view === "schedule" && (
          <ScheduleView
            events={events}
            loading={loading}
            onDelete={handleDelete}
            deleting={deleting}
            onAddEvent={openAdd}
          />
        )}
      </div>

      {/* Add Event Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Event</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {addError && <p className="text-sm text-destructive">{addError}</p>}

            <div className="space-y-1">
              <Label>Title *</Label>
              <Input
                value={addForm.title}
                onChange={e => setAddForm({...addForm, title: e.target.value})}
                placeholder="Event title"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Date *</Label>
                <Input
                  type="date"
                  value={addForm.event_date}
                  onChange={e => setAddForm({...addForm, event_date: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <Label>Type</Label>
                <Select value={addForm.type} onValueChange={v => setAddForm({...addForm, type: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["personal","reminder","shift","meeting","review","training","inspection"].map(t => (
                      <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="all_day"
                checked={addForm.is_all_day}
                onChange={e => setAddForm({...addForm, is_all_day: e.target.checked})}
                className="h-4 w-4 rounded border-border"
              />
              <Label htmlFor="all_day" className="cursor-pointer">All day</Label>
            </div>

            {!addForm.is_all_day && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Start Time</Label>
                  <Input type="time" value={addForm.start_time} onChange={e => setAddForm({...addForm, start_time: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <Label>End Time</Label>
                  <Input type="time" value={addForm.end_time} onChange={e => setAddForm({...addForm, end_time: e.target.value})} />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <Label className="flex items-center gap-1.5">
                <Bell className="h-3.5 w-3.5" /> Reminder
              </Label>
              <Select value={addForm.reminder_minutes} onValueChange={v => setAddForm({...addForm, reminder_minutes: v})}>
                <SelectTrigger><SelectValue placeholder="No reminder" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No reminder</SelectItem>
                  {REMINDER_OPTIONS.map(o => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Notes</Label>
              <Textarea
                value={addForm.description}
                onChange={e => setAddForm({...addForm, description: e.target.value})}
                placeholder="Optional notes…"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)} disabled={addSaving}>Cancel</Button>
            <Button onClick={handleAddEvent} disabled={addSaving}>
              {addSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
