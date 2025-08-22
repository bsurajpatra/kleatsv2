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

async function forward(req: Request) {
  const base = getBackendBase()
  const { method } = req
  const url = new URL(req.url)

  // Always forward to /telegram on the backend, preserving query string
  const targetUrl = `${base}/telegram${url.search}`

  // Clone headers but drop hop-by-hop/unsafe ones
  const upstreamHeaders = new Headers()
  req.headers.forEach((value, key) => {
    const k = key.toLowerCase()
    if (["host", "connection", "content-length", "accept-encoding"].includes(k)) return
    upstreamHeaders.set(key, value)
  })
  // Ensure backend responds uncompressed to avoid decoding issues over proxy
  upstreamHeaders.set("accept-encoding", "identity")

  // Read body for non-GET/HEAD to avoid Node fetch duplex requirement
  let body: ArrayBuffer | undefined = undefined
  if (!["GET", "HEAD"].includes(method.toUpperCase())) {
    try {
      body = await req.arrayBuffer()
    } catch {}
  }

  const resp = await fetch(targetUrl, {
    method,
    headers: upstreamHeaders,
    body: body as any,
    redirect: "manual",
  })

  // Pass-through response
  const headers = new Headers(resp.headers)
  // Strip hop-by-hop or mismatched encoding/length headers since body is already decoded by fetch
  headers.delete("transfer-encoding")
  headers.delete("content-encoding")
  headers.delete("content-length")

  return new Response(resp.body, {
    status: resp.status,
    statusText: resp.statusText,
    headers,
  })
}

export { forward as GET, forward as POST, forward as PUT, forward as PATCH, forward as DELETE, forward as OPTIONS }
