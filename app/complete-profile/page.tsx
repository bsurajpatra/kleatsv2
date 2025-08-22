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
          const returnTo = searchParams?.get("returnTo") || "/"
          router.push(returnTo)
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
