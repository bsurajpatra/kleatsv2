"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

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
          className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm"
        >
          {/* Floating particles/shine */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ duration: 1.2 }}
            style={{
              background:
                "radial-gradient(60vw 60vh at 10% 20%, rgba(59,130,246,0.25), transparent 60%), radial-gradient(40vw 40vh at 90% 80%, rgba(147,51,234,0.25), transparent 60%)",
            }}
          />

          <motion.div
            initial={{ y: 20, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 10, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 220, damping: 20 }}
            className="relative mx-4 w-full max-w-lg"
          >
            <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-br from-primary/50 via-fuchsia-500/40 to-indigo-500/40 blur" />
            <div className="relative rounded-2xl border bg-background/90 p-6 md:p-8 shadow-2xl">
              <motion.h1
                className="text-2xl md:text-3xl font-bold tracking-tight text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
              >
                Reopening soon
              </motion.h1>
              <motion.p
                className="mt-2 text-center text-muted-foreground"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 }}
              >
                Redesigned from the ground up. Recharged.
              </motion.p>

              <motion.div
                className="mt-6 rounded-xl border bg-card p-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18 }}
              >
                <p className="text-xs text-muted-foreground mb-2">If you're here for testing, enter the code:</p>
                <div className="flex items-center gap-2">
                  <input
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    onKeyDown={handleKey}
                    placeholder="Enter code"
                    className="flex-1 rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    onClick={submit}
                    className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:brightness-110 active:scale-[0.98]"
                  >
                    Unlock
                  </button>
                </div>
                <div className="mt-2 h-5">
                  {error && (
                    <motion.p className="text-xs text-destructive" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      {error}
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
