import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TableCell } from './TableCell'
import type { Cell, Column, SelectOption } from '@multi-table/shared'

describe('TableCell', () => {
  const createCell = (value: unknown): Cell => ({ value })
  const createColumn = (type: Column['type'], key = 'test'): Column => ({
    key,
    type,
    title: key,
  })

  it('should render text value', () => {
    render(
      <TableCell cell={createCell('Hello World')} column={createColumn('text')} rowIndex={0} />
    )

    expect(screen.getByText('Hello World')).toBeDefined()
  })

  it('should render number value with formatting', () => {
    render(<TableCell cell={createCell(1234567)} column={createColumn('number')} rowIndex={0} />)

    expect(screen.getByText('1,234,567')).toBeDefined()
  })

  it('should render checkbox checked', () => {
    const { container } = render(
      <TableCell cell={createCell(true)} column={createColumn('checkbox')} rowIndex={0} />
    )

    const checkbox = container.querySelector('input[type="checkbox"]')
    expect(checkbox?.checked).toBe(true)
  })

  it('should render checkbox unchecked', () => {
    const { container } = render(
      <TableCell cell={createCell(false)} column={createColumn('checkbox')} rowIndex={0} />
    )

    const checkbox = container.querySelector('input[type="checkbox"]')
    expect(checkbox?.checked).toBe(false)
  })

  it('should render select value as badge', () => {
    const option: SelectOption = { label: 'Active', value: 'active', color: '#d1fae5' }
    render(<TableCell cell={createCell([option])} column={createColumn('select')} rowIndex={0} />)

    expect(screen.getByText('Active')).toBeDefined()
  })

  it('should render multiSelect values', () => {
    const options: SelectOption[] = [
      { label: 'Tag1', value: 'tag1' },
      { label: 'Tag2', value: 'tag2' },
    ]
    render(
      <TableCell cell={createCell(options)} column={createColumn('multiSelect')} rowIndex={0} />
    )

    expect(screen.getByText('Tag1')).toBeDefined()
    expect(screen.getByText('Tag2')).toBeDefined()
  })

  it('should render email as mailto link', () => {
    render(
      <TableCell
        cell={createCell('test@example.com')}
        column={createColumn('email')}
        rowIndex={0}
      />
    )

    const link = screen.getByText('test@example.com')
    expect(link.getAttribute('href')).toBe('mailto:test@example.com')
  })

  it('should render url as link', () => {
    render(
      <TableCell
        cell={createCell('https://example.com')}
        column={createColumn('url')}
        rowIndex={0}
      />
    )

    const link = screen.getByText('https://example.com')
    expect(link.getAttribute('href')).toBe('https://example.com')
    expect(link.getAttribute('target')).toBe('_blank')
  })

  it('should render null value', () => {
    const { container } = render(
      <TableCell cell={createCell(null)} column={createColumn('text')} rowIndex={0} />
    )

    expect(container.textContent).toBe('')
  })

  it('should render undefined value', () => {
    const { container } = render(
      <TableCell cell={createCell(undefined)} column={createColumn('text')} rowIndex={0} />
    )

    expect(container.textContent).toBe('')
  })

  it('should apply selected class', () => {
    const { container } = render(
      <TableCell cell={createCell('test')} column={createColumn('text')} rowIndex={0} selected />
    )

    expect(container.querySelector('.multi-table-body-cell--selected')).toBeDefined()
  })

  it('should apply active class', () => {
    const { container } = render(
      <TableCell cell={createCell('test')} column={createColumn('text')} rowIndex={0} active />
    )

    expect(container.querySelector('.multi-table-body-cell--active')).toBeDefined()
  })

  it('should apply custom className', () => {
    const { container } = render(
      <TableCell
        cell={createCell('test')}
        column={createColumn('text')}
        rowIndex={0}
        className="custom-cell"
      />
    )

    expect(container.querySelector('.custom-cell')).toBeDefined()
  })

  it('should apply custom style', () => {
    const { container } = render(
      <TableCell
        cell={createCell('test')}
        column={createColumn('text')}
        rowIndex={0}
        style={{ width: 100 }}
      />
    )

    const cell = container.querySelector('td')
    expect(cell?.style.width).toBe('100px')
  })
})
