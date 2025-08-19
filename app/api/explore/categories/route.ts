import { NextResponse } from "next/server"

// Minimal mock for categories to satisfy frontend fetches
// Shape expected by pages: { code, message, data: { name, poster? }[] }
export async function GET() {
  const data = [
    { name: "South Indian", poster: "/placeholder.svg" },
    { name: "Chinese", poster: "/placeholder.svg" },
    { name: "Snacks", poster: "/placeholder.svg" },
    { name: "Beverages", poster: "/placeholder.svg" },
    { name: "North Indian", poster: "/placeholder.svg" },
  ]

  return NextResponse.json({ code: 1, message: "ok", data })
}
