"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

type BreadcrumbConfig = {
  label: React.ReactNode
  href?: string
}

interface PageHeaderProps {
  items: BreadcrumbConfig[]
  rightSlot?: React.ReactNode
  className?: string
}

export function PageHeader({
  items,
  rightSlot,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "flex h-16 shrink-0 items-center justify-between gap-2 px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12",
        className,
      )}
    >
      <div className="flex flex-1 items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />
        <Breadcrumb>
          <BreadcrumbList>
            {items.map((item, index) => (
              <BreadcrumbItem key={`${item.href ?? index}-${index}`}>
                {item.href ? (
                  <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
                ) : (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="flex items-center gap-2">
        {rightSlot}
        <AnimatedThemeToggler />
      </div>
    </header>
  )
}
