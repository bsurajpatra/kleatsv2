import { Card, CardContent } from "@/components/ui/card"

export default function SearchLoading() {
  return (
    <main className="min-h-screen pb-24">
      <div className="sticky top-0 z-10 bg-background p-4 shadow-sm">
        <div className="flex items-center space-x-2">
          <div className="flex-1 h-10 bg-muted rounded animate-pulse"></div>
          <div className="h-10 w-10 bg-muted rounded animate-pulse"></div>
        </div>
      </div>

      <div className="container px-4 py-6">
        <div className="mb-6">
          <div className="h-4 bg-muted rounded w-48 animate-pulse"></div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-32 bg-muted rounded mb-4"></div>
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  )
}
