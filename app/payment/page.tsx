"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, CheckCircle, CreditCard, Wallet, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useCart } from "@/hooks/use-cart"
import { useOrders } from "@/hooks/use-orders"
import { useToast } from "@/hooks/use-toast"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

export default function PaymentPage() {
  const { items, totalPrice, clearCart, canteenName, canClearCart } = useCart()
  const { addOrder } = useOrders()
  const { toast } = useToast()
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()

  const [paymentMethod, setPaymentMethod] = useState("upi")
  const [tipPercentage, setTipPercentage] = useState(0)
  const [customTip, setCustomTip] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [progress, setProgress] = useState(0)
  const [pickupTime, setPickupTime] = useState("asap")

  useEffect(() => {
    // Redirect if not authenticated or cart is empty
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    if (items.length === 0 && !paymentSuccess) {
      router.push("/")
    }
  }, [items, paymentSuccess, isAuthenticated, router])

  const handleTipSelection = (percentage: number) => {
    setTipPercentage(percentage)
    setCustomTip("")
  }

  const handleCustomTipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value === "" || /^\d+$/.test(value)) {
      setCustomTip(value)
      setTipPercentage(0)
    }
  }

  const calculateTip = () => {
    if (customTip) {
      return Number.parseInt(customTip, 10)
    }
    return Math.round((totalPrice * tipPercentage) / 100)
  }

  const tipAmount = calculateTip()
  const platformFee = 5
  const totalAmount = totalPrice + platformFee + tipAmount

  // Generate pickup time options
  const generateTimeOptions = () => {
    const options = []
    const now = new Date()

    // Add "As soon as possible" option
    options.push({ value: "asap", label: "As soon as possible" })

    // Add time slots in 15-minute increments for the next 2 hours
    for (let i = 1; i <= 8; i++) {
      const time = new Date(now.getTime() + i * 15 * 60000)
      const hours = time.getHours()
      const minutes = time.getMinutes()
      const ampm = hours >= 12 ? "PM" : "AM"
      const formattedHours = hours % 12 || 12
      const formattedMinutes = minutes.toString().padStart(2, "0")
      const timeString = `${formattedHours}:${formattedMinutes} ${ampm}`
      options.push({ value: timeString, label: timeString })
    }

    return options
  }

  const handlePayment = () => {
    if (!user) return

    setIsProcessing(true)

    // Simulate payment processing with progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 10
      })
    }, 200)

    // Simulate payment completion
    setTimeout(() => {
      clearInterval(interval)
      setProgress(100)

      // Create a new order
      const orderId = `ORD${Math.floor(100000 + Math.random() * 900000)}`
      const now = new Date()
      const estimatedReadyTime = new Date(now.getTime() + 20 * 60000) // 20 minutes from now

      const canteenId = items[0]?.canteenId || ""

      addOrder({
        id: orderId,
        items: [...items],
        totalAmount,
        tipAmount,
        paymentMethod,
        status: "Preparing",
        canteen: canteenName || "Multiple",
        canteenId,
        orderTime: now.toISOString(),
        pickupTime: pickupTime === "asap" ? "As soon as possible" : pickupTime,
        estimatedReadyTime: estimatedReadyTime.toISOString(),
        userId: user.id,
        userName: user.name,
      })

      // Clear cart and show success
      clearCart()
      setPaymentSuccess(true)

      toast({
        title: "Payment Successful!",
        description: "Your order has been placed successfully.",
      })
    }, 2500)
  }

  if (paymentSuccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <motion.div
          className="payment-success w-full max-w-md text-center"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <CheckCircle className="mx-auto mb-4 h-16 w-16 text-primary" />
          <h1 className="mb-2 text-2xl font-bold">Payment Successful!</h1>
          <p className="mb-6 text-muted-foreground">
            Your order has been placed successfully. You can track your order status in the Orders section.
          </p>
          <div className="flex flex-col gap-3">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link href="/quick-order">
                <Button className="w-full">Track Order</Button>
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link href="/">
                <Button variant="outline" className="w-full">
                  Back to Home
                </Button>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-16 page-transition">
      <div className="sticky top-0 z-10 flex items-center bg-background p-4 shadow-sm">
        <Link href="/cart" className="mr-2">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-bold">Payment</h1>
      </div>

      <div className="container px-4 py-6">
        {isProcessing ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Card className="mb-6">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="mb-6 w-full max-w-xs">
                  <Progress value={progress} className="h-2" />
                </div>
                <div className={`${progress === 100 ? "spin" : ""} mb-4 rounded-full bg-primary/10 p-4`}>
                  <CreditCard className="h-8 w-8 text-primary" />
                </div>
                <h2 className="mb-2 text-xl font-semibold">Processing Payment</h2>
                <p className="text-center text-muted-foreground">Please wait while we process your payment...</p>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Pickup Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={pickupTime} onValueChange={setPickupTime}>
                    <div className="flex items-center space-x-2 rounded-md border p-3">
                      <RadioGroupItem value="asap" id="asap" />
                      <Label htmlFor="asap" className="flex flex-1 items-center gap-2">
                        <Clock className="h-4 w-4" />
                        As soon as possible
                      </Label>
                    </div>
                    {generateTimeOptions()
                      .slice(1)
                      .map((option) => (
                        <div key={option.value} className="mt-2 flex items-center space-x-2 rounded-md border p-3">
                          <RadioGroupItem value={option.value} id={option.value} />
                          <Label htmlFor={option.value} className="flex flex-1 items-center gap-2">
                            <Clock className="h-4 w-4" />
                            {option.label}
                          </Label>
                        </div>
                      ))}
                  </RadioGroup>
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
                  <CardTitle>Payment Method</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    <div className="flex items-center space-x-2 rounded-md border p-3">
                      <RadioGroupItem value="upi" id="upi" />
                      <Label htmlFor="upi" className="flex flex-1 items-center gap-2">
                        <Wallet className="h-4 w-4" />
                        UPI
                      </Label>
                    </div>
                    <div className="mt-2 flex items-center space-x-2 rounded-md border p-3">
                      <RadioGroupItem value="card" id="card" />
                      <Label htmlFor="card" className="flex flex-1 items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Credit/Debit Card
                      </Label>
                    </div>
                    <div className="mt-2 flex items-center space-x-2 rounded-md border p-3">
                      <RadioGroupItem value="cash" id="cash" />
                      <Label htmlFor="cash" className="flex flex-1 items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Pay at Pickup
                      </Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Add a Tip</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-2">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant={tipPercentage === 5 ? "default" : "outline"}
                        onClick={() => handleTipSelection(5)}
                        className="w-full"
                      >
                        5% (₹{Math.round(totalPrice * 0.05)})
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant={tipPercentage === 10 ? "default" : "outline"}
                        onClick={() => handleTipSelection(10)}
                        className="w-full"
                      >
                        10% (₹{Math.round(totalPrice * 0.1)})
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant={tipPercentage === 15 ? "default" : "outline"}
                        onClick={() => handleTipSelection(15)}
                        className="w-full"
                      >
                        15% (₹{Math.round(totalPrice * 0.15)})
                      </Button>
                    </motion.div>
                  </div>
                  <div className="mt-3">
                    <Label htmlFor="custom-tip">Custom Tip (₹)</Label>
                    <Input
                      id="custom-tip"
                      type="text"
                      placeholder="Enter amount"
                      value={customTip}
                      onChange={handleCustomTipChange}
                      className="mt-1"
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Subtotal</span>
                    <span>₹{totalPrice}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Platform fee</span>
                    <span>₹{platformFee}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Tip</span>
                    <span>₹{tipAmount}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex items-center justify-between font-medium">
                    <span>Total</span>
                    <span>₹{totalAmount}</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <motion.div className="w-full" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button className="w-full" onClick={handlePayment}>
                      Pay ₹{totalAmount}
                    </Button>
                  </motion.div>
                </CardFooter>
              </Card>
            </motion.div>
          </>
        )}
      </div>
    </div>
  )
}
