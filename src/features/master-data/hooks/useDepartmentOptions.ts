"use client"

import { useQuery } from "@tanstack/react-query"

import { listDepartments } from "@/lib/api"

import type { LookupResult } from "./types"

export function useDepartmentOptions(params: { status?: "all" | "active" } = {}): LookupResult {
  const status = params.status ?? "active"

  const query = useQuery({
    queryKey: ["department-options", status],
    queryFn: () => listDepartments({ status, perPage: 200 }),
    select: (res) => res.data ?? [],
    staleTime: 5 * 60 * 1000,
  })

  const options =
    query.data?.map((dept) => ({
      value: dept.id,
      label: `${dept.name} (${dept.alias})`,
    })) ?? []

  const lookupMap = options.reduce<Record<string, string>>((acc, curr) => {
    acc[curr.value] = curr.label
    return acc
  }, {})

  return { options, lookupMap, loading: query.isLoading, error: !!query.error }
}
