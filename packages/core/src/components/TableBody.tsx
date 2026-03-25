import type { FC, CSSProperties } from 'react'
import type { Row, Column, Cell } from '@multi-table/shared'
import { TableCell } from './TableCell'

export interface TableBodyProps {
  rows: Row[]
  columns: Column[]
  showRowNumber?: boolean
  striped?: boolean
  style?: CSSProperties
}

export const TableBody: FC<TableBodyProps> = ({
  rows,
  columns,
  showRowNumber = false,
  striped = false,
  style,
}) => {
  if (rows.length === 0) {
    return (
      <tbody>
        <tr>
          <td colSpan={columns.length + (showRowNumber ? 1 : 0)} className="multi-table-empty">
            <div className="multi-table-empty-icon">📋</div>
            <div>No data available</div>
          </td>
        </tr>
      </tbody>
    )
  }

  return (
    <tbody className={striped ? 'multi-table--striped' : ''} style={style}>
      {rows.map((row, rowIndex) => (
        <tr key={row.id} className="multi-table-body-row">
          {showRowNumber && (
            <td className="multi-table-body-cell multi-table-row-number">{rowIndex + 1}</td>
          )}
          {columns.map((column) => {
            const cell: Cell = row.cells[column.key] || { value: null }
            return (
              <TableCell
                key={`${row.id}-${column.key}`}
                cell={cell}
                column={column}
                rowIndex={rowIndex}
              />
            )
          })}
        </tr>
      ))}
    </tbody>
  )
}
