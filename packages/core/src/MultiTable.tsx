import type { FC, CSSProperties } from 'react'
import type { TableData } from '@multi-table/shared'
import { TableHeader, TableBody } from './components'
import './styles.css'

export interface MultiTableProps {
  data: TableData
  className?: string
  style?: CSSProperties
  showRowNumber?: boolean
  striped?: boolean
  bordered?: boolean
  hoverable?: boolean
  rowHeight?: number
  headerHeight?: number
}

export const MultiTable: FC<MultiTableProps> = ({
  data,
  className = '',
  style,
  showRowNumber = true,
  striped = true,
  bordered = true,
  hoverable = true,
  rowHeight = 40,
  headerHeight = 44,
}) => {
  const { columns, rows } = data

  const tableClassName = [
    'multi-table',
    bordered ? '' : 'multi-table--no-border',
    striped ? 'multi-table--striped' : '',
    hoverable ? '' : 'multi-table--no-hover',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const rowStyle: CSSProperties = {
    height: rowHeight,
  }

  const headerStyle: CSSProperties = {
    height: headerHeight,
  }

  return (
    <div className={tableClassName} style={style}>
      <div className="multi-table-container">
        <table className="multi-table-table">
          <TableHeader columns={columns} showRowNumber={showRowNumber} style={headerStyle} />
          <TableBody
            rows={rows}
            columns={columns}
            showRowNumber={showRowNumber}
            striped={striped}
            style={rowStyle}
          />
        </table>
      </div>
    </div>
  )
}

export type { MultiTableProps as TableProps }
