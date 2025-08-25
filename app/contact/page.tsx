import { Mail, MapPin, Headphones, Users } from "lucide-react"
import Footer from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"

export const metadata = {
  title: "Contact Us – KL-Eats",
  description: "Get support, share feedback, or learn how to contribute to KL-Eats.",
}

export default function ContactUs() {
  return (
    <main className="min-h-screen page-transition">
      {/* Sticky Header aligned with app */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container px-4 py-4 md:py-6">
          {/* Mobile Layout - Stacked */}
          <div className="md:hidden space-y-3">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline transition-colors whitespace-nowrap"
            >
              ← Back to Home
            </Link>
            <div className="flex items-center justify-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-semibold leading-tight">Contact Us</h1>
                <p className="text-xs text-muted-foreground">Support & Feedback Center</p>
              </div>
            </div>
          </div>
          
          {/* Desktop Layout - Side by side */}
          <div className="hidden md:flex items-center">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline transition-colors whitespace-nowrap px-3 py-2 cursor-pointer"
            >
              ← Back to Home
            </Link>
            <div className="flex-1 flex items-center justify-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-semibold leading-tight">Contact Us</h1>
                <p className="text-xs text-muted-foreground">Support & Feedback Center</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hero-like intro */}
      <section className="relative overflow-hidden">
        <div className="hero-bg" />
        <div className="container px-4 py-8 md:py-12">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Need help? We’re here 24/7</h2>
            <p className="mt-2 text-sm md:text-base text-muted-foreground">
              Reach out for queries, platform issues, or to become a contributor at KL-Eats — your campus food companion.
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="container px-4 pb-10">
        <div className="mx-auto max-w-3xl space-y-6">
          {/* Why contact us */}
          <Card className="bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/40">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <Headphones className="h-5 w-5 text-primary" />
                <h3 className="text-base font-semibold">Why contact us?</h3>
              </div>
              <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                <li>Fast response to all user queries</li>
                <li>Direct support from KL GLUG members at Room C424</li>
                <li>24/7 technical support for platform issues</li>
                <li>Want to contribute? We’ll guide you</li>
                <li>Suggestions welcome to improve your experience</li>
                <li>Live updates on menus and service</li>
                <li>Issues with food, service, or payments — we’ve got you</li>
              </ul>
            </CardContent>
          </Card>

          {/* Join us */}
          <Card className="bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/40">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-5 w-5 text-primary" />
                <h3 className="text-base font-semibold">Join us or contribute</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                To become a member or contribute to KL-Eats, fill this
                {" "}
                <a
                  href="https://docs.google.com/forms/d/e/1FAIpQLSdb0kCwHtGsy3gtJtGeVuylQ-yeCJdR9kjb5HgcHJc9ADyagQ/viewform"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline underline-offset-4"
                >
                  recruitment form
                </a>
                {" "}or visit Room C424.
              </p>
            </CardContent>
          </Card>

          {/* Contact info */}
          <Card className="bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/40">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <Mail className="h-5 w-5 text-primary" />
                <h3 className="text-base font-semibold">Still have questions?</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Drop your queries anytime, and we’ll ensure you get the best support possible. Your experience matters to us.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="rounded-lg border p-4">
                  <p className="text-xs uppercase text-muted-foreground mb-1">Email</p>
                  <a href="mailto:support@kleats.in" className="text-sm text-foreground hover:text-primary">
                    admin@kleats.in
                  </a>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-xs uppercase text-muted-foreground mb-1">Location</p>
                  <p className="text-sm text-foreground flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-0.5 text-primary" />
                    KL University, GLUG Room C424, Vijayawada
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </main>
  )
}
