import type { Operation, TableData, Row, Column, CellValue } from '../types'

export type OperationPayload = Record<string, unknown>

export interface OperationContext {
  data: TableData
  operation: Operation
}

export function applyCellUpdateUndo(ctx: OperationContext): void {
  const { data, operation } = ctx
  const { rowIndex, columnKey, oldValue } = operation.payload as {
    rowIndex: number
    columnKey: string
    oldValue: unknown
  }
  data.rows[rowIndex].cells[columnKey].value = oldValue as CellValue
}

export function applyCellUpdateRedo(ctx: OperationContext): void {
  const { data, operation } = ctx
  const { rowIndex, columnKey, newValue } = operation.payload as {
    rowIndex: number
    columnKey: string
    newValue: unknown
  }
  data.rows[rowIndex].cells[columnKey].value = newValue as CellValue
}

export function applyRowAddUndo(ctx: OperationContext): void {
  const { data, operation } = ctx
  const { index } = operation.payload as { index?: number }
  if (index !== undefined) {
    data.rows.splice(index, 1)
  } else {
    data.rows.pop()
  }
}

export function applyRowAddRedo(ctx: OperationContext): void {
  const { data, operation } = ctx
  const { row, index } = operation.payload as { row: Row; index?: number }
  if (index !== undefined) {
    data.rows.splice(index, 0, row)
  } else {
    data.rows.push(row)
  }
}

export function applyRowDeleteUndo(ctx: OperationContext): void {
  const { data, operation } = ctx
  const { row, index } = operation.payload as { row: Row; index: number }
  data.rows.splice(index, 0, row)
}

export function applyRowDeleteRedo(ctx: OperationContext): void {
  const { data, operation } = ctx
  const { index } = operation.payload as { row: Row; index: number }
  data.rows.splice(index, 1)
}

export function applyRowMoveUndo(ctx: OperationContext): void {
  const { data, operation } = ctx
  const { fromIndex, toIndex } = operation.payload as { fromIndex: number; toIndex: number }
  const [row] = data.rows.splice(toIndex, 1)
  data.rows.splice(fromIndex, 0, row)
}

export function applyRowMoveRedo(ctx: OperationContext): void {
  const { data, operation } = ctx
  const { fromIndex, toIndex } = operation.payload as { fromIndex: number; toIndex: number }
  const [row] = data.rows.splice(fromIndex, 1)
  data.rows.splice(toIndex, 0, row)
}

export function applyColumnAddUndo(ctx: OperationContext): void {
  const { data, operation } = ctx
  const payload = operation.payload as { column: Column; index?: number }
  const removeIndex = payload.index ?? data.columns.length - 1
  data.columns.splice(removeIndex, 1)
  for (const row of data.rows) {
    delete row.cells[payload.column.key]
  }
}

export function applyColumnAddRedo(ctx: OperationContext): void {
  const { data, operation } = ctx
  const { column, index } = operation.payload as { column: Column; index?: number }
  if (index !== undefined) {
    data.columns.splice(index, 0, column)
  } else {
    data.columns.push(column)
  }
  for (const row of data.rows) {
    row.cells[column.key] = {
      value: (column.defaultValue as CellValue) ?? null,
    }
  }
}

export function applyColumnDeleteUndo(ctx: OperationContext): void {
  const { data, operation } = ctx
  const { column, index } = operation.payload as { column: Column; index: number }
  data.columns.splice(index, 0, column)
  for (const row of data.rows) {
    row.cells[column.key] = {
      value: (column.defaultValue as CellValue) ?? null,
    }
  }
}

export function applyColumnDeleteRedo(ctx: OperationContext): void {
  const { data, operation } = ctx
  const { column, index } = operation.payload as { column: Column; index: number }
  data.columns.splice(index, 1)
  for (const row of data.rows) {
    delete row.cells[column.key]
  }
}

export function applyColumnMoveUndo(ctx: OperationContext): void {
  const { data, operation } = ctx
  const { fromIndex, toIndex } = operation.payload as { fromIndex: number; toIndex: number }
  const [col] = data.columns.splice(toIndex, 1)
  data.columns.splice(fromIndex, 0, col)
}

export function applyColumnMoveRedo(ctx: OperationContext): void {
  const { data, operation } = ctx
  const { fromIndex, toIndex } = operation.payload as { fromIndex: number; toIndex: number }
  const [col] = data.columns.splice(fromIndex, 1)
  data.columns.splice(toIndex, 0, col)
}

export function applyColumnResizeUndo(ctx: OperationContext): void {
  const { data, operation } = ctx
  const { columnKey, oldWidth } = operation.payload as {
    columnKey: string
    oldWidth: number | undefined
  }
  const column = data.columns.find((col) => col.key === columnKey)
  if (column) {
    column.width = oldWidth
  }
}

export function applyColumnResizeRedo(ctx: OperationContext): void {
  const { data, operation } = ctx
  const { columnKey, width } = operation.payload as { columnKey: string; width: number }
  const column = data.columns.find((col) => col.key === columnKey)
  if (column) {
    column.width = width
  }
}
