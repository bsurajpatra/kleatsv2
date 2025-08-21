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
    // Show a quick progress animation
    const interval = setInterval(() => setProgress((p) => Math.min(100, p + 12)), 150)

    ;(async () => {
      const orderId = params.get("order_id") || params.get("cf_order_id") || params.get("orderId")
      if (!orderId) {
        clearInterval(interval)
        setProgress(100)
        toast({ title: "Missing order id", description: "Redirecting to your orders..." })
        router.replace("/orders")
        return
      }

      // Call backend verification endpoint
      // Always go through the Next.js proxy to hit the backend
      const verifyUrl = `/api/proxy/api/User/payment/cashfree/verify?order_id=${encodeURIComponent(orderId)}`
      // Debug: surface the URL being called in case of issues
      try { console.debug("[PaymentCallback] Verifying via:", verifyUrl) } catch {}
      let ok: boolean | undefined = undefined
      try {
        const res = await fetch(verifyUrl, {
          method: "GET",
          headers: token ? { Authorization: token } : undefined,
          cache: "no-store",
        })
        // Even if non-200, try to read payload for status
        try { console.debug("[PaymentCallback] Verify status:", res.status) } catch {}
        const data: any = await res.json().catch(() => ({}))
        const status = (data?.status || data?.order_status || "").toString().toUpperCase()
        ok = ["PAID", "SUCCESS", "COMPLETED", "CHARGED"].includes(status)
      } catch {
        // Network/parse failure — leave ok undefined, we will still redirect and let orders page reflect reality
      }

      // Best effort: refresh orders to reflect latest state
      await refreshOrders()

      // Wrap up UX
      await new Promise((r) => setTimeout(r, 600))
      setVerified(true)
      clearInterval(interval)
      setProgress(100)

      toast({
        title: ok === false ? "Payment not confirmed yet" : "Payment verified",
        description:
          ok === false
            ? "If you were charged, your order will update shortly."
            : "Redirecting to your orders to view the latest status...",
      })

      setTimeout(() => {
        router.replace("/orders")
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
