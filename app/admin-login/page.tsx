"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Shield } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"

export default function AdminLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const success = await login(email, password)
      if (success) {
        router.push("/admin-dashboard")
      } else {
        setError("Invalid admin credentials")
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container flex min-h-screen flex-col items-center justify-center px-4 py-8">
      <Link href="/" className="absolute left-4 top-4 flex items-center text-sm text-muted-foreground">
        <ArrowLeft className="mr-1 h-4 w-4" />
        Back
      </Link>

      <div className="mx-auto w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <Shield className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-primary">KL-Eats</h1>
          <p className="text-muted-foreground">Administrator Portal</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Admin Login</CardTitle>
            <CardDescription>
              Enter your administrator credentials to access the system management panel
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="space-y-2">
                <Label htmlFor="admin-email">Email</Label>
                <Input
                  id="admin-email"
                  type="email"
                  placeholder="Enter your admin email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="rounded-lg bg-red-50 p-3">
                <p className="text-xs text-red-700">
                  <strong>Demo Credentials:</strong>
                  <br />
                  Email: admin@gmail.com
                  <br />
                  Password: admin
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
              <p className="mt-4 text-center text-sm text-muted-foreground">Authorized personnel only</p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
