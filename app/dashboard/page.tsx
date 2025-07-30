"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { useOrders } from "@/hooks/use-orders"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { format } from "date-fns"
import BottomNavigation from "@/components/bottom-navigation"
import { motion } from "framer-motion"
import { Clock, DollarSign, Edit, FileText, Pause, Play, Plus, ShoppingBag, Trash } from "lucide-react"

// Sample menu items data
const canteenMenus = {
  "kl-adda": [
    {
      id: 101,
      name: "Masala Dosa",
      price: 55,
      category: "South Indian",
      image: "/placeholder.svg?height=100&width=100",
      description: "Crispy South Indian crepe filled with spiced potato",
      available: true,
    },
    {
      id: 102,
      name: "Idli",
      price: 30,
      category: "South Indian",
      image: "/placeholder.svg?height=100&width=100",
      description: "Steamed rice cake, soft and fluffy",
      available: true,
    },
    {
      id: 103,
      name: "Paratha",
      price: 50,
      category: "North Indian",
      image: "/placeholder.svg?height=100&width=100",
      description: "Layered flatbread with butter",
      available: true,
    },
    {
      id: 104,
      name: "Filter Coffee",
      price: 20,
      category: "Beverages",
      image: "/placeholder.svg?height=100&width=100",
      description: "Traditional South Indian coffee",
      available: true,
    },
    {
      id: 105,
      name: "Vada",
      price: 25,
      category: "South Indian",
      image: "/placeholder.svg?height=100&width=100",
      description: "Savory fried snack shaped like a donut",
      available: false,
    },
  ],
  satish: [
    {
      id: 201,
      name: "Chicken Rice",
      price: 90,
      category: "Chinese",
      image: "/placeholder.svg?height=100&width=100",
      description: "Flavorful rice with chicken pieces",
      available: true,
    },
    {
      id: 202,
      name: "Chicken Noodles",
      price: 80,
      category: "Chinese",
      image: "/placeholder.svg?height=100&width=100",
      description: "Stir-fried noodles with chicken and vegetables",
      available: true,
    },
    {
      id: 203,
      name: "Samosa",
      price: 15,
      category: "Snacks",
      image: "/placeholder.svg?height=100&width=100",
      description: "Crispy pastry filled with spiced potatoes",
      available: true,
    },
    {
      id: 204,
      name: "Coke",
      price: 20,
      category: "Beverages",
      image: "/placeholder.svg?height=100&width=100",
      description: "Refreshing cola drink",
      available: true,
    },
  ],
}

// Sample canteen details
const canteenDetails = {
  "kl-adda": {
    name: "KL Adda",
    openingTime: "08:00",
    closingTime: "20:00",
    location: "Main Campus, Ground Floor",
    contactNumber: "+91 9876543210",
  },
  satish: {
    name: "Satish",
    openingTime: "09:00",
    closingTime: "21:00",
    location: "Engineering Block, First Floor",
    contactNumber: "+91 9876543211",
  },
}

// Available categories
const availableCategories = [
  "South Indian",
  "North Indian",
  "Chinese",
  "Snacks",
  "Beverages",
  "Ice Cream",
  "Fast Food",
  "Desserts",
]

