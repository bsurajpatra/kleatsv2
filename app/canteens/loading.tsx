export default function Loading() {
  return (
    <main className="min-h-screen pb-24">
      <div className="sticky top-0 z-10 bg-background p-4 shadow-sm">
        <div className="h-6 w-32 animate-pulse rounded bg-muted" />
      </div>
      <div className="container px-4 py-6">
        <div className="mb-6">
          <div className="h-10 w-full animate-pulse rounded bg-muted" />
        </div>
        <div className="grid gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-lg border">
              <div className="h-40 w-full animate-pulse bg-muted" />
              <div className="p-4">
                <div className="mb-2 h-5 w-40 animate-pulse rounded bg-muted" />
                <div className="h-4 w-64 animate-pulse rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
