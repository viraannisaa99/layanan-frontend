"use client"

import { useQuery } from "@tanstack/react-query"

import { listPositions } from "@/lib/api"

import type { LookupResult } from "./types"

export function usePositionOptions(params: { status?: "all" | "active" } = {}): LookupResult {
  const status = params.status ?? "active"

  const query = useQuery({
    queryKey: ["position-options", status],
    queryFn: () => listPositions({ status, perPage: 200 }),
    select: (res) => res.data ?? [],
    staleTime: 5 * 60 * 1000,
  })

  const options =
    query.data?.map((pos) => ({
      value: pos.id,
      label: `${pos.nama_posisi} (${pos.alias_posisi})`,
    })) ?? []

  const lookupMap = options.reduce<Record<string, string>>((acc, curr) => {
    acc[curr.value] = curr.label
    return acc
  }, {})

  return { options, lookupMap, loading: query.isLoading, error: !!query.error }
}
