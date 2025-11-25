type FilterValue = string | string[] | undefined

export function evaluateTextOperator(
  rowValue: string,
  operator: string,
  filterValue: FilterValue
) {
  const targets = toArray(filterValue).map((value) => value.toLowerCase())
  const value = rowValue.toLowerCase()

  switch (operator) {
    case "iLike":
      return targets.some((target) => value.includes(target))
    case "notILike":
      return targets.every((target) => !value.includes(target))
    case "eq":
      return targets.length === 0 ? true : targets.includes(value)
    case "ne":
      return targets.length === 0 ? true : !targets.includes(value)
    default:
      return true
  }
}

export function evaluateSelectOperator(
  rowValue: string,
  operator: string,
  filterValue: FilterValue
) {
  const target = toArray(filterValue)[0]
  if (!target) return true

  switch (operator) {
    case "eq":
      return rowValue === target
    case "ne":
      return rowValue !== target
    default:
      return true
  }
}

export function evaluateMultiSelectOperator(
  rowValue: string,
  operator: string,
  filterValue: FilterValue
) {
  const targets = toArray(filterValue)
  if (targets.length === 0) return true

  switch (operator) {
    case "inArray":
      return targets.includes(rowValue)
    case "notInArray":
      return !targets.includes(rowValue)
    default:
      return true
  }
}

export function evaluateBooleanOperator(
  rowValue: boolean,
  operator: string,
  filterValue: FilterValue
) {
  const target = toArray(filterValue)[0]
  if (!target) return true
  const targetValue = target === "true"

  switch (operator) {
    case "eq":
      return rowValue === targetValue
    case "ne":
      return rowValue !== targetValue
    default:
      return true
  }
}

export function evaluateNumberOperator(
  rawValue: unknown,
  operator: string,
  filterValue: FilterValue
) {
  const value = toNumber(rawValue)
  const targets = toArray(filterValue).map((entry) => Number(entry))

  if (value === null) return false

  switch (operator) {
    case "eq":
      return value === targets[0]
    case "ne":
      return value !== targets[0]
    case "lt":
      return value < targets[0]
    case "lte":
      return value <= targets[0]
    case "gt":
      return value > targets[0]
    case "gte":
      return value >= targets[0]
    case "isBetween": {
      const [min, max] = targets
      if (Number.isNaN(min) || Number.isNaN(max)) return true
      return value >= min && value <= max
    }
    default:
      return true
  }
}

export function evaluateDateOperator(
  rawValue: unknown,
  operator: string,
  filterValue: FilterValue
) {
  const value = parseDateValue(rawValue)
  const targets = toArray(filterValue).map((entry) => parseDateValue(entry))

  if (value === null) return false

  switch (operator) {
    case "eq":
      return value === targets[0]
    case "ne":
      return value !== targets[0]
    case "lt":
      return targets[0] === null ? true : value < targets[0]
    case "lte":
      return targets[0] === null ? true : value <= targets[0]
    case "gt":
      return targets[0] === null ? true : value > targets[0]
    case "gte":
      return targets[0] === null ? true : value >= targets[0]
    case "isBetween": {
      const [start, end] = targets
      if (start === null || end === null) return true
      return value >= start && value <= end
    }
    default:
      return true
  }
}

export function isEmptyValue(value: unknown) {
  return (
    value === null ||
    value === undefined ||
    (typeof value === "string" && value.trim().length === 0)
  )
}

export function parseDateValue(value: unknown): number | null {
  if (value === null || value === undefined) return null
  const timestamp =
    typeof value === "number" ? value : Date.parse(String(value))
  return Number.isNaN(timestamp) ? null : timestamp
}

function toArray(value: FilterValue) {
  if (Array.isArray(value)) return value.filter(Boolean)
  if (typeof value === "string" && value.length > 0) return [value]
  return []
}

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null
  const num = Number(value)
  return Number.isNaN(num) ? null : num
}
