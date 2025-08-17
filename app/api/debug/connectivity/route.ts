export const runtime = "nodejs"
export const dynamic = "force-dynamic"

import http from "http"
import https from "https"
import dns from "dns"

export async function GET(req: Request) {
  // This endpoint tests connectivity to the backend
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://188.245.112.188:3000"
  const results: Record<string, any> = {
    timestamp: new Date().toISOString(),
    tests: {},
  }

  // 1. Test DNS resolution
  try {
    results.tests.dns = await new Promise<Record<string, any>>((resolve) => {
      dns.lookup(
        new URL(apiUrl).hostname,
        { family: 4 },
        (err, address, family) => {
          if (err) {
            resolve({ success: false, error: err.message })
          } else {
            resolve({ success: true, address, family })
          }
        }
      )
    })
  } catch (e: any) {
    results.tests.dns = { success: false, error: e.message }
  }

  // 2. Test TCP connection to port
  const url = new URL(apiUrl)
  const port = url.port ? parseInt(url.port) : url.protocol === "https:" ? 443 : 80
  
  try {
    results.tests.tcp = await new Promise<Record<string, any>>((resolve) => {
      const socket = new (require('net')).Socket()
      let connectionSuccessful = false
      
      socket.setTimeout(5000)
      
      socket.on('connect', () => {
        connectionSuccessful = true
        socket.end()
        resolve({ success: true, port, host: url.hostname })
      })
      
      socket.on('timeout', () => {
        socket.destroy()
        resolve({ success: false, error: 'Connection timeout' })
      })
      
      socket.on('error', (err: any) => {
        if (!connectionSuccessful) {
          resolve({ success: false, error: err.message })
        }
      })
      
      socket.connect(port, url.hostname)
    })
  } catch (e: any) {
    results.tests.tcp = { success: false, error: e.message }
  }
  
  // 3. Attempt a simple HTTP HEAD request
  try {
    results.tests.http = await new Promise<Record<string, any>>((resolve) => {
      const isHttps = url.protocol === "https:"
      const lib = isHttps ? https : http
      
      const req = lib.request(
        {
          hostname: url.hostname,
          port,
          path: "/",
          method: "HEAD",
          timeout: 5000,
        },
        (res) => {
          resolve({
            success: true,
            statusCode: res.statusCode,
            headers: res.headers,
          })
          res.resume()
        }
      )
      
      req.on("error", (err) => {
        resolve({ success: false, error: err.message })
      })
      
      req.on("timeout", () => {
        req.destroy(new Error("Request timeout"))
        resolve({ success: false, error: "Request timeout" })
      })
      
      req.end()
    })
  } catch (e: any) {
    results.tests.http = { success: false, error: e.message }
  }
  
  // Add overall configuration information
  results.configuration = {
    apiUrl,
    parsed: {
      host: url.host,
      hostname: url.hostname,
      port,
      protocol: url.protocol,
      pathname: url.pathname,
    },
  }
  
  return new Response(JSON.stringify(results, null, 2), {
    headers: { "Content-Type": "application/json" },
  })
}
