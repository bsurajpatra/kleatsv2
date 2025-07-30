"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"

export type SubscriptionPlan = {
  id: string
  name: string
  price: number
  description: string
  features: string[]
  duration: string
}

export type Subscription = {
  id: string
  planId: string
  startDate: string
  endDate: string
  status: "active" | "expired" | "cancelled"
}

type SubscriptionContextType = {
  plans: SubscriptionPlan[]
  currentSubscription: Subscription | null
  subscribe: (planId: string) => Promise<boolean>
  cancelSubscription: () => Promise<boolean>
  isSubscribed: boolean
}

// Available subscription plans
const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: "basic",
    name: "Basic Plan",
    price: 499,
    description: "Perfect for occasional campus dining",
    features: ["10% off on all orders", "Priority pickup", "No platform fee"],
    duration: "1 month",
  },
  {
    id: "premium",
    name: "Premium Plan",
    price: 999,
    description: "Ideal for regular campus diners",
    features: ["15% off on all orders", "Priority pickup", "No platform fee", "Free packaging", "Exclusive offers"],
    duration: "1 month",
  },
  {
    id: "ultimate",
    name: "Ultimate Plan",
    price: 1499,
    description: "For the campus food enthusiast",
    features: [
      "20% off on all orders",
      "Priority pickup",
      "No platform fee",
      "Free packaging",
      "Exclusive offers",
      "Monthly food voucher worth ₹200",
    ],
    duration: "1 month",
  },
]

const SubscriptionContext = createContext<SubscriptionContextType>({
  plans: subscriptionPlans,
  currentSubscription: null,
  subscribe: async () => false,
  cancelSubscription: async () => false,
  isSubscribed: false,
})

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  // Load subscription from localStorage on mount
  useEffect(() => {
    try {
      const storedSubscription = localStorage.getItem("subscription")
      if (storedSubscription) {
        setCurrentSubscription(JSON.parse(storedSubscription))
      }
      setIsInitialized(true)
    } catch (error) {
      console.error("Failed to load subscription from localStorage", error)
      setIsInitialized(true)
    }
  }, [])

  // Save subscription to localStorage when it changes
  useEffect(() => {
    if (isInitialized) {
      try {
        if (currentSubscription) {
          localStorage.setItem("subscription", JSON.stringify(currentSubscription))
        } else {
          localStorage.removeItem("subscription")
        }
      } catch (error) {
        console.error("Failed to save subscription to localStorage", error)
      }
    }
  }, [currentSubscription, isInitialized])

  const subscribe = async (planId: string) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const now = new Date()
    const endDate = new Date(now)
    endDate.setMonth(endDate.getMonth() + 1) // 1 month subscription

    const newSubscription: Subscription = {
      id: "sub_" + Math.random().toString(36).substr(2, 9),
      planId,
      startDate: now.toISOString(),
      endDate: endDate.toISOString(),
      status: "active",
    }

    setCurrentSubscription(newSubscription)
    return true
  }

  const cancelSubscription = async () => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (currentSubscription) {
      setCurrentSubscription({
        ...currentSubscription,
        status: "cancelled",
      })
      return true
    }
    return false
  }

  return (
    <SubscriptionContext.Provider
      value={{
        plans: subscriptionPlans,
        currentSubscription,
        subscribe,
        cancelSubscription,
        isSubscribed: !!currentSubscription && currentSubscription.status === "active",
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  )
}

export const useSubscription = () => useContext(SubscriptionContext)
