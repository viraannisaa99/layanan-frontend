import { Suspense } from "react"

import { Skeleton } from "@/components/ui/skeleton"

import DepartmentsPageClient from "./departments-page-client"

function DepartmentsPageFallback() {
  return (
    <div className="flex min-h-screen flex-col gap-4 bg-muted/30 p-4">
      <Skeleton className="h-4 w-48 rounded-sm" />
      <Skeleton className="h-full rounded-sm" />
    </div>
  )
}

export default function DepartmentsPage() {
  return (
    <Suspense fallback={<DepartmentsPageFallback />}>
      <DepartmentsPageClient />
    </Suspense>
  )
}
