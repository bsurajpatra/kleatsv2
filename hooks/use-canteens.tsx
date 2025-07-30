"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { canteenService, type Canteen, type MenuItem, type Category } from "@/services/canteen-service"

type CanteensContextType = {
  canteens: Canteen[]
  categories: Category[]
  popularItems: MenuItem[]
  loading: boolean
  error: string | null
  refreshCanteens: () => Promise<void>
  getCanteenById: (id: string) => Canteen | undefined
  getCanteenMenu: (canteenId: string) => Promise<MenuItem[]>
  searchItems: (query: string) => Promise<MenuItem[]>
  getItemsByCategory: (category: string) => Promise<MenuItem[]>
}

const CanteensContext = createContext<CanteensContextType>({
  canteens: [],
  categories: [],
  popularItems: [],
  loading: false,
  error: null,
  refreshCanteens: async () => {},
  getCanteenById: () => undefined,
  getCanteenMenu: async () => [],
  searchItems: async () => [],
  getItemsByCategory: async () => [],
})

export function CanteensProvider({ children }: { children: React.ReactNode }) {
  const [canteens, setCanteens] = useState<Canteen[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [popularItems, setPopularItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadInitialData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [canteensData, categoriesData, popularItemsData] = await Promise.all([
        canteenService.getCanteens(),
        canteenService.getCategories(),
        canteenService.getPopularItems(6),
      ])

      setCanteens(canteensData)
      setCategories(categoriesData)
      setPopularItems(popularItemsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data")
      console.error("Failed to load initial data:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadInitialData()
  }, [])

  const refreshCanteens = async () => {
    try {
      setError(null)
      const canteensData = await canteenService.getCanteens()
      setCanteens(canteensData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to refresh canteens")
      console.error("Failed to refresh canteens:", err)
    }
  }

  const getCanteenById = (id: string) => {
    return canteens.find((canteen) => canteen.id === id)
  }

  const getCanteenMenu = async (canteenId: string) => {
    try {
      return await canteenService.getCanteenMenu(canteenId)
    } catch (err) {
      console.error("Failed to get canteen menu:", err)
      return []
    }
  }

  const searchItems = async (query: string) => {
    try {
      return await canteenService.searchMenuItems(query)
    } catch (err) {
      console.error("Failed to search items:", err)
      return []
    }
  }

  const getItemsByCategory = async (category: string) => {
    try {
      return await canteenService.getMenuItemsByCategory(category)
    } catch (err) {
      console.error("Failed to get items by category:", err)
      return []
    }
  }

  return (
    <CanteensContext.Provider
      value={{
        canteens,
        categories,
        popularItems,
        loading,
        error,
        refreshCanteens,
        getCanteenById,
        getCanteenMenu,
        searchItems,
        getItemsByCategory,
      }}
    >
      {children}
    </CanteensContext.Provider>
  )
}

export const useCanteens = () => useContext(CanteensContext)
