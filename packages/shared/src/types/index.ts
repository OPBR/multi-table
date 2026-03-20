export interface TableColumn {
  key: string
  title: string
  width?: number
  fixed?: 'left' | 'right'
  sortable?: boolean
  resizable?: boolean
}

export interface TableRow<T = Record<string, unknown>> {
  id: string | number
  data: T
}

export interface TableProps {
  data: Record<string, unknown>[]
  columns?: string[]
  rowKey?: string
  bordered?: boolean
  striped?: boolean
  hoverable?: boolean
}

export interface CellProps {
  value: unknown
  row: number
  col: number
}

export type SortDirection = 'asc' | 'desc' | null

export interface SortState {
  column: string | null
  direction: SortDirection
}
