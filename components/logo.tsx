import Image from "next/image"
import Link from "next/link"

export default function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center ${className}`}>
      <div className="relative h-10 w-10 overflow-hidden rounded-md">
        <Image src="/logo.png" alt="KL-Eats Logo" width={40} height={40} className="object-contain" priority />
      </div>
      <span className="ml-2 text-xl font-bold text-primary">KL-Eats</span>
    </Link>
  )
}
