"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import PhoneVerificationForm from "@/components/phone-verification-form"
import { useToast } from "@/hooks/use-toast"
import LoadingScreen from "@/components/loading-screen"

export default function PhoneVerificationPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [needsVerification, setNeedsVerification] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "")

  // Helpers to resume an in-flight add-to-cart from sessionStorage and go straight to the canteen
  const getToken = () =>
    (typeof window !== "undefined" && (localStorage.getItem("auth_token") || localStorage.getItem("token"))) || null

  const addBackendToCart = async (itemId: number, quantity = 1) => {
    const token = getToken()
    if (!token) throw new Error("Not authenticated")
    const url = `${baseUrl}/api/user/cart/addToCart?id=${encodeURIComponent(String(itemId))}&quantity=${encodeURIComponent(String(quantity))}`
    const res = await fetch(url, { method: "GET", headers: { Authorization: token }, cache: "no-store" })
    if (!res.ok) throw new Error(await res.text().catch(() => `HTTP ${res.status}`))
  }

  const processPendingAdd = async (): Promise<boolean> => {
    try {
      const raw = sessionStorage.getItem("pendingAddToCart")
      if (!raw) return false
      const pending = JSON.parse(raw)
      if (!pending?.itemId || !pending?.canteenId) return false
      const token = getToken()
      if (!token) return false
      await addBackendToCart(Number(pending.itemId), 1)
      sessionStorage.removeItem("pendingAddToCart")
      router.push(`/canteen/${pending.canteenId}`)
      return true
    } catch (e) {
      console.error("complete-profile: processPendingAdd failed", e)
      return false
    }
  }

  useEffect(() => {
    const checkPhoneStatus = async () => {
      try {
        // Get token from localStorage
  const token = localStorage.getItem("auth_token") || localStorage.getItem("token")
        
        if (!token) {
          // Not logged in, redirect to login
          console.log("No auth token found, redirecting to login")
          toast({
            title: "Authentication Required",
            description: "Please log in to continue.",
          })
          router.push("/login")
          return
        }
        
        console.log("Checking phone verification status...")
        
  // Call backend via proxy to check phone status (mirror Postman exactly)
  const response = await fetch(`/api/proxy/api/User/auth/check-phone-status`, {
          method: "POST",
          // Backend expects raw token in Authorization header (no Bearer prefix)
          headers: {
            Authorization: token,
          },
          // Send an empty body like the cURL example
          body: "",
        })
        
        if (!response.ok) {
          const errorText = await response.text().catch(() => "Unknown error")
          console.error(`Phone status check failed (${response.status}): ${errorText}`)
          throw new Error(`Failed to check phone status: ${response.status}`)
        }
        
        const data = await response.json().catch(() => ({} as any))
        console.log("Phone status response:", data)
        const code = typeof data?.code === "number" ? data.code : 0
        const isPhoneZero = Boolean(data?.data?.isPhoneZero)
        
        // If isPhoneZero is true, user needs to verify phone
        if (code === 1 && isPhoneZero) {
          console.log("Phone verification needed")
          setNeedsVerification(true)
        } else if (code === 1) {
          // Phone already verified, redirect to home
          console.log("Phone already verified, redirecting to home")
          toast({
            title: "Welcome back!",
            description: "Your account is already set up.",
          })
          // If user initiated an add-to-cart before login, finish it and go straight to the canteen
          const handled = await processPendingAdd()
          if (!handled) {
            const returnTo = searchParams?.get("returnTo") || "/"
            router.push(returnTo)
          }
        } else {
          throw new Error("Unexpected response from phone status check")
        }
      } catch (error: any) {
        console.error("Error checking phone status:", error)
        toast({
          title: "Error",
          description: error.message || "Something went wrong. Please try again.",
          variant: "destructive",
        })
        
        // For development purposes, still show the phone verification form
        // This allows testing the form even if the backend is unavailable
        if (process.env.NODE_ENV === "development") {
          console.log("DEV MODE: Showing verification form despite error")
          setNeedsVerification(true)
        } else {
          router.push("/login")
        }
      } finally {
        setIsLoading(false)
      }
    }
    
    checkPhoneStatus()
  }, [router, toast, searchParams])

  if (isLoading) {
    return <LoadingScreen />
  }

  if (needsVerification) {
    return <PhoneVerificationForm />
  }

  return null
}
