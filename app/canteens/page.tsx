"use client"

import { useState } from "react"
import BottomNavigation from "@/components/bottom-navigation"
import CartIcon from "@/components/cart-icon"
import Footer from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"

// Import SearchBar
import SearchBar from "@/components/search-bar"

// Sample canteens data
const canteens = [
  {
    id: "kl-adda",
    name: "KL Adda",
    image: "/placeholder.svg?height=200&width=300",
    rating: 4.5,
    preparationTime: "10-15 min",
    slug: "kl-adda",
    description: "South Indian and North Indian cuisine",
    openingHours: "8:00 AM - 8:00 PM",
  },
  {
    id: "satish",
    name: "Satish",
    image: "/placeholder.svg?height=200&width=300",
    rating: 4.2,
    preparationTime: "15-20 min",
    slug: "satish",
    description: "Chinese and snacks",
    openingHours: "9:00 AM - 9:00 PM",
  },
  {
    id: "naturals",
    name: "Naturals",
    image: "/placeholder.svg?height=200&width=300",
    rating: 4.7,
    preparationTime: "5-10 min",
    slug: "naturals",
    description: "Ice cream and beverages",
    openingHours: "10:00 AM - 10:00 PM",
  },
  {
    id: "juice-junction",
    name: "Juice Junction",
    image: "/placeholder.svg?height=200&width=300",
    rating: 4.3,
    preparationTime: "5-10 min",
    slug: "juice-junction",
    description: "Fresh juices and smoothies",
    openingHours: "8:00 AM - 7:00 PM",
  },
  {
    id: "campus-cafe",
    name: "Campus Cafe",
    image: "/placeholder.svg?height=200&width=300",
    rating: 4.1,
    preparationTime: "10-15 min",
    slug: "campus-cafe",
    description: "Multi-cuisine restaurant",
    openingHours: "8:30 AM - 9:30 PM",
  },
]

export default function CanteensPage() {
  const [searchQuery, setSearchQuery] = useState("")

  // Filter canteens based on search query
  const filteredCanteens = canteens.filter(
    (canteen) =>
      canteen.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      canteen.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <main className="min-h-screen pb-24 page-transition">
      <div className="sticky top-0 z-10 bg-background p-4 shadow-sm">
        <h1 className="text-xl font-bold">Canteens</h1>
      </div>

      <div className="container px-4 py-6">
        <div className="mb-6">
          <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search for canteens..." />
        </div>

        <div className="grid gap-4">
          {filteredCanteens.map((canteen, index) => (
            <motion.div
              key={canteen.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Link href={`/canteen/${canteen.slug}`}>
                <Card className="card-hover overflow-hidden">
                  <CardContent className="p-0">
                    <div className="relative h-40">
                      <Image
                        src={canteen.image || "/placeholder.svg"}
                        alt={canteen.name}
                        fill
                        className="object-cover"
                      />
                      <Badge className="absolute right-2 top-2 bg-primary">★ {canteen.rating}</Badge>
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold">{canteen.name}</h3>
                      <p className="text-sm text-muted-foreground">{canteen.description}</p>
                      <div className="mt-2 flex justify-between">
                        <p className="text-xs text-muted-foreground">Prep time: {canteen.preparationTime}</p>
                        <p className="text-xs text-muted-foreground">{canteen.openingHours}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      <Footer />
      <CartIcon />
      <BottomNavigation />
    </main>
  )
}
