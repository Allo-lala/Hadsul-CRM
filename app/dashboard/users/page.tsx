"use client"

import { useState } from "react"
import { Header } from "@/frontend/components/dashboard/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/frontend/components/ui/card"
import { Button } from "@/frontend/components/ui/button"
import { Input } from "@/frontend/components/ui/input"
import { Label } from "@/frontend/components/ui/label"
import { Badge } from "@/frontend/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/frontend/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/frontend/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/frontend/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/frontend/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/frontend/components/ui/dropdown-menu"
import { 
  UserPlus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Mail, 
  Shield, 
  Users,
  CheckCircle,
  Clock,
  XCircle,
  Send
} from "lucide-react"

// Sample users data
const sampleUsers = [
  {
    id: "1",
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah.johnson@sunnydale.care",
    role: "care_home_admin",
    careHome: "Sunnydale Care Home",
    status: "active",
    isVerified: true,
    lastLogin: "2024-01-15T10:30:00Z",
    avatar: null,
  },
  {
    id: "2",
    firstName: "Michael",
    lastName: "Chen",
    email: "michael.chen@sunnydale.care",
    role: "manager",
    careHome: "Sunnydale Care Home",
    status: "active",
    isVerified: true,
    lastLogin: "2024-01-15T08:15:00Z",
    avatar: null,
  },
  {
    id: "3",
    firstName: "Emma",
    lastName: "Williams",
    email: "emma.williams@sunnydale.care",
    role: "senior_carer",
    careHome: "Sunnydale Care Home",
    status: "active",
    isVerified: true,
    lastLogin: "2024-01-14T19:45:00Z",
    avatar: null,
  },
  {
    id: "4",
    firstName: "James",
    lastName: "Brown",
    email: "james.brown@sunnydale.care",
    role: "carer",
    careHome: "Sunnydale Care Home",
    status: "pending",
    isVerified: false,
    lastLogin: null,
    avatar: null,
  },
  {
    id: "5",
    firstName: "Lisa",
    lastName: "Taylor",
    email: "lisa.taylor@rosewood.care",
    role: "nurse",
    careHome: "Rosewood Manor",
    status: "active",
    isVerified: true,
    lastLogin: "2024-01-15T07:00:00Z",
    avatar: null,
  },
]

const roleLabels: Record<string, string> = {
  super_admin: "Super Admin",
  care_home_admin: "Care Home Admin",
  manager: "Manager",
  senior_carer: "Senior Carer",
  carer: "Carer",
  nurse: "Nurse",
  domestic: "Domestic",
  kitchen: "Kitchen",
  maintenance: "Maintenance",
  admin_staff: "Admin Staff",
}

const roleColors: Record<string, string> = {
  super_admin: "bg-purple-500/10 text-purple-500",
  care_home_admin: "bg-blue-500/10 text-blue-500",
  manager: "bg-cyan-500/10 text-cyan-500",
  senior_carer: "bg-green-500/10 text-green-500",
  carer: "bg-emerald-500/10 text-emerald-500",
  nurse: "bg-pink-500/10 text-pink-500",
  domestic: "bg-orange-500/10 text-orange-500",
  kitchen: "bg-yellow-500/10 text-yellow-500",
  maintenance: "bg-gray-500/10 text-gray-500",
  admin_staff: "bg-indigo-500/10 text-indigo-500",
}

