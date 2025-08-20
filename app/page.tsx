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
  const [isLoading, setIsLoading] = useState(() => {
    if (typeof window !== "undefined") {
      const hasLoadedBefore = sessionStorage.getItem("hasLoadedBefore")
      return !hasLoadedBefore
    }
    return true
  })
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
    if (isLoading) {
      sessionStorage.setItem("hasLoadedBefore", "true")
      const timer = setTimeout(() => {
        setIsLoading(false)
      }, 1500) // Reduced loading time

      return () => clearTimeout(timer)
    }
  }, [isLoading])

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
      <section className="relative overflow-hidden bg-gradient-to-b from-background via-background to-transparent">
        <div className="hero-bg-animation" />
        <div className="container px-4 pt-10 pb-6 md:pt-16 md:pb-12 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
                Quick, tasty meals from your campus canteens
              </h1>
              <p className="mt-3 md:mt-4 text-muted-foreground text-sm md:text-base max-w-xl">
                Discover popular items, browse categories, and order in seconds. Fresh, fast, and right around the corner.
              </p>
              <motion.div
                className="mt-6 flex items-center gap-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: "easeOut", delay: 0.3 }}
              >
                <Link href="/canteens" passHref>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex rounded-md bg-primary px-5 py-2.5 text-white text-sm font-medium shadow-lg shadow-primary/20"
                  >
                    Browse Canteens
                  </motion.button>
                </Link>
                <Link href="#popular" passHref>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex rounded-md px-5 py-2.5 text-sm font-medium border bg-card hover:bg-muted"
                  >
                    Explore Popular
                  </motion.button>
                </Link>
              </motion.div>
            </motion.div>
            <div className="md:pl-6">
              <motion.div
                className="grid grid-cols-2 gap-3 md:gap-4"
                initial="hidden"
                animate="visible"
                variants={{
                  visible: {
                    transition: {
                      staggerChildren: 0.1,
                      delayChildren: 0.5,
                    },
                  },
                }}
              >
                {[
                  { icon: Star, title: "Best Rated", subtitle: "Students’ favorites" },
                  { icon: Clock, title: "Under 15 min", subtitle: "Fast pickup" },
                  { icon: Utensils, title: "Fresh Options", subtitle: "Across canteens" },
                  { icon: Star, title: "Exclusive Offers", subtitle: "Daily deals" },
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0 },
                    }}
                    className="rounded-xl border p-4 bg-card/60 backdrop-blur-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                        <item.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
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
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            transition={{ staggerChildren: 0.1 }}
          >
            <motion.section
              className="mb-8"
              variants={{
                hidden: { opacity: 0, y: 40 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
              }}
            >
              <h2 className="mb-4 text-xl font-bold tracking-tight">Food Categories</h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {apiCategories.map((category) => (
                  <Link href={`/category/${encodeURIComponent(category.name)}`} key={category.name} passHref>
                    <motion.div whileHover={{ y: -5, boxShadow: "0px 10px 20px rgba(0,0,0,0.1)" }} transition={{ type: "spring", stiffness: 300 }}>
                      <Card className="overflow-hidden bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/40 h-full">
                        <CardContent className="flex flex-col items-center justify-center p-4 text-center">
                          <div className="mb-3 rounded-full bg-secondary/10 p-2 transform group-hover:scale-110 transition-transform duration-300">
                            <Image
                              src={category.poster ? `${(process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "")}${category.poster.startsWith("/") ? category.poster : `/${category.poster}`}` : "/placeholder.svg"}
                              alt={category.name}
                              width={60}
                              height={60}
                              className="h-15 w-15 rounded-full object-cover"
                            />
                          </div>
                          <h3 className="text-sm font-semibold">{category.name}</h3>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </motion.section>

            <motion.section
              className="mb-6"
              aria-labelledby="offers-heading"
              variants={{
                hidden: { opacity: 0, y: 40 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
              }}
            >
              <div className="mb-3 flex items-center justify-between">
                <h2 id="offers-heading" className="text-xl font-bold tracking-tight">Today's Offers</h2>
              </div>
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
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
                ].map((offer, idx) => (
                  <motion.div key={`offer-${offer.id}`} whileHover={{ y: -5, boxShadow: "0px 10px 20px rgba(0,0,0,0.05)" }} transition={{ type: "spring", stiffness: 300 }}>
                    <Card className="overflow-hidden h-full flex flex-col">
                      <CardContent className="p-0 flex-grow">
                        <div className="relative h-28">
                          <Image src={offer.image} alt={offer.title} fill className="object-contain p-4 bg-gradient-to-br from-accent/20 to-transparent" />
                          <Badge className="absolute left-2 top-2 text-[10px] px-1.5 py-0.5 border-primary/50 bg-primary/10 text-primary">{idx === 0 ? "Main Canteen" : "North Canteen"}</Badge>
                        </div>
                        <div className="p-3 space-y-2 flex-grow flex flex-col justify-between">
                          <div>
                            <p className="font-semibold leading-tight">{offer.title}</p>
                            <p className="text-xs text-muted-foreground leading-tight mt-1">{offer.subtitle}</p>
                          </div>
                          <div className="flex items-center justify-between gap-2 pt-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs uppercase tracking-wide text-muted-foreground">Code:</span>
                              <code className="rounded bg-muted px-2 py-1 text-xs font-mono font-bold">{offer.coupon}</code>
                            </div>
                            <button
                              onClick={() => copyCoupon(offer.coupon, offer.id)}
                              className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs hover:bg-secondary transition-colors"
                              aria-label={`Copy coupon ${offer.coupon}`}
                            >
                              {copiedOffer === offer.id ? (
                                <>
                                  <Check className="h-3.5 w-3.5 text-green-500" /> Copied
                                </>
                              ) : (
                                <>
                                  <Copy className="h-3.5 w-3.5" /> Copy
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.section>

            <motion.section
              className="mb-8 scroll-mt-16 md:scroll-mt-20"
              id="popular"
              variants={{
                hidden: { opacity: 0, y: 40 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
              }}
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold tracking-tight">Popular Items</h2>
                <span className="hidden md:inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                  <Star className="w-3 h-3" />
                  <span>Updated Hourly</span>
                </span>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {popularItems.slice(0, 3).map((item) => {
                  const normalized = { ...item, canteen: (item as any).canteen ?? item.canteenName }
                  return (
                    <motion.div key={item.id} whileHover={{ y: -5, boxShadow: "0px 10px 20px rgba(0,0,0,0.1)" }} transition={{ type: "spring", stiffness: 300 }}>
                      <FoodItemCard
                        item={normalized as any}
                        onAddToCart={(it: any) => {
                          const cid = (it as any).canteenId
                          const isNumeric = typeof cid === "number" || (typeof cid === "string" && /^\d+$/.test(cid))
                          router.push(isNumeric ? `/canteen/${cid}` : "/canteens")
                        }}
                      />
                    </motion.div>
                  )
                })}
              </div>
            </motion.section>

            <motion.section
              className="mb-8"
              id="canteens"
              variants={{
                hidden: { opacity: 0, y: 40 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
              }}
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold tracking-tight">Our Canteens</h2>
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
                    <Link href={`/canteen/${canteen.canteenId}`} key={canteen.canteenId} passHref>
                      <motion.div whileHover={{ y: -5, boxShadow: "0px 10px 20px rgba(0,0,0,0.1)" }} transition={{ type: "spring", stiffness: 300 }} className="h-full">
                        <Card className="overflow-hidden h-full">
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
                              <Badge className="absolute right-2 top-2 bg-green-500 text-white shadow-md">Open</Badge>
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
                      </motion.div>
                    </Link>
                  ))}
              </div>
            </motion.section>
          </motion.div>
        )}
      </div>

      <Footer />
      <BottomNavigation />
    </main>
    </>
  )
}
