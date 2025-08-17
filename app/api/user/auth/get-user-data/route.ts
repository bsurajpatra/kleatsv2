export const runtime = "nodejs"
export const dynamic = "force-dynamic"

import http from "http"
import https from "https"

export async function POST(req: Request) {
  try {
    const authToken = req.headers.get("Authorization")
    if (!authToken) {
      return new Response(JSON.stringify({ error: "Missing Authorization header" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }

    const base = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://188.245.112.188:3000"
    const baseTrimmed = base.replace(/\/$/, "")
    const targetPath = "/api/User/auth/get-user-data"
    const targetUrl = new URL(`${baseTrimmed}${targetPath}`)
    const isHttps = targetUrl.protocol === "https:"

    const result = await new Promise<{
      status: number
      headers: Record<string, string | string[] | undefined>
      body: string
    }>((resolve, reject) => {
      const requestOptions = {
        protocol: targetUrl.protocol,
        hostname: targetUrl.hostname,
        port: targetUrl.port ? Number(targetUrl.port) : isHttps ? 443 : 80,
        path: targetUrl.pathname + targetUrl.search,
        method: "POST",
        headers: {
          Authorization: authToken,
          Accept: "application/json",
          "Content-Length": 0,
          "User-Agent": "PostmanRuntime/7.32.3",
          Connection: "close",
        },
      }

      const lib = isHttps ? https : http
      const request = lib.request(requestOptions, (response) => {
        let responseData = ""
        response.setEncoding("utf8")
        response.on("data", (chunk) => (responseData += chunk))
        response.on("end", () =>
          resolve({ status: response.statusCode || 502, headers: response.headers, body: responseData })
        )
      })
      request.on("error", (err) => reject(err))
      request.setTimeout(15000, () => {
        request.destroy(new Error("Request timeout"))
      })
      request.end()
    })

    return new Response(result.body, {
      status: result.status,
      headers: { "Content-Type": (result.headers["content-type"] as string) || "application/json" },
    })
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: "Proxy error", message: error?.message || "Unknown error" }),
      { status: 502, headers: { "Content-Type": "application/json" } }
    )
  }
}
