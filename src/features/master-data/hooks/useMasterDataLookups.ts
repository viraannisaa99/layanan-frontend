"use client"

import { useMemo } from "react"

import { useDepartmentOptions } from "./useDepartmentOptions"
import { usePositionOptions } from "./usePositionOptions"
import { useStudyProgramOptions } from "./useStudyProgramOptions"

export function useMasterDataLookups() {
  const dept = useDepartmentOptions({ status: "all" })
  const pos = usePositionOptions({ status: "all" })
  const prog = useStudyProgramOptions({ status: "all" })

  const lookupMaps = useMemo(
    () => ({
      departments: dept.lookupMap,
      positions: pos.lookupMap,
      programs: prog.lookupMap,
    }),
    [dept.lookupMap, pos.lookupMap, prog.lookupMap],
  )

  const loading = dept.loading || pos.loading || prog.loading
  const error = dept.error || pos.error || prog.error

  return {
    lookupMaps,
    loading,
    error,
    departmentOptions: dept.options,
    positionOptions: pos.options,
    programOptions: prog.options,
  }
}
