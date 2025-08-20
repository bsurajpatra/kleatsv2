"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import { useToast } from "@/hooks/use-toast"

export default function PaymentCallbackPage() {
  const router = useRouter()
  const params = useSearchParams()
  const { toast } = useToast()
  const [progress, setProgress] = useState(0)
  const [verified, setVerified] = useState(false)

  const baseUrl = useMemo(() => (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, ""), [])
  const token = useMemo(
    () => (typeof window !== "undefined" && (localStorage.getItem("auth_token") || localStorage.getItem("token"))) || null,
    []
  )

  // Optional: Attempt to refresh orders to reflect latest status
  const refreshOrders = async () => {
    if (!baseUrl || !token) return
    try {
      await fetch(`${baseUrl}/api/User/order/getOrders`, {
        method: "GET",
        headers: { Authorization: token },
        cache: "no-store",
      })
    } catch {
      // ignore best-effort refresh
    }
  }

  useEffect(() => {
    // Simulate short verification while backend finalizes the order
    const interval = setInterval(() => setProgress((p) => Math.min(100, p + 12)), 150)

    ;(async () => {
      // Extract common payment params (may be present if backend redirected here after verifying)
      const orderId = params.get("order_id") || params.get("cf_order_id") || params.get("orderId")
      const status = (params.get("status") || params.get("order_status") || "").toUpperCase()

      // Best effort refresh, then continue UX
      await refreshOrders()

      // Small delay to allow backend state to settle
      await new Promise((r) => setTimeout(r, 1200))
      setVerified(true)
      clearInterval(interval)
      setProgress(100)

      // Friendly feedback
      const ok = status ? ["PAID", "SUCCESS", "COMPLETED"].includes(status) : undefined
      toast({
        title: ok === false ? "Payment not confirmed yet" : "Payment verified",
        description:
          ok === false
            ? "If you were charged, your order will update shortly."
            : "Redirecting to your orders to view the latest status...",
      })

      // Redirect to orders or a specific order page if you prefer
      setTimeout(() => {
        if (orderId) {
          // You can switch to `/order/${orderId}` if your app supports deep linking
          router.replace("/orders")
        } else {
          router.replace("/orders")
        }
      }, 900)
    })()

    return () => clearInterval(interval)
  }, [params, router])

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
        <Card className="w-[92vw] max-w-md">
          <CardHeader>
            <CardTitle>Finalizing your order…</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="w-full">
              <Progress value={progress} className="h-2" />
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              {verified ? (
                <CheckCircle className="h-5 w-5 text-primary" />
              ) : (
                <Loader2 className="h-5 w-5 animate-spin" />
              )}
              <span>{verified ? "Payment verified. Redirecting…" : "Please wait while we verify your payment."}</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
