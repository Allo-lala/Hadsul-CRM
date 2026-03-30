"use client"

import { useState } from "react"
import { Header } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  Plus,
  MoreHorizontal,
  Mail,
  Phone,
  Clock,
  CheckCircle,
  XCircle,
  Filter,
  Download,
  Users,
  UserCheck,
  UserX,
} from "lucide-react"

interface Staff {
  id: string
  name: string
  email: string
  phone: string
  role: string
  department: string
  status: "active" | "inactive" | "on-leave"
  clockedIn: boolean
  lastClockIn?: string
  hoursThisWeek: number
  avatar?: string
  initials: string
}

const staffData: Staff[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah.j@carehome.com",
    phone: "+44 7700 900001",
    role: "Senior Nurse",
    department: "Wing A",
    status: "active",
    clockedIn: true,
    lastClockIn: "06:58 AM",
    hoursThisWeek: 38.5,
    initials: "SJ",
  },
  {
    id: "2",
    name: "Mike Peters",
    email: "mike.p@carehome.com",
    phone: "+44 7700 900002",
    role: "Care Assistant",
    department: "Wing B",
    status: "active",
    clockedIn: true,
    lastClockIn: "07:15 AM",
    hoursThisWeek: 42.0,
    initials: "MP",
  },
  {
    id: "3",
    name: "Emma Davis",
    email: "emma.d@carehome.com",
    phone: "+44 7700 900003",
    role: "Nurse",
    department: "Wing A",
    status: "active",
    clockedIn: false,
    hoursThisWeek: 36.0,
    initials: "ED",
  },
  {
    id: "4",
    name: "Tom Wilson",
    email: "tom.w@carehome.com",
    phone: "+44 7700 900004",
    role: "Care Assistant",
    department: "Wing C",
    status: "on-leave",
    clockedIn: false,
    hoursThisWeek: 24.0,
    initials: "TW",
  },
  {
    id: "5",
    name: "Lisa Brown",
    email: "lisa.b@carehome.com",
    phone: "+44 7700 900005",
    role: "Senior Care Assistant",
    department: "Wing B",
    status: "active",
    clockedIn: true,
    lastClockIn: "06:45 AM",
    hoursThisWeek: 40.0,
    initials: "LB",
  },
  {
    id: "6",
    name: "Alex Miller",
    email: "alex.m@carehome.com",
    phone: "+44 7700 900006",
    role: "Care Assistant",
    department: "Wing A",
    status: "inactive",
    clockedIn: false,
    hoursThisWeek: 0,
    initials: "AM",
  },
  {
    id: "7",
    name: "Rachel Green",
    email: "rachel.g@carehome.com",
    phone: "+44 7700 900007",
    role: "Night Nurse",
    department: "All Wings",
    status: "active",
    clockedIn: false,
    hoursThisWeek: 35.0,
    initials: "RG",
  },
  {
    id: "8",
    name: "James Taylor",
    email: "james.t@carehome.com",
    phone: "+44 7700 900008",
    role: "Maintenance",
    department: "Facilities",
    status: "active",
    clockedIn: true,
    lastClockIn: "08:00 AM",
    hoursThisWeek: 32.5,
    initials: "JT",
  },
]

const statusStyles = {
  active: "bg-success/10 text-success border-success/30",
  inactive: "bg-muted text-muted-foreground border-border",
  "on-leave": "bg-warning/10 text-warning border-warning/30",
}

const statusLabels = {
  active: "Active",
  inactive: "Inactive",
  "on-leave": "On Leave",
}

export default function StaffPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredStaff = staffData.filter((staff) => {
    const matchesSearch =
      staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.role.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = roleFilter === "all" || staff.role === roleFilter
    const matchesStatus = statusFilter === "all" || staff.status === statusFilter
    return matchesSearch && matchesRole && matchesStatus
  })

  const totalStaff = staffData.length
  const activeStaff = staffData.filter((s) => s.status === "active").length
  const clockedInStaff = staffData.filter((s) => s.clockedIn).length

  const uniqueRoles = Array.from(new Set(staffData.map((s) => s.role)))

  return (
    <div className="min-h-screen">
      <Header title="Staff Management" subtitle="Manage your care home staff and teams" />

      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Staff</p>
                  <p className="text-2xl font-bold">{totalStaff}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
                  <UserCheck className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Staff</p>
                  <p className="text-2xl font-bold">{activeStaff}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-chart-1/10">
                  <Clock className="h-6 w-6 text-chart-1" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Clocked In Now</p>
                  <p className="text-2xl font-bold">{clockedInStaff}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Staff Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle>All Staff</CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Staff
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search staff..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {uniqueRoles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="on-leave">On Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff Member</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Clock Status</TableHead>
                    <TableHead className="text-right">Hours (Week)</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStaff.map((staff) => (
                    <TableRow key={staff.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={staff.avatar} />
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {staff.initials}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{staff.name}</p>
                            <p className="text-sm text-muted-foreground">{staff.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{staff.role}</TableCell>
                      <TableCell>{staff.department}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusStyles[staff.status]}>
                          {statusLabels[staff.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {staff.clockedIn ? (
                          <div className="flex items-center gap-2 text-success">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-sm">In ({staff.lastClockIn})</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <XCircle className="h-4 w-4" />
                            <span className="text-sm">Out</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {staff.hoursThisWeek}h
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>View Profile</DropdownMenuItem>
                            <DropdownMenuItem>Edit Details</DropdownMenuItem>
                            <DropdownMenuItem>View Schedule</DropdownMenuItem>
                            <DropdownMenuItem>Send Message</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              Deactivate
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
