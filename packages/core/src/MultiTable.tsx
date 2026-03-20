import type { FC } from 'react'
import { extractColumns, type TableProps } from '@multi-table/shared'

export type { TableProps as MultiTableProps }

export const MultiTable: FC<TableProps> = ({ data, columns, bordered, striped, hoverable }) => {
  const displayColumns = columns ?? extractColumns(data)

  return (
    <div className="multi-table">
      <table
        className={[
          bordered ? 'multi-table--bordered' : '',
          striped ? 'multi-table--striped' : '',
          hoverable ? 'multi-table--hoverable' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <thead>
          <tr>
            {displayColumns.map((col) => (
              <th key={col}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={(row as { id?: string | number }).id ?? index}>
              {displayColumns.map((col) => (
                <td key={col}>{String(row[col] ?? '')}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
