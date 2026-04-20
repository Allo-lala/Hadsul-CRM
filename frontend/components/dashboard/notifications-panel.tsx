"use client"

import { useState, useEffect, useCallback } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/frontend/components/ui/sheet"
import { Button } from "@/frontend/components/ui/button"
import { Badge } from "@/frontend/components/ui/badge"
import { ScrollArea } from "@/frontend/components/ui/scroll-area"
import { Bell, CheckCheck, Clock, AlertTriangle, Info, CheckCircle2, Calendar } from "lucide-react"
import { cn } from "@/backend/lib/utils"
import { apiRequest } from "@/backend/lib/api"
import type { Notification } from "@/app/api/notifications/route"

const TYPE_ICON: Record<string, React.ElementType> = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: AlertTriangle,
  shift: Clock,
  task: CheckCheck,
  incident: AlertTriangle,
}

const TYPE_COLOR: Record<string, string> = {
  info: "text-blue-500",
  success: "text-success",
  warning: "text-amber-500",
  error: "text-destructive",
  shift: "text-primary",
  task: "text-violet-500",
  incident: "text-destructive",
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

interface NotificationsPanelProps {
  open: boolean
  onClose: () => void
  onUnreadChange?: (count: number) => void
}

export function NotificationsPanel({ open, onClose, onUnreadChange }: NotificationsPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await apiRequest<Notification[]>("/api/notifications")
    if (data) {
      setNotifications(data)
      const unread = data.filter(n => !n.is_read).length
      onUnreadChange?.(unread)
    }
    setLoading(false)
  }, [onUnreadChange])

  useEffect(() => {
    if (open) load()
  }, [open, load])

  async function markAllRead() {
    await apiRequest("/api/notifications", { method: "PATCH" })
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    onUnreadChange?.(0)
  }

  const unread = notifications.filter(n => !n.is_read).length

  return (
    <Sheet open={open} onOpenChange={open => { if (!open) onClose() }}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
        <SheetHeader className="px-6 py-4 border-b border-border">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
              {unread > 0 && (
                <Badge className="h-5 px-1.5 text-xs">{unread}</Badge>
              )}
            </SheetTitle>
            {unread > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllRead} className="text-xs text-muted-foreground">
                <CheckCheck className="mr-1.5 h-3.5 w-3.5" /> Mark all read
              </Button>
            )}
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1">
          {loading ? (
            <div className="space-y-3 p-4">
              {[1,2,3].map(i => <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />)}
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-6">
              <Bell className="h-10 w-10 text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map(n => {
                const Icon = TYPE_ICON[n.type] ?? Info
                return (
                  <div key={n.id} className={cn("flex gap-3 px-6 py-4 transition-colors", !n.is_read && "bg-primary/3")}>
                    <div className={cn("mt-0.5 shrink-0", TYPE_COLOR[n.type] ?? "text-muted-foreground")}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={cn("text-sm font-medium", !n.is_read && "text-foreground")}>{n.title}</p>
                        {!n.is_read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-[10px] text-muted-foreground/60 mt-1">{timeAgo(n.created_at)}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
