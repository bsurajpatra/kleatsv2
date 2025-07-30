"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useCart } from "@/hooks/use-cart"
import { useCanteens } from "@/hooks/use-canteens"
import CartIcon from "@/components/cart-icon"
import FoodItemCard from "@/components/food-item-card"

export default function CanteenPage({ params }: { params: { slug: string } }) {
  const { slug } = params
  const { getCanteenById, getCanteenMenu } = useCanteens()
  const { addItem } = useCart()

  const [canteen, setCanteen] = useState<any>(null)
  const [menu, setMenu] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<string>("all")

  useEffect(() => {
    const loadCanteenData = async () => {
      try {
        setLoading(true)

        // Get canteen details
        const canteenData = getCanteenById(slug)
        if (!canteenData) {
          throw new Error("Canteen not found")
        }
        setCanteen(canteenData)

        // Get menu items
        const menuData = await getCanteenMenu(slug)
        setMenu(menuData)
      } catch (error) {
        console.error("Failed to load canteen data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadCanteenData()
  }, [slug, getCanteenById, getCanteenMenu])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading menu...</p>
        </div>
      </div>
    )
  }

  if (!canteen) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Canteen not found</p>
          <Link href="/">
            <button className="px-4 py-2 bg-primary text-white rounded-md">Go Home</button>
          </Link>
        </div>
      </div>
    )
  }

  const categories = ["all", ...canteen.categories]
  const filteredMenu = activeTab === "all" ? menu : menu.filter((item) => item.category === activeTab)

  const handleAddToCart = (item: any) => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      canteen: canteen.name,
      canteenId: canteen.id,
      image: item.image,
    })
  }

  return (
    <div className="min-h-screen pb-16">
      <div className="relative h-48">
        <Link href="/" className="absolute left-4 top-4 z-10 rounded-full bg-background/80 p-2">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <Image src={canteen.image || "/placeholder.svg"} alt={canteen.name} fill className="object-cover" />
      </div>

      <div className="container px-4 py-6">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">{canteen.name}</h1>
            <Badge className="bg-primary">★ {canteen.rating}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">{canteen.description}</p>
          <p className="text-sm text-muted-foreground">Preparation time: {canteen.preparationTime}</p>
          <p className="text-sm text-muted-foreground">Hours: {canteen.openingHours}</p>
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 w-full overflow-x-auto">
            {categories.map((category) => (
              <TabsTrigger key={category} value={category} className="capitalize">
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value={activeTab} className="mt-0">
            <div className="grid gap-4">
              {filteredMenu.length > 0 ? (
                filteredMenu.map((item) => (
                  <FoodItemCard
                    key={item.id}
                    item={{
                      ...item,
                      canteen: canteen.name,
                    }}
                    onAddToCart={handleAddToCart}
                  />
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No items available in this category</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <CartIcon />
    </div>
  )
}
