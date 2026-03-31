"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/dashboard/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Building2,
  Plus,
  Search,
  MoreHorizontal,
  Users,
  MapPin,
  Phone,
  Mail,
  Star,
  CheckCircle,
  AlertCircle,
  Bed,
  ImageIcon,
} from "lucide-react"
import { apiRequest } from "@/lib/api"
import type { CareHome } from "@/lib/types"

const cqcRatingColors: Record<string, string> = {
  Outstanding: "bg-emerald-500/10 text-emerald-500",
  Good: "bg-green-500/10 text-green-500",
  "Requires Improvement": "bg-yellow-500/10 text-yellow-500",
  Inadequate: "bg-red-500/10 text-red-500",
}

const emptyForm = {
  name: "",
  address: "",
  city: "",
  postcode: "",
  phone: "",
  email: "",
  cqc_registration_number: "",
  capacity: "",
  logo_url: "",
}

export default function CareHomesPage() {
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [careHomes, setCareHomes] = useState<CareHome[]>([])
  const [loading, setLoading] = useState(true)
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState(emptyForm)
  const [editHome, setEditHome] = useState<CareHome | null>(null)
  const [editForm, setEditForm] = useState<Partial<CareHome>>({})
  const [editError, setEditError] = useState<string | null>(null)
  const [editSubmitting, setEditSubmitting] = useState(false)

  useEffect(() => {
    fetchCareHomes()
  }, [])

  async function fetchCareHomes() {
    setLoading(true)
    const { data, error } = await apiRequest<CareHome[]>("/api/care-homes")
    if (data) setCareHomes(data)
    if (error) console.error("Failed to load care homes:", error)
    setLoading(false)
  }

  const filteredCareHomes = careHomes.filter((home) => {
    const matchesSearch =
      home.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (home.city ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (home.postcode ?? "").toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || home.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalStaff = careHomes.reduce((sum, h) => sum + (h.staff_count ?? 0), 0)
  const goodOrOutstanding = careHomes.filter(
    (h) => h.cqc_rating === "Outstanding" || h.cqc_rating === "Good"
  ).length

  async function handleAddCareHome() {
    setFormError(null)
    setSubmitting(true)
    const { data, error } = await apiRequest<CareHome>("/api/care-homes", {
      method: "POST",
      body: JSON.stringify({
        ...formData,
        capacity: formData.capacity ? Number(formData.capacity) : undefined,
        logo_url: formData.logo_url || undefined,
      }),
    })
    setSubmitting(false)
    if (error) { setFormError(error); return }
    if (data) setCareHomes((prev) => [...prev, data])
    setIsAddOpen(false)
    setFormData(emptyForm)
  }

  async function handleSuspend(home: CareHome) {
    const newStatus = home.status === "suspended" ? "active" : "suspended"
    const { data, error } = await apiRequest<CareHome>(`/api/care-homes/${home.id}`, {
      method: "PATCH",
      body: JSON.stringify({ status: newStatus }),
    })
    if (error) { console.error("Failed to update status:", error); return }
    if (data) setCareHomes((prev) => prev.map((h) => (h.id === home.id ? data : h)))
  }

  async function handleEditSave() {
    if (!editHome) return
    setEditError(null)
    setEditSubmitting(true)
    const { data, error } = await apiRequest<CareHome>(`/api/care-homes/${editHome.id}`, {
      method: "PATCH",
      body: JSON.stringify(editForm),
    })
    setEditSubmitting(false)
    if (error) { setEditError(error); return }
    if (data) setCareHomes((prev) => prev.map((h) => (h.id === editHome.id ? data : h)))
    setEditHome(null)
    setEditForm({})
  }

  return (
    <div className="min-h-screen">
      <Header title="Care Homes" subtitle="Manage all care homes in the system" />
      <main className="p-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4 mb-6">
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-card-foreground">{careHomes.length}</p>
                    <p className="text-sm text-muted-foreground">Total Care Homes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Bed className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-card-foreground">
                      {careHomes.reduce((s, h) => s + h.capacity, 0)}
                    </p>
                    <p className="text-sm text-muted-foreground">Total Capacity</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-success/10 flex items-center justify-center">
                    <Users className="h-6 w-6 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-card-foreground">{totalStaff}</p>
                    <p className="text-sm text-muted-foreground">Total Staff</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <Star className="h-6 w-6 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-card-foreground">{goodOrOutstanding}</p>
                    <p className="text-sm text-muted-foreground">Good/Outstanding CQC</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Care Homes Table */}
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-card-foreground">All Care Homes</CardTitle>
                <CardDescription>View and manage registered care homes</CardDescription>
              </div>
              <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Care Home
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card border-border sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle className="text-card-foreground">Add New Care Home</DialogTitle>
                    <DialogDescription>Register a new care home to the system.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    {formError && <p className="text-sm text-destructive">{formError}</p>}
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-foreground">Care Home Name</Label>
                      <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="bg-background border-input text-foreground" placeholder="e.g., Sunnydale Care Home" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address" className="text-foreground">Address</Label>
                      <Textarea id="address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="bg-background border-input text-foreground" placeholder="Street address" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city" className="text-foreground">City</Label>
                        <Input id="city" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className="bg-background border-input text-foreground" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="postcode" className="text-foreground">Postcode</Label>
                        <Input id="postcode" value={formData.postcode} onChange={(e) => setFormData({ ...formData, postcode: e.target.value })} className="bg-background border-input text-foreground" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-foreground">Phone</Label>
                        <Input id="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="bg-background border-input text-foreground" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-foreground">Email</Label>
                        <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="bg-background border-input text-foreground" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="cqc" className="text-foreground">CQC Registration Number</Label>
                        <Input id="cqc" value={formData.cqc_registration_number} onChange={(e) => setFormData({ ...formData, cqc_registration_number: e.target.value })} className="bg-background border-input text-foreground" placeholder="CQC-XXXXX" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="capacity" className="text-foreground">Bed Capacity</Label>
                        <Input id="capacity" type="number" value={formData.capacity} onChange={(e) => setFormData({ ...formData, capacity: e.target.value })} className="bg-background border-input text-foreground" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="logo_url" className="text-foreground">Logo URL</Label>
                      <div className="flex items-center gap-2">
                        <ImageIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                        <Input id="logo_url" value={formData.logo_url} onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })} className="bg-background border-input text-foreground" placeholder="https://example.com/logo.png" />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => { setIsAddOpen(false); setFormError(null) }}>Cancel</Button>
                    <Button onClick={handleAddCareHome} disabled={submitting} className="bg-primary text-primary-foreground">
                      <Plus className="h-4 w-4 mr-2" />
                      {submitting ? "Adding..." : "Add Care Home"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search care homes..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 bg-background border-input text-foreground" />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px] bg-background border-input text-foreground">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="rounded-md border border-border">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-muted-foreground">Care Home</TableHead>
                      <TableHead className="text-muted-foreground">Location</TableHead>
                      <TableHead className="text-muted-foreground">Contact</TableHead>
                      <TableHead className="text-muted-foreground">CQC Rating</TableHead>
                      <TableHead className="text-muted-foreground">Capacity</TableHead>
                      <TableHead className="text-muted-foreground">Staff</TableHead>
                      <TableHead className="text-muted-foreground">Status</TableHead>
                      <TableHead className="text-muted-foreground w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-muted-foreground py-8">Loading...</TableCell>
                      </TableRow>
                    ) : filteredCareHomes.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-muted-foreground py-8">No care homes found.</TableCell>
                      </TableRow>
                    ) : (
                      filteredCareHomes.map((home) => (
                        <TableRow key={home.id} className="border-border">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center overflow-hidden">
                                {home.logo_url ? (
                                  <img src={home.logo_url} alt={home.name} className="h-10 w-10 rounded-lg object-cover" />
                                ) : (
                                  <Building2 className="h-5 w-5 text-primary" />
                                )}
                              </div>
                              <div>
                                <div className="font-medium text-foreground">{home.name}</div>
                                <div className="text-sm text-muted-foreground">{home.cqc_registration_number}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-foreground">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span>{home.city}, {home.postcode}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-sm text-foreground">
                                <Phone className="h-3 w-3 text-muted-foreground" />
                                {home.phone ?? "—"}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Mail className="h-3 w-3" />
                                {home.email ?? "—"}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {home.cqc_rating ? (
                              <Badge variant="secondary" className={cqcRatingColors[home.cqc_rating] ?? ""}>
                                <Star className="h-3 w-3 mr-1" />
                                {home.cqc_rating}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground text-sm">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-foreground">{home.capacity}</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-foreground">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              {home.staff_count ?? 0}
                            </div>
                          </TableCell>
                          <TableCell>
                            {home.status === "active" ? (
                              <Badge variant="secondary" className="bg-success/10 text-success">
                                <CheckCircle className="h-3 w-3 mr-1" />Active
                              </Badge>
                            ) : home.status === "suspended" ? (
                              <Badge variant="secondary" className="bg-destructive/10 text-destructive">
                                <AlertCircle className="h-3 w-3 mr-1" />Suspended
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="bg-muted text-muted-foreground">
                                <AlertCircle className="h-3 w-3 mr-1" />Inactive
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-popover border-border">
                                <DropdownMenuItem className="cursor-pointer" onClick={() => { setEditHome(home); setEditForm({ name: home.name, address: home.address ?? "", city: home.city ?? "", postcode: home.postcode ?? "", phone: home.phone ?? "", email: home.email ?? "", cqc_rating: home.cqc_rating ?? "", capacity: home.capacity, logo_url: home.logo_url ?? "" }); setEditError(null) }}>
                                  Edit Care Home
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer text-destructive" onClick={() => handleSuspend(home)}>
                                  {home.status === "suspended" ? "Unsuspend" : "Suspend"}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </main>

      {/* Edit Dialog */}
      <Dialog open={!!editHome} onOpenChange={(open) => { if (!open) setEditHome(null) }}>
        <DialogContent className="bg-card border-border sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-card-foreground">Edit Care Home</DialogTitle>
            <DialogDescription>Update the details for {editHome?.name}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {editError && <p className="text-sm text-destructive">{editError}</p>}
            <div className="space-y-2">
              <Label className="text-foreground">Care Home Name</Label>
              <Input value={editForm.name ?? ""} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="bg-background border-input text-foreground" />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Address</Label>
              <Textarea value={editForm.address ?? ""} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} className="bg-background border-input text-foreground" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground">City</Label>
                <Input value={editForm.city ?? ""} onChange={(e) => setEditForm({ ...editForm, city: e.target.value })} className="bg-background border-input text-foreground" />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Postcode</Label>
                <Input value={editForm.postcode ?? ""} onChange={(e) => setEditForm({ ...editForm, postcode: e.target.value })} className="bg-background border-input text-foreground" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground">Phone</Label>
                <Input value={editForm.phone ?? ""} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} className="bg-background border-input text-foreground" />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Email</Label>
                <Input type="email" value={editForm.email ?? ""} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className="bg-background border-input text-foreground" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground">CQC Rating</Label>
                <Select value={editForm.cqc_rating ?? ""} onValueChange={(v) => setEditForm({ ...editForm, cqc_rating: v })}>
                  <SelectTrigger className="bg-background border-input text-foreground">
                    <SelectValue placeholder="Select rating" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="Outstanding">Outstanding</SelectItem>
                    <SelectItem value="Good">Good</SelectItem>
                    <SelectItem value="Requires Improvement">Requires Improvement</SelectItem>
                    <SelectItem value="Inadequate">Inadequate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Bed Capacity</Label>
                <Input type="number" value={editForm.capacity ?? ""} onChange={(e) => setEditForm({ ...editForm, capacity: Number(e.target.value) })} className="bg-background border-input text-foreground" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Logo URL</Label>
              <div className="flex items-center gap-2">
                {editForm.logo_url && (
                  <img src={editForm.logo_url as string} alt="Logo preview" className="h-8 w-8 rounded object-cover shrink-0" />
                )}
                <Input value={(editForm.logo_url as string) ?? ""} onChange={(e) => setEditForm({ ...editForm, logo_url: e.target.value })} className="bg-background border-input text-foreground" placeholder="https://example.com/logo.png" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditHome(null)}>Cancel</Button>
            <Button onClick={handleEditSave} disabled={editSubmitting} className="bg-primary text-primary-foreground">
              {editSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
