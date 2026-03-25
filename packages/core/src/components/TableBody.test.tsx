import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TableBody } from './TableBody'
import type { Row, Column } from '@multi-table/shared'

const createTestColumns = (): Column[] => [
  { key: 'name', type: 'text', title: 'Name' },
  { key: 'age', type: 'number', title: 'Age' },
  { key: 'active', type: 'checkbox', title: 'Active' },
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

describe('TableBody', () => {
  it('should render all rows', () => {
    render(<TableBody rows={createTestRows()} columns={createTestColumns()} />)

    expect(screen.getByText('Alice')).toBeDefined()
    expect(screen.getByText('Bob')).toBeDefined()
  })

  it('should show row numbers when showRowNumber is true', () => {
    render(<TableBody rows={createTestRows()} columns={createTestColumns()} showRowNumber />)

    expect(screen.getByText('1')).toBeDefined()
    expect(screen.getByText('2')).toBeDefined()
  })

  it('should show empty state when no rows', () => {
    render(<TableBody rows={[]} columns={createTestColumns()} />)

    expect(screen.getByText('No data available')).toBeDefined()
  })

  it('should handle missing cells gracefully', () => {
    const rows: Row[] = [
      {
        id: 'row-1',
        cells: {
          name: { value: 'Alice' },
        },
      },
    ]

    render(<TableBody rows={rows} columns={createTestColumns()} />)

    expect(screen.getByText('Alice')).toBeDefined()
  })

  it('should render number cells with formatting', () => {
    const rows: Row[] = [
      {
        id: 'row-1',
        cells: {
          name: { value: 'Alice' },
          age: { value: 1234567 },
          active: { value: true },
        },
      },
    ]

    render(<TableBody rows={rows} columns={createTestColumns()} />)

    expect(screen.getByText('1,234,567')).toBeDefined()
  })

  it('should render checkbox cells', () => {
    const rows = createTestRows()
    const { container } = render(<TableBody rows={rows} columns={createTestColumns()} />)

    const checkboxes = container.querySelectorAll('input[type="checkbox"]')
    expect(checkboxes.length).toBe(2)
  })
})
