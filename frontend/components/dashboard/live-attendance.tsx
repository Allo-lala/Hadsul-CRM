"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/frontend/components/ui/card"
import { Badge } from "@/frontend/components/ui/badge"
import { Avatar, AvatarFallback } from "@/frontend/components/ui/avatar"
import { ScrollArea } from "@/frontend/components/ui/scroll-area"
import { Clock, Users, AlertTriangle } from "lucide-react"
import { apiRequest } from "@/backend/lib/api"
import type { ClockRecord } from "@/shared/types"

type LiveRecord = ClockRecord & { elapsed_minutes: number }

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
}

function formatElapsed(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60)
  const m = Math.floor(totalMinutes % 60)
  const s = Math.floor((totalMinutes * 60) % 60)
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":")
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

function formatRole(role: string): string {
  return role
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

interface LiveAttendanceProps {
  /** Optional: super_admin can pass a specific care home id */
  careHomeId?: string
}

// Requirements: 5.2, 5.3, 5.4
export function LiveAttendance({ careHomeId }: LiveAttendanceProps) {
  const [records, setRecords] = useState<LiveRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // Local elapsed seconds per record, keyed by record id
  const [elapsed, setElapsed] = useState<Record<string, number>>({})
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const buildUrl = useCallback(() => {
    const base = "/api/clock/live"
    return careHomeId ? `${base}?care_home_id=${careHomeId}` : base
  }, [careHomeId])

  const fetchRecords = useCallback(async () => {
    const { data, error: err } = await apiRequest<LiveRecord[]>(buildUrl())
    if (err) {
      setError(err)
      return
    }
    setError(null)
    const list = data ?? []
    setRecords(list)
    // Seed elapsed seconds from server-computed elapsed_minutes
    setElapsed(
      Object.fromEntries(list.map((r) => [r.id, Math.floor(r.elapsed_minutes * 60)]))
    )
  }, [buildUrl])

  // Initial fetch + 30-second polling (Requirement 5.3)
  useEffect(() => {
    const init = async () => {
      setLoading(true)
      await fetchRecords()
      setLoading(false)
    }
    init()

    pollRef.current = setInterval(fetchRecords, 30_000)
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [fetchRecords])

  // 1-second local tick to increment elapsed counters (Requirement 5.2)
  useEffect(() => {
    tickRef.current = setInterval(() => {
      setElapsed((prev) => {
        const next: Record<string, number> = {}
        for (const id in prev) next[id] = prev[id] + 1
        return next
      })
    }, 1000)
    return () => {
      if (tickRef.current) clearInterval(tickRef.current)
    }
  }, [])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Live Attendance
          </CardTitle>
          <CardDescription>Staff currently on site — refreshes every 30 seconds</CardDescription>
        </div>
        <Badge variant="outline" className="bg-success/10 text-success border-success/30">
          {records.length} on site
        </Badge>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <p className="px-6 py-8 text-center text-sm text-muted-foreground">Loading…</p>
        ) : error ? (
          <div className="flex items-center gap-2 px-6 py-8 text-sm text-destructive">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        ) : records.length === 0 ? (
          <p className="px-6 py-8 text-center text-sm text-muted-foreground">
            No staff currently clocked in.
          </p>
        ) : (
          <ScrollArea className="h-[360px] px-6">
            <div className="space-y-3 pb-4 pt-2">
              {records.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center gap-4 rounded-lg border border-border bg-card/50 p-3 transition-colors hover:bg-muted/50"
                >
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarFallback className="bg-primary/10 text-sm text-primary">
                      {record.staff_name ? getInitials(record.staff_name) : "?"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm text-foreground truncate">
                        {record.staff_name ?? "Unknown"}
                      </span>
                      {record.is_late && (
                        // Late badge — Requirement 5.4
                        <Badge
                          variant="outline"
                          className="bg-destructive/10 text-destructive border-destructive/30 text-xs"
                        >
                          Late
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {record.staff_role ? formatRole(record.staff_role) : "—"}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground justify-end">
                      <Clock className="h-3 w-3" />
                      <span>In at {formatTime(record.clock_in_time)}</span>
                    </div>
                    {/* Live elapsed timer updated every second — Requirement 5.2 */}
                    <p className="font-mono text-sm font-semibold text-foreground mt-0.5">
                      {formatElapsed(elapsed[record.id] != null ? elapsed[record.id] / 60 : record.elapsed_minutes)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
