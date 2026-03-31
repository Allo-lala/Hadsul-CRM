"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Bell, Moon, Sun, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useTheme } from "next-themes"
import { apiRequest } from "@/lib/api"
import { NotificationsPanel } from "@/components/dashboard/notifications-panel"
import { SupportChat } from "@/components/dashboard/support-chat"
import type { UserRole } from "@/lib/types"

// Roles that are "staff" (not admin/manager)
function isStaffRole(role?: string): boolean {
  if (!role) return false
  return !["super_admin", "care_home_admin", "manager"].includes(role)
}

interface MeData {
  id: string
  first_name: string
  last_name: string
  role: UserRole
  profile_image_url?: string | null
}

export interface HeaderUserProps {
  firstName: string
  lastName: string
  role: UserRole
  profileImageUrl?: string | null
}

interface HeaderProps {
  title: string
  subtitle?: string
  // user prop kept for API compatibility but role detection is done client-side
  user?: HeaderUserProps
}

export function Header({ title, subtitle }: HeaderProps) {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const [notifOpen, setNotifOpen] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [me, setMe] = useState<MeData | null>(null)

  useEffect(() => { setMounted(true) }, [])

  // Fetch current user on mount — gives us role + profile picture
  useEffect(() => {
    apiRequest<MeData>("/api/auth/me").then(({ data }) => {
      if (data) setMe(data)
    })
  }, [])

  const loadUnread = useCallback(async () => {
    const { data } = await apiRequest<{ id: string; is_read: boolean }[]>("/api/notifications")
    if (data) setUnreadCount(data.filter(n => !n.is_read).length)
  }, [])

  useEffect(() => { loadUnread() }, [loadUnread])

  const staffMode = isStaffRole(me?.role)
  const fullName = me ? `${me.first_name} ${me.last_name}` : ""
  const initials = me ? `${me.first_name.charAt(0)}${me.last_name.charAt(0)}`.toUpperCase() : "?"

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div>
          <h1 className="text-xl font-semibold text-foreground">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-2">
          {/* Dark/light toggle — always visible */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="text-muted-foreground hover:text-foreground"
          >
            {mounted ? (
              resolvedTheme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />
            ) : <div className="h-5 w-5" />}
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* Help & Support — staff only, opens chat */}
          {staffMode && (
            <Button
              variant="ghost"
              size="icon"
              title="Help & Support"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => setChatOpen(true)}
            >
              <MessageSquare className="h-5 w-5" />
            </Button>
          )}

          {/* Notifications bell — always visible */}
          <Button
            variant="ghost"
            size="icon"
            className="relative text-muted-foreground hover:text-foreground"
            onClick={() => setNotifOpen(true)}
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Button>

          {/* Avatar — only show for non-staff (admins). Staff avatar is in the sidebar. */}
          {me && !staffMode && (
            <div className="ml-1">
              <Avatar className="h-8 w-8 cursor-default">
                {me.profile_image_url ? (
                  <img
                    src={me.profile_image_url}
                    alt={fullName}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                    {initials}
                  </AvatarFallback>
                )}
              </Avatar>
            </div>
          )}
        </div>
      </header>

      <NotificationsPanel
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
        onUnreadChange={setUnreadCount}
      />
      <SupportChat
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        staffName={fullName}
      />
    </>
  )
}
