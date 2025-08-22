"use client"

import { useEffect } from "react"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Minus, Plus, ShoppingBag, Trash2, Clock, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/hooks/use-cart"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"

export default function CartPage() {
  const { items, removeItem, updateQuantity, togglePackaging, totalPrice, clearCart, canClearCart } = useCart()
  const { toast } = useToast()
  const { isAuthenticated, isInitialized } = useAuth()
  const router = useRouter()
  const [pickupTime, setPickupTime] = useState("asap")
  const [isProcessing, setIsProcessing] = useState(false)

  // Redirect to login only after auth state is initialized, and preserve return URL
  useEffect(() => {
    if (!isInitialized) return
    if (!isAuthenticated) {
      const params = new URLSearchParams()
      params.set("returnTo", "/cart")
      router.push(`/login?${params.toString()}`)
    }
  }, [isAuthenticated, isInitialized, router])

  const handleCheckout = () => {
    if (items.length === 0) return

    // Navigate to payment page with selected time so user doesn't re-enter
    const mode = pickupTime === "asap" ? "asap" : "slot"
    const qs = new URLSearchParams()
    qs.set("mode", mode)
    if (mode === "slot") qs.set("time", pickupTime)
    router.push(`/payment?${qs.toString()}`)
  }

  // Generate pickup time options
  const generateTimeOptions = () => {
    const options = []
    const now = new Date()

    // Add "As soon as possible" option
    options.push({ value: "asap", label: "As soon as possible" })

    // Start from the next quarter-hour (e.g., 1:15, 1:30, 1:45, 2:00)
    const first = new Date(now)
    const remainder = first.getMinutes() % 15
    const addMinutes = remainder === 0 ? 15 : 15 - remainder
    first.setMinutes(first.getMinutes() + addMinutes, 0, 0)

    // Add time slots in 15-minute increments for the next 2 hours (8 slots)
    for (let i = 0; i < 8; i++) {
      const time = new Date(first.getTime() + i * 15 * 60000)
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

  const timeOptions = generateTimeOptions()

  // Calculate packaging cost
  const packagingCost = items.reduce((total, item) => {
    return total + (item.packaging ? 7 * item.quantity : 0)
  }, 0)

  return (
    <div className="min-h-screen pb-16 page-transition">
      <div className="sticky top-0 z-10 flex items-center justify-between bg-background p-4 shadow-sm">
        <div className="flex items-center">
          <Link href={(typeof window !== "undefined" && (localStorage.getItem("last_canteen_id") ? `/canteen/${localStorage.getItem("last_canteen_id")}` : "/canteens")) || "/canteens"} className="mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-xl font-bold">Your Cart</h1>
        </div>
        {canClearCart && (
          <Button variant="ghost" size="sm" onClick={clearCart}>
            Clear Cart
          </Button>
        )}
      </div>

      <div className="container px-4 py-6">
        {items.length > 0 ? (
          <>
            <div className="mb-6">
              {items.map((item) => (
                <Card key={item.id} className="mb-4">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      {item.image && (
                        <div className="relative h-16 w-16 overflow-hidden rounded-md">
                          <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">{item.name}</h3>
                            <p className="text-sm text-muted-foreground">{item.canteen}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <p className="font-medium">₹{item.price * item.quantity}</p>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-6 text-center">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Switch
                              id={`packaging-${item.id}`}
                              checked={!!item.packaging}
                              onCheckedChange={() => togglePackaging(item.id)}
                            />
                            <Label htmlFor={`packaging-${item.id}`} className="flex items-center text-sm">
                              <Package className="mr-1 h-3 w-3" /> Packaging (+₹7)
                            </Label>
                          </div>
                          {item.packaging && (
                            <span className="text-xs text-muted-foreground">+₹{7 * item.quantity}</span>
                          )}
                        </div>
                        <div className="mt-4 flex items-center">
                          <Button variant="destructive" size="icon" onClick={() => removeItem(item.id)} aria-label="Remove item">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  {items.some((i) => !!i.packaging) ? "Pickup Time" : "Dining Time"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Label htmlFor="pickup-time" className="mb-2 block">
                  {items.some((i) => !!i.packaging)
                    ? "Select when you want to pick up your order"
                    : "Select when you want to dine-in"}
                </Label>
                <Select value={pickupTime} onValueChange={setPickupTime}>
                  <SelectTrigger id="pickup-time" className="w-full">
                    <SelectValue
                      placeholder={items.some((i) => !!i.packaging) ? "Select pickup time" : "Select dining time"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span>₹{totalPrice - packagingCost}</span>
                </div>
                {packagingCost > 0 && (
                  <div className="flex items-center justify-between">
                    <span>Packaging</span>
                    <span>₹{packagingCost}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span>Platform fee</span>
                  <span>₹5</span>
                </div>
                <Separator className="my-2" />
                <div className="flex items-center justify-between font-medium">
                  <span>Total</span>
                  <span>₹{totalPrice + 5}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={handleCheckout} disabled={isProcessing}>
                  {isProcessing ? "Processing..." : "Proceed to Payment"}
                </Button>
              </CardFooter>
            </Card>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <ShoppingBag className="mb-4 h-16 w-16 text-muted-foreground" />
            <h2 className="mb-2 text-xl font-semibold">Your cart is empty</h2>
            <p className="mb-6 text-center text-muted-foreground">
              Looks like you haven&apos;t added any items to your cart yet.
            </p>
            <Link href="/">
              <Button>Browse Menu</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