export default function UsersPage() {
  const [isInviteOpen, setIsInviteOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  // Form state for inviting new user
  const [inviteForm, setInviteForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "carer",
    careHomeId: "",
    phone: "",
    jobTitle: "",
  })

  const filteredUsers = sampleUsers.filter((user) => {
    const matchesSearch =
      user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = roleFilter === "all" || user.role === roleFilter
    const matchesStatus = statusFilter === "all" || user.status === statusFilter
    return matchesSearch && matchesRole && matchesStatus
  })

  const handleInviteUser = async () => {
    // In a real app, this would:
    // 1. Create user in database via API
    // 2. Use Clerk Admin API to create invitation
    // 3. Send email with sign-in link
    console.log("Inviting user:", inviteForm)
    setIsInviteOpen(false)
    setInviteForm({
      firstName: "",
      lastName: "",
      email: "",
      role: "carer",
      careHomeId: "",
      phone: "",
      jobTitle: "",
    })
  }

  const handleResendInvite = (userId: string) => {
    console.log("Resending invite for user:", userId)
  }

  return (
    <div className="min-h-screen">
      <Header title="User Management" subtitle="Invite and manage system users" />
      
      <main className="p-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4 mb-6">
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-card-foreground">{sampleUsers.length}</p>
                    <p className="text-sm text-muted-foreground">Total Users</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-success/10 flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-card-foreground">
                      {sampleUsers.filter((u) => u.status === "active").length}
                    </p>
                    <p className="text-sm text-muted-foreground">Active</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-warning/10 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-warning" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-card-foreground">
                      {sampleUsers.filter((u) => u.status === "pending").length}
                    </p>
                    <p className="text-sm text-muted-foreground">Pending Invite</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Shield className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-card-foreground">
                      {sampleUsers.filter((u) => ["care_home_admin", "manager"].includes(u.role)).length}
                    </p>
                    <p className="text-sm text-muted-foreground">Admins</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Users Table */}
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-card-foreground">All Users</CardTitle>
                <CardDescription>
                  Manage user accounts and send invitations
                </CardDescription>
              </div>
              <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invite User
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card border-border sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle className="text-card-foreground">Invite New User</DialogTitle>
                    <DialogDescription>
                      Send an invitation to a new staff member. They will receive an email with a link to set up their account.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-foreground">First Name</Label>
                        <Input
                          id="firstName"
                          value={inviteForm.firstName}
                          onChange={(e) => setInviteForm({ ...inviteForm, firstName: e.target.value })}
                          className="bg-background border-input text-foreground"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-foreground">Last Name</Label>
                        <Input
                          id="lastName"
                          value={inviteForm.lastName}
                          onChange={(e) => setInviteForm({ ...inviteForm, lastName: e.target.value })}
                          className="bg-background border-input text-foreground"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-foreground">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={inviteForm.email}
                        onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                        className="bg-background border-input text-foreground"
                        placeholder="user@carehome.com"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="role" className="text-foreground">Role</Label>
                        <Select
                          value={inviteForm.role}
                          onValueChange={(value) => setInviteForm({ ...inviteForm, role: value })}
                        >
                          <SelectTrigger className="bg-background border-input text-foreground">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-popover border-border">
                            <SelectItem value="care_home_admin">Care Home Admin</SelectItem>
                            <SelectItem value="manager">Manager</SelectItem>
                            <SelectItem value="senior_carer">Senior Carer</SelectItem>
                            <SelectItem value="carer">Carer</SelectItem>
                            <SelectItem value="nurse">Nurse</SelectItem>
                            <SelectItem value="domestic">Domestic</SelectItem>
                            <SelectItem value="kitchen">Kitchen</SelectItem>
                            <SelectItem value="maintenance">Maintenance</SelectItem>
                            <SelectItem value="admin_staff">Admin Staff</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="careHome" className="text-foreground">Care Home</Label>
                        <Select
                          value={inviteForm.careHomeId}
                          onValueChange={(value) => setInviteForm({ ...inviteForm, careHomeId: value })}
                        >
                          <SelectTrigger className="bg-background border-input text-foreground">
                            <SelectValue placeholder="Select care home" />
                          </SelectTrigger>
                          <SelectContent className="bg-popover border-border">
                            <SelectItem value="1">Sunnydale Care Home</SelectItem>
                            <SelectItem value="2">Rosewood Manor</SelectItem>
                            <SelectItem value="3">Oak Tree House</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-foreground">Phone (optional)</Label>
                        <Input
                          id="phone"
                          value={inviteForm.phone}
                          onChange={(e) => setInviteForm({ ...inviteForm, phone: e.target.value })}
                          className="bg-background border-input text-foreground"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="jobTitle" className="text-foreground">Job Title (optional)</Label>
                        <Input
                          id="jobTitle"
                          value={inviteForm.jobTitle}
                          onChange={(e) => setInviteForm({ ...inviteForm, jobTitle: e.target.value })}
                          className="bg-background border-input text-foreground"
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsInviteOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleInviteUser} className="bg-primary text-primary-foreground">
                      <Send className="h-4 w-4 mr-2" />
                      Send Invitation
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-background border-input text-foreground"
                  />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-[180px] bg-background border-input text-foreground">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="care_home_admin">Care Home Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="senior_carer">Senior Carer</SelectItem>
                    <SelectItem value="carer">Carer</SelectItem>
                    <SelectItem value="nurse">Nurse</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px] bg-background border-input text-foreground">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Table */}
              <div className="rounded-md border border-border">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-muted-foreground">User</TableHead>
                      <TableHead className="text-muted-foreground">Role</TableHead>
                      <TableHead className="text-muted-foreground">Care Home</TableHead>
                      <TableHead className="text-muted-foreground">Status</TableHead>
                      <TableHead className="text-muted-foreground">Last Login</TableHead>
                      <TableHead className="text-muted-foreground w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id} className="border-border">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarImage src={user.avatar || undefined} />
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {user.firstName[0]}
                                {user.lastName[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-foreground">
                                {user.firstName} {user.lastName}
                              </div>
                              <div className="text-sm text-muted-foreground">{user.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={roleColors[user.role]}>
                            {roleLabels[user.role]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-foreground">{user.careHome}</TableCell>
                        <TableCell>
                          {user.status === "active" ? (
                            <Badge variant="secondary" className="bg-success/10 text-success">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Active
                            </Badge>
                          ) : user.status === "pending" ? (
                            <Badge variant="secondary" className="bg-warning/10 text-warning">
                              <Clock className="h-3 w-3 mr-1" />
                              Pending
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-muted text-muted-foreground">
                              <XCircle className="h-3 w-3 mr-1" />
                              Inactive
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {user.lastLogin
                            ? new Date(user.lastLogin).toLocaleDateString("en-GB", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                            : "Never"}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-popover border-border">
                              <DropdownMenuItem className="cursor-pointer">
                                View Profile
                              </DropdownMenuItem>
                              <DropdownMenuItem className="cursor-pointer">
                                Edit User
                              </DropdownMenuItem>
                              {user.status === "pending" && (
                                <DropdownMenuItem
                                  className="cursor-pointer"
                                  onClick={() => handleResendInvite(user.id)}
                                >
                                  <Mail className="h-4 w-4 mr-2" />
                                  Resend Invite
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem className="cursor-pointer text-destructive">
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
        </main>
    </div>
  )
}
