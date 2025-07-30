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
  Clock,
  DollarSign,
  Package,
  Users,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  LogOut,
  Bell,
  Settings,
} from "lucide-react"

// Mock data for worker dashboard
const mockOrders = [
  {
    id: "ORD001",
    customerName: "Raunit Kumar",
    items: ["Chicken Biryani", "Raita"],
    total: 180,
    status: "preparing",
    time: "10:30 AM",
    estimatedTime: "15 mins",
  },
  {
    id: "ORD002",
    customerName: "Priya Sharma",
    items: ["Veg Thali", "Lassi"],
    total: 120,
    status: "ready",
    time: "10:45 AM",
    estimatedTime: "Ready",
  },
  {
    id: "ORD003",
    customerName: "Amit Singh",
    items: ["Masala Dosa", "Coffee"],
    total: 85,
    status: "preparing",
    time: "11:00 AM",
    estimatedTime: "10 mins",
  },
]

const mockMenuItems = [
  { id: 1, name: "Chicken Biryani", price: 150, available: true, category: "Main Course" },
  { id: 2, name: "Veg Thali", price: 100, available: true, category: "Main Course" },
  { id: 3, name: "Masala Dosa", price: 70, available: false, category: "South Indian" },
  { id: 4, name: "Coffee", price: 15, available: true, category: "Beverages" },
  { id: 5, name: "Raita", price: 30, available: true, category: "Sides" },
]

export default function WorkerDashboard() {
  const { user, logout, isCanteenWorker } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState(mockOrders)
  const [menuItems, setMenuItems] = useState(mockMenuItems)
  const [stats, setStats] = useState({
    todayOrders: 45,
    todayRevenue: 6750,
    pendingOrders: 8,
    completedOrders: 37,
  })

  useEffect(() => {
    if (!isCanteenWorker) {
      router.push("/worker-login")
    }
  }, [isCanteenWorker, router])

  const updateOrderStatus = (orderId: string, newStatus: string) => {
    setOrders(orders.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order)))
  }

  const toggleMenuItemAvailability = (itemId: number) => {
    setMenuItems(menuItems.map((item) => (item.id === itemId ? { ...item, available: !item.available } : item)))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "preparing":
        return "bg-yellow-100 text-yellow-800"
      case "ready":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (!isCanteenWorker) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Worker Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.name}</p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
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
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Orders</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.todayOrders}</div>
              <p className="text-xs text-muted-foreground">+12% from yesterday</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats.todayRevenue}</div>
              <p className="text-xs text-muted-foreground">+8% from yesterday</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingOrders}</div>
              <p className="text-xs text-muted-foreground">Needs attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedOrders}</div>
              <p className="text-xs text-muted-foreground">Great job!</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="menu">Menu</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
            <TabsTrigger value="actions">Quick Actions</TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Active Orders</CardTitle>
                <CardDescription>Manage and update order status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="font-semibold">{order.id}</p>
                            <p className="text-sm text-gray-600">{order.customerName}</p>
                          </div>
                          <div>
                            <p className="text-sm">{order.items.join(", ")}</p>
                            <p className="text-sm text-gray-600">
                              ₹{order.total} • {order.time}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                        <div className="flex gap-2">
                          {order.status === "preparing" && (
                            <Button size="sm" onClick={() => updateOrderStatus(order.id, "ready")}>
                              Mark Ready
                            </Button>
                          )}
                          {order.status === "ready" && (
                            <Button size="sm" onClick={() => updateOrderStatus(order.id, "completed")}>
                              Complete
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Menu Tab */}
          <TabsContent value="menu" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Menu Management</CardTitle>
                <CardDescription>Toggle item availability</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {menuItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-sm text-gray-600">
                          {item.category} • ₹{item.price}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant={item.available ? "default" : "secondary"}>
                          {item.available ? "Available" : "Out of Stock"}
                        </Badge>
                        <Switch checked={item.available} onCheckedChange={() => toggleMenuItemAvailability(item.id)} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Statistics Tab */}
          <TabsContent value="stats" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Popular Items Today</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Chicken Biryani</span>
                      <span className="font-semibold">15 orders</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Veg Thali</span>
                      <span className="font-semibold">12 orders</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Masala Dosa</span>
                      <span className="font-semibold">8 orders</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Average Prep Time</span>
                      <span className="font-semibold">12 mins</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Order Completion Rate</span>
                      <span className="font-semibold">98%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Customer Rating</span>
                      <span className="font-semibold">4.8/5</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Quick Actions Tab */}
          <TabsContent value="actions" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Low Stock Alert
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">Items running low on stock</p>
                  <Button className="w-full">View Inventory</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Daily Report
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">Generate today's sales report</p>
                  <Button className="w-full">Generate Report</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Staff Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">View today's staff schedule</p>
                  <Button className="w-full">View Schedule</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
