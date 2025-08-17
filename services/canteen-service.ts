import { apiClient, API_ENDPOINTS, type ApiResponse, handleApiError } from "@/lib/api"

export interface Canteen {
  id: string
  name: string
  description: string
  image: string
  rating: number
  preparationTime: string
  openingHours: string
  location: string
  contactNumber: string
  isActive: boolean
  categories: string[]
  ownerId: string
  createdAt: string
  updatedAt: string
}

export interface MenuItem {
  id: number
  name: string
  description: string
  price: number
  image: string
  category: string
  canteenId: string
  canteenName: string
  available: boolean
  rating?: number
  preparationTime?: string
  ingredients?: string[]
  nutritionInfo?: {
    calories: number
    protein: number
    carbs: number
    fat: number
  }
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: string
  name: string
  description: string
  image: string
  slug: string
}

class CanteenService {
  // Mock data - will be replaced by API calls
  private mockCanteens: Canteen[] = [
    {
      id: "kl-adda",
      name: "KL Adda",
      description: "South Indian and North Indian cuisine",
      image: "/placeholder.svg?height=200&width=300",
      rating: 4.5,
      preparationTime: "10-15 min",
      openingHours: "8:00 AM - 8:00 PM",
      location: "Main Campus, Ground Floor",
      contactNumber: "+91 9876543210",
      isActive: true,
      categories: ["South Indian", "North Indian", "Beverages"],
      ownerId: "user_2",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "satish",
      name: "Satish",
      description: "Chinese and snacks",
      image: "/placeholder.svg?height=200&width=300",
      rating: 4.2,
      preparationTime: "15-20 min",
      openingHours: "9:00 AM - 9:00 PM",
      location: "Engineering Block, First Floor",
      contactNumber: "+91 9876543211",
      isActive: true,
      categories: ["Chinese", "Snacks", "Beverages"],
      ownerId: "user_3",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "naturals",
      name: "Naturals",
      description: "Ice cream and beverages",
      image: "/placeholder.svg?height=200&width=300",
      rating: 4.7,
      preparationTime: "5-10 min",
      openingHours: "10:00 AM - 10:00 PM",
      location: "Student Center",
      contactNumber: "+91 9876543212",
      isActive: true,
      categories: ["Ice Cream", "Beverages"],
      ownerId: "user_4",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]

  private mockMenuItems: MenuItem[] = [
    // KL Adda items
    {
      id: 101,
      name: "Masala Dosa",
      description: "Crispy South Indian crepe filled with spiced potato",
      price: 55,
      image: "/placeholder.svg?height=100&width=100",
      category: "South Indian",
      canteenId: "kl-adda",
      canteenName: "KL Adda",
      available: true,
      rating: 4.8,
      preparationTime: "10-15 min",
      ingredients: ["Rice", "Lentils", "Potato", "Spices"],
      nutritionInfo: { calories: 350, protein: 8, carbs: 65, fat: 12 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 102,
      name: "Idli",
      description: "Steamed rice cake, soft and fluffy",
      price: 30,
      image: "/placeholder.svg?height=100&width=100",
      category: "South Indian",
      canteenId: "kl-adda",
      canteenName: "KL Adda",
      available: true,
      rating: 4.5,
      preparationTime: "5-10 min",
      ingredients: ["Rice", "Lentils"],
      nutritionInfo: { calories: 150, protein: 4, carbs: 30, fat: 2 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    // Satish items
    {
      id: 201,
      name: "Chicken Rice",
      description: "Flavorful rice with chicken pieces",
      price: 90,
      image: "/placeholder.svg?height=100&width=100",
      category: "Chinese",
      canteenId: "satish",
      canteenName: "Satish",
      available: true,
      rating: 4.4,
      preparationTime: "15-20 min",
      ingredients: ["Rice", "Chicken", "Vegetables", "Soy Sauce"],
      nutritionInfo: { calories: 450, protein: 25, carbs: 55, fat: 15 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 202,
      name: "Chicken Noodles",
      description: "Stir-fried noodles with chicken and vegetables",
      price: 80,
      image: "/placeholder.svg?height=100&width=100",
      category: "Chinese",
      canteenId: "satish",
      canteenName: "Satish",
      available: true,
      rating: 4.5,
      preparationTime: "15-20 min",
      ingredients: ["Noodles", "Chicken", "Vegetables", "Sauces"],
      nutritionInfo: { calories: 400, protein: 20, carbs: 50, fat: 12 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]

  private mockCategories: Category[] = [
    {
      id: "1",
      name: "South Indian",
      description: "Traditional South Indian cuisine",
      image: "/placeholder.svg?height=80&width=80",
      slug: "south-indian",
    },
    {
      id: "2",
      name: "Chinese",
      description: "Chinese and Indo-Chinese dishes",
      image: "/placeholder.svg?height=80&width=80",
      slug: "chinese",
    },
    {
      id: "3",
      name: "Snacks",
      description: "Quick bites and snacks",
      image: "/placeholder.svg?height=80&width=80",
      slug: "snacks",
    },
    {
      id: "4",
      name: "Beverages",
      description: "Drinks and beverages",
      image: "/placeholder.svg?height=80&width=80",
      slug: "beverages",
    },
    {
      id: "5",
      name: "North Indian",
      description: "North Indian cuisine",
      image: "/placeholder.svg?height=80&width=80",
      slug: "north-indian",
    },
  ]

  // Check if API is available (disabled for now to avoid hitting non-existent endpoints)
  private async isApiAvailable(): Promise<boolean> {
    return false
  }

  // Get all canteens
  async getCanteens(): Promise<Canteen[]> {
    try {
      if (await this.isApiAvailable()) {
        const response = await apiClient.get<ApiResponse<Canteen[]>>(API_ENDPOINTS.CANTEENS)
        return response.data
      }
    } catch (error) {
      console.warn("API not available, using mock data:", handleApiError(error))
    }

    // Fallback to mock data
    return this.mockCanteens
  }

  // Get canteen by ID
  async getCanteenById(id: string): Promise<Canteen | null> {
    try {
      if (await this.isApiAvailable()) {
        const response = await apiClient.get<ApiResponse<Canteen>>(API_ENDPOINTS.CANTEEN_BY_ID(id))
        return response.data
      }
    } catch (error) {
      console.warn("API not available, using mock data:", handleApiError(error))
    }

    // Fallback to mock data
    return this.mockCanteens.find((canteen) => canteen.id === id) || null
  }

  // Get menu items for a canteen
  async getCanteenMenu(canteenId: string): Promise<MenuItem[]> {
    try {
      if (await this.isApiAvailable()) {
        const response = await apiClient.get<ApiResponse<MenuItem[]>>(API_ENDPOINTS.CANTEEN_MENU(canteenId))
        return response.data
      }
    } catch (error) {
      console.warn("API not available, using mock data:", handleApiError(error))
    }

    // Fallback to mock data
    return this.mockMenuItems.filter((item) => item.canteenId === canteenId)
  }

  // Get all menu items
  async getAllMenuItems(): Promise<MenuItem[]> {
    try {
      if (await this.isApiAvailable()) {
        const response = await apiClient.get<ApiResponse<MenuItem[]>>(API_ENDPOINTS.MENU_ITEMS)
        return response.data
      }
    } catch (error) {
      console.warn("API not available, using mock data:", handleApiError(error))
    }

    // Fallback to mock data
    return this.mockMenuItems
  }

  // Get menu items by category
  async getMenuItemsByCategory(category: string): Promise<MenuItem[]> {
    try {
      if (await this.isApiAvailable()) {
        const response = await apiClient.get<ApiResponse<MenuItem[]>>(
          `${API_ENDPOINTS.MENU_ITEMS}?category=${category}`,
        )
        return response.data
      }
    } catch (error) {
      console.warn("API not available, using mock data:", handleApiError(error))
    }

    // Fallback to mock data
    return this.mockMenuItems.filter((item) => item.category.toLowerCase() === category.toLowerCase())
  }

  // Search menu items
  async searchMenuItems(query: string): Promise<MenuItem[]> {
    try {
      if (await this.isApiAvailable()) {
        const response = await apiClient.get<ApiResponse<MenuItem[]>>(
          `${API_ENDPOINTS.MENU_ITEMS}?search=${encodeURIComponent(query)}`,
        )
        return response.data
      }
    } catch (error) {
      console.warn("API not available, using mock data:", handleApiError(error))
    }

    // Fallback to mock data with improved search
    const searchTerm = query.toLowerCase().trim()
    if (!searchTerm) return []

    return this.mockMenuItems
      .filter((item) => {
        const searchableText = [
          item.name,
          item.description,
          item.category,
          item.canteenName,
          ...(item.ingredients || []),
        ]
          .join(" ")
          .toLowerCase()

        // Check for exact matches first, then partial matches
        return (
          searchableText.includes(searchTerm) || searchTerm.split(" ").some((term) => searchableText.includes(term))
        )
      })
      .sort((a, b) => {
        // Sort by relevance - exact name matches first
        const aNameMatch = a.name.toLowerCase().includes(searchTerm)
        const bNameMatch = b.name.toLowerCase().includes(searchTerm)

        if (aNameMatch && !bNameMatch) return -1
        if (!aNameMatch && bNameMatch) return 1

        // Then by rating
        return (b.rating || 0) - (a.rating || 0)
      })
  }

  // Get all categories
  async getCategories(): Promise<Category[]> {
    try {
      if (await this.isApiAvailable()) {
        const response = await apiClient.get<ApiResponse<Category[]>>(API_ENDPOINTS.CATEGORIES)
        return response.data
      }
    } catch (error) {
      console.warn("API not available, using mock data:", handleApiError(error))
    }

    // Fallback to mock data
    return this.mockCategories
  }

  // Get popular items
  async getPopularItems(limit = 10): Promise<MenuItem[]> {
    try {
      if (await this.isApiAvailable()) {
        const response = await apiClient.get<ApiResponse<MenuItem[]>>(
          `${API_ENDPOINTS.MENU_ITEMS}?popular=true&limit=${limit}`,
        )
        return response.data
      }
    } catch (error) {
      console.warn("API not available, using mock data:", handleApiError(error))
    }

    // Fallback to mock data - sort by rating and return top items
    return this.mockMenuItems.sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, limit)
  }

  // Admin/Owner methods
  async createMenuItem(menuItem: Omit<MenuItem, "id" | "createdAt" | "updatedAt">): Promise<MenuItem> {
    try {
      if (await this.isApiAvailable()) {
        const response = await apiClient.post<ApiResponse<MenuItem>>(API_ENDPOINTS.MENU_ITEMS, menuItem)
        return response.data
      }
    } catch (error) {
      console.warn("API not available, using mock data:", handleApiError(error))
    }

    // Fallback to mock data
    const newItem: MenuItem = {
      ...menuItem,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    this.mockMenuItems.push(newItem)
    return newItem
  }

  async updateMenuItem(id: number, updates: Partial<MenuItem>): Promise<MenuItem> {
    try {
      if (await this.isApiAvailable()) {
        const response = await apiClient.put<ApiResponse<MenuItem>>(
          API_ENDPOINTS.MENU_ITEM_BY_ID(id.toString()),
          updates,
        )
        return response.data
      }
    } catch (error) {
      console.warn("API not available, using mock data:", handleApiError(error))
    }

    // Fallback to mock data
    const itemIndex = this.mockMenuItems.findIndex((item) => item.id === id)
    if (itemIndex === -1) {
      throw new Error("Menu item not found")
    }

    this.mockMenuItems[itemIndex] = {
      ...this.mockMenuItems[itemIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    return this.mockMenuItems[itemIndex]
  }

  async deleteMenuItem(id: number): Promise<void> {
    try {
      if (await this.isApiAvailable()) {
        await apiClient.delete(API_ENDPOINTS.MENU_ITEM_BY_ID(id.toString()))
        return
      }
    } catch (error) {
      console.warn("API not available, using mock data:", handleApiError(error))
    }

    // Fallback to mock data
    const itemIndex = this.mockMenuItems.findIndex((item) => item.id === id)
    if (itemIndex === -1) {
      throw new Error("Menu item not found")
    }

    this.mockMenuItems.splice(itemIndex, 1)
  }

  async updateCanteen(id: string, updates: Partial<Canteen>): Promise<Canteen> {
    try {
      if (await this.isApiAvailable()) {
        const response = await apiClient.put<ApiResponse<Canteen>>(API_ENDPOINTS.CANTEEN_BY_ID(id), updates)
        return response.data
      }
    } catch (error) {
      console.warn("API not available, using mock data:", handleApiError(error))
    }

    // Fallback to mock data
    const canteenIndex = this.mockCanteens.findIndex((canteen) => canteen.id === id)
    if (canteenIndex === -1) {
      throw new Error("Canteen not found")
    }

    this.mockCanteens[canteenIndex] = {
      ...this.mockCanteens[canteenIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    return this.mockCanteens[canteenIndex]
  }
}

export const canteenService = new CanteenService()
