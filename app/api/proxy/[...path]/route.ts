export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function getBackendBase() {
  const base = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_URL
  if (!base) {
    throw new Error("API base URL not configured. Set API_BASE_URL (preferred) or NEXT_PUBLIC_API_URL on the server.")
  }
  return base.replace(/\/$/, "")
}

async function proxy(req: Request, ctx: { params: { path?: string[] } }) {
  const base = getBackendBase()
  const { method } = req
  const url = new URL(req.url)
  const path = ctx.params?.path?.join("/") || ""
  const targetUrl = `${base}/${path}${url.search}`

  // Clone headers but drop hop-by-hop/unsafe ones
  const upstreamHeaders = new Headers()
  req.headers.forEach((value, key) => {
    const k = key.toLowerCase()
    if (["host", "connection", "content-length", "accept-encoding"].includes(k)) return
    upstreamHeaders.set(key, value)
  })

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
  // Optionally strip hop-by-hop headers
  headers.delete("transfer-encoding")

  return new Response(resp.body, {
    status: resp.status,
    statusText: resp.statusText,
    headers,
  })
}

export { proxy as GET, proxy as POST, proxy as PUT, proxy as PATCH, proxy as DELETE, proxy as OPTIONS }
