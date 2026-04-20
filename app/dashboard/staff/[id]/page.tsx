"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Header } from "@/frontend/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/components/ui/card"
import { Badge } from "@/frontend/components/ui/badge"
import { Button } from "@/frontend/components/ui/button"
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
  ArrowLeft,
  Mail,
  Phone,
  Briefcase,
  Building2,
  Clock,
  Calendar,
  Loader2,
} from "lucide-react"
import { apiRequest } from "@/backend/lib/api"
import type { StaffMember, ClockRecord } from "@/shared/types"

type StaffProfile = StaffMember & {
  start_date?: string | null
  clock_history: ClockRecord[]
  hours_this_week: number
  hours_this_month: number
}

function getInitials(firstName: string, lastName: string) {
  return `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase()
}

function formatRole(role: string) {
  return role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

function formatContractType(ct: string | null) {
  if (!ct) return "—"
  return ct.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

function formatDate(iso: string | null | undefined) {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function formatTime(iso: string | null | undefined) {
  if (!iso) return "—"
  return new Date(iso).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function StaffProfilePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [profile, setProfile] = useState<StaffProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data, error: err } = await apiRequest<StaffProfile>(`/api/staff/${id}`)
      if (err) {
        setError(err)
      } else {
        setProfile(data)
      }
      setLoading(false)
    }
    load()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header title="Staff Profile" subtitle="" />
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen">
        <Header title="Staff Profile" subtitle="" />
        <div className="p-6">
          <p className="text-sm text-destructive">{error ?? "Staff member not found"}</p>
          <Button variant="outline" className="mt-4" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
      </div>
    )
  }

  const fullName = `${profile.first_name} ${profile.last_name}`

  return (
    <div className="min-h-screen">
      <Header
        title="Staff Profile"
        subtitle={fullName}
      />

      <div className="p-6 space-y-6">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Staff
        </Button>

        {/* Profile Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
              <Avatar className="h-20 w-20">
                {profile.profile_image_url ? (
                  <img src={profile.profile_image_url} alt={fullName} className="h-20 w-20 rounded-full object-cover" />
                ) : (
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                    {getInitials(profile.first_name, profile.last_name)}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-semibold">{fullName}</h2>
                  <Badge
                    variant="outline"
                    className={
                      profile.is_active
                        ? "border-success/30 bg-success/10 text-success"
                        : "border-border bg-muted text-muted-foreground"
                    }
                  >
                    {profile.is_active ? "Active" : "Inactive"}
                  </Badge>
                  {profile.is_clocked_in && (
                    <Badge variant="outline" className="border-chart-1/30 bg-chart-1/10 text-chart-1">
                      Clocked In
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground">{formatRole(profile.role)}</p>
                {profile.job_title && (
                  <p className="text-sm text-muted-foreground">{profile.job_title}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hours Summary Cards (Requirement 7.3) */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Hours This Week</p>
                  <p className="text-2xl font-bold">
                    {Number(profile.hours_this_week).toFixed(1)}h
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-chart-2/10">
                  <Calendar className="h-6 w-6 text-chart-2" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Hours This Month</p>
                  <p className="text-2xl font-bold">
                    {Number(profile.hours_this_month).toFixed(1)}h
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Employment Details (Requirement 7.1) */}
        <Card>
          <CardHeader>
            <CardTitle>Employment Details</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div>
                  <dt className="text-xs text-muted-foreground">Email</dt>
                  <dd className="text-sm font-medium">{profile.email}</dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div>
                  <dt className="text-xs text-muted-foreground">Phone</dt>
                  <dd className="text-sm font-medium">{profile.phone ?? "—"}</dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Briefcase className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div>
                  <dt className="text-xs text-muted-foreground">Department</dt>
                  <dd className="text-sm font-medium">{profile.department ?? "—"}</dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Building2 className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div>
                  <dt className="text-xs text-muted-foreground">Contract Type</dt>
                  <dd className="text-sm font-medium">{formatContractType(profile.contract_type)}</dd>
                </div>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Contract Hours</dt>
                <dd className="text-sm font-medium">
                  {profile.contract_hours != null ? `${profile.contract_hours}h/week` : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Hourly Rate</dt>
                <dd className="text-sm font-medium">
                  {profile.hourly_rate != null ? `£${Number(profile.hourly_rate).toFixed(2)}/hr` : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Start Date</dt>
                <dd className="text-sm font-medium">{formatDate(profile.start_date)}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Account Status</dt>
                <dd className="text-sm font-medium">
                  {profile.is_verified ? "Verified" : "Pending setup"}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Clock History (Requirement 7.2) */}
        <Card>
          <CardHeader>
            <CardTitle>Clock History — Last 30 Days</CardTitle>
          </CardHeader>
          <CardContent>
            {profile.clock_history.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No clock records in the past 30 days
              </p>
            ) : (
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Clock In</TableHead>
                      <TableHead>Clock Out</TableHead>
                      <TableHead className="text-right">Hours</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {profile.clock_history.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>{formatDate(record.clock_in_time)}</TableCell>
                        <TableCell>{formatTime(record.clock_in_time)}</TableCell>
                        <TableCell>
                          {record.clock_out_time ? formatTime(record.clock_out_time) : (
                            <Badge variant="outline" className="border-chart-1/30 bg-chart-1/10 text-chart-1 text-xs">
                              Active
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {record.total_hours_worked != null
                            ? `${Number(record.total_hours_worked).toFixed(2)}h`
                            : "—"}
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
