import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MultiTable } from './MultiTable'
import type { TableData } from '@multi-table/shared'

const createTestData = (): TableData => ({
  id: 'test-table',
  name: 'Test Table',
  columns: [
    { key: 'name', type: 'text', title: 'Name', width: 150 },
    { key: 'age', type: 'number', title: 'Age', width: 80 },
    { key: 'active', type: 'checkbox', title: 'Active', width: 80 },
  ],
  rows: [
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
  ],
})

describe('MultiTable', () => {
  it('should render table with data', () => {
    render(<MultiTable data={createTestData()} />)

    expect(screen.getByText('Alice')).toBeDefined()
    expect(screen.getByText('Bob')).toBeDefined()
  })

  it('should render column headers', () => {
    render(<MultiTable data={createTestData()} />)

    expect(screen.getByText('Name')).toBeDefined()
    expect(screen.getByText('Age')).toBeDefined()
    expect(screen.getByText('Active')).toBeDefined()
  })

  it('should show row numbers by default', () => {
    render(<MultiTable data={createTestData()} />)

    expect(screen.getByText('1')).toBeDefined()
    expect(screen.getByText('2')).toBeDefined()
  })

  it('should hide row numbers when showRowNumber is false', () => {
    render(<MultiTable data={createTestData()} showRowNumber={false} />)

    expect(screen.queryByText('1')).toBeNull()
    expect(screen.queryByText('2')).toBeNull()
  })

  it('should apply striped class when striped is true', () => {
    const { container } = render(<MultiTable data={createTestData()} striped />)

    expect(container.querySelector('.multi-table--striped')).toBeDefined()
  })

  it('should render with custom className', () => {
    const { container } = render(<MultiTable data={createTestData()} className="custom-table" />)

    expect(container.querySelector('.custom-table')).toBeDefined()
  })

  it('should render with custom style', () => {
    const { container } = render(<MultiTable data={createTestData()} style={{ width: '100%' }} />)

    const table = container.querySelector('.multi-table')
    expect(table).toBeDefined()
  })

  it('should handle empty data', () => {
    const emptyData: TableData = {
      id: 'empty-table',
      name: 'Empty Table',
      columns: [{ key: 'name', type: 'text', title: 'Name' }],
      rows: [],
    }

    render(<MultiTable data={emptyData} />)

    expect(screen.getByText('No data available')).toBeDefined()
  })

  it('should render select type with badge', () => {
    const data: TableData = {
      id: 'test-table',
      name: 'Test Table',
      columns: [{ key: 'status', type: 'select', title: 'Status' }],
      rows: [
        {
          id: 'row-1',
          cells: {
            status: { value: [{ label: 'Active', value: 'active', color: '#d1fae5' }] },
          },
        },
      ],
    }

    render(<MultiTable data={data} />)

    expect(screen.getByText('Active')).toBeDefined()
  })

  it('should render email type as mailto link', () => {
    const data: TableData = {
      id: 'test-table',
      name: 'Test Table',
      columns: [{ key: 'email', type: 'email', title: 'Email' }],
      rows: [
        {
          id: 'row-1',
          cells: {
            email: { value: 'test@example.com' },
          },
        },
      ],
    }

    render(<MultiTable data={data} />)

    const link = screen.getByText('test@example.com')
    expect(link.getAttribute('href')).toBe('mailto:test@example.com')
  })

  it('should render url type as link', () => {
    const data: TableData = {
      id: 'test-table',
      name: 'Test Table',
      columns: [{ key: 'website', type: 'url', title: 'Website' }],
      rows: [
        {
          id: 'row-1',
          cells: {
            website: { value: 'https://example.com' },
          },
        },
      ],
    }

    render(<MultiTable data={data} />)

    const link = screen.getByText('https://example.com')
    expect(link.getAttribute('href')).toBe('https://example.com')
  })
})
