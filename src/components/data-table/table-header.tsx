"use client"

import type * as React from "react"

import { AppCard } from "@/components/ui/app-card"
import { Button } from "@/components/ui/button"

export type TableHeaderProps = {
  title: React.ReactNode
  description?: string
  primaryActionLabel: React.ReactNode
  onPrimaryAction: () => void
  actions?: React.ReactNode
}

export function TableHeader({
  title,
  description,
  primaryActionLabel,
  onPrimaryAction,
  actions,
}: TableHeaderProps) {
  return (
    <AppCard className="space-y-4 p-3">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {actions}
          <Button size="sm" onClick={onPrimaryAction}>
            {primaryActionLabel}
          </Button>
        </div>
      </div>
    </AppCard>
  )
}
