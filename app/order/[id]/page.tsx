"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useOrders } from "@/hooks/use-orders"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Receipt, Clock, MapPin, CreditCard } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { motion } from "framer-motion"

export default function OrderDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { getOrderById } = useOrders()
  const { user, isAuthenticated } = useAuth()
  const [order, setOrder] = useState<any>(null)
  const [isReceiptOpen, setIsReceiptOpen] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    const orderId = params.id as string
    const orderDetails = getOrderById(orderId)

    if (!orderDetails) {
      router.push("/quick-order")
      return
    }

    setOrder(orderDetails)
  }, [params.id, getOrderById, router, isAuthenticated])

  if (!order) {
    return null
  }

  // Calculate subtotal (without tip and platform fee)
  const subtotal = order.totalAmount - order.tipAmount - 5

  // Calculate packaging cost
  const packagingCost = order.items.reduce((total: number, item: any) => {
    return total + (item.packaging ? 7 * item.quantity : 0)
  }, 0)

  // Format dates
  const orderDate = new Date(order.orderTime)
  const formattedOrderDate = format(orderDate, "MMMM d, yyyy")
  const formattedOrderTime = format(orderDate, "h:mm a")

  return (
    <div className="min-h-screen pb-16 page-transition">
      <div className="sticky top-0 z-10 flex items-center bg-background p-4 shadow-sm">
  <Link href="/orders" className="mr-2">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-bold">Order Details</h1>
      </div>

      <div className="container px-4 py-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Order #{order.id}</CardTitle>
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
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Order Time</p>
                    <p className="text-sm text-muted-foreground">
                      {formattedOrderDate} at {formattedOrderTime}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Pickup From</p>
                    <p className="text-sm text-muted-foreground">{order.canteen}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Pickup Time</p>
                    <p className="text-sm text-muted-foreground">{order.pickupTime}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Payment Method</p>
                    <p className="text-sm text-muted-foreground">{order.paymentMethod}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item: any) => (
                  <div key={item.id} className="flex justify-between border-b pb-3 last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium">
                        {item.name} x {item.quantity}
                      </p>
                      {item.packaging && <p className="text-xs text-muted-foreground">With packaging</p>}
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₹{item.price * item.quantity}</p>
                      {item.packaging && <p className="text-xs text-muted-foreground">+₹{7 * item.quantity}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Payment Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{subtotal - packagingCost}</span>
                </div>
                {packagingCost > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Packaging</span>
                    <span>₹{packagingCost}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Platform Fee</span>
                  <span>₹5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tip</span>
                  <span>₹{order.tipAmount}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-medium">
                  <span>Total</span>
                  <span>₹{order.totalAmount}</span>
                </div>

                <div className="pt-4">
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Button variant="outline" className="w-full" onClick={() => setIsReceiptOpen(true)}>
                      <Receipt className="mr-2 h-4 w-4" />
                      View Receipt
                    </Button>
                  </motion.div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Dialog open={isReceiptOpen} onOpenChange={setIsReceiptOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Receipt</DialogTitle>
          </DialogHeader>
          <div className="font-mono text-sm whitespace-pre-wrap">{order.receipt}</div>
          <div className="mt-4 flex justify-end">
            <Button onClick={() => setIsReceiptOpen(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
