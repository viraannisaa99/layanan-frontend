"use client"

import { useQuery } from "@tanstack/react-query"

import { listStudyPrograms } from "@/lib/api"

import type { LookupResult } from "./types"

export function useStudyProgramOptions(params: { status?: "all" | "active" } = {}): LookupResult {
  const status = params.status ?? "active"

  const query = useQuery({
    queryKey: ["study-program-options", status],
    queryFn: () => listStudyPrograms({ status, perPage: 200 }),
    select: (res) => res.data ?? [],
    staleTime: 5 * 60 * 1000,
  })

  const options =
    query.data?.map((prog) => ({
      value: prog.id,
      label: `${prog.nama_prodi} (${prog.kode_prodi})`,
    })) ?? []

  const lookupMap = options.reduce<Record<string, string>>((acc, curr) => {
    acc[curr.value] = curr.label
    return acc
  }, {})

  return { options, lookupMap, loading: query.isLoading, error: !!query.error }
}
