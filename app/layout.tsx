import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Providers } from "./providers"
import { Toaster } from "@/components/ui/toaster"
import Script from "next/script"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "KL-Eats",
  description: "Food pre-ordering app for college students",
  generator: 'v0.dev',
  icons: {
    icon: '/logo.jpg',
    shortcut: '/logo.jpg',
    apple: '/logo.jpg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
  {/* Google Analytics 4 */}
  <Script src="https://www.googletagmanager.com/gtag/js?id=G-Y3TDH790Z7" strategy="afterInteractive" />
  <Script id="ga4-init" strategy="afterInteractive">
    {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);} 
gtag('js', new Date());
gtag('config', 'G-Y3TDH790Z7', { anonymize_ip: true });`}
  </Script>
  {/* End Google Analytics 4 */}
      <body className={inter.className}>
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <Providers>
            {children}
            <Toaster />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  )
}
