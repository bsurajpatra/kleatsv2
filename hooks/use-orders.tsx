"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import type { CartItem } from "./use-cart"

export type OrderStatus = "Preparing" | "Ready for Pickup" | "Completed" | "Cancelled"

export type Order = {
  id: string
  items: CartItem[]
  totalAmount: number
  tipAmount: number
  paymentMethod: string
  status: OrderStatus
  canteen: string
  canteenId: string
  orderTime: string
  pickupTime: string
  estimatedReadyTime: string
  userId: string
  userName: string
  receipt?: string
}

type OrdersContextType = {
  orders: Order[]
  addOrder: (order: Order) => void
  getOrderById: (id: string) => Order | undefined
  updateOrderStatus: (id: string, status: OrderStatus) => void
  getCanteenOrders: (canteenId: string) => Order[]
  getUserOrders: (userId: string) => Order[]
  generateReceipt: (orderId: string) => string
}

const OrdersContext = createContext<OrdersContextType>({
  orders: [],
  addOrder: () => {},
  getOrderById: () => undefined,
  updateOrderStatus: () => {},
  getCanteenOrders: () => [],
  getUserOrders: () => [],
  generateReceipt: () => "",
})

export function OrdersProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

  // Load orders from localStorage on mount
  useEffect(() => {
    try {
      const storedOrders = localStorage.getItem("orders")
      if (storedOrders) {
        setOrders(JSON.parse(storedOrders))
      }
      setIsInitialized(true)
    } catch (error) {
      console.error("Failed to load orders from localStorage", error)
      setIsInitialized(true)
    }
  }, [])

  // Save orders to localStorage when it changes
  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem("orders", JSON.stringify(orders))
      } catch (error) {
        console.error("Failed to save orders to localStorage", error)
      }
    }
  }, [orders, isInitialized])

  const addOrder = (order: Order) => {
    // Generate receipt for the order
    const receipt = generateReceipt(order.id, order)
    const orderWithReceipt = { ...order, receipt }

    setOrders((prev) => [orderWithReceipt, ...prev])
  }

  const getOrderById = (id: string) => {
    return orders.find((order) => order.id === id)
  }

  const updateOrderStatus = (id: string, status: OrderStatus) => {
    setOrders((prev) => prev.map((order) => (order.id === id ? { ...order, status } : order)))
  }

  const getCanteenOrders = (canteenId: string) => {
    return orders.filter((order) => order.canteenId === canteenId)
  }

  const getUserOrders = (userId: string) => {
    return orders.filter((order) => order.userId === userId)
  }

  const generateReceipt = (orderId: string, orderData?: Order) => {
    const order = orderData || orders.find((o) => o.id === orderId)
    if (!order) return ""

    const date = new Date(order.orderTime).toLocaleDateString()
    const time = new Date(order.orderTime).toLocaleTimeString()

    let receipt = `
      KL-EATS RECEIPT
      ===============================
      Order #: ${order.id}
      Date: ${date}
      Time: ${time}
      Canteen: ${order.canteen}
      ===============================
      ITEMS:
    `

    order.items.forEach((item) => {
      const itemTotal = item.price * item.quantity
      const packagingCost = item.packaging ? 7 * item.quantity : 0
      receipt += `\n${item.name} x${item.quantity} - ₹${itemTotal}`
      if (packagingCost > 0) {
        receipt += `\n  + Packaging - ₹${packagingCost}`
      }
    })

    receipt += `
      ===============================
      Subtotal: ₹${order.totalAmount - order.tipAmount - 5}
      Platform Fee: ₹5
      Tip: ₹${order.tipAmount}
      ===============================
      TOTAL: ₹${order.totalAmount}
      
      Payment Method: ${order.paymentMethod}
      Pickup Time: ${order.pickupTime}
      
      Thank you for ordering with KL-Eats!
    `

    return receipt
  }

  return (
    <OrdersContext.Provider
      value={{
        orders,
        addOrder,
        getOrderById,
        updateOrderStatus,
        getCanteenOrders,
        getUserOrders,
        generateReceipt,
      }}
    >
      {children}
    </OrdersContext.Provider>
  )
}

export const useOrders = () => useContext(OrdersContext)
