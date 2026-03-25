import type { Column, Row, Cell, Operation, TableData, CellValue } from '../types'
import { generateId } from '../utils'
import { HistoryManager } from './HistoryManager'
import {
  applyCellUpdateUndo,
  applyCellUpdateRedo,
  applyRowAddUndo,
  applyRowAddRedo,
  applyRowDeleteUndo,
  applyRowDeleteRedo,
  applyRowMoveUndo,
  applyRowMoveRedo,
  applyColumnAddUndo,
  applyColumnAddRedo,
  applyColumnDeleteUndo,
  applyColumnDeleteRedo,
  applyColumnMoveUndo,
  applyColumnMoveRedo,
  applyColumnResizeUndo,
  applyColumnResizeRedo,
  type OperationContext,
} from './operations'

export class DataManager {
  private data: TableData
  private historyManager: HistoryManager

  constructor(initialData: TableData) {
    this.data = initialData
    this.historyManager = new HistoryManager(
      { maxSize: 100 },
      this.applyUndo.bind(this),
      this.applyRedo.bind(this)
    )
  }

  getData(): TableData {
    return this.data
  }

  getRows(): Row[] {
    return this.data.rows
  }

  getColumns(): Column[] {
    return this.data.columns
  }

  getCellValue(rowIndex: number, columnKey: string): unknown {
    const row = this.data.rows[rowIndex]
    return row?.cells[columnKey]?.value
  }

  setCellValue(rowIndex: number, columnKey: string, value: CellValue): void {
    const oldValue = this.getCellValue(rowIndex, columnKey)

    this.data.rows[rowIndex].cells[columnKey] = {
      ...this.data.rows[rowIndex].cells[columnKey],
      value,
    }

    this.recordOperation({
      type: 'cell-update',
      payload: { rowIndex, columnKey, oldValue, newValue: value },
      timestamp: Date.now(),
    })
  }

  addRow(row?: Partial<Row>, index?: number): Row {
    const newRow: Row = {
      id: row?.id ?? generateId(),
      cells: row?.cells ?? this.createEmptyCells(),
      ...row,
    }

    if (index !== undefined) {
      this.data.rows.splice(index, 0, newRow)
    } else {
      this.data.rows.push(newRow)
    }

    this.recordOperation({
      type: 'row-add',
      payload: { row: newRow, index },
      timestamp: Date.now(),
    })

    return newRow
  }

  deleteRow(rowIndex: number): Row | null {
    if (rowIndex < 0 || rowIndex >= this.data.rows.length) {
      return null
    }

    const [deletedRow] = this.data.rows.splice(rowIndex, 1)

    this.recordOperation({
      type: 'row-delete',
      payload: { row: deletedRow, index: rowIndex },
      timestamp: Date.now(),
    })

    return deletedRow
  }

  deleteRows(rowIndices: number[]): Row[] {
    const deletedRows: Row[] = []
    const sortedIndices = [...rowIndices].sort((a, b) => b - a)

    for (const index of sortedIndices) {
      const [row] = this.data.rows.splice(index, 1)
      if (row) deletedRows.push(row)
    }

    this.recordOperation({
      type: 'row-delete',
      payload: { rows: deletedRows, indices: rowIndices },
      timestamp: Date.now(),
    })

    return deletedRows
  }

  moveRow(fromIndex: number, toIndex: number): void {
    const [row] = this.data.rows.splice(fromIndex, 1)
    this.data.rows.splice(toIndex, 0, row)

    this.recordOperation({
      type: 'row-move',
      payload: { fromIndex, toIndex },
      timestamp: Date.now(),
    })
  }

  addColumn(column: Column, index?: number): void {
    if (index !== undefined) {
      this.data.columns.splice(index, 0, column)
    } else {
      this.data.columns.push(column)
    }

    for (const row of this.data.rows) {
      row.cells[column.key] = {
        value: (column.defaultValue as CellValue) ?? null,
      }
    }

    this.recordOperation({
      type: 'column-add',
      payload: { column, index },
      timestamp: Date.now(),
    })
  }

  deleteColumn(columnKey: string): Column | null {
    const index = this.data.columns.findIndex((col) => col.key === columnKey)
    if (index === -1) return null

    const [deletedColumn] = this.data.columns.splice(index, 1)

    for (const row of this.data.rows) {
      delete row.cells[columnKey]
    }

    this.recordOperation({
      type: 'column-delete',
      payload: { column: deletedColumn, index },
      timestamp: Date.now(),
    })

    return deletedColumn
  }

  setColumnWidth(columnKey: string, width: number): void {
    const column = this.data.columns.find((col) => col.key === columnKey)
    const oldWidth = column?.width
    if (column) {
      column.width = width
    }

    this.recordOperation({
      type: 'column-resize',
      payload: { columnKey, width, oldWidth },
      timestamp: Date.now(),
    })
  }

  moveColumn(fromIndex: number, toIndex: number): void {
    const [column] = this.data.columns.splice(fromIndex, 1)
    this.data.columns.splice(toIndex, 0, column)

    this.recordOperation({
      type: 'column-move',
      payload: { fromIndex, toIndex },
      timestamp: Date.now(),
    })
  }

  undo(): Operation | null {
    return this.historyManager.undo({ data: this.data, operation: null as unknown as Operation })
  }

  redo(): Operation | null {
    return this.historyManager.redo({ data: this.data, operation: null as unknown as Operation })
  }

  canUndo(): boolean {
    return this.historyManager.canUndo()
  }

  canRedo(): boolean {
    return this.historyManager.canRedo()
  }

  private createEmptyCells(): Record<string, Cell> {
    const cells: Record<string, Cell> = {}
    for (const column of this.data.columns) {
      cells[column.key] = {
        value: (column.defaultValue as CellValue) ?? null,
      }
    }
    return cells
  }

  private recordOperation(operation: Operation): void {
    this.historyManager.record(operation)
  }

  private applyUndo(ctx: OperationContext): void {
    const { operation } = ctx
    switch (operation.type) {
      case 'cell-update':
        applyCellUpdateUndo(ctx)
        break
      case 'row-add':
        applyRowAddUndo(ctx)
        break
      case 'row-delete':
        applyRowDeleteUndo(ctx)
        break
      case 'row-move':
        applyRowMoveUndo(ctx)
        break
      case 'column-add':
        applyColumnAddUndo(ctx)
        break
      case 'column-delete':
        applyColumnDeleteUndo(ctx)
        break
      case 'column-move':
        applyColumnMoveUndo(ctx)
        break
      case 'column-resize':
        applyColumnResizeUndo(ctx)
        break
    }
  }

  private applyRedo(ctx: OperationContext): void {
    const { operation } = ctx
    switch (operation.type) {
      case 'cell-update':
        applyCellUpdateRedo(ctx)
        break
      case 'row-add':
        applyRowAddRedo(ctx)
        break
      case 'row-delete':
        applyRowDeleteRedo(ctx)
        break
      case 'row-move':
        applyRowMoveRedo(ctx)
        break
      case 'column-add':
        applyColumnAddRedo(ctx)
        break
      case 'column-delete':
        applyColumnDeleteRedo(ctx)
        break
      case 'column-move':
        applyColumnMoveRedo(ctx)
        break
      case 'column-resize':
        applyColumnResizeRedo(ctx)
        break
    }
  }
}
