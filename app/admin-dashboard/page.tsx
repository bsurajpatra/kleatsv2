"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import {
  Users,
  Store,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  LogOut,
  Settings,
  Bell,
  BarChart3,
  Shield,
} from "lucide-react"

// Mock data for admin dashboard
const mockUsers = [
  { id: 1, name: "Raunit Kumar", email: "student@kl.edu", role: "customer", status: "active", joinDate: "2024-01-15" },
  {
    id: 2,
    name: "KL Adda Owner",
    email: "kl-adda@owner.com",
    role: "canteen_owner",
    status: "active",
    joinDate: "2024-01-10",
  },
  { id: 3, name: "Priya Sharma", email: "priya@kl.edu", role: "customer", status: "suspended", joinDate: "2024-02-01" },
  {
    id: 4,
    name: "Adda Worker",
    email: "adda@gmail.com",
    role: "canteen_worker",
    status: "active",
    joinDate: "2024-01-20",
  },
]

const mockCanteens = [
  { id: 1, name: "KL Adda", owner: "KL Adda Owner", status: "active", revenue: 45000, orders: 320, rating: 4.5 },
  { id: 2, name: "Satish Canteen", owner: "Satish Owner", status: "active", revenue: 38000, orders: 280, rating: 4.2 },
  { id: 3, name: "New Canteen", owner: "New Owner", status: "pending", revenue: 0, orders: 0, rating: 0 },
]

const mockSystemStats = {
  totalUsers: 1250,
  totalCanteens: 8,
  totalRevenue: 125000,
  totalOrders: 2340,
  pendingApprovals: 3,
  activeIssues: 2,
}

export default function AdminDashboard() {
  const { user, logout, isAdmin } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState(mockUsers)
  const [canteens, setCanteens] = useState(mockCanteens)
  const [systemStats] = useState(mockSystemStats)
  const [maintenanceMode, setMaintenanceMode] = useState(false)

  useEffect(() => {
    if (!isAdmin) {
      router.push("/admin-login")
    }
  }, [isAdmin, router])

  const toggleUserStatus = (userId: number) => {
    setUsers(
      users.map((user) =>
        user.id === userId ? { ...user, status: user.status === "active" ? "suspended" : "active" } : user,
      ),
    )
  }

  const approveCanteen = (canteenId: number) => {
    setCanteens(canteens.map((canteen) => (canteen.id === canteenId ? { ...canteen, status: "active" } : canteen)))
  }

  const rejectCanteen = (canteenId: number) => {
    setCanteens(canteens.map((canteen) => (canteen.id === canteenId ? { ...canteen, status: "rejected" } : canteen)))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "suspended":
        return "bg-red-100 text-red-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "rejected":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "customer":
        return "bg-blue-100 text-blue-800"
      case "canteen_owner":
        return "bg-purple-100 text-purple-800"
      case "canteen_worker":
        return "bg-orange-100 text-orange-800"
      case "admin":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (!isAdmin) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Shield className="h-6 w-6 text-red-600" />
                Admin Dashboard
              </h1>
              <p className="text-gray-600">System Administration Panel</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm">Maintenance Mode</span>
                <Switch checked={maintenanceMode} onCheckedChange={setMaintenanceMode} />
              </div>
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Alerts ({systemStats.activeIssues})
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* System Stats */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemStats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">+5% this month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Canteens</CardTitle>
              <Store className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemStats.totalCanteens}</div>
              <p className="text-xs text-muted-foreground">2 pending approval</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{systemStats.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">+12% this month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemStats.totalOrders}</div>
              <p className="text-xs text-muted-foreground">+8% this week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemStats.pendingApprovals}</div>
              <p className="text-xs text-muted-foreground">Needs review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Issues</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemStats.activeIssues}</div>
              <p className="text-xs text-muted-foreground">Active issues</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="canteens">Canteens</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">New canteen "Healthy Bites" approved</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Users className="h-4 w-4 text-blue-600" />
                      <span className="text-sm">25 new user registrations today</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm">Payment gateway maintenance scheduled</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Revenue increased by 15% this week</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pending Approvals</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {canteens
                      .filter((c) => c.status === "pending")
                      .map((canteen) => (
                        <div key={canteen.id} className="flex items-center justify-between p-3 border rounded">
                          <div>
                            <p className="font-medium">{canteen.name}</p>
                            <p className="text-sm text-gray-600">Owner: {canteen.owner}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => approveCanteen(canteen.id)}>
                              Approve
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => rejectCanteen(canteen.id)}>
                              Reject
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage all platform users</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="font-semibold">{user.name}</p>
                            <p className="text-sm text-gray-600">{user.email}</p>
                          </div>
                          <Badge className={getRoleColor(user.role)}>{user.role.replace("_", " ")}</Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge className={getStatusColor(user.status)}>{user.status}</Badge>
                        <Button
                          size="sm"
                          variant={user.status === "active" ? "destructive" : "default"}
                          onClick={() => toggleUserStatus(user.id)}
                        >
                          {user.status === "active" ? "Suspend" : "Activate"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Canteens Tab */}
          <TabsContent value="canteens" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Canteen Management</CardTitle>
                <CardDescription>Monitor all canteens and their performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {canteens.map((canteen) => (
                    <div key={canteen.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="font-semibold">{canteen.name}</p>
                            <p className="text-sm text-gray-600">Owner: {canteen.owner}</p>
                          </div>
                          <div className="text-sm">
                            <p>Revenue: ₹{canteen.revenue.toLocaleString()}</p>
                            <p>Orders: {canteen.orders}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm">Rating: {canteen.rating}/5</p>
                          <Badge className={getStatusColor(canteen.status)}>{canteen.status}</Badge>
                        </div>
                        {canteen.status === "pending" && (
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => approveCanteen(canteen.id)}>
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => rejectCanteen(canteen.id)}>
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Canteens</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>KL Adda</span>
                      <span className="font-semibold">₹45,000</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Satish Canteen</span>
                      <span className="font-semibold">₹38,000</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Healthy Bites</span>
                      <span className="font-semibold">₹32,000</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Platform Growth</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>New Users (This Month)</span>
                      <span className="font-semibold">+156</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Revenue Growth</span>
                      <span className="font-semibold text-green-600">+12%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Order Volume</span>
                      <span className="font-semibold text-green-600">+8%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Maintenance Mode</span>
                    <Switch checked={maintenanceMode} onCheckedChange={setMaintenanceMode} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>New Registrations</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Email Notifications</span>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full">Generate System Report</Button>
                  <Button className="w-full bg-transparent" variant="outline">
                    Export User Data
                  </Button>
                  <Button className="w-full bg-transparent" variant="outline">
                    Clear Cache
                  </Button>
                  <Button className="w-full" variant="destructive">
                    Emergency Shutdown
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
