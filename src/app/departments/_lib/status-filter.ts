export type StatusFilterValue = "all" | "active" | "inactive"

export const STATUS_FILTER_OPTIONS: Array<{ label: string; value: StatusFilterValue }> = [
  { label: "Semua", value: "all" },
  { label: "Aktif", value: "active" },
  { label: "Nonaktif", value: "inactive" },
]

export function isStatusFilterValue(value: string | null | undefined): value is StatusFilterValue {
  return value === "all" || value === "active" || value === "inactive"
}