export default function DashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated, isCanteenOwner } = useAuth()
  const { getCanteenOrders, updateOrderStatus } = useOrders()

  const [canteenId, setCanteenId] = useState<string>("")
  const [canteenName, setCanteenName] = useState<string>("")
  const [orders, setOrders] = useState<any[]>([])
  const [menuItems, setMenuItems] = useState<any[]>([])
  const [canteenInfo, setCanteenInfo] = useState<any>(null)

  // Edit item state
  const [isEditItemOpen, setIsEditItemOpen] = useState(false)
  const [isAddItemOpen, setIsAddItemOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [itemName, setItemName] = useState("")
  const [itemPrice, setItemPrice] = useState("")
  const [itemDescription, setItemDescription] = useState("")
  const [itemCategory, setItemCategory] = useState("")
  const [itemAvailable, setItemAvailable] = useState(true)

  // Edit canteen info state
  const [isEditInfoOpen, setIsEditInfoOpen] = useState(false)
  const [openingTime, setOpeningTime] = useState("")
  const [closingTime, setClosingTime] = useState("")
  const [location, setLocation] = useState("")
  const [contactNumber, setContactNumber] = useState("")

  // Stats
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [totalOrders, setTotalOrders] = useState(0)
  const [pendingOrders, setPendingOrders] = useState(0)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    // Redirect if not authenticated or not a canteen owner
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    if (!isCanteenOwner) {
      router.push("/")
      return
    }

    if (user?.canteenId) {
      setCanteenId(user.canteenId)

      // Set canteen name
      const canteen = canteenDetails[user.canteenId as keyof typeof canteenDetails]
      if (canteen) {
        setCanteenName(canteen.name)
        setCanteenInfo(canteen)
        setOpeningTime(canteen.openingTime)
        setClosingTime(canteen.closingTime)
        setLocation(canteen.location)
        setContactNumber(canteen.contactNumber)
      }

      // Get menu items
      const menu = canteenMenus[user.canteenId as keyof typeof canteenMenus] || []
      setMenuItems(menu)

      // Get orders for this canteen
      const canteenOrders = getCanteenOrders(user.canteenId)
      setOrders(canteenOrders)

      // Calculate stats
      setTotalOrders(canteenOrders.length)
      setPendingOrders(
        canteenOrders.filter((order) => order.status !== "Completed" && order.status !== "Cancelled").length,
      )

      const revenue = canteenOrders
        .filter((order) => order.status !== "Cancelled")
        .reduce((total, order) => total + order.totalAmount, 0)
      setTotalRevenue(revenue)
    }
  }, [user, isAuthenticated, isCanteenOwner, router, getCanteenOrders])

  const handleEditItem = (item: any) => {
    setEditingItem(item)
    setItemName(item.name)
    setItemPrice(item.price.toString())
    setItemDescription(item.description)
    setItemCategory(item.category)
    setItemAvailable(item.available)
    setIsEditItemOpen(true)
  }

  const handleAddItem = () => {
    setEditingItem(null)
    setItemName("")
    setItemPrice("")
    setItemDescription("")
    setItemCategory(availableCategories[0])
    setItemAvailable(true)
    setIsAddItemOpen(true)
  }

  const handleSaveItem = () => {
    if (editingItem) {
      // Update existing item
      const updatedItems = menuItems.map((item) =>
        item.id === editingItem.id
          ? {
              ...item,
              name: itemName,
              price: Number(itemPrice),
              description: itemDescription,
              category: itemCategory,
              available: itemAvailable,
            }
          : item,
      )
      setMenuItems(updatedItems)
    } else {
      // Add new item
      const newItem = {
        id: Date.now(),
        name: itemName,
        price: Number(itemPrice),
        description: itemDescription,
        category: itemCategory,
        available: itemAvailable,
        image: "/placeholder.svg?height=100&width=100",
      }
      setMenuItems([...menuItems, newItem])
    }

    setIsEditItemOpen(false)
    setIsAddItemOpen(false)
  }

  const handleToggleItemAvailability = (itemId: number) => {
    const updatedItems = menuItems.map((item) => (item.id === itemId ? { ...item, available: !item.available } : item))
    setMenuItems(updatedItems)
  }

  const handleDeleteItem = (itemId: number) => {
    const updatedItems = menuItems.filter((item) => item.id !== itemId)
    setMenuItems(updatedItems)
  }

  const handleSaveCanteenInfo = () => {
    const updatedInfo = {
      ...canteenInfo,
      openingTime,
      closingTime,
      location,
      contactNumber,
    }
    setCanteenInfo(updatedInfo)
    setIsEditInfoOpen(false)
  }

  const handleUpdateOrderStatus = (orderId: string, status: any) => {
    updateOrderStatus(orderId, status)

    // Update local orders state
    const updatedOrders = orders.map((order) => (order.id === orderId ? { ...order, status } : order))
    setOrders(updatedOrders)
  }

  return (
    <div className="min-h-screen pb-16">
      <div className="sticky top-0 z-10 bg-background p-4 shadow-sm">
        <h1 className="text-xl font-bold">{canteenName} Dashboard</h1>
      </div>

      <div className="container px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="menu">Menu</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">₹{totalRevenue}</div>
                    <p className="text-xs text-muted-foreground">+20% from last month</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                    <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalOrders}</div>
                    <p className="text-xs text-muted-foreground">+15% from last month</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{pendingOrders}</div>
                    <p className="text-xs text-muted-foreground">Requires attention</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Menu Items</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{menuItems.filter((item) => item.available).length}</div>
                    <p className="text-xs text-muted-foreground">Out of {menuItems.length} total items</p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
              >
                <Card className="col-span-1">
                  <CardHeader>
                    <CardTitle>Recent Orders</CardTitle>
                    <CardDescription>Latest orders from customers</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {orders.slice(0, 5).map((order) => (
                        <div key={order.id} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Order #{order.id}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(order.orderTime), "MMM d, h:mm a")}
                            </p>
                          </div>
                          <Badge
                            variant={
                              order.status === "Completed"
                                ? "default"
                                : order.status === "Cancelled"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {order.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" onClick={() => setActiveTab("orders")}>
                      View All Orders
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.5 }}
              >
                <Card className="col-span-1">
                  <CardHeader>
                    <CardTitle>Canteen Information</CardTitle>
                    <CardDescription>Your canteen details</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium">Opening Hours</p>
                          <p className="text-sm text-muted-foreground">
                            {canteenInfo?.openingTime} - {canteenInfo?.closingTime}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Location</p>
                          <p className="text-sm text-muted-foreground">{canteenInfo?.location}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Contact</p>
                        <p className="text-sm text-muted-foreground">{canteenInfo?.contactNumber}</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" onClick={() => setIsEditInfoOpen(true)}>
                      Edit Information
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>All Orders</CardTitle>
                <CardDescription>Manage your customer orders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders.length > 0 ? (
                    orders.map((order) => (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className="rounded-lg border p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Order #{order.id}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(order.orderTime), "MMM d, yyyy 'at' h:mm a")}
                            </p>
                          </div>
                          <Badge
                            variant={
                              order.status === "Completed"
                                ? "default"
                                : order.status === "Cancelled"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {order.status}
                          </Badge>
                        </div>

                        <div className="mt-2">
                          <p className="text-sm">
                            <span className="font-medium">Customer:</span> {order.userName}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Pickup:</span> {order.pickupTime}
                          </p>
                        </div>

                        <div className="mt-2">
                          <p className="text-sm font-medium">Items:</p>
                          <ul className="mt-1 space-y-1">
                            {order.items.map((item: any) => (
                              <li key={item.id} className="text-sm text-muted-foreground">
                                {item.name} x{item.quantity} - ₹{item.price * item.quantity}
                                {item.packaging && <span className="ml-1 text-xs">(+ packaging)</span>}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <p className="font-medium">Total: ₹{order.totalAmount}</p>
                          <p className="text-sm text-muted-foreground">Paid via {order.paymentMethod}</p>
                        </div>

                        {order.status !== "Completed" && order.status !== "Cancelled" && (
                          <div className="mt-4 flex justify-end space-x-2">
                            {order.status === "Preparing" && (
                              <Button size="sm" onClick={() => handleUpdateOrderStatus(order.id, "Ready for Pickup")}>
                                Mark Ready
                              </Button>
                            )}
                            {order.status === "Ready for Pickup" && (
                              <Button size="sm" onClick={() => handleUpdateOrderStatus(order.id, "Completed")}>
                                Complete Order
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateOrderStatus(order.id, "Cancelled")}
                            >
                              Cancel
                            </Button>
                          </div>
                        )}
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                      <p className="mt-2 text-muted-foreground">No orders yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Menu Tab */}
          <TabsContent value="menu">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Menu Items</h2>
              <Button onClick={handleAddItem}>
                <Plus className="mr-2 h-4 w-4" /> Add Item
              </Button>
            </div>

            <div className="space-y-4">
              {menuItems.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className={!item.available ? "opacity-70" : ""}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <h3 className="font-medium">{item.name}</h3>
                            {!item.available && (
                              <Badge variant="outline" className="ml-2">
                                Unavailable
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{item.category}</p>
                          <p className="mt-1 text-sm">{item.description}</p>
                          <p className="mt-2 font-medium">₹{item.price}</p>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="icon" variant="ghost" onClick={() => handleToggleItemAvailability(item.id)}>
                            {item.available ? (
                              <Pause className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Play className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => handleEditItem(item)}>
                            <Edit className="h-4 w-4 text-muted-foreground" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => handleDeleteItem(item.id)}>
                            <Trash className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Canteen Settings</CardTitle>
                <CardDescription>Manage your canteen information and preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium mb-2">Canteen Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <p className="text-sm">Name</p>
                      <p className="text-sm font-medium">{canteenName}</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-sm">Opening Hours</p>
                      <p className="text-sm font-medium">
                        {canteenInfo?.openingTime} - {canteenInfo?.closingTime}
                      </p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-sm">Location</p>
                      <p className="text-sm font-medium">{canteenInfo?.location}</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-sm">Contact</p>
                      <p className="text-sm font-medium">{canteenInfo?.contactNumber}</p>
                    </div>
                  </div>
                  <Button variant="outline" className="mt-4 w-full" onClick={() => setIsEditInfoOpen(true)}>
                    Edit Information
                  </Button>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Canteen Status</h3>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">Open for Orders</p>
                      <p className="text-sm text-muted-foreground">Allow customers to place orders</p>
                    </div>
                    <Switch checked={true} />
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Notifications</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <p className="text-sm font-medium">New Order Alerts</p>
                        <p className="text-sm text-muted-foreground">Get notified when new orders arrive</p>
                      </div>
                      <Switch checked={true} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <p className="text-sm font-medium">Order Status Updates</p>
                        <p className="text-sm text-muted-foreground">Send notifications when order status changes</p>
                      </div>
                      <Switch checked={true} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Item Dialog */}
      <Dialog
        open={isEditItemOpen || isAddItemOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsEditItemOpen(false)
            setIsAddItemOpen(false)
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Item" : "Add New Item"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="item-name">Name</Label>
              <Input
                id="item-name"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="Item name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="item-price">Price (₹)</Label>
              <Input
                id="item-price"
                value={itemPrice}
                onChange={(e) => setItemPrice(e.target.value)}
                placeholder="Price"
                type="number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="item-category">Category</Label>
              <Select value={itemCategory} onValueChange={setItemCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {availableCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="item-description">Description</Label>
              <Textarea
                id="item-description"
                value={itemDescription}
                onChange={(e) => setItemDescription(e.target.value)}
                placeholder="Item description"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="item-available" checked={itemAvailable} onCheckedChange={setItemAvailable} />
              <Label htmlFor="item-available">Available</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditItemOpen(false)
                setIsAddItemOpen(false)
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveItem}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Canteen Info Dialog */}
      <Dialog open={isEditInfoOpen} onOpenChange={setIsEditInfoOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Canteen Information</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="opening-time">Opening Time</Label>
                <Input
                  id="opening-time"
                  value={openingTime}
                  onChange={(e) => setOpeningTime(e.target.value)}
                  placeholder="e.g. 08:00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="closing-time">Closing Time</Label>
                <Input
                  id="closing-time"
                  value={closingTime}
                  onChange={(e) => setClosingTime(e.target.value)}
                  placeholder="e.g. 20:00"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Canteen location"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-number">Contact Number</Label>
              <Input
                id="contact-number"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                placeholder="Contact number"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditInfoOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveCanteenInfo}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BottomNavigation />
    </div>
  )
}
