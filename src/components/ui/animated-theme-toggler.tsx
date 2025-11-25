"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Moon, Sun } from "lucide-react"
import { flushSync } from "react-dom"
import { useTheme } from "next-themes"

import { cn } from "@/lib/utils"

interface AnimatedThemeTogglerProps
  extends React.ComponentPropsWithoutRef<"button"> {
  duration?: number
}

export const AnimatedThemeToggler = ({
  className,
  duration = 400,
  ...props
}: AnimatedThemeTogglerProps) => {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => setMounted(true), [])

  const isDark = useMemo(
    () => (mounted ? resolvedTheme : "light") === "dark",
    [mounted, resolvedTheme],
  )

  const toggleTheme = useCallback(async () => {
    if (!buttonRef.current) return

    const nextTheme = isDark ? "light" : "dark"
    const startViewTransition = (document as any)
      .startViewTransition?.bind(document)

    const applyTheme = () => {
      flushSync(() => setTheme(nextTheme))
    }

    if (!startViewTransition) {
      applyTheme()
      return
    }

    await startViewTransition(applyTheme).ready

    const { top, left, width, height } =
      buttonRef.current.getBoundingClientRect()
    const x = left + width / 2
    const y = top + height / 2
    const maxRadius = Math.hypot(
      Math.max(left, window.innerWidth - left),
      Math.max(top, window.innerHeight - top),
    )

    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${maxRadius}px at ${x}px ${y}px)`,
        ],
      },
      {
        duration,
        easing: "ease-in-out",
        pseudoElement: "::view-transition-new(root)",
      },
    )
  }, [isDark, setTheme, duration])

  return (
    <button
      ref={buttonRef}
      onClick={toggleTheme}
      className={cn(
        "relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-border/80 bg-card/90 text-muted-foreground transition hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      type="button"
      aria-pressed={isDark}
      {...props}
    >
      <Sun
        className={cn(
          "h-4 w-4 transition duration-300",
          isDark ? "-translate-y-2 scale-0 opacity-0" : "translate-y-0 scale-100 opacity-100",
        )}
      />
      <Moon
        className={cn(
          "absolute h-4 w-4 transition duration-300",
          isDark ? "translate-y-0 scale-100 opacity-100" : "translate-y-2 scale-0 opacity-0",
        )}
      />
      <span className="sr-only">Toggle theme</span>
    </button>
  )
}
