"use client"

import { ChevronsUpDown, LogOut, Settings2, ShieldCheck } from "lucide-react"
import { signOut, useSession } from "next-auth/react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

type NavUserProps = {
  user: {
    name?: string | null
    email?: string | null
    avatar?: string | null
  }
}

export function NavUser({ user }: NavUserProps) {
  const { isMobile } = useSidebar()
  const { data: session } = useSession()
  const initials =
    user.name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "HR"

  const appBase =
    process.env.NEXT_PUBLIC_APP_BASE_URL ||
    (typeof window !== "undefined" ? window.location.origin : "")
  const keycloakLogoutUrl =
    process.env.NEXT_PUBLIC_KEYCLOAK_LOGOUT_URL ||
    "https://sso.devpcr.duckdns.org/realms/pcr/protocol/openid-connect/logout"
  const keycloakClientId =
    process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || "pcr-hr-frontend"
  const hasValidIdToken =
    typeof session?.idToken === "string" &&
    session.idToken.split(".").length === 3

  const buildLoginRedirect = (opts?: { manual?: boolean }) => {
    const origin =
      appBase || (typeof window !== "undefined" ? window.location.origin : "")
    const path = `/login${opts?.manual ? "?mode=manual" : ""}`
    if (origin) {
      return `${origin.replace(/\/$/, "")}${path}`
    }
    return path
  }

  const handleAppLogout = async () => {
    await signOut({ callbackUrl: buildLoginRedirect({ manual: true }) })
  }

  const handleSsoLogout = async () => {
    await signOut({ redirect: false })

    const logoutUrl = new URL(keycloakLogoutUrl)
    logoutUrl.searchParams.set("client_id", keycloakClientId)
    logoutUrl.searchParams.set(
      "post_logout_redirect_uri",
      buildLoginRedirect({ manual: true })
    )
    if (hasValidIdToken && session?.idToken) {
      logoutUrl.searchParams.set("id_token_hint", session.idToken)
    }

    window.location.href = logoutUrl.toString()
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.avatar ?? undefined} alt={user.name ?? "Pengguna"} />
                <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {user.name ?? "Pengguna"}
                </span>
                <span className="truncate text-xs">
                  {user.email ?? "user@pcr.internal"}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar ?? undefined} alt={user.name ?? "Pengguna"} />
                  <AvatarFallback className="rounded-lg">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {user.name ?? "Pengguna"}
                  </span>
                  <span className="truncate text-xs">
                    {user.email ?? "user@pcr.internal"}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Settings2 className="mr-2 h-4 w-4" />
              <span>Pengaturan Akun</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault()
                handleAppLogout()
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <div className="flex flex-col leading-tight">
                <span>Keluar Aplikasi</span>
                <span className="text-xs text-muted-foreground">
                  Sesi HR saja yang berakhir
                </span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onSelect={(event) => {
                event.preventDefault()
                handleSsoLogout()
              }}
            >
              <ShieldCheck className="mr-2 h-4 w-4" />
              <div className="flex flex-col leading-tight">
                <span>Keluar SSO</span>
                <span className="text-xs text-muted-foreground">
                  Termasuk Keycloak SSO
                </span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
