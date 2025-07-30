"use client"

import type React from "react"

import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useFavorites } from "@/hooks/use-favorites"
import { useState, useEffect } from "react"

interface FavoriteButtonProps {
  item: {
    id: number
    name: string
    price: number
    canteen: string
    image?: string
    category?: string
    description?: string
  }
}

export default function FavoriteButton({ item }: FavoriteButtonProps) {
  const { isFavorite, addFavorite, removeFavorite } = useFavorites()
  const [isClient, setIsClient] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) return null

  const favorite = isFavorite(item.id)

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (favorite) {
      removeFavorite(item.id)
    } else {
      addFavorite(item)
      setIsAnimating(true)
      setTimeout(() => setIsAnimating(false), 1000)
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className={`absolute right-2 top-2 z-10 h-8 w-8 rounded-full bg-background/80 ${isAnimating ? "heart-beat" : ""}`}
      onClick={handleToggleFavorite}
    >
      <Heart className={`h-5 w-5 ${favorite ? "fill-primary text-primary" : "text-muted-foreground"}`} />
    </Button>
  )
}
