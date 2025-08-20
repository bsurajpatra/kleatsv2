"use client"

import Logo from "./logo"

export default function LoadingScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="relative flex items-center justify-center">
        <div className="absolute h-24 w-24 rounded-full border-2 border-primary/20" />
        <div className="absolute h-32 w-32 animate-spin rounded-full border-t-2 border-b-2 border-primary" />
        <Logo />
      </div>
    </div>
  )
}
