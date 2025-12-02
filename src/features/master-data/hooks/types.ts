"use client"

export type LookupOption = { value: string; label: string }
export type LookupMap = Record<string, string>

export type LookupResult = {
  options: LookupOption[]
  lookupMap: LookupMap
  loading: boolean
  error: boolean
}
