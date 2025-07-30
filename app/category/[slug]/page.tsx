"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { useCart } from "@/hooks/use-cart"
import { useCanteens } from "@/hooks/use-canteens"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import FoodItemCard from "@/components/food-item-card"
import { motion } from "framer-motion"

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const { slug } = params
  const { categories, getItemsByCategory } = useCanteens()
  const { addItem } = useCart()
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  const [category, setCategory] = useState<any>(null)
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCategoryData = async () => {
      try {
        setLoading(true)

        // Find category by slug
        const categoryData = categories.find((cat) => cat.slug === slug)
        if (!categoryData) {
          throw new Error("Category not found")
        }
        setCategory(categoryData)

        // Get items for this category
        const itemsData = await getItemsByCategory(categoryData.name)
        setItems(itemsData)
      } catch (error) {
        console.error("Failed to load category data:", error)
      } finally {
        setLoading(false)
      }
    }

    if (categories.length > 0) {
      loadCategoryData()
    }
  }, [slug, categories, getItemsByCategory])

  const handleAddToCart = (item: any) => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      canteen: item.canteenName,
      canteenId: item.canteenId,
      image: item.image,
      packaging: false,
    })
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

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Category not found</p>
          <Link href="/">
            <button className="px-4 py-2 bg-primary text-white rounded-md">Go Home</button>
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
        <h1 className="text-xl font-bold">{category.name}</h1>
      </div>

      <div className="container px-4 py-6">
        <div className="mb-6">
          <p className="text-muted-foreground">{category.description}</p>
          <p className="text-sm text-muted-foreground mt-2">{items.length} items available</p>
        </div>

        <div className="grid gap-4">
          {items.length > 0 ? (
            items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
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
