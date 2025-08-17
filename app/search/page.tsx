"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Search, SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import BottomNavigation from "@/components/bottom-navigation"
import CartIcon from "@/components/cart-icon"
import Footer from "@/components/footer"
import FoodItemCard from "@/components/food-item-card"
import SearchBar from "@/components/search-bar"
import { canteenService, type MenuItem } from "@/services/canteen-service"
import { motion } from "framer-motion"
import { useCart } from "@/hooks/use-cart"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"

function SearchPageContent() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get("q") || ""
  const { addItem } = useCart()
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState<MenuItem[]>([])
  const [filteredResults, setFilteredResults] = useState<MenuItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [categories, setCategories] = useState<string[]>([])

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200])
  const [sortBy, setSortBy] = useState<string>("relevance")

  // Load categories (from backend) and perform initial search
  useEffect(() => {
    const loadData = async () => {
      try {
        const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || ""
        const res = await fetch(`${base}/api/explore/categories`, { cache: "no-store" })
        if (!res.ok) throw new Error(`Categories HTTP ${res.status}`)
        const json: { code: number; message: string; data: { name: string }[] } = await res.json()
        if (json.code !== 1 || !Array.isArray(json.data)) throw new Error(json.message || "Failed categories fetch")
        setCategories(json.data.map((cat) => cat.name))

        if (initialQuery) {
          performSearch(initialQuery)
        }
      } catch (error) {
        console.error("Failed to load data:", error)
      }
    }

    loadData()
  }, [initialQuery])

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...results]

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter((item) => item.category === selectedCategory)
    }

    // Price filter
    filtered = filtered.filter((item) => item.price >= priceRange[0] && item.price <= priceRange[1])

    // Sorting
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price)
        break
      case "price-high":
        filtered.sort((a, b) => b.price - a.price)
        break
      case "rating":
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0))
        break
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      default: // relevance
        // Keep original order from search
        break
    }

    setFilteredResults(filtered)
  }, [results, selectedCategory, priceRange, sortBy])

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setIsLoading(true)
    try {
      const searchResults = await canteenService.searchMenuItems(searchQuery)
      setResults(searchResults)
    } catch (error) {
      console.error("Search failed:", error)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery)
    performSearch(searchQuery)
  }

  const handleAddToCart = (item: any) => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }
    addItem({ id: item.id, name: item.name, price: item.price, quantity: 1, canteen: item.canteen, image: item.image })
  }

  const clearFilters = () => {
    setSelectedCategory("all")
    setPriceRange([0, 200])
    setSortBy("relevance")
  }

  const activeFiltersCount =
    (selectedCategory !== "all" ? 1 : 0) +
    (priceRange[0] !== 0 || priceRange[1] !== 200 ? 1 : 0) +
    (sortBy !== "relevance" ? 1 : 0)

  return (
    <main className="min-h-screen pb-24 page-transition">
      <div className="sticky top-0 z-10 bg-background p-4 shadow-sm">
        <div className="flex items-center space-x-2">
          <div className="flex-1">
            <SearchBar value={query} onChange={setQuery} onSearch={handleSearch} showSuggestions={false} />
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="relative bg-transparent">
                <SlidersHorizontal className="h-4 w-4" />
                {activeFiltersCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="space-y-6 mt-6">
                {/* Category Filter */}
                <div>
                  <Label className="text-sm font-medium">Category</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range Filter */}
                <div>
                  <Label className="text-sm font-medium">
                    Price Range: ₹{priceRange[0]} - ₹{priceRange[1]}
                  </Label>
                  <Slider
                    value={priceRange}
                    onValueChange={(value) => setPriceRange(value as [number, number])}
                    max={200}
                    min={0}
                    step={10}
                    className="mt-2"
                  />
                </div>

                {/* Sort By */}
                <div>
                  <Label className="text-sm font-medium">Sort By</Label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance">Relevance</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="rating">Rating</SelectItem>
                      <SelectItem value="name">Name</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <Button variant="outline" onClick={clearFilters} className="w-full bg-transparent">
                  Clear All Filters
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="container px-4 py-6">
        {/* Search Info */}
        <div className="mb-6">
          {query && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {isLoading ? "Searching..." : `${filteredResults.length} results for "${query}"`}
              </p>
              {activeFiltersCount > 0 && (
                <Badge variant="secondary">
                  {activeFiltersCount} filter{activeFiltersCount > 1 ? "s" : ""} applied
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="h-32 bg-muted rounded mb-4"></div>
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredResults.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredResults.map((raw, index) => {
              const item = {
                id: raw.id,
                name: raw.name,
                price: raw.price,
                image: raw.image,
                description: raw.description,
                rating: raw.rating,
                preparationTime: raw.preparationTime,
                canteen: (raw as any).canteen ?? (raw as MenuItem).canteenName,
              }
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <FoodItemCard item={item as any} onAddToCart={handleAddToCart} />
                </motion.div>
              )
            })}
          </div>
        ) : query ? (
          <div className="text-center py-12">
            <Search className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-4" />
            <h3 className="text-lg font-medium mb-2">No results found</h3>
            <p className="text-muted-foreground mb-4">We couldn't find any items matching "{query}"</p>
            <Button variant="outline" onClick={() => setQuery("")}>
              Clear Search
            </Button>
          </div>
        ) : (
          <div className="text-center py-12">
            <Search className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-4" />
            <h3 className="text-lg font-medium mb-2">Start searching</h3>
            <p className="text-muted-foreground">Enter a search term to find your favorite food items</p>
          </div>
        )}
      </div>

      <Footer />
      <CartIcon />
      <BottomNavigation />
    </main>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchPageContent />
    </Suspense>
  )
}
