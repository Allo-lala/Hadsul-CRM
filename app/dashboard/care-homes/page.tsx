"use client"

import { useState } from "react"
import { Header } from "@/components/dashboard/header"
import { Sidebar } from "@/components/dashboard/sidebar"
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
  Bed
} from "lucide-react"

// Sample care homes data
const sampleCareHomes = [
  {
    id: "1",
    name: "Sunnydale Care Home",
    address: "123 Sunny Lane",
    city: "Manchester",
    postcode: "M1 2AB",
    phone: "0161 123 4567",
    email: "info@sunnydale.care",
    cqcRating: "Good",
    cqcRegistrationNumber: "CQC-12345",
    capacity: 45,
    currentResidents: 42,
    totalStaff: 35,
    status: "active",
  },
  {
    id: "2",
    name: "Rosewood Manor",
    address: "456 Oak Street",
    city: "Birmingham",
    postcode: "B1 3CD",
    phone: "0121 234 5678",
    email: "contact@rosewoodmanor.care",
    cqcRating: "Outstanding",
    cqcRegistrationNumber: "CQC-23456",
    capacity: 60,
    currentResidents: 55,
    totalStaff: 48,
    status: "active",
  },
  {
    id: "3",
    name: "Oak Tree House",
    address: "789 Garden Road",
    city: "Leeds",
    postcode: "LS1 4EF",
    phone: "0113 345 6789",
    email: "hello@oaktreehouse.care",
    cqcRating: "Requires Improvement",
    cqcRegistrationNumber: "CQC-34567",
    capacity: 30,
    currentResidents: 25,
    totalStaff: 22,
    status: "active",
  },
  {
    id: "4",
    name: "Meadow View Care",
    address: "321 Meadow Way",
    city: "Sheffield",
    postcode: "S1 5GH",
    phone: "0114 456 7890",
    email: "enquiries@meadowview.care",
    cqcRating: "Good",
    cqcRegistrationNumber: "CQC-45678",
    capacity: 40,
    currentResidents: 38,
    totalStaff: 30,
    status: "active",
  },
]

const cqcRatingColors: Record<string, string> = {
  "Outstanding": "bg-emerald-500/10 text-emerald-500",
  "Good": "bg-green-500/10 text-green-500",
  "Requires Improvement": "bg-yellow-500/10 text-yellow-500",
  "Inadequate": "bg-red-500/10 text-red-500",
}

export default function CareHomesPage() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    postcode: "",
    phone: "",
    email: "",
    cqcRegistrationNumber: "",
    capacity: "",
  })

  const filteredCareHomes = sampleCareHomes.filter((home) => {
    const matchesSearch =
      home.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      home.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      home.postcode.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || home.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalCapacity = sampleCareHomes.reduce((sum, home) => sum + home.capacity, 0)
  const totalResidents = sampleCareHomes.reduce((sum, home) => sum + home.currentResidents, 0)
  const totalStaff = sampleCareHomes.reduce((sum, home) => sum + home.totalStaff, 0)

  const handleAddCareHome = async () => {
    console.log("Adding care home:", formData)
    setIsAddOpen(false)
    setFormData({
      name: "",
      address: "",
      city: "",
      postcode: "",
      phone: "",
      email: "",
      cqcRegistrationNumber: "",
      capacity: "",
    })
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Care Homes" subtitle="Manage all care homes in the system" />
        
        <main className="flex-1 overflow-y-auto p-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4 mb-6">
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-card-foreground">{sampleCareHomes.length}</p>
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
                    <p className="text-2xl font-bold text-card-foreground">{totalResidents}/{totalCapacity}</p>
                    <p className="text-sm text-muted-foreground">Occupancy</p>
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
                    <p className="text-2xl font-bold text-card-foreground">
                      {sampleCareHomes.filter(h => h.cqcRating === "Outstanding" || h.cqcRating === "Good").length}
                    </p>
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
                <CardDescription>
                  View and manage registered care homes
                </CardDescription>
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
                    <DialogDescription>
                      Register a new care home to the system. You can add administrators and staff after creation.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-foreground">Care Home Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="bg-background border-input text-foreground"
                        placeholder="e.g., Sunnydale Care Home"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address" className="text-foreground">Address</Label>
                      <Textarea
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="bg-background border-input text-foreground"
                        placeholder="Street address"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city" className="text-foreground">City</Label>
                        <Input
                          id="city"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          className="bg-background border-input text-foreground"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="postcode" className="text-foreground">Postcode</Label>
                        <Input
                          id="postcode"
                          value={formData.postcode}
                          onChange={(e) => setFormData({ ...formData, postcode: e.target.value })}
                          className="bg-background border-input text-foreground"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-foreground">Phone</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="bg-background border-input text-foreground"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-foreground">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="bg-background border-input text-foreground"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="cqc" className="text-foreground">CQC Registration Number</Label>
                        <Input
                          id="cqc"
                          value={formData.cqcRegistrationNumber}
                          onChange={(e) => setFormData({ ...formData, cqcRegistrationNumber: e.target.value })}
                          className="bg-background border-input text-foreground"
                          placeholder="CQC-XXXXX"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="capacity" className="text-foreground">Bed Capacity</Label>
                        <Input
                          id="capacity"
                          type="number"
                          value={formData.capacity}
                          onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                          className="bg-background border-input text-foreground"
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddCareHome} className="bg-primary text-primary-foreground">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Care Home
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
                    placeholder="Search care homes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-background border-input text-foreground"
                  />
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

              {/* Table */}
              <div className="rounded-md border border-border">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-muted-foreground">Care Home</TableHead>
                      <TableHead className="text-muted-foreground">Location</TableHead>
                      <TableHead className="text-muted-foreground">Contact</TableHead>
                      <TableHead className="text-muted-foreground">CQC Rating</TableHead>
                      <TableHead className="text-muted-foreground">Occupancy</TableHead>
                      <TableHead className="text-muted-foreground">Staff</TableHead>
                      <TableHead className="text-muted-foreground">Status</TableHead>
                      <TableHead className="text-muted-foreground w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCareHomes.map((home) => (
                      <TableRow key={home.id} className="border-border">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Building2 className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <div className="font-medium text-foreground">{home.name}</div>
                              <div className="text-sm text-muted-foreground">{home.cqcRegistrationNumber}</div>
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
                              {home.phone}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              {home.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={cqcRatingColors[home.cqcRating]}>
                            <Star className="h-3 w-3 mr-1" />
                            {home.cqcRating}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-2 flex-1 max-w-[80px] rounded-full bg-muted overflow-hidden">
                              <div 
                                className="h-full bg-primary rounded-full"
                                style={{ width: `${(home.currentResidents / home.capacity) * 100}%` }}
                              />
                            </div>
                            <span className="text-sm text-foreground">
                              {home.currentResidents}/{home.capacity}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-foreground">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            {home.totalStaff}
                          </div>
                        </TableCell>
                        <TableCell>
                          {home.status === "active" ? (
                            <Badge variant="secondary" className="bg-success/10 text-success">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-destructive/10 text-destructive">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Inactive
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
                              <DropdownMenuItem className="cursor-pointer">
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem className="cursor-pointer">
                                Edit Care Home
                              </DropdownMenuItem>
                              <DropdownMenuItem className="cursor-pointer">
                                Manage Staff
                              </DropdownMenuItem>
                              <DropdownMenuItem className="cursor-pointer">
                                View Residents
                              </DropdownMenuItem>
                              <DropdownMenuItem className="cursor-pointer text-destructive">
                                Suspend
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
    </div>
  )
}
