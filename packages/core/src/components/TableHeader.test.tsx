import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TableHeader } from './TableHeader'
import type { Column } from '@multi-table/shared'

const createTestColumns = (): Column[] => [
  { key: 'name', type: 'text', title: 'Name', width: 150 },
  { key: 'age', type: 'number', title: 'Age', width: 80 },
  { key: 'active', type: 'checkbox', title: 'Active', width: 80 },
]

describe('TableHeader', () => {
  it('should render all column titles', () => {
    render(<TableHeader columns={createTestColumns()} />)

    expect(screen.getByText('Name')).toBeDefined()
    expect(screen.getByText('Age')).toBeDefined()
    expect(screen.getByText('Active')).toBeDefined()
  })

  it('should show row number column when showRowNumber is true', () => {
    render(<TableHeader columns={createTestColumns()} showRowNumber />)

    expect(screen.getByText('#')).toBeDefined()
  })

  it('should not show row number column by default', () => {
    render(<TableHeader columns={createTestColumns()} />)

    expect(screen.queryByText('#')).toBeNull()
  })

  it('should display field type labels', () => {
    render(<TableHeader columns={createTestColumns()} />)

    expect(screen.getByText('Text')).toBeDefined()
    expect(screen.getByText('Number')).toBeDefined()
    expect(screen.getByText('Checkbox')).toBeDefined()
  })

  it('should render with custom style', () => {
    const { container } = render(
      <TableHeader columns={createTestColumns()} style={{ height: 50 }} />
    )

    const thead = container.querySelector('thead')
    expect(thead).toBeDefined()
  })

  it('should handle columns without type', () => {
    const columns: Column[] = [
      { key: 'name', type: 'text', title: 'Name' },
      { key: 'custom', title: 'Custom' } as Column,
    ]

    render(<TableHeader columns={columns} />)

    expect(screen.getByText('Name')).toBeDefined()
    expect(screen.getByText('Custom')).toBeDefined()
  })
})
