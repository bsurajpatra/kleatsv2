import { NextResponse } from "next/server"

// Minimal mock for canteens to satisfy frontend fetches
// Shape expected by pages: { code, message, data: ApiCanteen[] }
export async function GET() {
  const data = [
    {
      canteenId: 1,
      CanteenName: "KL Adda",
      Location: "Main Campus, Ground Floor",
      fromTime: "08:00",
      ToTime: "20:00",
      accessTo: "students",
      poster: "/placeholder.jpg",
    },
    {
      canteenId: 2,
      CanteenName: "Satish",
      Location: "Engineering Block, First Floor",
      fromTime: "09:00",
      ToTime: "21:00",
      accessTo: "all",
      poster: "/placeholder.jpg",
    },
    {
      canteenId: 3,
      CanteenName: "Naturals",
      Location: "Student Center",
      fromTime: "10:00",
      ToTime: "22:00",
      accessTo: "all",
      poster: "/placeholder.jpg",
    },
  ]

  return NextResponse.json({ code: 1, message: "ok", data })
}
