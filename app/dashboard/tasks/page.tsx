"use client"

import { useState } from "react"
import { Header } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Plus,
  Search,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Filter,
  MoreHorizontal,
  User,
  MapPin,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Task {
  id: string
  title: string
  description: string
  priority: "high" | "medium" | "low"
  status: "pending" | "in-progress" | "completed" | "overdue"
  assignee: {
    name: string
    initials: string
  }
  location: string
  dueTime: string
  category: string
}

const tasks: Task[] = [
  {
    id: "1",
    title: "Medication Round - Wing A",
    description: "Complete morning medication round for all residents in Wing A",
    priority: "high",
    status: "in-progress",
    assignee: { name: "Sarah Johnson", initials: "SJ" },
    location: "Wing A",
    dueTime: "08:00 AM",
    category: "Medication",
  },
  {
    id: "2",
    title: "Room 203 - Personal Care",
    description: "Assist Mrs. Thompson with morning personal care routine",
    priority: "high",
    status: "pending",
    assignee: { name: "Emma Davis", initials: "ED" },
    location: "Room 203",
    dueTime: "08:30 AM",
    category: "Personal Care",
  },
  {
    id: "3",
    title: "Temperature Monitoring",
    description: "Record and log temperature readings for all refrigerators",
    priority: "medium",
    status: "overdue",
    assignee: { name: "Mike Peters", initials: "MP" },
    location: "Kitchen",
    dueTime: "07:00 AM",
    category: "Monitoring",
  },
  {
    id: "4",
    title: "Care Plan Review - Mr. Davis",
    description: "Complete monthly care plan review and update documentation",
    priority: "medium",
    status: "pending",
    assignee: { name: "Lisa Brown", initials: "LB" },
    location: "Office",
    dueTime: "10:00 AM",
    category: "Documentation",
  },
  {
    id: "5",
    title: "Breakfast Service - Dining Room",
    description: "Assist with breakfast service and feeding support",
    priority: "high",
    status: "completed",
    assignee: { name: "Tom Wilson", initials: "TW" },
    location: "Dining Room",
    dueTime: "07:30 AM",
    category: "Meals",
  },
  {
    id: "6",
    title: "Bed Linen Change - Wing B",
    description: "Change bed linen for rooms 210-220",
    priority: "low",
    status: "pending",
    assignee: { name: "Rachel Green", initials: "RG" },
    location: "Wing B",
    dueTime: "11:00 AM",
    category: "Housekeeping",
  },
  {
    id: "7",
    title: "Activities Session",
    description: "Lead morning activities session - Arts and Crafts",
    priority: "medium",
    status: "pending",
    assignee: { name: "James Taylor", initials: "JT" },
    location: "Activity Room",
    dueTime: "10:30 AM",
    category: "Activities",
  },
  {
    id: "8",
    title: "Wound Dressing - Room 215",
    description: "Change wound dressing for Mr. Roberts as per care plan",
    priority: "high",
    status: "pending",
    assignee: { name: "Sarah Johnson", initials: "SJ" },
    location: "Room 215",
    dueTime: "09:00 AM",
    category: "Medical",
  },
]

const priorityStyles = {
  high: "bg-destructive/10 text-destructive border-destructive/30",
  medium: "bg-warning/10 text-warning border-warning/30",
  low: "bg-muted text-muted-foreground border-border",
}

const statusStyles = {
  pending: "bg-muted text-muted-foreground",
  "in-progress": "bg-chart-1/10 text-chart-1",
  completed: "bg-success/10 text-success",
  overdue: "bg-destructive/10 text-destructive",
}

const statusLabels = {
  pending: "Pending",
  "in-progress": "In Progress",
  completed: "Completed",
  overdue: "Overdue",
}

export default function TasksPage() {
  const [filter, setFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredTasks = tasks.filter((task) => {
    const matchesFilter = filter === "all" || task.status === filter
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const pendingCount = tasks.filter((t) => t.status === "pending").length
  const inProgressCount = tasks.filter((t) => t.status === "in-progress").length
  const completedCount = tasks.filter((t) => t.status === "completed").length
  const overdueCount = tasks.filter((t) => t.status === "overdue").length

  return (
    <div className="min-h-screen">
      <Header title="Daily Tasks" subtitle="Manage and track daily care tasks" />

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-4">
          <Card
            className={cn(
              "cursor-pointer transition-all hover:shadow-md",
              filter === "pending" && "ring-2 ring-primary"
            )}
            onClick={() => setFilter("pending")}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{pendingCount}</p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card
            className={cn(
              "cursor-pointer transition-all hover:shadow-md",
              filter === "in-progress" && "ring-2 ring-primary"
            )}
            onClick={() => setFilter("in-progress")}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-1/10">
                  <Clock className="h-5 w-5 text-chart-1" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{inProgressCount}</p>
                  <p className="text-xs text-muted-foreground">In Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card
            className={cn(
              "cursor-pointer transition-all hover:shadow-md",
              filter === "completed" && "ring-2 ring-primary"
            )}
            onClick={() => setFilter("completed")}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{completedCount}</p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card
            className={cn(
              "cursor-pointer transition-all hover:shadow-md",
              filter === "overdue" && "ring-2 ring-primary"
            )}
            onClick={() => setFilter("overdue")}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{overdueCount}</p>
                  <p className="text-xs text-muted-foreground">Overdue</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Task List */}
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Today&apos;s Tasks</CardTitle>
                <CardDescription>March 24, 2025</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search tasks..."
                    className="w-64 pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tasks</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Task
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              <div className="space-y-3 pr-4">
                {filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    className={cn(
                      "rounded-lg border p-4 transition-all hover:shadow-md",
                      task.status === "overdue" && "border-destructive/30 bg-destructive/5",
                      task.status === "completed" && "opacity-60"
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <Checkbox
                        checked={task.status === "completed"}
                        className="mt-1"
                      />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className={cn(
                              "font-semibold",
                              task.status === "completed" && "line-through"
                            )}>
                              {task.title}
                            </h3>
                            <p className="text-sm text-muted-foreground">{task.description}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={priorityStyles[task.priority]}>
                              {task.priority}
                            </Badge>
                            <Badge className={statusStyles[task.status]}>
                              {statusLabels[task.status]}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Avatar className="h-5 w-5">
                              <AvatarFallback className="bg-primary/10 text-[10px] text-primary">
                                {task.assignee.initials}
                              </AvatarFallback>
                            </Avatar>
                            <span>{task.assignee.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {task.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            Due: {task.dueTime}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {task.category}
                          </Badge>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
