import type { FC, CSSProperties } from 'react'
import type { Column, FieldType } from '@multi-table/shared'

export interface TableHeaderProps {
  columns: Column[]
  showRowNumber?: boolean
  style?: CSSProperties
  onColumnResize?: (columnKey: string, width: number) => void
}

const fieldTypeLabels: Partial<Record<FieldType, string>> = {
  text: 'Text',
  textarea: 'Text',
  number: 'Number',
  select: 'Select',
  multiSelect: 'Multi-Select',
  date: 'Date',
  dateTime: 'DateTime',
  checkbox: 'Checkbox',
  url: 'URL',
  email: 'Email',
  phone: 'Phone',
  file: 'File',
  image: 'Image',
  user: 'User',
  relation: 'Relation',
  formula: 'Formula',
  autoNumber: 'Auto Number',
  createdTime: 'Created',
  updatedTime: 'Updated',
}

export const TableHeader: FC<TableHeaderProps> = ({ columns, showRowNumber = false, style }) => {
  return (
    <thead className="multi-table-header">
      <tr>
        {showRowNumber && (
          <th className="multi-table-header-cell multi-table-row-number" style={style}>
            #
          </th>
        )}
        {columns.map((column) => (
          <th
            key={column.key}
            className="multi-table-header-cell"
            style={{
              width: column.width,
              minWidth: column.width,
              ...style,
            }}
          >
            <div className="multi-table-header-cell-content">
              <span className="multi-table-header-cell-title">{column.title}</span>
              {column.type && (
                <span className="multi-table-header-cell-type">
                  {fieldTypeLabels[column.type] || column.type}
                </span>
              )}
            </div>
          </th>
        ))}
      </tr>
    </thead>
  )
}
