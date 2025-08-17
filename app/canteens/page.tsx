"use client"

import { useEffect, useMemo, useState } from "react"
import BottomNavigation from "@/components/bottom-navigation"
import CartIcon from "@/components/cart-icon"
import Footer from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"

// Import SearchBar
import SearchBar from "@/components/search-bar"
import { isOpenNow } from "@/lib/utils"

type ApiCanteen = {
  canteenId: number
  CanteenName: string
  Location?: string
  fromTime?: string | null
  ToTime?: string | null
  accessTo?: string
  poster?: string | null
}

type ApiResponse = {
  code: number
  message: string
  data: ApiCanteen[]
}

export default function CanteensPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [data, setData] = useState<ApiCanteen[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    const fetchCanteens = async () => {
      setLoading(true)
      setError(null)
      try {
        const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || ""
        const res = await fetch(`${base}/api/explore/canteens`, { cache: "no-store" })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json: ApiResponse = await res.json()
        if (json.code !== 1 || !Array.isArray(json.data)) throw new Error(json.message || "Failed to fetch")
        if (mounted) setData(json.data)
      } catch (e: any) {
        console.error("Failed to load canteens", e)
        if (mounted) setError("Unable to load canteens right now.")
      } finally {
        if (mounted) setLoading(false)
      }
    }
    fetchCanteens()
    return () => {
      mounted = false
    }
  }, [])

  const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "")

  const openOrUnknown = useMemo(() => {
    return data.filter((c) => {
      const open = isOpenNow(c.fromTime, c.ToTime)
      return open === true || open === null
    })
  }, [data])

  const filteredCanteens = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return openOrUnknown
    return openOrUnknown.filter((c) => {
      const name = (c.CanteenName || "").toLowerCase()
      const loc = (c.Location || "").toLowerCase()
      return name.includes(q) || loc.includes(q)
    })
  }, [openOrUnknown, searchQuery])

  return (
    <main className="min-h-screen pb-24 page-transition">
      <div className="sticky top-0 z-10 bg-background p-4 shadow-sm">
        <h1 className="text-xl font-bold">Canteens</h1>
      </div>

      <div className="container px-4 py-6">
        <div className="mb-6">
          <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search for canteens..." />
        </div>

        {error && (
          <div className="mb-4">
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}

        {loading ? (
          <div className="grid gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-40 w-full animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : filteredCanteens.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground">No canteens available right now.</div>
        ) : (
          <div className="grid gap-4">
            {filteredCanteens.map((canteen, index) => {
              const hoursUnknown = isOpenNow(canteen.fromTime, canteen.ToTime) === null
              const badgeText = hoursUnknown
                ? "Hours N/A"
                : "Open Now"
              const imgSrc = canteen.poster
                ? `${baseUrl}${canteen.poster.startsWith("/") ? canteen.poster : `/${canteen.poster}`}`
                : "/placeholder.svg"
              return (
                <motion.div
                  key={canteen.canteenId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Link href={`/canteen/${canteen.canteenId}`}>
                    <Card className="card-hover overflow-hidden">
                      <CardContent className="p-0">
                        <div className="relative h-40">
                          <Image src={imgSrc} alt={canteen.CanteenName} fill className="object-cover" />
                          <Badge className="absolute right-2 top-2 bg-primary">{badgeText}</Badge>
                        </div>
                        <div className="p-4">
                          <h3 className="text-lg font-semibold">{canteen.CanteenName}</h3>
                          {canteen.Location && (
                            <p className="text-sm text-muted-foreground">{canteen.Location}</p>
                          )}
                          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                            {(canteen.fromTime || canteen.ToTime) ? (
                              <p>
                                {canteen.fromTime || "?"} - {canteen.ToTime || "?"}
                              </p>
                            ) : (
                              <p>Timing info not available</p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      <Footer />
      <CartIcon />
      <BottomNavigation />
    </main>
  )
}
