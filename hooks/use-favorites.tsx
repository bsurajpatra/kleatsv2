"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"

export type FavoriteItem = {
  id: number
  name: string
  price: number
  canteen: string
  image?: string
  category?: string
  description?: string
}

type FavoritesContextType = {
  favorites: FavoriteItem[]
  addFavorite: (item: FavoriteItem) => void
  removeFavorite: (id: number) => void
  isFavorite: (id: number) => boolean
}

const FavoritesContext = createContext<FavoritesContextType>({
  favorites: [],
  addFavorite: () => {},
  removeFavorite: () => {},
  isFavorite: () => false,
})

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

  // Load favorites from localStorage on mount
  useEffect(() => {
    try {
      const storedFavorites = localStorage.getItem("favorites")
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites))
      }
      setIsInitialized(true)
    } catch (error) {
      console.error("Failed to load favorites from localStorage", error)
      setIsInitialized(true)
    }
  }, [])

  // Save favorites to localStorage when it changes
  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem("favorites", JSON.stringify(favorites))
      } catch (error) {
        console.error("Failed to save favorites to localStorage", error)
      }
    }
  }, [favorites, isInitialized])

  const addFavorite = (item: FavoriteItem) => {
    setFavorites((prev) => [...prev, item])
  }

  const removeFavorite = (id: number) => {
    setFavorites((prev) => prev.filter((item) => item.id !== id))
  }

  const isFavorite = (id: number) => {
    return favorites.some((item) => item.id === id)
  }

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        addFavorite,
        removeFavorite,
        isFavorite,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  )
}

export const useFavorites = () => useContext(FavoritesContext)
