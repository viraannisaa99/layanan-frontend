"use client"

import * as React from "react"
import {
  BadgeCheck,
  CalendarCheck,
  ClipboardCheck,
  FileBarChart,
  GalleryVerticalEnd,
  Layers,
  LayoutDashboard,
  Settings2,
  ShieldCheck,
  Users,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

const NAVIGATION = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
    items: [
      { title: "Ringkasan", url: "/dashboard" },
      { title: "Laporan Cepat", url: "/dashboard/reports" },
    ],
  },
  {
    title: "Layanan",
    url: "/layanan",
    icon: ClipboardCheck,
    items: [
      { title: "Layanan", url: "/layanan" },
      { title: "Permohonan", url: "/permohonan" },
      { title: "Pengaduan", url: "/pengaduan" },
    ]
  },
  {
    title: "Civitas PCR",
    url: "/employees",
    icon: Users,
    items: [
      { title: "Pegawai", url: "/employees" },
    ],
  },
  {
    title: "Absensi",
    url: "/attendance",
    icon: CalendarCheck,
    items: [
      { title: "Rekap Absensi", url: "/attendance" },
      { title: "Izin & Cuti", url: "/attendance/leave" },
    ],
  },
  {
    title: "Approval",
    url: "/approvals",
    icon: ClipboardCheck,
    items: [
      { title: "Permintaan Pending", url: "/approvals" },
      { title: "Riwayat", url: "/approvals/history" },
    ],
  },
  {
    title: "Master Data",
    url: "/master-data",
    icon: Layers,
    items: [
      { title: "Departemen", url: "/departments" },
      { title: "Program Studi", url: "/program-studi" },
      { title: "Posisi", url: "/posisi" },
    ],
  },
  {
    title: "Keamanan",
    url: "/security",
    icon: ShieldCheck,
    items: [
      { title: "Hak Akses", url: "/security/access-control" },
      { title: "Audit Log", url: "/security/audit" },
    ],
  },
  {
    title: "Pengaturan",
    url: "/settings",
    icon: Settings2,
    items: [
      { title: "Organisasi", url: "/settings/org" },
      { title: "Integrasi", url: "/settings/integrations" },
    ],
  },
]

const SHORTCUTS = [
  {
    name: "Laporan Bulanan",
    url: "/reports/monthly",
    icon: FileBarChart,
  },
  {
    name: "Benefit & Payroll",
    url: "/benefits",
    icon: BadgeCheck,
  },
  {
    name: "Audit Kepatuhan",
    url: "/compliance",
    icon: ShieldCheck,
  },
]

const TEAMS = [
  {
    name: "PCR Layanan",
    logo: GalleryVerticalEnd,
    plan: "Enterprise",
  },
]

type SessionUser = {
  name?: string | null
  email?: string | null
  image?: string | null
}

const DEFAULT_USER: Required<Omit<SessionUser, "image">> & {
  image: string | null
} = {
  name: "PCR Admin",
  email: "ops@pcr.internal",
  image: null,
}

export function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user?: SessionUser
}) {
  const sidebarUser = {
    name: user?.name ?? DEFAULT_USER.name,
    email: user?.email ?? DEFAULT_USER.email,
    avatar: user?.image ?? undefined,
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={TEAMS} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={NAVIGATION} />
        <NavProjects projects={SHORTCUTS} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={sidebarUser} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
