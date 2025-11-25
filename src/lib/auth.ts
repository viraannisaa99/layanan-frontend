import type { AuthOptions } from "next-auth"
import Keycloak from "next-auth/providers/keycloak"
import type { JWT } from "next-auth/jwt"

const issuer =
  process.env.KEYCLOAK_ISSUER ??
  "https://sso.devpcr.duckdns.org/realms/pcr"

export const authConfig: AuthOptions = {
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    Keycloak({
      clientId: process.env.KEYCLOAK_CLIENT_ID ?? "",
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET ?? "",
      issuer,
      authorization: { params: { scope: "openid profile email" } },
      checks: ["pkce", "state"],
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
        token.idToken = account.id_token
        token.expiresAt = account.expires_at
          ? account.expires_at * 1000
          : Date.now() + 60 * 60 * 1000
        token.error = undefined
      }

      if (!token.accessToken || !token.expiresAt) {
        return token
      }

      const shouldRefresh =
        typeof token.expiresAt === "number" &&
        Date.now() > token.expiresAt - 60 * 1000

      if (!shouldRefresh) {
        return token
      }

      return await refreshAccessToken(token)
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub
      }

      session.idToken = typeof token.idToken === "string" ? token.idToken : undefined
      session.error = token.error as string | undefined
      return session
    },
  },
}

async function refreshAccessToken(token: JWT) {
  if (!token.refreshToken) {
    return { ...token, error: "MissingRefreshToken" }
  }

  const issuer =
    process.env.KEYCLOAK_ISSUER ??
    "https://sso.devpcr.duckdns.org/realms/pcr"
  const tokenEndpoint = `${issuer}/protocol/openid-connect/token`

  try {
    const body = new URLSearchParams({
      grant_type: "refresh_token",
      client_id: process.env.KEYCLOAK_CLIENT_ID ?? "",
      refresh_token: token.refreshToken as string,
    })
    if (process.env.KEYCLOAK_CLIENT_SECRET) {
      body.set("client_secret", process.env.KEYCLOAK_CLIENT_SECRET)
    }

    const response = await fetch(tokenEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    })

    const refreshed = await response.json()
    if (!response.ok) {
      throw refreshed
    }

    return {
      ...token,
      accessToken: refreshed.access_token,
      refreshToken: refreshed.refresh_token ?? token.refreshToken,
      idToken: refreshed.id_token ?? token.idToken,
      expiresAt: Date.now() + refreshed.expires_in * 1000,
      error: undefined,
    }
  } catch (error) {
    console.error("Failed to refresh Keycloak token", error)
    return {
      ...token,
      error: "RefreshAccessTokenError",
      accessToken: undefined,
    }
  }
}
