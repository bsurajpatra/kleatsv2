"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Search, X, Clock, TrendingUp } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { canteenService, type MenuItem } from "@/services/canteen-service"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"

interface SearchBarProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  showSuggestions?: boolean
  onSearch?: (query: string) => void
}

export default function SearchBar({
  value = "",
  onChange,
  placeholder = "Search for food items...",
  showSuggestions = true,
  onSearch,
}: SearchBarProps) {
  const [query, setQuery] = useState(value)
  const [suggestions, setSuggestions] = useState<MenuItem[]>([])
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Popular search terms
  const popularSearches = ["Dosa", "Coffee", "Chicken Rice", "Idli", "Noodles", "Samosa", "Ice Cream", "Juice"]

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("recentSearches")
    if (saved) {
      setRecentSearches(JSON.parse(saved))
    }
  }, [])

  // Handle input changes with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (query.trim() && showSuggestions) {
        setIsLoading(true)
        try {
          const results = await canteenService.searchMenuItems(query)
          setSuggestions(results.slice(0, 5)) // Show top 5 suggestions
        } catch (error) {
          console.error("Search error:", error)
          setSuggestions([])
        } finally {
          setIsLoading(false)
        }
      } else {
        setSuggestions([])
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query, showSuggestions])

  // Handle clicks outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setQuery(newValue)
    onChange?.(newValue)
    setIsOpen(true)
  }

  const handleSearch = (searchQuery: string = query) => {
    if (!searchQuery.trim()) return

    // Save to recent searches
    const updatedRecent = [searchQuery, ...recentSearches.filter((s) => s !== searchQuery)].slice(0, 5)
    setRecentSearches(updatedRecent)
    localStorage.setItem("recentSearches", JSON.stringify(updatedRecent))

    // Close suggestions
    setIsOpen(false)

    // Call onSearch callback or navigate to search page
    if (onSearch) {
      onSearch(searchQuery)
    } else {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  const handleSuggestionClick = (item: MenuItem) => {
    const searchQuery = item.name
    setQuery(searchQuery)
    onChange?.(searchQuery)
    handleSearch(searchQuery)
  }

  const handleRecentSearchClick = (search: string) => {
    setQuery(search)
    onChange?.(search)
    handleSearch(search)
  }

  const clearRecentSearches = () => {
    setRecentSearches([])
    localStorage.removeItem("recentSearches")
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    } else if (e.key === "Escape") {
      setIsOpen(false)
    }
  }

  return (
    <div ref={searchRef} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          className="pl-9 pr-10"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 p-0"
            onClick={() => {
              setQuery("")
              onChange?.("")
              inputRef.current?.focus()
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && showSuggestions && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full z-50 mt-1 w-full"
          >
            <Card className="shadow-lg">
              <CardContent className="p-0">
                {/* Search Results */}
                {suggestions.length > 0 && (
                  <div className="border-b">
                    <div className="p-3">
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Search Results</h4>
                      <div className="space-y-2">
                        {suggestions.map((item) => (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted cursor-pointer"
                            onClick={() => handleSuggestionClick(item)}
                          >
                            <Image
                              src={item.image || "/placeholder.svg"}
                              alt={item.name}
                              width={40}
                              height={40}
                              className="rounded-md object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{item.name}</p>
                              <div className="flex items-center space-x-2">
                                <p className="text-xs text-muted-foreground">{item.canteenName}</p>
                                <Badge variant="outline" className="text-xs">
                                  ₹{item.price}
                                </Badge>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Loading State */}
                {isLoading && (
                  <div className="p-3 border-b">
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      <span className="text-sm text-muted-foreground">Searching...</span>
                    </div>
                  </div>
                )}

                {/* Recent Searches */}
                {recentSearches.length > 0 && !query && (
                  <div className="border-b">
                    <div className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-muted-foreground flex items-center">
                          <Clock className="mr-1 h-3 w-3" />
                          Recent Searches
                        </h4>
                        <Button variant="ghost" size="sm" className="text-xs h-auto p-1" onClick={clearRecentSearches}>
                          Clear
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {recentSearches.map((search, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="cursor-pointer hover:bg-secondary/80"
                            onClick={() => handleRecentSearchClick(search)}
                          >
                            {search}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Popular Searches */}
                {!query && (
                  <div className="p-3">
                    <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center">
                      <TrendingUp className="mr-1 h-3 w-3" />
                      Popular Searches
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {popularSearches.map((search, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="cursor-pointer hover:bg-muted"
                          onClick={() => handleRecentSearchClick(search)}
                        >
                          {search}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* No Results */}
                {query && !isLoading && suggestions.length === 0 && (
                  <div className="p-3 text-center">
                    <p className="text-sm text-muted-foreground">No results found for "{query}"</p>
                    <p className="text-xs text-muted-foreground mt-1">Try searching for something else</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
