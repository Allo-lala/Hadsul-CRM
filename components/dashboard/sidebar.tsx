"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  Calendar,
  Clock,
  ClipboardList,
  FileText,
  Settings,
  MessageSquare,
  Building2,
  ChevronDown,
  ChevronRight,
  Palmtree,
  Shield,
  BarChart3,
  Wrench,
  RefreshCw,
  BookOpen,
  Bell,
  HelpCircle,
  LogOut,
  Menu,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"

interface NavItem {
  title: string
  href?: string
  icon: React.ElementType
  children?: { title: string; href: string }[]
}

const navItems: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Inbox", href: "/dashboard/inbox", icon: MessageSquare },
  { title: "Calendar", href: "/dashboard/calendar", icon: Calendar },
  { title: "Daily Tasks", href: "/dashboard/tasks", icon: ClipboardList },
  { title: "Handover", href: "/dashboard/handover", icon: RefreshCw },
  { title: "Maintenance", href: "/dashboard/maintenance", icon: Wrench },
  {
    title: "Setup",
    icon: Settings,
    children: [
      { title: "Care Plans", href: "/dashboard/setup/care-plans" },
      { title: "Pre-Admission", href: "/dashboard/setup/pre-admission" },
      { title: "Business Alerts", href: "/dashboard/setup/alerts" },
      { title: "Company Profile", href: "/dashboard/setup/company" },
      { title: "Staff", href: "/dashboard/setup/staff" },
    ],
  },
  {
    title: "Reports",
    icon: BarChart3,
    children: [
      { title: "Service Users", href: "/dashboard/reports/service-users" },
      { title: "Incidents", href: "/dashboard/reports/incidents" },
      { title: "Temperatures", href: "/dashboard/reports/temperatures" },
      { title: "CQC Health Check", href: "/dashboard/reports/cqc" },
      { title: "Staff Reports", href: "/dashboard/reports/staff" },
      { title: "Finance", href: "/dashboard/reports/finance" },
    ],
  },
  {
    title: "Rota",
    icon: Calendar,
    children: [
      { title: "My Rota", href: "/dashboard/rota/my-rota" },
      { title: "Manage Rota", href: "/dashboard/rota/manage" },
      { title: "Shift Auditor", href: "/dashboard/rota/auditor" },
    ],
  },
  { title: "Holidays", href: "/dashboard/holidays", icon: Palmtree },
  { title: "Clock In/Out", href: "/dashboard/clock", icon: Clock },
  { title: "Staff", href: "/dashboard/staff", icon: Users },
  { title: "CQC Inspection", href: "/dashboard/cqc", icon: Shield },
  { title: "Policy & Procedures", href: "/dashboard/policies", icon: BookOpen },
]

const bottomNavItems: NavItem[] = [
  { title: "Updates & News", href: "/dashboard/updates", icon: Bell },
  { title: "Help & Support", href: "/dashboard/support", icon: HelpCircle },
]

function NavItemComponent({ item, isCollapsed }: { item: NavItem; isCollapsed: boolean }) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const hasChildren = item.children && item.children.length > 0
  const isActive = item.href ? pathname === item.href : item.children?.some((child) => pathname === child.href)

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

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

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
            {bottomNavItems.map((item) => (
              <NavItemComponent key={item.title} item={item} isCollapsed={isCollapsed} />
            ))}
          </nav>

          {/* User Profile */}
          <div
            className={cn(
              "flex items-center gap-3 rounded-lg p-2 hover:bg-sidebar-accent",
              isCollapsed && "justify-center"
            )}
          >
            <Avatar className="h-9 w-9">
              <AvatarImage src="/placeholder.svg?height=36&width=36" alt="User" />
              <AvatarFallback className="bg-primary text-primary-foreground">JD</AvatarFallback>
            </Avatar>
            {!isCollapsed && (
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium text-sidebar-foreground">John Doe</p>
                <p className="truncate text-xs text-sidebar-foreground/60">Care Home Admin</p>
              </div>
            )}
            {!isCollapsed && (
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-sidebar-foreground/70">
                <LogOut className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}
