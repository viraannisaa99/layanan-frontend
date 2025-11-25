import { Skeleton } from "@/components/ui/skeleton"

export default function LoginLoading() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-muted/40 px-4 py-6">
      <div className="w-full max-w-md space-y-4 rounded-lg border border-border bg-card p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-xl" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-5 w-64" />
          </div>
        </div>
        <Skeleton className="h-12 w-full" />
      </div>
      <Skeleton className="h-4 w-40" />
    </main>
  )
}
