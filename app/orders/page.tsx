"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import BottomNavigation from "@/components/bottom-navigation"
import { format } from "date-fns"

type AnyOrder = Record<string, any>

export default function OrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<AnyOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    const run = async () => {
      try {
        setLoading(true)
        setError(null)
        const token =
          (typeof window !== "undefined" && (localStorage.getItem("auth_token") || localStorage.getItem("token"))) ||
          null
        if (!token) {
          router.push("/login")
          return
        }
        const base = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "")
        const url = `${base}/api/User/order/getOrders?requestOffset=0`
        const res = await fetch(url, {
          method: "GET",
          headers: {
            // Backend expects raw token (no Bearer prefix)
            Authorization: token,
          },
          cache: "no-store",
        })
        const text = await res.text()
        if (!res.ok) {
          throw new Error(text || `HTTP ${res.status}`)
        }
        let data: any
        try {
          data = JSON.parse(text)
        } catch {
          throw new Error("Invalid JSON response")
        }
        const list: AnyOrder[] = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []
        if (active) setOrders(list)
      } catch (e: any) {
        console.error("Failed to load orders", e)
        if (active) setError(e?.message || "Failed to load orders")
      } finally {
        if (active) setLoading(false)
      }
    }
    run()
    return () => {
      active = false
    }
  }, [router])

  const normalized = useMemo(() => orders.map(normalizeOrder), [orders])

  return (
    <div className="min-h-screen pb-16 page-transition">
      <div className="sticky top-0 z-10 flex items-center bg-background p-4 shadow-sm">
        <Link href="/" className="mr-2 text-sm underline">
          Home
        </Link>
        <h1 className="text-xl font-bold">Orders</h1>
      </div>

      <div className="container px-4 py-6">
        {loading ? (
          <div className="text-center text-muted-foreground">Loading orders…</div>
        ) : error ? (
          <div className="rounded-md border p-4 text-sm text-red-600">{error}</div>
        ) : normalized.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">No orders yet</CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {normalized.map((o) => (
              <Card key={o.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Order #{o.id}</CardTitle>
                    {o.status && (
                      <Badge variant={o.status === "Completed" ? "default" : o.status === "Cancelled" ? "destructive" : "secondary"}>
                        {o.status}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {o.date ? `${format(new Date(o.date), "MMM d, yyyy 'at' h:mm a")}` : ""}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{o.canteenName || "Canteen"}</p>
                      {typeof o.total === "number" && <p className="text-sm font-medium">₹{o.total}</p>}
                    </div>
                    {o.itemsLabel && (
                      <p className="text-sm text-muted-foreground truncate" title={o.itemsLabel}>
                        {o.itemsLabel}
                      </p>
                    )}
                    <div className="pt-2 flex justify-end gap-2">
                      {o.canteenId && (
                        <Link href={`/canteen/${encodeURIComponent(String(o.canteenId))}`}>
                          <Button size="sm" variant="outline">Explore Canteen</Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  )
}

function normalizeOrder(src: AnyOrder) {
  const id = src.id ?? src.orderId ?? src.OrderId ?? src._id ?? src.pid ?? "-"
  const canteenId =
    src.canteenId ?? src.CanteenId ?? src.canteen_id ?? src.canteen?.id ?? src.canteen?.canteenId ?? null
  const canteenName = src.canteenName ?? src.CanteenName ?? src.canteen?.name ?? src.canteen?.CanteenName ?? ""
  const date = src.createdAt ?? src.orderDate ?? src.OrderDate ?? src.orderTime ?? null
  const total = src.totalAmount ?? src.total ?? src.TotalAmount ?? null
  const status = src.status ?? src.orderStatus ?? src.OrderStatus ?? null

  const rawItems = src.items ?? src.orderItems ?? src.Items ?? []
  const itemsLabel = Array.isArray(rawItems)
    ? rawItems
        .map((it: any) => {
          const name = it.name ?? it.itemName ?? it.ItemName ?? it.foodName ?? it.title ?? "Item"
          const qty = it.quantity ?? it.qty ?? it.Quantity ?? 1
          return `${name} (x${qty})`
        })
        .join(", ")
    : typeof rawItems === "string"
      ? rawItems
      : ""

  return { id, canteenId, canteenName, date, total, status, itemsLabel }
}
