"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/frontend/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/components/ui/card"
import { Input } from "@/frontend/components/ui/input"
import { Button } from "@/frontend/components/ui/button"
import { Badge } from "@/frontend/components/ui/badge"
import { Avatar, AvatarFallback } from "@/frontend/components/ui/avatar"
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/frontend/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/frontend/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/frontend/components/ui/dialog"
import { Label } from "@/frontend/components/ui/label"
import {
  Search,
  Plus,
  MoreHorizontal,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  UserCheck,
  Loader2,
} from "lucide-react"
import { apiRequest } from "@/backend/lib/api"
import type { StaffMember } from "@/shared/types"

// Standard role options per Requirement 3.6
const STANDARD_ROLES = [
  "HCA",
  "MHA",
  "Support Worker",
  "Nurse",
  "Cleaner",
  "Team Leader",
  "Kitchen Assistant",
]

const CONTRACT_TYPES = [
  { value: "full_time", label: "Full Time" },
  { value: "part_time", label: "Part Time" },
  { value: "zero_hours", label: "Zero Hours" },
  { value: "bank", label: "Bank" },
  { value: "agency", label: "Agency" },
]

function getInitials(firstName: string, lastName: string) {
  return `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase()
}

function formatRole(role: string) {
  return role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

interface AddStaffForm {
  first_name: string
  last_name: string
  email: string
  role: string
  custom_role: string
  phone: string
  job_title: string
  department: string
  hourly_rate: string
  contract_hours: string
  contract_type: string
  profile_image_url: string
}

const EMPTY_FORM: AddStaffForm = {
  first_name: "",
  last_name: "",
  email: "",
  role: "",
  custom_role: "",
  phone: "",
  job_title: "",
  department: "",
  hourly_rate: "",
  contract_hours: "",
  contract_type: "",
  profile_image_url: "",
}

export default function StaffPage() {
  const router = useRouter()
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  const [showAddDialog, setShowAddDialog] = useState(false)
  const [form, setForm] = useState<AddStaffForm>(EMPTY_FORM)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const fetchStaff = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error: err } = await apiRequest<StaffMember[]>("/api/staff")
    if (err) {
      setError(err)
    } else {
      setStaff(data ?? [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchStaff()
  }, [fetchStaff])

  const uniqueRoles = Array.from(new Set(staff.map((s) => s.role)))

  const filteredStaff = staff.filter((s) => {
    const fullName = `${s.first_name} ${s.last_name}`.toLowerCase()
    const matchesSearch =
      fullName.includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.role.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = roleFilter === "all" || s.role === roleFilter
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && s.is_active) ||
      (statusFilter === "inactive" && !s.is_active)
    return matchesSearch && matchesRole && matchesStatus
  })

  const totalStaff = staff.length
  const activeStaff = staff.filter((s) => s.is_active).length
  const clockedInStaff = staff.filter((s) => s.is_clocked_in).length

  async function handleDeactivate(id: string) {
    const { error: err } = await apiRequest(`/api/staff/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ is_active: false }),
    })
    if (!err) {
      setStaff((prev) =>
        prev.map((s) => (s.id === id ? { ...s, is_active: false } : s))
      )
    }
  }

  function handleFormChange(field: keyof AddStaffForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setFormErrors((prev) => ({ ...prev, [field]: "" }))
  }

  async function handleAddStaff() {
    const errors: Record<string, string> = {}
    if (!form.first_name.trim()) errors.first_name = "First name is required"
    if (!form.last_name.trim()) errors.last_name = "Last name is required"
    if (!form.email.trim()) errors.email = "Email is required"
    const effectiveRole = form.role === "custom" ? form.custom_role.trim() : form.role
    if (!effectiveRole) errors.role = "Role is required"
    if (form.role === "custom" && !form.custom_role.trim()) errors.custom_role = "Custom role name is required"

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    setSubmitting(true)
    setSubmitError(null)

    const payload: Record<string, unknown> = {
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      email: form.email.trim(),
      role: effectiveRole,
    }
    if (form.phone.trim()) payload.phone = form.phone.trim()
    if (form.job_title.trim()) payload.job_title = form.job_title.trim()
    if (form.department.trim()) payload.department = form.department.trim()
    if (form.hourly_rate.trim()) payload.hourly_rate = Number(form.hourly_rate)
    if (form.contract_hours.trim()) payload.contract_hours = Number(form.contract_hours)
    if (form.contract_type) payload.contract_type = form.contract_type
    if (form.profile_image_url.trim()) payload.profile_image_url = form.profile_image_url.trim()

    const { data, error: err } = await apiRequest<StaffMember>("/api/staff", {
      method: "POST",
      body: JSON.stringify(payload),
    })

    if (err) {
      setSubmitError(err)
    } else if (data) {
      setStaff((prev) => [data, ...prev])
      setShowAddDialog(false)
      setForm(EMPTY_FORM)
    }

    setSubmitting(false)
  }

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
              <Button size="sm" onClick={() => setShowAddDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Staff
              </Button>
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
                      {formatRole(role)}
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
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : error ? (
              <div className="py-8 text-center text-sm text-destructive">{error}</div>
            ) : (
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
                    {filteredStaff.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                          No staff members found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredStaff.map((member) => (
                        <TableRow key={member.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9">
                                {member.profile_image_url ? (
                                  <img src={member.profile_image_url} alt={`${member.first_name} ${member.last_name}`} className="h-9 w-9 rounded-full object-cover" />
                                ) : (
                                  <AvatarFallback className="bg-primary/10 text-primary">
                                    {getInitials(member.first_name, member.last_name)}
                                  </AvatarFallback>
                                )}
                              </Avatar>
                              <div>
                                <p className="font-medium">
                                  {member.first_name} {member.last_name}
                                </p>
                                <p className="text-sm text-muted-foreground">{member.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{formatRole(member.role)}</TableCell>
                          <TableCell>{member.department ?? "—"}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                member.is_active
                                  ? "border-success/30 bg-success/10 text-success"
                                  : "border-border bg-muted text-muted-foreground"
                              }
                            >
                              {member.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {member.is_clocked_in ? (
                              <div className="flex items-center gap-2 text-success">
                                <CheckCircle className="h-4 w-4" />
                                <span className="text-sm">
                                  In
                                  {member.clock_in_time
                                    ? ` (${new Date(member.clock_in_time).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })})`
                                    : ""}
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <XCircle className="h-4 w-4" />
                                <span className="text-sm">Out</span>
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {Number(member.hours_this_week ?? 0).toFixed(1)}h
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
                                <DropdownMenuItem
                                  onClick={() => router.push(`/dashboard/staff/${member.id}`)}
                                >
                                  View Profile
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {member.is_active && (
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => handleDeactivate(member.id)}
                                  >
                                    Deactivate
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Staff Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Staff Member</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {submitError && (
              <p className="text-sm text-destructive">{submitError}</p>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="first_name">First Name *</Label>
                <Input
                  id="first_name"
                  value={form.first_name}
                  onChange={(e) => handleFormChange("first_name", e.target.value)}
                />
                {formErrors.first_name && (
                  <p className="text-xs text-destructive">{formErrors.first_name}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="last_name">Last Name *</Label>
                <Input
                  id="last_name"
                  value={form.last_name}
                  onChange={(e) => handleFormChange("last_name", e.target.value)}
                />
                {formErrors.last_name && (
                  <p className="text-xs text-destructive">{formErrors.last_name}</p>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => handleFormChange("email", e.target.value)}
              />
              {formErrors.email && (
                <p className="text-xs text-destructive">{formErrors.email}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="role">Role *</Label>
              <Select value={form.role} onValueChange={(v) => handleFormChange("role", v)}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {STANDARD_ROLES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">Custom role...</SelectItem>
                </SelectContent>
              </Select>
              {formErrors.role && (
                <p className="text-xs text-destructive">{formErrors.role}</p>
              )}
            </div>

            {form.role === "custom" && (
              <div className="space-y-1">
                <Label htmlFor="custom_role">Custom Role Name *</Label>
                <Input
                  id="custom_role"
                  value={form.custom_role}
                  onChange={(e) => handleFormChange("custom_role", e.target.value)}
                  placeholder="e.g. Activities Coordinator"
                />
                {formErrors.custom_role && (
                  <p className="text-xs text-destructive">{formErrors.custom_role}</p>
                )}
              </div>
            )}

            <div className="space-y-1">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => handleFormChange("phone", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="job_title">Job Title</Label>
                <Input
                  id="job_title"
                  value={form.job_title}
                  onChange={(e) => handleFormChange("job_title", e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={form.department}
                  onChange={(e) => handleFormChange("department", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="hourly_rate">Hourly Rate (£)</Label>
                <Input
                  id="hourly_rate"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.hourly_rate}
                  onChange={(e) => handleFormChange("hourly_rate", e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="contract_hours">Contract Hours</Label>
                <Input
                  id="contract_hours"
                  type="number"
                  min="0"
                  step="0.5"
                  value={form.contract_hours}
                  onChange={(e) => handleFormChange("contract_hours", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="contract_type">Contract Type</Label>
              <Select
                value={form.contract_type}
                onValueChange={(v) => handleFormChange("contract_type", v)}
              >
                <SelectTrigger id="contract_type">
                  <SelectValue placeholder="Select contract type" />
                </SelectTrigger>
                <SelectContent>
                  {CONTRACT_TYPES.map((ct) => (
                    <SelectItem key={ct.value} value={ct.value}>
                      {ct.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="profile_image_url">Headshot URL</Label>
              <Input
                id="profile_image_url"
                value={form.profile_image_url}
                onChange={(e) => handleFormChange("profile_image_url", e.target.value)}
                placeholder="https://example.com/photo.jpg"
              />
              {form.profile_image_url && (
                <img src={form.profile_image_url} alt="Preview" className="mt-1 h-12 w-12 rounded-full object-cover" />
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleAddStaff} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Staff Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
