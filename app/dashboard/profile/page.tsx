"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Mail, Phone, Briefcase, Building2, Loader2, Pencil, CheckCircle } from "lucide-react"
import { apiRequest } from "@/lib/api"

interface MyProfile {
  id: string
  email: string
  first_name: string
  last_name: string
  phone: string | null
  role: string
  care_home_id: string | null
  job_title: string | null
  department: string | null
  profile_image_url: string | null
  is_verified: boolean
  contract_type: string | null
  contract_hours: number | null
  hourly_rate: number | null
  start_date: string | null
}

function formatRole(role: string) {
  return role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

function getInitials(first: string, last: string) {
  return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase()
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<MyProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    profile_image_url: "",
  })

  useEffect(() => {
    async function load() {
      setLoading(true)
      // First get the user id from /api/auth/me
      const { data: me } = await apiRequest<MyProfile>("/api/auth/me")
      if (me) {
        // Then get full profile from /api/staff/[id]
        const { data: full } = await apiRequest<MyProfile>(`/api/staff/${me.id}`)
        const merged = { ...me, ...(full ?? {}) }
        setProfile(merged as MyProfile)
        setForm({
          first_name: merged.first_name ?? "",
          last_name: merged.last_name ?? "",
          phone: merged.phone ?? "",
          profile_image_url: merged.profile_image_url ?? "",
        })
      }
      setLoading(false)
    }
    load()
  }, [])

  async function handleSave() {
    setSaving(true)
    setSaveError(null)
    const { data, error } = await apiRequest<MyProfile>("/api/auth/me", {
      method: "PATCH",
      body: JSON.stringify({
        first_name: form.first_name.trim() || undefined,
        last_name: form.last_name.trim() || undefined,
        phone: form.phone.trim() || null,
        profile_image_url: form.profile_image_url.trim() || null,
      }),
    })
    setSaving(false)
    if (error) { setSaveError(error); return }
    if (data) {
      setProfile((prev) => prev ? { ...prev, ...data } : data)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
      setEditOpen(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header title="My Profile" subtitle="Your account details" />
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen">
        <Header title="My Profile" subtitle="" />
        <div className="p-6 text-sm text-destructive">Could not load profile.</div>
      </div>
    )
  }

  const fullName = `${profile.first_name} ${profile.last_name}`

  return (
    <div className="min-h-screen">
      <Header title="My Profile" subtitle="View and update your account details" />

      <div className="p-6 max-w-2xl space-y-6">
        {saved && (
          <div className="flex items-center gap-2 rounded-md bg-success/10 px-4 py-2 text-sm text-success">
            <CheckCircle className="h-4 w-4" />
            Profile updated successfully
          </div>
        )}

        {/* Profile card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-5">
              <div className="relative">
                <Avatar className="h-20 w-20">
                  {profile.profile_image_url ? (
                    <img
                      src={profile.profile_image_url}
                      alt={fullName}
                      className="h-20 w-20 rounded-full object-cover"
                    />
                  ) : (
                    <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                      {getInitials(profile.first_name, profile.last_name)}
                    </AvatarFallback>
                  )}
                </Avatar>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-semibold">{fullName}</h2>
                  <Badge
                    variant="outline"
                    className={
                      profile.is_verified
                        ? "border-success/30 bg-success/10 text-success"
                        : "border-border bg-muted text-muted-foreground"
                    }
                  >
                    {profile.is_verified ? "Verified" : "Pending setup"}
                  </Badge>
                </div>
                <p className="text-muted-foreground mt-0.5">{formatRole(profile.role)}</p>
                {profile.job_title && (
                  <p className="text-sm text-muted-foreground">{profile.job_title}</p>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setForm({
                    first_name: profile.first_name,
                    last_name: profile.last_name,
                    phone: profile.phone ?? "",
                    profile_image_url: profile.profile_image_url ?? "",
                  })
                  setSaveError(null)
                  setEditOpen(true)
                }}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Contact & employment details */}
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <dt className="text-xs text-muted-foreground">Email</dt>
                  <dd className="text-sm font-medium">{profile.email}</dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <dt className="text-xs text-muted-foreground">Phone</dt>
                  <dd className="text-sm font-medium">{profile.phone ?? "—"}</dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Briefcase className="mt-0.5 h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <dt className="text-xs text-muted-foreground">Department</dt>
                  <dd className="text-sm font-medium">{profile.department ?? "—"}</dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Building2 className="mt-0.5 h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <dt className="text-xs text-muted-foreground">Contract Type</dt>
                  <dd className="text-sm font-medium">
                    {profile.contract_type
                      ? profile.contract_type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
                      : "—"}
                  </dd>
                </div>
              </div>
              {profile.contract_hours != null && (
                <div>
                  <dt className="text-xs text-muted-foreground">Contract Hours</dt>
                  <dd className="text-sm font-medium">{profile.contract_hours}h / week</dd>
                </div>
              )}
              {profile.hourly_rate != null && (
                <div>
                  <dt className="text-xs text-muted-foreground">Hourly Rate</dt>
                  <dd className="text-sm font-medium">£{Number(profile.hourly_rate).toFixed(2)} / hr</dd>
                </div>
              )}
              {profile.start_date && (
                <div>
                  <dt className="text-xs text-muted-foreground">Start Date</dt>
                  <dd className="text-sm font-medium">
                    {new Date(profile.start_date).toLocaleDateString("en-GB", {
                      day: "2-digit", month: "short", year: "numeric",
                    })}
                  </dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>
      </div>

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {saveError && (
              <p className="text-sm text-destructive">{saveError}</p>
            )}

            {/* Headshot preview + URL */}
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 shrink-0">
                {form.profile_image_url ? (
                  <img src={form.profile_image_url} alt="Preview" className="h-16 w-16 rounded-full object-cover" />
                ) : (
                  <AvatarFallback className="bg-primary/10 text-primary text-xl">
                    {getInitials(form.first_name || profile.first_name, form.last_name || profile.last_name)}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="flex-1 space-y-1">
                <Label htmlFor="photo_url">Photo URL</Label>
                <Input
                  id="photo_url"
                  value={form.profile_image_url}
                  onChange={(e) => setForm({ ...form, profile_image_url: e.target.value })}
                  placeholder="https://example.com/photo.jpg"
                />
                <p className="text-xs text-muted-foreground">Paste a direct image link</p>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  value={form.first_name}
                  onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  value={form.last_name}
                  onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+44 7700 000000"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
