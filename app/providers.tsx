"use client"

import type React from "react"

import { CartProvider } from "@/hooks/use-cart"
import { FavoritesProvider } from "@/hooks/use-favorites"
import { OrdersProvider } from "@/hooks/use-orders"
import { AuthProvider } from "@/hooks/use-auth"
import { SubscriptionProvider } from "@/hooks/use-subscription"
import { CanteensProvider } from "@/hooks/use-canteens"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        <FavoritesProvider>
          <OrdersProvider>
            <SubscriptionProvider>
              <CanteensProvider>{children}</CanteensProvider>
            </SubscriptionProvider>
          </OrdersProvider>
        </FavoritesProvider>
      </CartProvider>
    </AuthProvider>
  )
}
