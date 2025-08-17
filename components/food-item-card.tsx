"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Plus, Minus, Loader2 } from "lucide-react"
import FavoriteButton from "./favorite-button"
import { Badge } from "@/components/ui/badge"

interface FoodItemCardProps {
  item: {
    id: number
    name: string
    price: number
    canteen: string
    image?: string
    category?: string
    description?: string
    rating?: number
    preparationTime?: string
  }
  onAddToCart?: (item: any) => void
  quantity?: number
  onIncrement?: () => void
  onDecrement?: () => void
  isLoading?: boolean
}

export default function FoodItemCard({ item, onAddToCart, quantity = 0, onIncrement, onDecrement, isLoading = false }: FoodItemCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="flex p-0">
        <div className="flex-1 p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold">{item.name}</h3>
              <p className="mb-1 text-xs text-muted-foreground">{item.canteen}</p>
            </div>
            {item.rating && (
              <Badge variant="outline" className="bg-primary/10 text-primary">
                ★ {item.rating}
              </Badge>
            )}
          </div>
          <p className="mb-2 text-sm text-muted-foreground line-clamp-2">{item.description}</p>
          {item.preparationTime && (
            <p className="text-xs text-muted-foreground mb-2">Prep time: {item.preparationTime}</p>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-medium">₹{item.price}</span>
              {item.canteen && (
                <Badge variant="secondary" className="text-[10px]">
                  {item.canteen}
                </Badge>
              )}
            </div>
            {quantity > 0 ? (
              <div className="flex items-center gap-2">
                <Button size="icon" variant="outline" disabled={isLoading} onClick={onDecrement} className="h-8 w-8">
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Minus className="h-4 w-4" />}
                </Button>
                <span className="w-6 text-center text-sm font-medium">{quantity}</span>
                <Button size="icon" variant="default" disabled={isLoading} onClick={onIncrement} className="h-8 w-8">
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                </Button>
              </div>
            ) : (
              <Button size="sm" disabled={isLoading} onClick={() => (onAddToCart ? onAddToCart(item) : onIncrement?.())}>
                {isLoading ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Plus className="mr-1 h-4 w-4" />}
                {isLoading ? "Adding" : "Add"}
              </Button>
            )}
          </div>
        </div>
        <div className="relative h-auto w-24">
          <FavoriteButton item={item} />
          <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
        </div>
      </CardContent>
    </Card>
  )
}
