"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Header } from "@/frontend/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/components/ui/card"
import { Button } from "@/frontend/components/ui/button"
import { Input } from "@/frontend/components/ui/input"
import { Label } from "@/frontend/components/ui/label"
import { Badge } from "@/frontend/components/ui/badge"
import { Avatar, AvatarFallback } from "@/frontend/components/ui/avatar"
import { Separator } from "@/frontend/components/ui/separator"
import { Slider } from "@/frontend/components/ui/slider"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/frontend/components/ui/dialog"
import {
  Mail, Phone, Briefcase, Building2, Loader2, Pencil,
  CheckCircle, Upload, ZoomIn, RotateCcw,
} from "lucide-react"
import { apiRequest } from "@/backend/lib/api"

interface MyProfile {
  id: string
  email: string
  first_name: string
  last_name: string
  phone: string | null
  role: string
  care_home_id: string | null
  care_home_name: string | null
  job_title: string | null
  department: string | null
  profile_image_url: string | null
  is_verified: boolean
  contract_type: string | null
  contract_hours: number | null
  hourly_rate: number | null
  start_date: string | null
}

const MAX_SIZE = 400 // px — standard headshot size

function formatRole(r: string) {
  return r.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())
}
function getInitials(f: string, l: string) {
  return `${f[0] ?? ""}${l[0] ?? ""}`.toUpperCase()
}

