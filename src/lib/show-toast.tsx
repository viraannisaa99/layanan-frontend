"use client"

import type { ReactNode } from "react"
import { AlertTriangle, CheckCircle2, CircleX } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"

export type ToastVariant = "success" | "error" | "warning"

const TOAST_CONFIG: Record<
  ToastVariant,
  { className: string; icon: ReactNode; defaultDuration: number }
> = {
  success: {
    className: "border border-emerald-400 bg-emerald-600 text-white",
    icon: <CheckCircle2 className="h-4 w-4 text-white" />,
    defaultDuration: 3200,
  },
  error: {
    className: "border border-destructive bg-destructive text-destructive-foreground",
    icon: <CircleX className="h-4 w-4 text-destructive-foreground" />,
    defaultDuration: 4500,
  },
  warning: {
    className: "border border-amber-400 bg-amber-300 text-amber-950",
    icon: <AlertTriangle className="h-4 w-4 text-amber-900" />,
    defaultDuration: 3800,
  },
}

export function showToast(
  variant: ToastVariant,
  message: string,
  options?: { duration?: number },
) {
  const config = TOAST_CONFIG[variant]

  toast.custom(
    () => (
      <div
        className={cn(
          "flex min-w-[220px] items-center gap-2 rounded-sm px-3 py-2 text-sm font-medium shadow-lg",
          config.className,
        )}
      >
        {config.icon}
        <span>{message}</span>
      </div>
    ),
    {
      duration: options?.duration ?? config.defaultDuration,
    },
  )
}

