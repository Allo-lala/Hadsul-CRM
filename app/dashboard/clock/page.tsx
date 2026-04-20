"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Header } from "@/frontend/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/frontend/components/ui/card"
import { Button } from "@/frontend/components/ui/button"
import { Badge } from "@/frontend/components/ui/badge"
import { Avatar, AvatarFallback } from "@/frontend/components/ui/avatar"
import { Progress } from "@/frontend/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/frontend/components/ui/table"
import { Clock, LogIn, LogOut, Timer, TrendingUp, CheckCircle2, AlertTriangle } from "lucide-react"
import { apiRequest } from "@/backend/lib/api"
import type { ClockRecord, StaffMember } from "@/shared/types"

function formatElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":")
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  if (d.toDateString() === today.toDateString()) return "Today"
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday"
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" })
}

function getInitials(name: string): string {
  return name.split(" ").map((p) => p[0]).join("").toUpperCase().slice(0, 2)
}

type StaffWithHistory = StaffMember & {
  clock_history: ClockRecord[]
  hours_this_week: number
  hours_this_month: number
}

export default function ClockPage() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [clockStatus, setClockStatus] = useState<ClockRecord | null>(null)
  const [clockHistory, setClockHistory] = useState<ClockRecord[]>([])
  const [staffProfile, setStaffProfile] = useState<StaffWithHistory | null>(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const elapsedRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // 1-second wall clock (Requirement 4.3)
  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const startElapsedTimer = useCallback((clockInTime: string) => {
    if (elapsedRef.current) clearInterval(elapsedRef.current)
    const update = () => {
      setElapsedSeconds(Math.max(0, Math.floor((Date.now() - new Date(clockInTime).getTime()) / 1000)))
    }
    update()
    elapsedRef.current = setInterval(update, 1000)
  }, [])

  const stopElapsedTimer = useCallback(() => {
    if (elapsedRef.current) { clearInterval(elapsedRef.current); elapsedRef.current = null }
    setElapsedSeconds(0)
  }, [])

  const fetchStatus = useCallback(async () => {
    const { data } = await apiRequest<ClockRecord | null>("/api/clock/status")
    setClockStatus(data ?? null)
    if (data?.clock_in_time) {
      startElapsedTimer(data.clock_in_time)
    } else {
      stopElapsedTimer()
    }
  }, [startElapsedTimer, stopElapsedTimer])

  const fetchProfile = useCallback(async () => {
    const { data: meData } = await apiRequest<{ id: string }>("/api/auth/me")
    if (!meData?.id) return
    const { data } = await apiRequest<StaffWithHistory>(`/api/staff/${meData.id}`)
    if (data) {
      setStaffProfile(data)
      setClockHistory(data.clock_history ?? [])
    }
  }, [])

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      await Promise.all([fetchStatus(), fetchProfile()])
      setLoading(false)
    }
    init()
    return () => stopElapsedTimer()
  }, [fetchStatus, fetchProfile, stopElapsedTimer])

  const handleClockIn = async () => {
    setActionLoading(true)
    setError(null)
    const { data, error: err } = await apiRequest<ClockRecord>("/api/clock/in", { method: "POST" })
    if (err) {
      setError(err)
    } else if (data) {
      setClockStatus(data)
      startElapsedTimer(data.clock_in_time)
      await fetchProfile()
    }
    setActionLoading(false)
  }

  const handleClockOut = async () => {
    setActionLoading(true)
    setError(null)
    const { data, error: err } = await apiRequest<ClockRecord>("/api/clock/out", { method: "POST" })
    if (err) {
      setError(err)
    } else if (data) {
      setClockStatus(null)
      stopElapsedTimer()
      await fetchProfile()
    }
    setActionLoading(false)
  }

  const isClockedIn = clockStatus !== null

  return (
    <div className="min-h-screen">
      <Header title="Clock In / Out" subtitle="Track your working hours" />
      <div className="p-6 space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Clock Widget */}
          <Card className="lg:col-span-1">
            <CardContent className="flex flex-col items-center justify-center p-8">
              <div className="mb-6 text-center">
                <p className="text-6xl font-bold tracking-tight text-foreground">
                  {currentTime.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                </p>
                <p className="mt-2 text-lg text-muted-foreground">
                  {currentTime.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
                </p>
              </div>

              {error && (
                <div className="mb-4 w-full rounded-md bg-destructive/10 px-4 py-2 text-sm text-destructive flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              <div className="flex w-full flex-col gap-3">
                {!isClockedIn ? (
                  <Button size="lg" className="h-14 text-lg" onClick={handleClockIn} disabled={actionLoading || loading}>
                    <LogIn className="mr-2 h-5 w-5" />
                    {actionLoading ? "Clocking In…" : "Clock In"}
                  </Button>
                ) : (
                  <Button size="lg" variant="destructive" className="h-14 text-lg" onClick={handleClockOut} disabled={actionLoading}>
                    <LogOut className="mr-2 h-5 w-5" />
                    {actionLoading ? "Clocking Out…" : "Clock Out"}
                  </Button>
                )}
              </div>

              {isClockedIn && clockStatus && (
                <div className="mt-6 space-y-2 text-center">
                  <div className="flex items-center justify-center gap-2 text-sm text-success">
                    <CheckCircle2 className="h-4 w-4" />
                    Clocked in at {formatTime(clockStatus.clock_in_time)}
                  </div>
                  {clockStatus.is_late && (
                    <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">
                      Late arrival
                    </Badge>
                  )}
                  <p className="text-3xl font-mono font-bold text-foreground">
                    {formatElapsed(elapsedSeconds)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Hours Summary */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Hours Summary</CardTitle>
              <CardDescription>Your working hours overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                <Card className="bg-muted/50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Timer className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">
                          {isClockedIn ? (elapsedSeconds / 3600).toFixed(1) : (staffProfile?.hours_today ?? 0).toFixed(1)}h
                        </p>
                        <p className="text-xs text-muted-foreground">Hours Today</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-muted/50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                        <TrendingUp className="h-5 w-5 text-success" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{(staffProfile?.hours_this_week ?? 0).toFixed(1)}h</p>
                        <p className="text-xs text-muted-foreground">This Week</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-muted/50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                        <Clock className="h-5 w-5 text-warning" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{(staffProfile?.hours_this_month ?? 0).toFixed(1)}h</p>
                        <p className="text-xs text-muted-foreground">This Month</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              {staffProfile?.contract_hours && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Weekly contract progress</span>
                    <span className="text-sm font-medium">
                      {(staffProfile.hours_this_week ?? 0).toFixed(1)}h / {staffProfile.contract_hours}h
                    </span>
                  </div>
                  <Progress
                    value={Math.min(100, ((staffProfile.hours_this_week ?? 0) / staffProfile.contract_hours) * 100)}
                    className="h-3"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Clock History — from GET /api/staff/[id] (Requirement 4.4) */}
        <Card>
          <CardHeader>
            <CardTitle>Clock History</CardTitle>
            <CardDescription>Your clock-in/out records for the past 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground py-4 text-center">Loading…</p>
            ) : clockHistory.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No records found.</p>
            ) : (
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Clock In</TableHead>
                      <TableHead>Clock Out</TableHead>
                      <TableHead>Hours</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clockHistory.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-primary/10 text-xs text-primary">
                                {staffProfile ? getInitials(`${staffProfile.first_name} ${staffProfile.last_name}`) : "?"}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{formatDate(record.clock_in_time)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <LogIn className="h-4 w-4 text-success" />
                            {formatTime(record.clock_in_time)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {record.clock_out_time ? (
                            <div className="flex items-center gap-2">
                              <LogOut className="h-4 w-4 text-muted-foreground" />
                              {formatTime(record.clock_out_time)}
                            </div>
                          ) : (
                            <Badge variant="outline" className="bg-success/10 text-success border-success/30">Active</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {record.total_hours_worked != null ? `${Number(record.total_hours_worked).toFixed(2)}h` : "—"}
                        </TableCell>
                        <TableCell>
                          {record.is_late ? (
                            <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">Late</Badge>
                          ) : (
                            <Badge variant="outline" className="bg-success/10 text-success border-success/30">On Time</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
