import type { SortDirection } from '../types'

/**
 * Generate unique ID
 */
export function generateId(): string {
  return crypto.randomUUID()
}

/**
 * Get value from object by path
 */
export function getValueByPath(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce((acc, key) => {
    if (acc && typeof acc === 'object') {
      return (acc as Record<string, unknown>)[key]
    }
    return undefined
  }, obj as unknown)
}

/**
 * Sort data by column
 */
export function sortData(
  data: Record<string, unknown>[],
  column: string,
  direction: SortDirection
): Record<string, unknown>[] {
  if (!direction) return data

  return [...data].sort((a, b) => {
    const aVal = a[column]
    const bVal = b[column]

    if (aVal === bVal) return 0
    if (aVal === null || aVal === undefined) return 1
    if (bVal === null || bVal === undefined) return -1

    const comparison = aVal < bVal ? -1 : 1
    return direction === 'asc' ? comparison : -comparison
  })
}

/**
 * Flatten nested data for multi-dimensional display
 */
export function flattenData(
  data: Record<string, unknown>[],
  depth = 0,
  parentKey = ''
): Array<Record<string, unknown> & { _depth?: number; _parentKey?: string }> {
  const result: Array<Record<string, unknown> & { _depth?: number; _parentKey?: string }> = []

  for (const item of data) {
    const flatItem = { ...item, _depth: depth, _parentKey: parentKey }
    result.push(flatItem)

    // Handle nested children if present
    const children = item.children as Array<Record<string, unknown>> | undefined
    if (children && Array.isArray(children)) {
      const childKey = String(item.id ?? item.name ?? generateId())
      result.push(...flattenData(children, depth + 1, childKey))
    }
  }

  return result
}

/**
 * Extract columns from data
 */
export function extractColumns(data: Record<string, unknown>[]): string[] {
  if (!data || data.length === 0) return []

  const columns = new Set<string>()
  for (const row of data) {
    Object.keys(row).forEach((key) => {
      if (key !== 'children') {
        columns.add(key)
      }
    })
  }

  return Array.from(columns)
}
