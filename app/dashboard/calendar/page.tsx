"use client"

import { useState } from "react"
import { Header } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Event {
  id: string
  title: string
  type: "shift" | "meeting" | "review" | "training" | "inspection"
  time: string
  location?: string
  attendees?: number
}

interface DayEvents {
  [key: number]: Event[]
}

const events: DayEvents = {
  24: [
    { id: "1", title: "Morning Shift Handover", type: "shift", time: "07:00", location: "Wing A" },
    { id: "2", title: "Care Plan Review - Mrs. Thompson", type: "review", time: "10:00", location: "Office" },
  ],
  25: [
    { id: "3", title: "Staff Training Session", type: "training", time: "14:00", location: "Training Room", attendees: 12 },
  ],
  26: [
    { id: "4", title: "Team Meeting", type: "meeting", time: "09:00", location: "Conference Room", attendees: 8 },
    { id: "5", title: "Evening Shift Handover", type: "shift", time: "15:00", location: "Wing B" },
  ],
  27: [
    { id: "6", title: "CQC Inspection", type: "inspection", time: "10:00", location: "All Areas" },
  ],
  28: [
    { id: "7", title: "Fire Safety Training", type: "training", time: "11:00", location: "Training Room", attendees: 20 },
    { id: "8", title: "Care Plan Review - Mr. Davis", type: "review", time: "14:00", location: "Office" },
  ],
  30: [
    { id: "9", title: "Monthly Staff Meeting", type: "meeting", time: "10:00", location: "Main Hall", attendees: 45 },
  ],
}

const eventStyles = {
  shift: "bg-chart-1/20 border-chart-1/40 text-chart-1",
  meeting: "bg-chart-2/20 border-chart-2/40 text-chart-2",
  review: "bg-warning/20 border-warning/40 text-warning",
  training: "bg-chart-4/20 border-chart-4/40 text-chart-4",
  inspection: "bg-destructive/20 border-destructive/40 text-destructive",
}

const eventLabels = {
  shift: "Shift",
  meeting: "Meeting",
  review: "Review",
  training: "Training",
  inspection: "Inspection",
}

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

// Generate calendar days for March 2025
const generateCalendarDays = () => {
  const days = []
  // Previous month days (Feb ends on 28, March starts on Saturday)
  for (let i = 0; i < 6; i++) {
    days.push({ day: 23 + i, currentMonth: false })
  }
  // Current month days
  for (let i = 1; i <= 31; i++) {
    days.push({ day: i, currentMonth: true })
  }
  // Next month days
  for (let i = 1; i <= 5; i++) {
    days.push({ day: i, currentMonth: false })
  }
  return days
}

const calendarDays = generateCalendarDays()

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState(24)
  const today = 24 // Simulating today as March 24

  const selectedEvents = events[selectedDate] || []

  return (
    <div className="min-h-screen">
      <Header title="Calendar" subtitle="View shifts, meetings, and events" />

      <div className="p-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Calendar */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button variant="outline" size="icon">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div>
                    <h2 className="text-xl font-semibold">March 2025</h2>
                  </div>
                  <Button variant="outline" size="icon">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    Today
                  </Button>
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Event
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Week days header */}
              <div className="grid grid-cols-7 mb-2">
                {weekDays.map((day) => (
                  <div
                    key={day}
                    className="p-2 text-center text-sm font-medium text-muted-foreground"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.slice(0, 42).map((dateObj, index) => {
                  const dayEvents = dateObj.currentMonth ? events[dateObj.day] : undefined
                  const isToday = dateObj.currentMonth && dateObj.day === today
                  const isSelected = dateObj.currentMonth && dateObj.day === selectedDate

                  return (
                    <button
                      key={index}
                      onClick={() => dateObj.currentMonth && setSelectedDate(dateObj.day)}
                      className={cn(
                        "relative min-h-[100px] rounded-lg border p-2 text-left transition-all hover:bg-muted/50",
                        !dateObj.currentMonth && "bg-muted/20 text-muted-foreground",
                        isToday && "border-primary bg-primary/5",
                        isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                      )}
                    >
                      <span
                        className={cn(
                          "inline-flex h-7 w-7 items-center justify-center rounded-full text-sm",
                          isToday && "bg-primary text-primary-foreground font-medium"
                        )}
                      >
                        {dateObj.day}
                      </span>
                      {dayEvents && dayEvents.length > 0 && (
                        <div className="mt-1 space-y-1">
                          {dayEvents.slice(0, 2).map((event) => (
                            <div
                              key={event.id}
                              className={cn(
                                "truncate rounded px-1.5 py-0.5 text-[10px] font-medium",
                                eventStyles[event.type]
                              )}
                            >
                              {event.title}
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <p className="text-[10px] text-muted-foreground pl-1">
                              +{dayEvents.length - 2} more
                            </p>
                          )}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Selected Day Events */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-primary" />
                March {selectedDate}, 2025
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedEvents.length > 0 ? (
                <ScrollArea className="h-[500px]">
                  <div className="space-y-4 pr-4">
                    {selectedEvents.map((event) => (
                      <div
                        key={event.id}
                        className={cn(
                          "rounded-lg border p-4 transition-all hover:shadow-md",
                          eventStyles[event.type]
                        )}
                      >
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <Badge variant="outline" className={eventStyles[event.type]}>
                              {eventLabels[event.type]}
                            </Badge>
                            <h3 className="font-semibold">{event.title}</h3>
                            <div className="flex flex-col gap-1.5 text-sm opacity-80">
                              <div className="flex items-center gap-2">
                                <Clock className="h-3.5 w-3.5" />
                                {event.time}
                              </div>
                              {event.location && (
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-3.5 w-3.5" />
                                  {event.location}
                                </div>
                              )}
                              {event.attendees && (
                                <div className="flex items-center gap-2">
                                  <Users className="h-3.5 w-3.5" />
                                  {event.attendees} attendees
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <CalendarIcon className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="mt-4 font-medium">No events scheduled</p>
                  <p className="text-sm text-muted-foreground">
                    Add an event for this day
                  </p>
                  <Button className="mt-4" size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Event
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Event Type Legend */}
        <Card className="mt-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-6">
              <span className="text-sm font-medium text-muted-foreground">Event Types:</span>
              {Object.entries(eventLabels).map(([key, label]) => (
                <div key={key} className="flex items-center gap-2">
                  <div
                    className={cn(
                      "h-4 w-4 rounded border",
                      eventStyles[key as keyof typeof eventStyles]
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
