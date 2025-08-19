"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Lock } from "lucide-react"
import Image from "next/image"

type Props = {
  open: boolean
  onUnlock: () => void
}

export default function LockOverlay({ open, onUnlock }: Props) {
  const [code, setCode] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!open) {
      setCode("")
      setError("")
      setSuccess(false)
    }
  }, [open])

  const submit = () => {
    if (code.trim() === "GLUG") {
      setSuccess(true)
      setError("")
      setTimeout(() => {
        onUnlock()
      }, 500)
    } else {
      setError("Invalid code")
      setSuccess(false)
    }
  }

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") submit()
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="lock-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 grid place-items-center bg-black/70 backdrop-blur-2xl lg:backdrop-blur-3xl backdrop-saturate-50"
        >
          {/* Floating particles/shine */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.45 }}
            transition={{ duration: 1.2 }}
            style={{
              background:
                "radial-gradient(60vw 60vh at 10% 20%, rgba(59,130,246,0.22), transparent 60%), radial-gradient(40vw 40vh at 90% 80%, rgba(147,51,234,0.22), transparent 60%)",
            }}
          />

          <motion.div
            initial={{ y: 20, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 10, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 220, damping: 20 }}
            className="relative mx-4 w-full max-w-lg"
          >
            <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-br from-primary/60 via-fuchsia-500/50 to-indigo-500/50 blur" />
            <div className="relative rounded-2xl border bg-background/85 p-6 md:p-8 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center justify-center mb-4">
                <Image src="/logo.svg" alt="KL Eats" width={140} height={36} className="h-9 w-auto opacity-95" priority />
              </div>
              <motion.h1
                className="text-2xl md:text-3xl font-semibold tracking-tight text-center flex items-center gap-2 justify-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
              >
                <Lock className="h-6 w-6 text-primary" aria-hidden />
                We’ll be right back
              </motion.h1>
              <motion.p
                className="mt-2 text-center text-muted-foreground"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 }}
              >
                We’re making improvements to KL Eats for a smoother, faster experience.
                Testers can use their access code below to continue.
              </motion.p>

              <motion.div
                className="mt-6 rounded-xl border bg-card/90 p-4 shadow-sm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18 }}
              >
                <p className="text-xs text-muted-foreground mb-2">Have a code? Enter it to unlock access:</p>
                <div className="flex items-center gap-2">
                  <input
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    onKeyDown={handleKey}
                    placeholder="Access code"
                    aria-label="Access code"
                    aria-invalid={!!error}
                    className="flex-1 rounded-md border bg-background/90 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    onClick={submit}
                    className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:brightness-110 active:scale-[0.98]"
                  >
                    Unlock access
                  </button>
                </div>
                <div className="mt-2 h-5">
                  {error && (
                    <motion.p className="text-xs text-destructive" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      That code doesn’t look right. Try again.
                    </motion.p>
                  )}
                  {success && (
                    <motion.p
                      className="text-xs text-emerald-600"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      Unlocked
                    </motion.p>
                  )}
                </div>
              </motion.div>

              <motion.div
                className="mt-6 flex items-center justify-center gap-2 text-[10px] text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.24 }}
              >
                <span>KL Eats • A Unit of Equitech Private Limited</span>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
