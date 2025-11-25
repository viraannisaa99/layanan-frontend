"use client"

import { useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { signIn, useSession } from "next-auth/react"

type UseRequireAuthResult = ReturnType<typeof useSession> & {
  isReady: boolean
}

export function useRequireAuth(): UseRequireAuthResult {
  const router = useRouter()
  const session = useSession()

  useEffect(() => {
    if (session.status === "unauthenticated") {
      router.replace("/login")
    }
  }, [session.status, router])

  useEffect(() => {
    if (session.status === "authenticated" && session.data?.error) {
      signIn("keycloak")
    }
  }, [session.status, session.data?.error])

  const isReady = useMemo(() => {
    return session.status === "authenticated" && !session.data?.error
  }, [session.status, session.data?.error])

  return {
    ...session,
    isReady,
  }
}
