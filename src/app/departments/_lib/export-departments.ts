"use client"

import { formatDate } from "@/lib/format"

import {
  type Department,
  listDepartments,
} from "@/lib/api"
import type { ExtendedColumnFilter, ExtendedColumnSort } from "@/types/data-table"

import type { StatusFilterValue } from "@/app/departments/_lib/status-filter"

type FetchAllDepartmentsParams = {
  status: StatusFilterValue
  search: string
  filters: ExtendedColumnFilter<Department>[]
  sorting: ExtendedColumnSort<Department>[]
  joinOperator: "and" | "or"
  pageSize?: number
}

export async function fetchAllDepartments({
  status,
  search,
  filters,
  sorting,
  joinOperator,
  pageSize = 100,
}: FetchAllDepartmentsParams) {
  const aggregated: Department[] = []
  let currentPage = 1
  let totalPages = 1

  do {
    const response = await listDepartments({
      status,
      search,
      filters,
      sort: sorting,
      joinOperator,
      page: currentPage,
      perPage: pageSize,
    })

    const pageData = response.data ?? []
    aggregated.push(...pageData)
    totalPages = Math.max(
      totalPages,
      response.meta?.pagination?.total_pages ?? currentPage,
    )

    if (!pageData.length) break

    currentPage += 1
  } while (currentPage <= totalPages)

  return aggregated
}

export function exportDepartmentsToCSV(rows: Department[], filename = "departments") {
  if (!rows.length) {
    throw new Error("Tidak ada data departemen untuk diekspor.")
  }

  const headers = ["Nama", "Alias", "Sys Code", "Major ID", "Status", "Dibuat"]
  const csvRows = rows.map((dept) => [
    escapeCsvValue(dept.name),
    escapeCsvValue(dept.alias),
    escapeCsvValue(dept.sys_code),
    escapeCsvValue(dept.major_id ?? "-"),
    escapeCsvValue(dept.is_active ? "Aktif" : "Nonaktif"),
    escapeCsvValue(
      formatDate(dept.created_at, {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    ),
  ])

  const csvContent = [headers, ...csvRows].map((row) => row.join(",")).join("\n")
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = `${filename}.csv`
  anchor.style.visibility = "hidden"
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(url)
}

function escapeCsvValue(value: string) {
  const normalized = value ?? ""
  if (normalized.includes(",") || normalized.includes("\"") || normalized.includes("\n")) {
    return `"${normalized.replace(/"/g, '""')}"`
  }
  return `"${normalized}"`
}

