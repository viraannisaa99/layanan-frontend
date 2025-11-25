"use client"

import { PageHeader } from "@/components/page-header"
import { AppSidebar } from "@/components/app-sidebar"
import { AppCard } from "@/components/ui/app-card"
import { Skeleton } from "@/components/ui/skeleton"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useRequireAuth } from "@/hooks/use-require-auth"

export default function DashboardPage() {
  const { data: session, status } = useRequireAuth()

  if (status === "loading") {
    return (
      <div className="flex min-h-screen flex-col gap-4 bg-muted/30 p-4">
        <Skeleton className="h-4 w-48 rounded-sm" />
        <Skeleton className="h-full rounded-sm" />
      </div>
    )
  }

  return (
    <SidebarProvider>
      <AppSidebar user={session?.user ?? undefined} />
      <SidebarInset>
        <PageHeader items={[{ label: "Dashboard" }]} />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <AppCard className="flex flex-1 flex-col items-center justify-center border-dashed border-muted-foreground/20 text-center">
            <p className="text-base font-semibold">HR Dashboard</p>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Tidak ada widget yang dirender saat ini. Tahap berikutnya akan
              menambahkan ringkasan karyawan, absensi, dan approval workflow.
             
            </p>
          </AppCard>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
