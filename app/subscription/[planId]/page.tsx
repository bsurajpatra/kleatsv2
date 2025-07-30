"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Check, CreditCard, Wallet } from "lucide-react"
import Link from "next/link"
import { useSubscription } from "@/hooks/use-subscription"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { motion } from "framer-motion"

export default function SubscriptionPage() {
  const router = useRouter()
  const params = useParams()
  const { planId } = params
  const { plans, subscribe } = useSubscription()
  const { isAuthenticated } = useAuth()
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isSuccess, setIsSuccess] = useState(false)

  // Find the selected plan
  const selectedPlan = plans.find((plan) => plan.id === planId)

  // Redirect if not authenticated or plan not found
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
    if (!selectedPlan) {
      router.push("/account")
    }
  }, [isAuthenticated, selectedPlan, router])

  const handleSubscribe = async () => {
    setIsProcessing(true)

    // Simulate payment processing with progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 5
      })
    }, 100)

    // Simulate subscription completion
    setTimeout(async () => {
      clearInterval(interval)
      setProgress(100)

      if (selectedPlan) {
        await subscribe(selectedPlan.id)
        setIsSuccess(true)

        // Redirect after success
        setTimeout(() => {
          router.push("/account?tab=subscription")
        }, 2000)
      }
    }, 3000)
  }

  if (!selectedPlan) {
    return null
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <motion.div
          className="payment-success w-full max-w-md text-center"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Check className="mx-auto mb-4 h-16 w-16 text-primary" />
          <h1 className="mb-2 text-2xl font-bold">Subscription Successful!</h1>
          <p className="mb-6 text-muted-foreground">
            You have successfully subscribed to the {selectedPlan.name}. Enjoy your benefits!
          </p>
          <Link href="/account?tab=subscription">
            <Button className="w-full">View Subscription</Button>
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-16 page-transition">
      <div className="sticky top-0 z-10 flex items-center bg-background p-4 shadow-sm">
        <Link href="/account?tab=subscription" className="mr-2">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-bold">Subscribe to {selectedPlan.name}</h1>
      </div>

      <div className="container px-4 py-6">
        {isProcessing ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Card className="mb-6">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="mb-6 w-full max-w-xs">
                  <Progress value={progress} className="h-2" />
                </div>
                <div className={`${progress === 100 ? "spin" : ""} mb-4 rounded-full bg-primary/10 p-4`}>
                  <CreditCard className="h-8 w-8 text-primary" />
                </div>
                <h2 className="mb-2 text-xl font-semibold">Processing Payment</h2>
                <p className="text-center text-muted-foreground">Please wait while we process your subscription...</p>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>{selectedPlan.name}</CardTitle>
                  <CardDescription>{selectedPlan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium">Benefits:</h3>
                      <ul className="mt-2 space-y-2">
                        {selectedPlan.features.map((feature, index) => (
                          <li key={index} className="flex items-center">
                            <Check className="mr-2 h-4 w-4 text-primary" />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Duration</span>
                      <span>{selectedPlan.duration}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Price</span>
                      <span className="text-xl font-bold">₹{selectedPlan.price}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    <div className="flex items-center space-x-2 rounded-md border p-3">
                      <RadioGroupItem value="card" id="card" />
                      <Label htmlFor="card" className="flex flex-1 items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Credit/Debit Card
                      </Label>
                    </div>
                    <div className="mt-2 flex items-center space-x-2 rounded-md border p-3">
                      <RadioGroupItem value="upi" id="upi" />
                      <Label htmlFor="upi" className="flex flex-1 items-center gap-2">
                        <Wallet className="h-4 w-4" />
                        UPI
                      </Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span>{selectedPlan.name}</span>
                      <span>₹{selectedPlan.price}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Tax</span>
                      <span>₹{Math.round(selectedPlan.price * 0.18)}</span>
                    </div>
                    <div className="border-t pt-2 flex items-center justify-between font-medium">
                      <span>Total</span>
                      <span>₹{selectedPlan.price + Math.round(selectedPlan.price * 0.18)}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <motion.div className="w-full" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button className="w-full" onClick={handleSubscribe}>
                      Subscribe Now
                    </Button>
                  </motion.div>
                </CardFooter>
              </Card>
            </motion.div>
          </>
        )}
      </div>
    </div>
  )
}
