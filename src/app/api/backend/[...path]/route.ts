"use server"

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { getToken } from "next-auth/jwt"

import { authConfig } from "@/lib/auth"

const BACKEND_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8099"

const EXPIRY_BUFFER_MS = 60 * 1000

async function acquireAccessToken(req: NextRequest) {
  const loadToken = () => getToken({ req })

  const isStale = (expiresAt?: number | string | null) => {
    if (!expiresAt) return false
    const ts = typeof expiresAt === "string" ? Number(expiresAt) : expiresAt
    if (Number.isNaN(ts)) return false
    return Date.now() > ts - EXPIRY_BUFFER_MS
  }

  let token = await loadToken()
  if (token?.accessToken && !isStale(token.expiresAt as number | undefined)) {
    return token.accessToken as string
  }

  const refreshedSession = await getServerSession(authConfig)
  if (!refreshedSession) {
    return null
  }

  token = await loadToken()
  if (token?.accessToken && !isStale(token.expiresAt as number | undefined)) {
    return token.accessToken as string
  }

  return null
}

async function proxyRequest(req: NextRequest) {
  const accessToken = await acquireAccessToken(req)
  if (!accessToken) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    )
  }

  const overrideBaseUrl = req.headers.get("x-backend-base-url")
  const BASE_URL = overrideBaseUrl ?? BACKEND_BASE_URL

  const search = req.nextUrl.search || ""
  const normalizedBase = BASE_URL.replace(/\/+$/, "")
  const forwardedPath = req.nextUrl.pathname.replace(/^\/api\/backend/, "")
  const targetUrl = `${normalizedBase}${forwardedPath}${search}`

  const headers = new Headers(req.headers)
  headers.set("Authorization", `Bearer ${accessToken}`)
  headers.set("Host", new URL(BASE_URL).host)

  const body =
    ["GET", "HEAD"].includes(req.method) ? undefined : await req.blob()

  const fetchOptions: RequestInit = {
    method: req.method,
    headers,
    redirect: "manual",
    body,
  }

  let upstream: Response
  try {
    upstream = await fetch(targetUrl, fetchOptions)
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Upstream service unavailable",
        detail: error instanceof Error ? error.message : String(error),
        upstream: targetUrl
      },
      { status: 502 }
    )
  }

  const responseHeaders = new Headers(upstream.headers)
  responseHeaders.delete("transfer-encoding")

  return new NextResponse(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  })
}

export const GET = proxyRequest
export const POST = proxyRequest
export const PUT = proxyRequest
export const PATCH = proxyRequest
export const DELETE = proxyRequest
