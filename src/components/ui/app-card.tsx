"use client"

import { cn } from "@/lib/utils"

type AppCardProps = React.HTMLAttributes<HTMLDivElement>

export function AppCard({ className, ...props }: AppCardProps) {
  return (
    <div
      className={cn(
        "rounded-sm border border-border bg-card p-4 shadow-none",
        className
      )}
      {...props}
    />
  )
}
