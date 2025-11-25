import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user?: DefaultSession["user"] & {
      id?: string | null
    }
    error?: string
    idToken?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    expiresAt?: number
    error?: string
    idToken?: string
    accessToken?: string
    refreshToken?: string
  }
}
