"use client"

import { useEffect, useRef } from "react"

import { LogIn } from "lucide-react"
import { signIn, useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"

import { AppCard } from "@/components/ui/app-card"
import { Button } from "@/components/ui/button"

export default function LoginPage() {
  const { status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const alreadyTriggered = useRef(false)

  const isManualMode = searchParams.get("mode") === "manual"

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard")
    }
  }, [status, router])

  useEffect(() => {
    if (
      status === "unauthenticated" &&
      !isManualMode &&
      !alreadyTriggered.current
    ) {
      alreadyTriggered.current = true
      signIn("keycloak")
    }
  }, [status, isManualMode])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-muted/40 px-4 py-6">
      <AppCard className="w-full max-w-md space-y-4">
        <div className="flex items-center gap-2">
          <div className="rounded-xl bg-primary/10 p-2 text-primary">
            <LogIn className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm uppercase tracking-wider text-muted-foreground">
              PCR Human Resources
            </p>
            <h1 className="text-xl font-semibold">
              {isManualMode ? "Sesi Anda Berakhir" : "Menghubungkan ke Keycloak"}
            </h1>
          </div>
        </div>

        {isManualMode ? (
          <p className="text-sm text-muted-foreground">
            Untuk melanjutkan ke dashboard HR silakan autentikasi ulang melalui
            Keycloak SSO. Klik tombol di bawah ini untuk masuk kembali.
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            Mengarahkan Anda ke Keycloak untuk proses login. Jika jendela tidak
            muncul, gunakan tombol berikut.
          </p>
        )}

        <Button className="w-full" onClick={() => signIn("keycloak")}>
          Masuk dengan Keycloak
        </Button>
      </AppCard>

      <p className="text-xs text-muted-foreground">
        Butuh bantuan? Hubungi tim IT PCR.
      </p>
    </main>
  )
}
