"use client"

import { ShoppingBag } from "lucide-react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useCart } from "@/hooks/use-cart"

export default function CartIcon() {
  const { items, totalPrice } = useCart()
  const [isMounted, setIsMounted] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (items.length > 0) {
      setIsAnimating(true)
      const timer = setTimeout(() => setIsAnimating(false), 1000)
      return () => clearTimeout(timer)
    }
  }, [items.length])

  if (!isMounted) return null

  return (
    <Link href="/cart">
      <Button
        variant="default"
        size="lg"
        className={`fixed bottom-20 right-4 z-20 h-16 w-auto rounded-full shadow-lg flex items-center gap-2 px-4 ${isAnimating ? "pulse" : ""}`}
      >
        <ShoppingBag className="h-6 w-6" />
        <div className="flex flex-col items-start">
          <span className="text-xs font-medium">₹{totalPrice}</span>
          <span className="text-xs">View Cart</span>
        </div>
        {items.length > 0 && (
          <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-bold text-primary border-2 border-primary">
            {items.length}
          </span>
        )}
      </Button>
    </Link>
  )
}
