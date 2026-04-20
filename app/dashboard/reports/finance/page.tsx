"use client"

import { Header } from "@/frontend/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/frontend/components/ui/card"
import { Button } from "@/frontend/components/ui/button"
import { Badge } from "@/frontend/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/frontend/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/frontend/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/frontend/components/ui/select"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import {
  TrendingUp,
  TrendingDown,
  PoundSterling,
  Users,
  Clock,
  FileText,
  Download,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"

const revenueData = [
  { month: "Jan", revenue: 125000, expenses: 98000, profit: 27000 },
  { month: "Feb", revenue: 132000, expenses: 102000, profit: 30000 },
  { month: "Mar", revenue: 128000, expenses: 99000, profit: 29000 },
  { month: "Apr", revenue: 145000, expenses: 108000, profit: 37000 },
  { month: "May", revenue: 152000, expenses: 112000, profit: 40000 },
  { month: "Jun", revenue: 148000, expenses: 110000, profit: 38000 },
]

const wagesData = [
  { department: "Nursing", wages: 45000, hours: 2800, staff: 35 },
  { department: "Care Assistants", wages: 52000, hours: 4200, staff: 65 },
  { department: "Support", wages: 18000, hours: 1200, staff: 28 },
  { department: "Admin", wages: 12000, hours: 800, staff: 12 },
  { department: "Management", wages: 15000, hours: 640, staff: 8 },
]

const expenseBreakdown = [
  { name: "Staff Wages", value: 142000, color: "var(--chart-1)" },
  { name: "Supplies", value: 18000, color: "var(--chart-2)" },
  { name: "Utilities", value: 12000, color: "var(--chart-3)" },
  { name: "Maintenance", value: 8000, color: "var(--chart-4)" },
  { name: "Insurance", value: 6000, color: "var(--chart-5)" },
]

const invoices = [
  { id: "INV-001", client: "NHS Trust", amount: 45000, date: "Mar 15, 2025", status: "paid" },
  { id: "INV-002", client: "Local Authority", amount: 32000, date: "Mar 18, 2025", status: "paid" },
  { id: "INV-003", client: "Private Client", amount: 8500, date: "Mar 20, 2025", status: "pending" },
  { id: "INV-004", client: "NHS Trust", amount: 42000, date: "Mar 22, 2025", status: "pending" },
  { id: "INV-005", client: "Private Client", amount: 12000, date: "Mar 25, 2025", status: "overdue" },
]

const statusStyles = {
  paid: "bg-success/10 text-success border-success/30",
  pending: "bg-warning/10 text-warning border-warning/30",
  overdue: "bg-destructive/10 text-destructive border-destructive/30",
}

export default function FinanceReportsPage() {
  const totalRevenue = 148000
  const totalExpenses = 110000
  const profit = totalRevenue - totalExpenses
  const profitMargin = ((profit / totalRevenue) * 100).toFixed(1)

  return (
    <div className="min-h-screen">
      <Header title="Finance Reports" subtitle="Financial analytics and reporting" />

      <div className="p-6 space-y-6">
        {/* Key Financial Metrics */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Monthly Revenue</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold tracking-tight">£148K</span>
                    <span className="flex items-center text-xs font-medium text-success">
                      <ArrowUpRight className="h-3 w-3" />
                      8.2%
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">vs last month</p>
                </div>
                <div className="rounded-xl bg-success/10 p-3">
                  <TrendingUp className="h-5 w-5 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Monthly Expenses</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold tracking-tight">£110K</span>
                    <span className="flex items-center text-xs font-medium text-destructive">
                      <ArrowDownRight className="h-3 w-3" />
                      2.1%
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">vs last month</p>
                </div>
                <div className="rounded-xl bg-destructive/10 p-3">
                  <TrendingDown className="h-5 w-5 text-destructive" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Net Profit</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold tracking-tight">£38K</span>
                    <span className="flex items-center text-xs font-medium text-success">
                      <ArrowUpRight className="h-3 w-3" />
                      12.4%
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{profitMargin}% margin</p>
                </div>
                <div className="rounded-xl bg-primary/10 p-3">
                  <PoundSterling className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Staff Wages</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold tracking-tight">£142K</span>
                  </div>
                  <p className="text-xs text-muted-foreground">76% of expenses</p>
                </div>
                <div className="rounded-xl bg-chart-2/10 p-3">
                  <Users className="h-5 w-5 text-chart-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Revenue vs Expenses Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Revenue vs Expenses</CardTitle>
                  <CardDescription>6-month financial overview</CardDescription>
                </div>
                <Select defaultValue="6m">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3m">3 Months</SelectItem>
                    <SelectItem value="6m">6 Months</SelectItem>
                    <SelectItem value="12m">12 Months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="revenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="expenses" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--chart-5)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="var(--chart-5)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="month" tick={{ fill: "var(--muted-foreground)" }} />
                    <YAxis
                      tick={{ fill: "var(--muted-foreground)" }}
                      tickFormatter={(value) => `£${value / 1000}K`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: "var(--radius)",
                      }}
                      formatter={(value: number) => [`£${value.toLocaleString()}`, ""]}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="var(--chart-1)"
                      fill="url(#revenue)"
                      strokeWidth={2}
                      name="Revenue"
                    />
                    <Area
                      type="monotone"
                      dataKey="expenses"
                      stroke="var(--chart-5)"
                      fill="url(#expenses)"
                      strokeWidth={2}
                      name="Expenses"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Expense Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Expense Breakdown</CardTitle>
              <CardDescription>Distribution of monthly expenses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {expenseBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: "var(--radius)",
                      }}
                      formatter={(value: number) => [`£${value.toLocaleString()}`, ""]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-2">
                {expenseBreakdown.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-muted-foreground">{item.name}</span>
                    </div>
                    <span className="font-medium">£{(item.value / 1000).toFixed(0)}K</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Wages by Department */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Wages by Department</CardTitle>
                <CardDescription>Monthly payroll breakdown</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export Report
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={wagesData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
                  <XAxis
                    type="number"
                    tick={{ fill: "var(--muted-foreground)" }}
                    tickFormatter={(value) => `£${value / 1000}K`}
                  />
                  <YAxis
                    dataKey="department"
                    type="category"
                    tick={{ fill: "var(--muted-foreground)" }}
                    width={120}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius)",
                    }}
                    formatter={(value: number) => [`£${value.toLocaleString()}`, "Wages"]}
                  />
                  <Bar dataKey="wages" fill="var(--chart-1)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Invoices Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Invoices</CardTitle>
                <CardDescription>Track payments and outstanding invoices</CardDescription>
              </div>
              <Button size="sm">
                <FileText className="mr-2 h-4 w-4" />
                Create Invoice
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice ID</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.id}</TableCell>
                      <TableCell>{invoice.client}</TableCell>
                      <TableCell className="font-medium">
                        £{invoice.amount.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{invoice.date}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusStyles[invoice.status as keyof typeof statusStyles]}>
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
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
