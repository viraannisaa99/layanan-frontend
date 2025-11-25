import {
  evaluateBooleanOperator,
  evaluateDateOperator,
  evaluateMultiSelectOperator,
  evaluateNumberOperator,
  evaluateSelectOperator,
  evaluateTextOperator,
  isEmptyValue,
  parseDateValue,
} from "@/lib/data-table-evaluators"

import type { Department } from "@/lib/api"
import type { ExtendedColumnFilter, ExtendedColumnSort } from "@/types/data-table"

import type { StatusFilterValue } from "@/app/departments/_lib/status-filter"

export function processDepartments({
  rows,
  search,
  statusFilter,
  filters,
  joinOperator,
  sorting,
}: {
  rows: Department[]
  search: string
  statusFilter: StatusFilterValue
  filters: ExtendedColumnFilter<Department>[]
  joinOperator: "and" | "or"
  sorting: ExtendedColumnSort<Department>[]
}) {
  let processed = [...rows]
  const normalizedSearch = search.trim().toLowerCase()

  if (normalizedSearch.length > 0) {
    processed = processed.filter((dept) => matchesSearchTerm(dept, normalizedSearch))
  }

  if (statusFilter !== "all") {
    processed = processed.filter((dept) => (statusFilter === "active" ? dept.is_active : !dept.is_active))
  }

  if (filters.length > 0) {
    processed = processed.filter((dept) => {
      const evaluator = (filter: ExtendedColumnFilter<Department>) => evaluateClientFilter(dept, filter)
      return joinOperator === "or" ? filters.some(evaluator) : filters.every(evaluator)
    })
  }

  if (sorting.length > 0) {
    processed = sortByDefinitions(processed, sorting)
  }

  return processed
}

function matchesSearchTerm(dept: Department, term: string) {
  const haystacks = [dept.name, dept.alias, dept.sys_code, dept.major_id ?? ""]
  return haystacks.some((value) => value?.toLowerCase().includes(term))
}

function evaluateClientFilter(
  dept: Department,
  filter: ExtendedColumnFilter<Department>,
) {
  const rawValue = getColumnValue(dept, filter.id)
  const operator = filter.operator

  if (operator === "isEmpty") {
    return isEmptyValue(rawValue)
  }
  if (operator === "isNotEmpty") {
    return !isEmptyValue(rawValue)
  }

  switch (filter.variant) {
    case "text":
      return evaluateTextOperator(String(rawValue ?? ""), operator, filter.value)
    case "select":
      return evaluateSelectOperator(String(rawValue ?? ""), operator, filter.value)
    case "multiSelect":
      return evaluateMultiSelectOperator(String(rawValue ?? ""), operator, filter.value)
    case "boolean":
      return evaluateBooleanOperator(Boolean(rawValue), operator, filter.value)
    case "date":
    case "dateRange":
      return evaluateDateOperator(rawValue, operator, filter.value)
    case "number":
    case "range":
      return evaluateNumberOperator(rawValue, operator, filter.value)
    default:
      return true
  }
}

function sortByDefinitions(rows: Department[], sorting: ExtendedColumnSort<Department>[]) {
  const sorted = [...rows]
  sorted.sort((a, b) => {
    for (const sort of sorting) {
      const aValue = getSortableValue(a, sort.id)
      const bValue = getSortableValue(b, sort.id)
      const comparison = compareValues(aValue, bValue)
      if (comparison !== 0) {
        return sort.desc ? -comparison : comparison
      }
    }
    return 0
  })
  return sorted
}

function compareValues(
  a: string | number | boolean | null | undefined,
  b: string | number | boolean | null | undefined,
) {
  if (a === b) return 0
  if (a === undefined || a === null) return -1
  if (b === undefined || b === null) return 1

  if (typeof a === "number" && typeof b === "number") {
    return a - b
  }

  return String(a).localeCompare(String(b))
}

function getSortableValue(dept: Department, columnId: string) {
  switch (columnId) {
    case "name":
      return dept.name?.toLowerCase() ?? ""
    case "sys_code":
      return dept.sys_code?.toLowerCase() ?? ""
    case "major":
      return dept.major_id?.toLowerCase() ?? ""
    case "status":
      return dept.is_active ? "active" : "inactive"
    case "created_at":
      return parseDateValue(dept.created_at)
    default:
      return ""
  }
}

function getColumnValue(dept: Department, columnId: string) {
  switch (columnId) {
    case "name":
      return dept.name ?? ""
    case "sys_code":
      return dept.sys_code ?? ""
    case "major":
      return dept.major_id ?? ""
    case "status":
      return dept.is_active ? "active" : "inactive"
    case "created_at":
      return dept.created_at ?? ""
    default:
      return ""
  }
}
