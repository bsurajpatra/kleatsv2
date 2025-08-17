"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { useCart } from "@/hooks/use-cart"
import { useAuth } from "@/hooks/use-auth"
import { useRouter, useParams } from "next/navigation"
import FoodItemCard from "@/components/food-item-card"
import { motion } from "framer-motion"

type RawItem = {
  ItemId: number
  ItemName: string
  Description?: string
  Price: number
  ava?: boolean
  ImagePath?: string
  category?: string
  startTime?: string
  endTime?: string
  canteenId: number
}

type ItemsResponse = {
  code: number
  message: string
  data: RawItem[]
}

type CanteenDetails = {
  canteenId?: number
  CanteenName: string
}

type CanteenResponse = {
  code: number
  message: string
  data: CanteenDetails
}

function buildImageUrl(path?: string | null) {
  if (!path) return "/placeholder.svg"
  const base = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "")
  return `${base}${path.startsWith("/") ? path : `/${path}`}`
}

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>()
  const categoryName = decodeURIComponent(slug)
  const { addItem } = useCart()
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || ""
        const res = await fetch(`${base}/api/explore/get/items-by-category/${encodeURIComponent(categoryName)}`, {
          cache: "no-store",
        })
        if (!res.ok) throw new Error(`Items HTTP ${res.status}`)
        const json: ItemsResponse = await res.json()
        if (json.code !== 1 || !Array.isArray(json.data)) throw new Error(json.message || "Failed items fetch")
        const avail = json.data.filter((it) => it.ava !== false)
        const uniqueCIds = Array.from(new Set(avail.map((it) => it.canteenId)))
        // fetch canteen names
        const nameEntries = await Promise.all(
          uniqueCIds.map(async (id) => {
            try {
              const d = await fetch(`${base}/api/explore/canteen/details/${id}`, { cache: "no-store" })
              if (!d.ok) throw new Error()
              const dJson: CanteenResponse = await d.json()
              return [id, dJson.data?.CanteenName || `Canteen ${id}`] as const
            } catch {
              return [id, `Canteen ${id}`] as const
            }
          }),
        )
        const nameMap = Object.fromEntries(nameEntries) as Record<number, string>
        const mapped = avail.map((it) => ({
          id: it.ItemId,
          name: it.ItemName,
          price: it.Price,
          image: buildImageUrl(it.ImagePath || undefined),
          category: it.category,
          description: it.Description,
          canteen: nameMap[it.canteenId] || `Canteen ${it.canteenId}`,
        }))
        if (mounted) setItems(mapped)
      } catch (e) {
        console.error("Category load failed", e)
        if (mounted) setError("Unable to load category items.")
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [categoryName])

  const handleAddToCart = (item: any) => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }
    addItem({ id: item.id, name: item.name, price: item.price, quantity: 1, canteen: item.canteen, image: item.image })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading category...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Link href="/canteens" className="underline text-primary">
            Back
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-16 page-transition">
      <div className="sticky top-0 z-10 flex items-center bg-background p-4 shadow-sm">
        <Link href="/" className="mr-2">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-bold">{categoryName}</h1>
      </div>

      <div className="container px-4 py-6">
        <div className="mb-6">
          <p className="text-sm text-muted-foreground mt-2">{items.length} items available</p>
        </div>

        <div className="grid gap-4">
          {items.length > 0 ? (
            items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <FoodItemCard item={item} onAddToCart={handleAddToCart} />
              </motion.div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No items available in this category</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
