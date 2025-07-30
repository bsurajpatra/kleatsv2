import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import Link from "next/link"

const canteens = [
  {
    id: 1,
    name: "KL Adda",
    image: "/placeholder.svg?height=200&width=300",
    rating: 4.5,
    deliveryTime: "10-15 min",
    slug: "kl-adda",
  },
  {
    id: 2,
    name: "Satish",
    image: "/placeholder.svg?height=200&width=300",
    rating: 4.2,
    deliveryTime: "15-20 min",
    slug: "satish",
  },
  {
    id: 3,
    name: "Naturals",
    image: "/placeholder.svg?height=200&width=300",
    rating: 4.7,
    deliveryTime: "5-10 min",
    slug: "naturals",
  },
]

export default function CanteenList() {
  return (
    <div className="grid gap-4">
      {canteens.map((canteen) => (
        <Link href={`/canteen/${canteen.slug}`} key={canteen.id}>
          <Card className="card-hover overflow-hidden">
            <CardContent className="p-0">
              <div className="relative h-40">
                <Image src={canteen.image || "/placeholder.svg"} alt={canteen.name} fill className="object-cover" />
                <Badge className="absolute right-2 top-2 bg-primary">★ {canteen.rating}</Badge>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold">{canteen.name}</h3>
                <p className="text-sm text-muted-foreground">Delivery: {canteen.deliveryTime}</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
