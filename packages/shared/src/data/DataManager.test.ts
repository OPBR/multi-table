import { describe, it, expect, beforeEach } from 'vitest'
import { DataManager } from '../data/DataManager'
import type { TableData, Column, Row } from '../types'

const createTestColumns = (): Column[] => [
  { key: 'name', type: 'text', title: 'Name', width: 150 },
  { key: 'age', type: 'number', title: 'Age', width: 80 },
  { key: 'active', type: 'checkbox', title: 'Active', width: 80 },
]

const createTestRows = (): Row[] => [
  {
    id: 'row-1',
    cells: {
      name: { value: 'Alice' },
      age: { value: 25 },
      active: { value: true },
    },
  },
  {
    id: 'row-2',
    cells: {
      name: { value: 'Bob' },
      age: { value: 30 },
      active: { value: false },
    },
  },
]

const createTestData = (): TableData => ({
  id: 'test-table',
  name: 'Test Table',
  columns: createTestColumns(),
  rows: createTestRows(),
})

describe('DataManager', () => {
  let manager: DataManager

  beforeEach(() => {
    manager = new DataManager(createTestData())
  })

  describe('getData', () => {
    it('should return table data', () => {
      const data = manager.getData()
      expect(data.id).toBe('test-table')
      expect(data.name).toBe('Test Table')
    })
  })

  describe('getRows', () => {
    it('should return all rows', () => {
      const rows = manager.getRows()
      expect(rows).toHaveLength(2)
      expect(rows[0].id).toBe('row-1')
    })
  })

  describe('getColumns', () => {
    it('should return all columns', () => {
      const columns = manager.getColumns()
      expect(columns).toHaveLength(3)
      expect(columns[0].key).toBe('name')
    })
  })

  describe('getCellValue', () => {
    it('should return cell value', () => {
      expect(manager.getCellValue(0, 'name')).toBe('Alice')
      expect(manager.getCellValue(0, 'age')).toBe(25)
    })

    it('should return undefined for non-existent cell', () => {
      expect(manager.getCellValue(10, 'name')).toBeUndefined()
      expect(manager.getCellValue(0, 'nonexistent')).toBeUndefined()
    })
  })

  describe('setCellValue', () => {
    it('should update cell value', () => {
      manager.setCellValue(0, 'name', 'Charlie')
      expect(manager.getCellValue(0, 'name')).toBe('Charlie')
    })

    it('should record operation for undo', () => {
      manager.setCellValue(0, 'name', 'Charlie')
      expect(manager.canUndo()).toBe(true)
    })
  })

  describe('addRow', () => {
    it('should add row at the end', () => {
      const newRow = manager.addRow()
      expect(manager.getRows()).toHaveLength(3)
      expect(manager.getRows()[2].id).toBe(newRow.id)
    })

    it('should add row at specific index', () => {
      const newRow = manager.addRow({}, 1)
      const rows = manager.getRows()
      expect(rows).toHaveLength(3)
      expect(rows[1].id).toBe(newRow.id)
    })

    it('should create empty cells for all columns', () => {
      const newRow = manager.addRow()
      expect(newRow.cells.name).toBeDefined()
      expect(newRow.cells.age).toBeDefined()
      expect(newRow.cells.active).toBeDefined()
    })
  })

  describe('deleteRow', () => {
    it('should delete row by index', () => {
      const deleted = manager.deleteRow(0)
      expect(deleted?.id).toBe('row-1')
      expect(manager.getRows()).toHaveLength(1)
    })

    it('should return null for invalid index', () => {
      expect(manager.deleteRow(-1)).toBeNull()
      expect(manager.deleteRow(10)).toBeNull()
    })
  })

  describe('deleteRows', () => {
    it('should delete multiple rows', () => {
      manager.addRow()
      manager.addRow()
      const deleted = manager.deleteRows([0, 2])
      expect(deleted).toHaveLength(2)
      expect(manager.getRows()).toHaveLength(2)
    })
  })

  describe('moveRow', () => {
    it('should move row from one position to another', () => {
      manager.moveRow(0, 1)
      const rows = manager.getRows()
      expect(rows[0].id).toBe('row-2')
      expect(rows[1].id).toBe('row-1')
    })
  })

  describe('addColumn', () => {
    it('should add column at the end', () => {
      const newColumn: Column = { key: 'email', type: 'text', title: 'Email' }
      manager.addColumn(newColumn)
      expect(manager.getColumns()).toHaveLength(4)
      expect(manager.getColumns()[3].key).toBe('email')
    })

    it('should add column at specific index', () => {
      const newColumn: Column = { key: 'email', type: 'text', title: 'Email' }
      manager.addColumn(newColumn, 1)
      expect(manager.getColumns()[1].key).toBe('email')
    })

    it('should add cell to all rows', () => {
      const newColumn: Column = {
        key: 'email',
        type: 'text',
        title: 'Email',
        defaultValue: 'test@test.com',
      }
      manager.addColumn(newColumn)
      const rows = manager.getRows()
      expect(rows[0].cells.email?.value).toBe('test@test.com')
    })
  })

  describe('deleteColumn', () => {
    it('should delete column by key', () => {
      const deleted = manager.deleteColumn('age')
      expect(deleted?.key).toBe('age')
      expect(manager.getColumns()).toHaveLength(2)
    })

    it('should remove cells from all rows', () => {
      manager.deleteColumn('name')
      const rows = manager.getRows()
      expect(rows[0].cells.name).toBeUndefined()
    })

    it('should return null for non-existent column', () => {
      expect(manager.deleteColumn('nonexistent')).toBeNull()
    })
  })

  describe('setColumnWidth', () => {
    it('should update column width', () => {
      manager.setColumnWidth('name', 200)
      const column = manager.getColumns().find((c) => c.key === 'name')
      expect(column?.width).toBe(200)
    })
  })

  describe('moveColumn', () => {
    it('should move column from one position to another', () => {
      manager.moveColumn(0, 2)
      const columns = manager.getColumns()
      expect(columns[2].key).toBe('name')
    })
  })

  describe('undo/redo', () => {
    it('should undo cell update', () => {
      manager.setCellValue(0, 'name', 'Charlie')
      manager.undo()
      expect(manager.getCellValue(0, 'name')).toBe('Alice')
    })

    it('should redo cell update', () => {
      manager.setCellValue(0, 'name', 'Charlie')
      manager.undo()
      manager.redo()
      expect(manager.getCellValue(0, 'name')).toBe('Charlie')
    })

    it('should undo row add', () => {
      manager.addRow()
      expect(manager.getRows()).toHaveLength(3)
      manager.undo()
      expect(manager.getRows()).toHaveLength(2)
    })

    it('should undo row delete', () => {
      manager.deleteRow(0)
      expect(manager.getRows()).toHaveLength(1)
      manager.undo()
      expect(manager.getRows()).toHaveLength(2)
      expect(manager.getRows()[0].id).toBe('row-1')
    })

    it('should track canUndo/canRedo correctly', () => {
      expect(manager.canUndo()).toBe(false)
      expect(manager.canRedo()).toBe(false)

      manager.setCellValue(0, 'name', 'Charlie')
      expect(manager.canUndo()).toBe(true)
      expect(manager.canRedo()).toBe(false)

      manager.undo()
      expect(manager.canUndo()).toBe(false)
      expect(manager.canRedo()).toBe(true)
    })

    it('should clear redo history on new operation', () => {
      manager.setCellValue(0, 'name', 'Charlie')
      manager.setCellValue(0, 'age', 99)
      manager.undo()
      manager.undo()
      expect(manager.canRedo()).toBe(true)

      manager.setCellValue(0, 'active', false)
      expect(manager.canRedo()).toBe(false)
    })
  })
})
