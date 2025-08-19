import Logo from "./logo"
import { Facebook, Instagram, Twitter } from "lucide-react"
import Link from 'next/link';



export default function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container px-4 py-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="flex flex-col">
            <Logo className="mb-4" />
            <p className="text-sm text-muted-foreground">
              Pre-order your favorite campus food and skip the lines. KL-Eats makes campus dining easy and convenient.
            </p>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-medium">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-primary">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/canteens" className="text-muted-foreground hover:text-primary">
                  Canteens
                </Link>
              </li>
              <li>
                <Link href="/quick-order" className="text-muted-foreground hover:text-primary">
                  My Orders
                </Link>
              </li>
              <li>
                <Link href="/account" className="text-muted-foreground hover:text-primary">
                  Account
                </Link>
              </li>
               <li>
                 <Link href="/contact" className="text-muted-foreground hover:text-primary">
                 ContactUs
                 </Link>
               </li>
               <li>
                 <Link href="/privacy-policy" className="text-muted-foreground hover:text-primary">
                   Privacy Policy
                 </Link>
               </li>
            </ul>
          </div>

          
          <div>
            <h3 className="mb-3 text-sm font-medium">Follow Us</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-primary">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </a>
            </div>
          </div>

          {/* Learn More section with ordered policy links */}
          <div>
            <h3 className="mb-3 text-sm font-medium">Learn More</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-primary">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="text-muted-foreground hover:text-primary">
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="text-muted-foreground hover:text-primary">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-6 text-center text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} KL Eats : A Unit of Equitech Private Limited. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
