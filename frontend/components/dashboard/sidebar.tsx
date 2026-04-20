"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/backend/lib/utils"
import {
  LayoutDashboard,
  Users,
  Calendar,
  Clock,
  Building2,
  ChevronDown,
  ChevronRight,
  BarChart3,
  Bell,
  MessageSquare,
  LogOut,
  Menu,
  X,
  User,
  Shield,
} from "lucide-react"
import { Button } from "@/frontend/components/ui/button"
import { Avatar, AvatarFallback } from "@/frontend/components/ui/avatar"
import { ScrollArea } from "@/frontend/components/ui/scroll-area"
import type { UserRole } from "@/shared/types"
import { NotificationsPanel } from "@/frontend/components/dashboard/notifications-panel"
import { SupportChat } from "@/frontend/components/dashboard/support-chat"

interface NavItem {
  title: string
  href?: string
  icon: React.ElementType
  children?: { title: string; href: string }[]
}

// Role-scoped nav definitions (Requirements 8.1, 8.2, 8.3)
function getNavItems(role: UserRole): NavItem[] {
  if (role === "super_admin") {
    return [
      { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { title: "Care Homes", href: "/dashboard/care-homes", icon: Building2 },
      { title: "All Staff", href: "/dashboard/staff", icon: Users },
      {
        title: "Platform Reports",
        icon: BarChart3,
        children: [
          { title: "Staff Reports", href: "/dashboard/reports/staff" },
          { title: "Finance", href: "/dashboard/reports/finance" },
        ],
      },
      { title: "User Management", href: "/dashboard/users", icon: Shield },
    ]
  }

  if (role === "care_home_admin" || role === "manager") {
    return [
      { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { title: "Staff", href: "/dashboard/staff", icon: Users },
      { title: "Clock In/Out", href: "/dashboard/clock", icon: Clock },
      {
        title: "Rota",
        icon: Calendar,
        children: [
          { title: "Manage Rota", href: "/dashboard/rota/manage" },
        ],
      },
      {
        title: "Reports",
        icon: BarChart3,
        children: [
          { title: "Staff Reports", href: "/dashboard/reports/staff" },
          { title: "Finance", href: "/dashboard/reports/finance" },
        ],
      },
    ]
  }

  // Staff / all other roles (Requirements 8.3)
  return [
    { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { title: "Clock In/Out", href: "/dashboard/clock", icon: Clock },
    { title: "My Schedule", href: "/dashboard/calendar", icon: Calendar },
    { title: "My Profile", href: "/dashboard/profile", icon: User },
  ]
}

function getRoleLabel(role: UserRole): string {
  switch (role) {
    case "super_admin": return "Platform Admin"
    case "care_home_admin": return "Care Home Admin"
    case "manager": return "Manager"
    case "senior_carer": return "Senior Carer"
    case "carer": return "Carer"
    case "nurse": return "Nurse"
    case "domestic": return "Domestic"
    case "kitchen": return "Kitchen"
    case "maintenance": return "Maintenance"
    case "admin_staff": return "Admin Staff"
    default: return role
  }
}

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

interface NavItemComponentProps {
  item: NavItem
  isCollapsed: boolean
}

function NavItemComponent({ item, isCollapsed }: NavItemComponentProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const hasChildren = item.children && item.children.length > 0
  const isActive = item.href
    ? pathname === item.href
    : item.children?.some((child) => pathname === child.href)

  if (hasChildren) {
    return (
      <div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
            "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
            isActive && "bg-sidebar-accent text-sidebar-foreground"
          )}
        >
          <item.icon className="h-5 w-5 shrink-0" />
          {!isCollapsed && (
            <>
              <span className="flex-1 text-left">{item.title}</span>
              {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </>
          )}
        </button>
        {!isCollapsed && isOpen && (
          <div className="ml-4 mt-1 space-y-1 border-l border-sidebar-border pl-4">
            {item.children?.map((child) => (
              <Link
                key={child.href}
                href={child.href}
                className={cn(
                  "block rounded-lg px-3 py-2 text-sm transition-all duration-200",
                  "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                  pathname === child.href && "bg-sidebar-primary/10 text-sidebar-primary"
                )}
              >
                {child.title}
              </Link>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <Link
      href={item.href || "#"}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
        "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
        isActive && "bg-sidebar-primary/10 text-sidebar-primary"
      )}
    >
      <item.icon className="h-5 w-5 shrink-0" />
      {!isCollapsed && <span>{item.title}</span>}
    </Link>
  )
}

export interface SidebarUserProps {
  firstName: string
  lastName: string
  role: UserRole
  careHomeName: string | null
  profileImageUrl?: string | null
}

interface SidebarProps {
  user: SidebarUserProps
}

export function Sidebar({ user }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const router = useRouter()

  const isStaffRole = !["super_admin", "care_home_admin", "manager"].includes(user.role)
  const navItems = getNavItems(user.role)
  const roleLabel = getRoleLabel(user.role)
  const contextLabel = user.role === "super_admin" ? "Platform Admin" : (user.careHomeName ?? roleLabel)
  const initials = getInitials(user.firstName, user.lastName)
  const fullName = `${user.firstName} ${user.lastName}`

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/login")
  }

  const bottomNavItems: NavItem[] = [
    { title: "Updates & News", href: "/dashboard/updates", icon: Bell },
    { title: "Help & Support", href: "/dashboard/support", icon: MessageSquare },
  ]

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed left-4 top-4 z-50 lg:hidden"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300",
          isCollapsed ? "w-[72px]" : "w-64",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Building2 className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold text-sidebar-foreground">Hadsul CRM</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="hidden h-8 w-8 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground lg:flex"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavItemComponent key={item.title} item={item} isCollapsed={isCollapsed} />
            ))}
          </nav>
        </ScrollArea>

        {/* Bottom Section */}
        <div className="border-t border-sidebar-border p-3">
          <nav className="mb-3 space-y-1">
            {isStaffRole ? (
              <>
                <button
                  onClick={() => setNotifOpen(true)}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all"
                >
                  <Bell className="h-5 w-5 shrink-0" />
                  {!isCollapsed && <span>Updates & News</span>}
                </button>
                <button
                  onClick={() => setChatOpen(true)}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all"
                >
                  <MessageSquare className="h-5 w-5 shrink-0" />
                  {!isCollapsed && <span>Help & Support</span>}
                </button>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 transition-all"
                >
                  <LogOut className="h-5 w-5 shrink-0 text-destructive" />
                  {!isCollapsed && <span>Log out</span>}
                </button>
              </>
            ) : (
              <>
                {bottomNavItems.map((item) => (
                  <NavItemComponent key={item.title} item={item} isCollapsed={isCollapsed} />
                ))}
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 transition-all"
                >
                  <LogOut className="h-5 w-5 shrink-0 text-destructive" />
                  {!isCollapsed && <span>Log out</span>}
                </button>
              </>
            )}
          </nav>

          {/* User name / context — no logout button here anymore */}
          <div className={cn("flex items-center gap-3 rounded-lg p-2", isCollapsed && "justify-center")}>
            <Avatar className="h-9 w-9 shrink-0">
              {user.profileImageUrl ? (
                <img src={user.profileImageUrl} alt={fullName} className="h-9 w-9 rounded-full object-cover" />
              ) : (
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {initials}
                </AvatarFallback>
              )}
            </Avatar>
            {!isCollapsed && (
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium text-sidebar-foreground">{fullName}</p>
                <p className="truncate text-xs text-sidebar-foreground/60">{contextLabel}</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Staff panels rendered from sidebar */}
      {isStaffRole && (
        <>
          <NotificationsPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
          <SupportChat open={chatOpen} onClose={() => setChatOpen(false)} staffName={fullName} />
        </>
      )}
    </>
  )
}
