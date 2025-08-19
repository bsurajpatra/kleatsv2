"use client"

import { useEffect, useMemo, useState } from "react"
import BottomNavigation from "@/components/bottom-navigation"
import LoadingScreen from "@/components/loading-screen"
import { useCart } from "@/hooks/use-cart"
import type { MenuItem } from "@/services/canteen-service"
import { canteenService } from "@/services/canteen-service"
import FoodItemCard from "@/components/food-item-card"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import Footer from "@/components/footer"
import Logo from "@/components/logo"
import ThemeToggle from "@/components/theme-toggle"
import { motion } from "framer-motion"
import { Star, Clock, Utensils, Copy, Check } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import Link from "next/link"
import SearchBar from "@/components/search-bar"
import { isOpenNow } from "@/lib/utils"
import LockOverlay from "@/components/lock-overlay"
// import ContactUs from "./contact/page"

export default function Home() {
  const [isLoading, setIsLoading] = useState(true)
  const [locked, setLocked] = useState<boolean>(() => {
    const v = process.env.NEXT_PUBLIC_LOCK
    return typeof v === "string" && /LOCK/i.test(v)
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<MenuItem[]>([])
  const [isSearching, setIsSearching] = useState(false)
  // No motion hooks in hero anymore for smoother, static layout

  const { addItem } = useCart()
  // backend-driven state
  const [homeLoading, setHomeLoading] = useState(true)
  const [homeError, setHomeError] = useState<string | null>(null)
  const [apiCanteens, setApiCanteens] = useState<{
    canteenId: number
    CanteenName: string
    Location?: string
    fromTime?: string | null
    ToTime?: string | null
    accessTo?: string
    poster?: string | null
  }[]>([])
  const [apiCategories, setApiCategories] = useState<{ name: string; poster?: string | null }[]>([])
  const [popularItems, setPopularItems] = useState<MenuItem[]>([])
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const [copiedOffer, setCopiedOffer] = useState<number | null>(null)

  // helper to check open status moved to lib/utils as isOpenNow

  useEffect(() => {
    let mounted = true
    const loadHome = async () => {
      setHomeLoading(true)
      setHomeError(null)
      try {
        const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || ""
        const [cRes, catRes] = await Promise.all([
          fetch(`${base}/api/explore/canteens`, { cache: "no-store" }),
          fetch(`${base}/api/explore/categories`, { cache: "no-store" }),
        ])
        if (!cRes.ok) throw new Error(`Canteens HTTP ${cRes.status}`)
        if (!catRes.ok) throw new Error(`Categories HTTP ${catRes.status}`)
        const cJson: { code: number; message: string; data: typeof apiCanteens } = await cRes.json()
        const catJson: { code: number; message: string; data: typeof apiCategories } = await catRes.json()
        if (cJson.code !== 1 || !Array.isArray(cJson.data)) throw new Error(cJson.message || "Failed canteens fetch")
        if (catJson.code !== 1 || !Array.isArray(catJson.data)) throw new Error(catJson.message || "Failed categories fetch")
        if (mounted) {
          setApiCanteens(cJson.data)
          setApiCategories(catJson.data)
        }
      } catch (e: any) {
        console.error("Home API failed", e)
        if (mounted) setHomeError("Unable to load homepage data.")
      } finally {
        if (mounted) setHomeLoading(false)
      }
    }
    loadHome()
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    // Simulate loading time for initial app load
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  // Load mock popular items from service (uses mock since API probing is disabled)
  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const items = await canteenService.getPopularItems(6)
        if (mounted) setPopularItems(items)
      } catch (e) {
        console.warn("Popular items load failed", e)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  // Handle search (placeholder: no backend search wired here)
  useEffect(() => {
    const performSearch = async () => {
      if (searchQuery.trim().length > 0) {
        setIsSearching(true)
        try {
    // Future: call a search endpoint. For now, show no results.
    setSearchResults([])
        } catch (error) {
          console.error("Search failed:", error)
          setSearchResults([])
        } finally {
          setIsSearching(false)
        }
      } else {
        setSearchResults([])
        setIsSearching(false)
      }
    }

    const debounceTimer = setTimeout(performSearch, 300)
    return () => clearTimeout(debounceTimer)
  }, [searchQuery])

  type DisplayItem = Pick<MenuItem, "id" | "name" | "price" | "image" | "description" | "rating" | "preparationTime"> & {
    canteen?: string
    canteenName?: string
  }

  const handleAddToCart = (item: DisplayItem) => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
  canteen: item.canteen || item.canteenName || "",
      image: item.image,
      packaging: false,
    })
  }

  // Helper to copy coupon codes
  const copyCoupon = async (code: string, id: number) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedOffer(id)
      setTimeout(() => setCopiedOffer(null), 1500)
    } catch (e) {
      console.error("Failed to copy coupon", e)
    }
  }

  if (isLoading) {
    return <LoadingScreen />
  }

  if (homeLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading delicious food options...</p>
        </div>
      </div>
    )
  }

  if (homeError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">Failed to load data: {homeError}</p>
          <button onClick={() => window.location.reload()} className="px-4 py-2 bg-primary text-white rounded-md">
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
    <LockOverlay open={locked} onUnlock={() => setLocked(false)} />
    <main className={`min-h-screen pb-24 page-transition ${locked ? "blur-sm pointer-events-none select-none" : ""}`}>
      {/* Top Bar */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 border-b">
        <div className="container mx-auto flex items-center justify-between">
          <Logo />
          <div className="hidden md:block md:w-1/3">
            <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search for food or canteen..." />
          </div>
          <div className="hidden md:flex md:items-center md:gap-2">
            <ThemeToggle />
            {!isAuthenticated ? (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <button
                  onClick={() => router.push("/login")}
                  className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white"
                >
                  Login
                </button>
              </motion.div>
            ) : (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <button
                  onClick={() => router.push("/account")}
                  className="rounded-md bg-primary/10 px-4 py-2 text-sm font-medium text-primary"
                >
                  My Account
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Static, clean hero without parallax/animations */}
      <section className="relative overflow-hidden">
        <div className="hero-bg" />
        <div className="container px-4 pt-10 pb-6 md:pt-16 md:pb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-center">
            <div>
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold tracking-tight">
                Quick, tasty meals from your campus canteens
              </h1>
              <p className="mt-3 md:mt-4 text-muted-foreground text-sm md:text-base max-w-xl">
                Discover popular items, browse categories, and order in seconds. Fresh, fast, and right around the corner.
              </p>
              <div className="mt-4 flex items-center gap-3">
                <Link href="/canteens" className="inline-flex rounded-md bg-primary px-4 py-2 text-white text-sm font-medium">
                  Browse canteens
                </Link>
                <Link href="#popular" className="inline-flex rounded-md px-4 py-2 text-sm font-medium border">
                  Explore popular
                </Link>
              </div>
            </div>
            <div className="md:pl-6">
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div className="rounded-xl border p-4 bg-card/60">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <Star className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Best rated</p>
                      <p className="text-xs text-muted-foreground">Students’ favorites</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border p-4 bg-card/60">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Under 15 min</p>
                      <p className="text-xs text-muted-foreground">Fast pickup</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border p-4 bg-card/60">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <Utensils className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Fresh options</p>
                      <p className="text-xs text-muted-foreground">Across canteens</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border p-4 bg-card/60">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <Star className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Offers</p>
                      <p className="text-xs text-muted-foreground">Exclusive deals</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container px-4 py-6">
        <div className="md:hidden mb-6 flex items-center gap-2">
          <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search for food or canteen..." />
          <ThemeToggle />
        </div>

        {/* Search Results */}
        {searchQuery.trim().length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <section className="mb-8">
              <h2 className="mb-4 text-lg font-semibold">
                {isSearching ? (
                  "Searching..."
                ) : (
                  <>
                    Search Results for &ldquo;{searchQuery}&rdquo; ({searchResults.length})
                  </>
                )}
              </h2>
              {isSearching ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="grid gap-4">
                  {searchResults.map((item) => {
                    const normalized = { ...item, canteen: (item as MenuItem & { canteen?: string }).canteen ?? item.canteenName }
                    return (
                      <FoodItemCard key={`search-${item.id}`} item={normalized} onAddToCart={handleAddToCart} />
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No items found matching &ldquo;{searchQuery}&rdquo;</p>
                  <p className="text-sm text-muted-foreground mt-2">Try searching for different keywords</p>
                </div>
              )}
            </section>
          </motion.div>
        )}

        {/* Show regular content only when not searching */}
        {searchQuery.trim().length === 0 && (
          <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5 }}
              >
                <section className="mb-8">
                <h2 className="mb-4 text-lg font-semibold">Food Categories</h2>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                  {apiCategories.map((category) => (
                    <Link href={`/category/${encodeURIComponent(category.name)}`} key={category.name}>
                        <Card className="card-hover overflow-hidden bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/40">
                          <CardContent className="flex flex-col items-center p-4">
                          <div className="mb-3 rounded-full bg-secondary/10 p-2">
                            <Image
                              src={(category.poster ? `${(process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "")}${category.poster.startsWith("/") ? category.poster : `/${category.poster}`}` : "/placeholder.svg")}
                              alt={category.name}
                              width={60}
                              height={60}
                              className="h-15 w-15 rounded-full object-cover"
                            />
                          </div>
                          <h3 className="text-center text-sm font-medium">{category.name}</h3>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>
            </motion.div>

            {/* Today's Offers - lightweight section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: 0.03 }}
            >
              <section className="mb-6" aria-labelledby="offers-heading">
                <div className="mb-3 flex items-center justify-between">
                  <h2 id="offers-heading" className="text-base font-semibold">Today's Offers</h2>
                </div>
                <div className="grid gap-3 grid-cols-2 md:grid-cols-2">
                  {[
                    {
                      id: 0,
                      title: "Combo Meal Discount",
                      subtitle: "Limited time • Campus pickup",
                      image: "/hero/bowl.svg",
                      coupon: "KLE10",
                    },
                    {
                      id: 1,
                      title: "Fresh & Healthy Deal",
                      subtitle: "Limited time • Campus pickup",
                      image: "/hero/leaf.svg",
                      coupon: "FRESH15",
                    },
                  ].map((offer, idx) => {
                    const canteenName = idx === 0 ? "Main Canteen" : "North Canteen"
                    return (
                      <Card key={`offer-${offer.id}`} className="overflow-hidden">
                        <CardContent className="p-0">
                          <div className="relative h-24">
                            <Image src={offer.image} alt={offer.title} fill className="object-contain p-3 bg-accent/10" />
                            <Badge className="absolute left-2 top-2 text-[10px] px-1.5 py-0.5">{canteenName}</Badge>
                          </div>
                          <div className="p-3 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="text-xs font-semibold leading-tight">{offer.title}</p>
                                <p className="text-[11px] text-muted-foreground leading-tight">{offer.subtitle}</p>
                              </div>
                              <Link href={`/offers/${offer.id}`} className="text-xs font-medium text-primary hover:underline whitespace-nowrap">View</Link>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Code</span>
                                <code className="rounded bg-muted px-1.5 py-0.5 text-[11px] font-mono">{offer.coupon}</code>
                              </div>
                              <button
                                onClick={() => copyCoupon(offer.coupon, offer.id)}
                                className="inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[11px] hover:bg-secondary"
                                aria-label={`Copy coupon ${offer.coupon}`}
                              >
                                {copiedOffer === offer.id ? (
                                  <>
                                    <Check className="h-3 w-3" /> Copied
                                  </>
                                ) : (
                                  <>
                                    <Copy className="h-3 w-3" /> Copy
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </section>
            </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: 0.05 }}
              >
                <section className="mb-8 scroll-mt-16 md:scroll-mt-20" id="popular">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Popular Items</h2>
                    <span className="hidden md:inline-flex text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">Updated hourly</span>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {popularItems.slice(0, 3).map((item) => {
                      const normalized = { ...item, canteen: (item as any).canteen ?? item.canteenName }
                      return (
                        <FoodItemCard
                          key={item.id}
                          item={normalized as any}
                          onAddToCart={(it: any) => {
                            const cid = (it as any).canteenId
                            const isNumeric = typeof cid === "number" || (typeof cid === "string" && /^\d+$/.test(cid))
                            router.push(isNumeric ? `/canteen/${cid}` : "/canteens")
                          }}
                        />
                      )
                    })}
                  </div>
              </section>
            </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <section className="mb-8" id="canteens">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Canteens</h2>
                    <Link
                      href="/canteens"
                      className="text-sm font-medium text-primary hover:underline"
                      aria-label="View all canteens"
                    >
                      View all
                    </Link>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {apiCanteens
                      .filter((c) => {
                        const open = isOpenNow(c.fromTime, c.ToTime)
                        return open === true || open === null
                      })
                      .slice(0, 6)
                      .map((canteen) => (
                    <Link href={`/canteen/${canteen.canteenId}`} key={canteen.canteenId}>
                        <Card className="card-hover overflow-hidden">
                        <CardContent className="p-0">
                          <div className="relative h-40">
                            <Image
                              src={
                                canteen.poster
                                  ? `${(process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "")}${canteen.poster.startsWith("/") ? canteen.poster : `/${canteen.poster}`}`
                                  : "/placeholder.svg"
                              }
                              alt={canteen.CanteenName}
                              fill
                              className="object-cover"
                            />
                            <Badge className="absolute right-2 top-2 bg-primary">Open</Badge>
                          </div>
                          <div className="p-4">
                            <h3 className="text-lg font-semibold">{canteen.CanteenName}</h3>
                            {canteen.Location && (
                              <p className="text-sm text-muted-foreground">{canteen.Location}</p>
                            )}
                            <div className="mt-2 flex justify-between">
                              <p className="text-xs text-muted-foreground">
                                {(canteen.fromTime || canteen.ToTime) ? `${canteen.fromTime || "?"} - ${canteen.ToTime || "?"}` : "Timing info not available"}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>
            </motion.div>
          </>
        )}
      </div>

      <Footer />
      <BottomNavigation />
    </main>
    </>
  )
}
