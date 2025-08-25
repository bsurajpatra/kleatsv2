export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function getBackendBase() {
  const base = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_URL
  if (!base) {
    throw new Error(
      "API base URL not configured. Set API_BASE_URL (preferred) or NEXT_PUBLIC_API_URL on the server."
    )
  }
  return base.replace(/\/$/, "")
}

export async function POST(req: Request) {
  const base = getBackendBase()
  const url = new URL(req.url)

  // Forward to /cashfree/webhook on the backend, preserving query string
  const targetUrl = `${base}/cashfree/webhook${url.search}`

  // Clone headers but drop hop-by-hop or unsafe ones; preserve signatures and content-type
  const upstreamHeaders = new Headers()
  req.headers.forEach((value, key) => {
    const k = key.toLowerCase()
    if (["host", "connection", "content-length", "accept-encoding"].includes(k)) return
    upstreamHeaders.set(key, value)
  })
  // Ensure backend responds uncompressed to avoid decoding issues over proxy
  upstreamHeaders.set("accept-encoding", "identity")

  // Read raw bytes; do not parse/modify
  let body: ArrayBuffer | undefined = undefined
  try {
    body = await req.arrayBuffer()
  } catch {}

  const resp = await fetch(targetUrl, {
    method: "POST",
    headers: upstreamHeaders,
    body: body as any,
    redirect: "manual",
  })

  // Pass-through response, normalize headers that can conflict
  const headers = new Headers(resp.headers)
  headers.delete("transfer-encoding")
  headers.delete("content-encoding")
  headers.delete("content-length")

  return new Response(resp.body, {
    status: resp.status,
    statusText: resp.statusText,
    headers,
  })
}
