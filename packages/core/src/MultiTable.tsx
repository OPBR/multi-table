import type { FC, CSSProperties, MouseEvent } from 'react'
import type { TableData } from '@multi-table/shared'
import { TableHeader, TableBody } from './components'
import { useSelection } from './hooks'
import './styles.css'

export type ThemeMode = 'light' | 'dark' | 'system'

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
  theme?: ThemeMode
  selectable?: boolean
  onSelectionChange?: (selection: {
    activeCell: { row: number; col: number } | null
    selectionRange: { startRow: number; startCol: number; endRow: number; endCol: number } | null
  }) => void
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
  theme = 'system',
  selectable = true,
  onSelectionChange,
}) => {
  const { columns, rows } = data

  const {
    handleCellMouseDown,
    handleCellMouseEnter,
    handleMouseUp,
    handleKeyDown,
    isSelected,
    isActive,
  } = useSelection({
    rowCount: rows.length,
    colCount: columns.length,
    onSelect: onSelectionChange
      ? (sel) => {
          onSelectionChange({
            activeCell: sel.activeCell,
            selectionRange: sel.selectionRange,
          })
        }
      : undefined,
  })

  const tableClassName = [
    'multi-table',
    `multi-table--theme-${theme}`,
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

  const onCellMouseDown = (row: number, col: number, e: MouseEvent) => {
    handleCellMouseDown(row, col, e.shiftKey)
  }

  return (
    <div
      className={tableClassName}
      style={style}
      tabIndex={selectable ? 0 : undefined}
      onKeyDown={selectable ? handleKeyDown : undefined}
      onMouseUp={selectable ? handleMouseUp : undefined}
    >
      <div className="multi-table-container">
        <table className="multi-table-table">
          <TableHeader columns={columns} showRowNumber={showRowNumber} style={headerStyle} />
          <TableBody
            rows={rows}
            columns={columns}
            showRowNumber={showRowNumber}
            striped={striped}
            style={rowStyle}
            isSelected={selectable ? isSelected : undefined}
            isActive={selectable ? isActive : undefined}
            onCellMouseDown={selectable ? onCellMouseDown : undefined}
            onCellMouseEnter={selectable ? handleCellMouseEnter : undefined}
          />
        </table>
      </div>
    </div>
  )
}

export type { MultiTableProps as TableProps }
