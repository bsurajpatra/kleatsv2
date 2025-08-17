export const runtime = "nodejs"
export const dynamic = "force-dynamic"

import http from "http"
import https from "https"

export async function POST(req: Request) {
  try {
    // Extract the Authorization header
    const authToken = req.headers.get("Authorization")
    
    if (!authToken) {
      return new Response(JSON.stringify({ error: "Missing Authorization header" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Get API base URL
    const base = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://188.245.112.188:3000"
    const baseTrimmed = base.replace(/\/$/, "")
    console.log(`Using API base URL: ${baseTrimmed}`)

    // Create target URL
    const targetPath = "/api/User/auth/check-phone-status"
    const targetUrl = new URL(`${baseTrimmed}${targetPath}`)
    const isHttps = targetUrl.protocol === "https:"
    
    console.log(`Forwarding POST request to: ${targetUrl.toString()}`)
    
    // Create a promise-based HTTP request
    const result = await new Promise<{
      status: number;
      headers: Record<string, string | string[] | undefined>;
      body: string;
    }>((resolve, reject) => {
      // Create empty body string for POST request
      const bodyStr = JSON.stringify({})
      
      const requestOptions = {
        protocol: targetUrl.protocol,
        hostname: targetUrl.hostname,
        port: targetUrl.port ? Number(targetUrl.port) : isHttps ? 443 : 80,
        path: targetUrl.pathname + targetUrl.search,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(bodyStr),
          "Accept": "application/json",
          "Authorization": authToken,
          "Connection": "close", 
          "User-Agent": "PostmanRuntime/7.32.3",
        },
      }

      // Send the request
      const library = isHttps ? https : http
      const request = library.request(requestOptions, (response) => {
        console.log(`Backend responded with status: ${response.statusCode}`)
        
        let responseData = ""
        response.setEncoding("utf8")
        
        response.on("data", (chunk) => {
          responseData += chunk
        })
        
        response.on("end", () => {
          console.log("Response fully received from backend")
          resolve({
            status: response.statusCode || 502,
            headers: response.headers,
            body: responseData,
          })
        })
      })
      
      // Handle errors
      request.on("error", (error) => {
        console.error(`Request error: ${error.message}`)
        reject(error)
      })
      
      // Set a reasonable timeout
      request.setTimeout(15000, () => {
        console.error(`Request timeout after 15 seconds`)
        request.destroy(new Error("Request timeout"))
      })
      
      // Send the empty body
      console.log("Sending POST request to backend")
      request.write(bodyStr)
      request.end()
    })

    // Return actual response or mock one if unavailable
    if (result.status === 200) {
      return new Response(result.body, {
        status: result.status,
        headers: {
          "Content-Type": (result.headers["content-type"] as string) || "application/json",
        },
      })
    }
    // For development/demo: if the backend is unavailable, return a mock response
    else if (result.status >= 500) {
      console.log("Backend error or unavailable, returning mock response")
      
      // Mock response indicating the user needs to verify their phone
      const mockResponse = {
        success: true,
        data: {
          isPhoneZero: true,
          message: "Phone verification required"
        }
      }
      
      return new Response(JSON.stringify(mockResponse), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "X-Generated": "mock-response",
        },
      })
    }
    // Otherwise return the original response
    else {
      return new Response(result.body, {
        status: result.status,
        headers: {
          "Content-Type": (result.headers["content-type"] as string) || "application/json",
        },
      })
    }
  } catch (error: any) {
    console.error("Error in phone status check:", error)
    // Return a mock response for demo purposes
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          isPhoneZero: true,
          message: "Phone verification required (mock response)"
        }
      }),
      { 
        status: 200, 
        headers: { 
          "Content-Type": "application/json",
          "X-Generated": "error-fallback-mock" 
        } 
      }
    )
  }
}
