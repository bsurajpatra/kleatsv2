"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function BackendTestPage() {
  const [testResult, setTestResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [testCode, setTestCode] = useState("")
  const [mockMode, setMockMode] = useState(false)

  const runConnectivityTest = useCallback(async () => {
    setLoading(true)
    setTestResult(null)
    
    try {
      const res = await fetch("/api/debug/connectivity")
      const data = await res.json()
      setTestResult(JSON.stringify(data, null, 2))
    } catch (err: any) {
      setTestResult(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }, [])
  
  const testOAuthEndpoint = useCallback(async () => {
    if (!testCode) {
      setTestResult("Please enter a test OAuth code")
      return
    }
    
    setLoading(true)
    setTestResult(null)
    
    try {
      // First try the proxy with timeout handling
      setTestResult("Testing through proxy route (with enhanced timeout handling)...")
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30s timeout
      
      try {
        const proxyRes = await fetch("/api/user/auth/login-oauth", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(mockMode ? { "X-Mock-Mode": "true" } : {})
          },
          body: JSON.stringify({ code: testCode }),
          signal: controller.signal
        })
        
        clearTimeout(timeoutId)
        
        const responseHeaders = Object.fromEntries(proxyRes.headers.entries())
        const proxyText = await proxyRes.text()
        
        setTestResult(prev => `${prev}\n\nProxy result (${proxyRes.status}):\nHeaders: ${JSON.stringify(responseHeaders, null, 2)}\n\nBody:\n${proxyText}`)
        
        // Check for mock response
        if (responseHeaders['x-generated'] === 'mock-timeout-fallback') {
          setTestResult(prev => `${prev}\n\n⚠️ NOTICE: This is a mock response generated due to backend timeout`)
        }
      } catch (proxyErr: any) {
        clearTimeout(timeoutId)
        setTestResult(prev => `${prev}\n\nProxy request failed: ${proxyErr.message}`)
      }
      
      // Then try direct backend if we have the URL
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      if (apiUrl) {
        setTestResult(prev => `${prev}\n\nTrying direct API call to ${apiUrl}...`)
        
        try {
          // Use a separate controller and timeout
          const directController = new AbortController()
          const directTimeoutId = setTimeout(() => directController.abort(), 20000) // 20s timeout
          
          const directRes = await fetch(`${apiUrl}/api/user/auth/login-oauth`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "User-Agent": "PostmanRuntime/7.32.3", // Mimic Postman
            },
            body: JSON.stringify({ code: testCode }),
            mode: "cors",
            signal: directController.signal
          })
          
          clearTimeout(directTimeoutId)
          
          const directText = await directRes.text()
          setTestResult(prev => `${prev}\n\nDirect result (${directRes.status}):\n${directText}`)
        } catch (directErr: any) {
          setTestResult(prev => `${prev}\n\nDirect API call failed: ${directErr.message}`)
        }
      }
    } catch (err: any) {
      setTestResult(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }, [testCode])

  return (
    <div className="container flex min-h-screen flex-col items-center justify-center px-4 py-8">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Backend Connectivity Test</CardTitle>
          <CardDescription>Test connectivity to the backend server</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={runConnectivityTest} disabled={loading}>
            {loading ? "Testing..." : "Run Connectivity Test"}
          </Button>
          
          <div className="space-y-4 mt-8">
            <div className="flex items-center gap-2 mb-2">
              <Label htmlFor="test-code">Test OAuth Code</Label>
              <div className="flex items-center ml-auto">
                <Label htmlFor="mock-mode" className="text-xs mr-2">Use Mock Mode</Label>
                <input 
                  type="checkbox" 
                  id="mock-mode" 
                  checked={mockMode} 
                  onChange={() => setMockMode(!mockMode)} 
                />
              </div>
            </div>
            <Input 
              id="test-code"
              value={testCode} 
              onChange={e => setTestCode(e.target.value)} 
              placeholder="Enter a test OAuth code" 
            />
            <Button onClick={testOAuthEndpoint} disabled={loading}>
              Test OAuth Endpoint
            </Button>
            {mockMode && (
              <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700 mt-2">
                Mock mode: Will simulate a successful login even if backend times out
              </div>
            )}
          </div>
          
          {testResult && (
            <div className="mt-4 p-4 bg-muted rounded-md">
              <pre className="text-xs overflow-auto whitespace-pre-wrap">{testResult}</pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
