import type { FC, CSSProperties, MouseEvent } from 'react'
import type { Cell, CellValue, Column, SelectOption } from '@multi-table/shared'

export interface TableCellProps {
  cell: Cell
  column: Column
  rowIndex: number
  colIndex: number
  style?: CSSProperties
  className?: string
  selected?: boolean
  active?: boolean
  onMouseDown?: (e: MouseEvent) => void
  onMouseEnter?: (e: MouseEvent) => void
}

function formatCellValue(value: CellValue, column: Column): React.ReactNode {
  if (value === null || value === undefined) {
    return null
  }

  switch (column.type) {
    case 'number':
      return (
        <span className="multi-table-cell--number">
          {typeof value === 'number' ? value.toLocaleString() : String(value)}
        </span>
      )

    case 'checkbox':
      return (
        <span className="multi-table-cell--checkbox">
          <input type="checkbox" checked={Boolean(value)} readOnly />
        </span>
      )

    case 'select':
      if (Array.isArray(value) && value.length > 0) {
        const option = value[0] as SelectOption
        return (
          <span className="multi-table-cell--select">
            <span
              className="multi-table-cell-select-badge"
              style={{ backgroundColor: option.color || '#e5e7eb' }}
            >
              {option.label}
            </span>
          </span>
        )
      }
      return null

    case 'multiSelect':
      if (Array.isArray(value) && value.length > 0) {
        return (
          <span className="multi-table-cell--select">
            {(value as SelectOption[]).map((opt, idx) => (
              <span
                key={idx}
                className="multi-table-cell-select-badge"
                style={{
                  backgroundColor: opt.color || '#e5e7eb',
                  marginRight: idx < (value as SelectOption[]).length - 1 ? '4px' : 0,
                }}
              >
                {opt.label}
              </span>
            ))}
          </span>
        )
      }
      return null

    case 'date':
      if (value instanceof Date) {
        return <span className="multi-table-cell--date">{value.toLocaleDateString()}</span>
      }
      if (typeof value === 'string') {
        return (
          <span className="multi-table-cell--date">{new Date(value).toLocaleDateString()}</span>
        )
      }
      return String(value)

    case 'url':
      if (typeof value === 'string') {
        return (
          <a
            href={value}
            className="multi-table-cell--url"
            target="_blank"
            rel="noopener noreferrer"
          >
            {value}
          </a>
        )
      }
      return String(value)

    case 'email':
      if (typeof value === 'string') {
        return (
          <a href={`mailto:${value}`} className="multi-table-cell--url">
            {value}
          </a>
        )
      }
      return String(value)

    default:
      return <span className="multi-table-cell--text">{String(value)}</span>
  }
}

export const TableCell: FC<TableCellProps> = ({
  cell,
  column,
  style,
  className = '',
  selected,
  active,
  onMouseDown,
  onMouseEnter,
}) => {
  const cellClassName = [
    'multi-table-body-cell',
    className,
    selected ? 'multi-table-body-cell--selected' : '',
    active ? 'multi-table-body-cell--active' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <td
      className={cellClassName}
      style={style}
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
      tabIndex={active ? 0 : -1}
    >
      {formatCellValue(cell.value, column)}
    </td>
  )
}