/** Resize + crop an image file to a square canvas, return base64 data URL */
function resizeImage(file: File, size: number, zoom: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const canvas = document.createElement("canvas")
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext("2d")!
      // Centre-crop with zoom
      const scale = (Math.min(img.width, img.height) / size) / zoom
      const sw = size * scale
      const sh = size * scale
      const sx = (img.width - sw) / 2
      const sy = (img.height - sh) / 2
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, size, size)
      resolve(canvas.toDataURL("image/jpeg", 0.88))
    }
    img.onerror = reject
    img.src = url
  })
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<MyProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const [form, setForm] = useState({ first_name: "", last_name: "", phone: "" })

  // Image upload state
  const [rawFile, setRawFile] = useState<File | null>(null)
  const [rawPreview, setRawPreview] = useState<string | null>(null)
  const [zoom, setZoom] = useState(1)
  const [croppedDataUrl, setCroppedDataUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data: me } = await apiRequest<MyProfile>("/api/auth/me")
      if (me) {
        const { data: full } = await apiRequest<MyProfile>(`/api/staff/${me.id}`)
        const merged = { ...me, ...(full ?? {}) } as MyProfile
        setProfile(merged)
        setForm({ first_name: merged.first_name, last_name: merged.last_name, phone: merged.phone ?? "" })
      }
      setLoading(false)
    }
    load()
  }, [])

  // Re-render crop preview whenever zoom or file changes
  const updateCrop = useCallback(async () => {
    if (!rawFile) return
    const url = await resizeImage(rawFile, MAX_SIZE, zoom)
    setCroppedDataUrl(url)
  }, [rawFile, zoom])

  useEffect(() => { updateCrop() }, [updateCrop])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!["image/jpeg", "image/png", "image/jpg", "image/webp"].includes(file.type)) {
      setSaveError("Only JPEG, PNG, jpg, or WebP images are supported")
      return
    }
    setRawFile(file)
    setZoom(1)
    const reader = new FileReader()
    reader.onload = ev => setRawPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  function resetImage() {
    setRawFile(null)
    setRawPreview(null)
    setCroppedDataUrl(null)
    setZoom(1)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  async function handleSave() {
    setSaving(true)
    setSaveError(null)
    const { data, error } = await apiRequest<MyProfile>("/api/auth/me", {
      method: "PATCH",
      body: JSON.stringify({
        first_name: form.first_name.trim() || undefined,
        last_name: form.last_name.trim() || undefined,
        phone: form.phone.trim() || null,
        // Use newly cropped image if available, otherwise keep existing
        profile_image_url: croppedDataUrl ?? profile?.profile_image_url ?? null,
      }),
    })
    setSaving(false)
    if (error) { setSaveError(error); return }
    if (data) {
      setProfile(prev => prev ? { ...prev, ...data } : data)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
      setEditOpen(false)
      resetImage()
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
  const displayImage = croppedDataUrl ?? profile.profile_image_url

  return (
    <div className="min-h-screen">
      <Header title="My Profile" subtitle="View and update your account details" />

      <div className="p-6 max-w-2xl space-y-6">
        {saved && (
          <div className="flex items-center gap-2 rounded-md bg-success/10 px-4 py-2 text-sm text-success">
            <CheckCircle className="h-4 w-4" /> Profile updated successfully
          </div>
        )}

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-5">
              {/* Avatar — no overlay, verified moves to name */}
              <div className="shrink-0">
                <Avatar className="h-20 w-20">
                  {displayImage ? (
                    <img src={displayImage} alt={fullName} className="h-20 w-20 rounded-full object-cover" />
                  ) : (
                    <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                      {getInitials(profile.first_name, profile.last_name)}
                    </AvatarFallback>
                  )}
                </Avatar>
              </div>
              <div className="flex-1">
                {/* Name + verified checkmark inline */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h2 className="text-xl font-semibold">{fullName}</h2>
                  {profile.is_verified && (
                    <img
                      src="/profile/verified.png"
                      alt="Verified"
                      title="Verified account"
                      className="h-5 w-5"
                    />
                  )}
                  {!profile.is_verified && (
                    <Badge variant="outline" className="border-border bg-muted text-muted-foreground text-xs">
                      Pending setup
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground mt-0.5">{formatRole(profile.role)}</p>
                {profile.job_title && <p className="text-sm text-muted-foreground">{profile.job_title}</p>}
                {profile.care_home_name && (
                  <p className="text-sm mt-1">
                    Care Home: <span className="font-bold">{profile.care_home_name}</span>
                  </p>
                )}
              </div>
              <Button variant="outline" size="sm" onClick={() => {
                setForm({ first_name: profile.first_name, last_name: profile.last_name, phone: profile.phone ?? "" })
                setSaveError(null)
                resetImage()
                setEditOpen(true)
              }}>
                <Pencil className="mr-2 h-4 w-4" /> Edit Profile
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Details</CardTitle></CardHeader>
          <CardContent>
            <dl className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 text-muted-foreground shrink-0" />
                <div><dt className="text-xs text-muted-foreground">Email</dt><dd className="text-sm font-medium">{profile.email}</dd></div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 text-muted-foreground shrink-0" />
                <div><dt className="text-xs text-muted-foreground">Phone</dt><dd className="text-sm font-medium">{profile.phone ?? "—"}</dd></div>
              </div>
              <div className="flex items-start gap-3">
                <Briefcase className="mt-0.5 h-4 w-4 text-muted-foreground shrink-0" />
                <div><dt className="text-xs text-muted-foreground">Department</dt><dd className="text-sm font-medium">{profile.department ?? "—"}</dd></div>
              </div>
              <div className="flex items-start gap-3">
                <Building2 className="mt-0.5 h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <dt className="text-xs text-muted-foreground">Contract Type</dt>
                  <dd className="text-sm font-medium">{profile.contract_type ? profile.contract_type.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()) : "—"}</dd>
                </div>
              </div>
              {profile.contract_hours != null && (
                <div><dt className="text-xs text-muted-foreground">Contract Hours</dt><dd className="text-sm font-medium">{profile.contract_hours}h / week</dd></div>
              )}
              {profile.hourly_rate != null && (
                <div><dt className="text-xs text-muted-foreground">Hourly Rate</dt><dd className="text-sm font-medium">£{Number(profile.hourly_rate).toFixed(2)} / hr</dd></div>
              )}
              {profile.start_date && (
                <div>
                  <dt className="text-xs text-muted-foreground">Start Date</dt>
                  <dd className="text-sm font-medium">{new Date(profile.start_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>
      </div>

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={open => { if (!open) resetImage(); setEditOpen(open) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Edit Profile</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            {saveError && <p className="text-sm text-destructive">{saveError}</p>}

            {/* Photo upload */}
            <div className="space-y-3">
              <Label>Profile Photo</Label>
              <div className="flex items-start gap-4">
                {/* Preview */}
                <div className="shrink-0">
                  {croppedDataUrl ? (
                    <img src={croppedDataUrl} alt="Preview" className="h-20 w-20 rounded-full object-cover border-2 border-primary" />
                  ) : profile.profile_image_url ? (
                    <img src={profile.profile_image_url} alt="Current" className="h-20 w-20 rounded-full object-cover border border-border" />
                  ) : (
                    <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-semibold">
                      {getInitials(form.first_name || profile.first_name, form.last_name || profile.last_name)}
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/jpg,image/webp"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="mr-2 h-4 w-4" />
                    {rawFile ? "Change Photo" : "Upload Photo"}
                  </Button>
                  <p className="text-xs text-muted-foreground">JPEG, PNG or WebP · Max 400×400px output</p>
                  {rawFile && (
                    <Button type="button" variant="ghost" size="sm" className="w-full text-muted-foreground" onClick={resetImage}>
                      <RotateCcw className="mr-2 h-3 w-3" /> Remove
                    </Button>
                  )}
                </div>
              </div>

              {/* Zoom slider — only shown when a file is selected */}
              {rawFile && (
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5 text-xs">
                    <ZoomIn className="h-3.5 w-3.5" /> Zoom / Crop
                  </Label>
                  <Slider
                    min={1}
                    max={3}
                    step={0.05}
                    value={[zoom]}
                    onValueChange={([v]) => setZoom(v)}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">Drag to zoom in and crop your photo</p>
                </div>
              )}
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="first_name">First Name</Label>
                <Input id="first_name" value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="last_name">Last Name</Label>
                <Input id="last_name" value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+44 7700 000000" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { resetImage(); setEditOpen(false) }} disabled={saving}>Cancel</Button>
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
