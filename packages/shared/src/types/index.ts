/**
 * 字段类型枚举
 */
export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'select'
  | 'multiSelect'
  | 'date'
  | 'dateTime'
  | 'checkbox'
  | 'url'
  | 'email'
  | 'phone'
  | 'file'
  | 'image'
  | 'user'
  | 'relation'
  | 'formula'
  | 'autoNumber'
  | 'createdTime'
  | 'updatedTime'

/**
 * 选择项配置
 */
export interface SelectOption {
  label: string
  value: string
  color?: string
}

/**
 * 列配置
 */
export interface Column {
  /** 列唯一标识 */
  key: string
  /** 列类型 */
  type: FieldType
  /** 显示标题 */
  title: string
  /** 列宽度 */
  width?: number
  /** 是否固定列 */
  fixed?: 'left' | 'right'
  /** 是否可排序 */
  sortable?: boolean
  /** 是否可编辑 */
  editable?: boolean
  /** 是否可见 */
  visible?: boolean
  /** 选择类型选项 */
  options?: SelectOption[]
  /** 数字精度 */
  precision?: number
  /** 日期格式 */
  dateFormat?: string
  /** 默认值 */
  defaultValue?: unknown
  /** 计算公式（formula 类型） */
  formula?: string
  /** 关联表 ID（relation 类型） */
  relationTableId?: string
}

/**
 * 单元格值类型
 */
export type CellValue = string | number | boolean | null | undefined | SelectOption[] | File[]

/**
 * 单元格数据
 */
export interface Cell {
  /** 单元格值 */
  value: CellValue
  /** 是否正在编辑 */
  editing?: boolean
  /** 校验错误信息 */
  error?: string
}

/**
 * 行数据
 */
export interface Row {
  /** 行唯一标识 */
  id: string
  /** 单元格数据，key 为列标识 */
  cells: Record<string, Cell>
  /** 行索引（虚拟滚动用） */
  index?: number
  /** 是否选中 */
  selected?: boolean
  /** 是否展开（有子行时） */
  expanded?: boolean
  /** 父行 ID（树形结构） */
  parentId?: string | null
  /** 子行 */
  children?: Row[]
}

/**
 * 表格数据
 */
export interface TableData {
  /** 表格 ID */
  id: string
  /** 表格名称 */
  name: string
  /** 列配置 */
  columns: Column[]
  /** 行数据 */
  rows: Row[]
  /** 创建时间 */
  createdAt?: string
  /** 更新时间 */
  updatedAt?: string
  /** 创建者 */
  createdBy?: string
}

/**
 * 选择范围
 */
export interface SelectionRange {
  /** 起始行索引 */
  startRow: number
  /** 起始列索引 */
  startCol: number
  /** 结束行索引 */
  endRow: number
  /** 结束列索引 */
  endCol: number
}

/**
 * 选择状态
 */
export interface Selection {
  /** 当前激活单元格 */
  activeCell?: { row: number; col: number }
  /** 选择范围 */
  ranges: SelectionRange[]
  /** 选中的行 ID */
  selectedRows: string[]
}

/**
 * 表格状态
 */
export interface TableState {
  /** 表格数据 */
  data: TableData
  /** 选择状态 */
  selection: Selection
  /** 排序配置 */
  sort?: { column: string; direction: 'asc' | 'desc' }[]
  /** 筛选配置 */
  filter?: { column: string; operator: string; value: unknown }[]
  /** 编辑中的单元格 */
  editingCell?: { row: number; col: number }
}

/**
 * 操作类型
 */
export type OperationType =
  | 'cell-update'
  | 'row-add'
  | 'row-delete'
  | 'row-move'
  | 'column-add'
  | 'column-delete'
  | 'column-move'
  | 'column-resize'

/**
 * 操作记录（用于撤销/重做）
 */
export interface Operation {
  type: OperationType
  payload: unknown
  timestamp: number
}

/**
 * 表格 Props
 */
export interface TablePropsBase {
  /** 列配置 */
  columns: Column[]
  /** 行数据 */
  data: Row[]
  /** 行高 */
  rowHeight?: number
  /** 表头高度 */
  headerHeight?: number
  /** 是否显示行号 */
  showRowNumber?: boolean
  /** 是否显示边框 */
  bordered?: boolean
  /** 是否显示斑马纹 */
  striped?: boolean
  /** 是否显示悬停效果 */
  hoverable?: boolean
  /** 是否可编辑 */
  editable?: boolean
  /** 数据变更回调 */
  onChange?: (data: Row[], changes: Operation[]) => void
}

/**
 * 虚拟滚动配置
 */
export interface VirtualScrollConfig {
  /** 是否启用 */
  enabled: boolean
  /** 行高 */
  rowHeight: number
  /** 预渲染行数 */
  overscan?: number
  /** 列虚拟化 */
  columnVirtualization?: boolean
  /** 列预渲染数 */
  columnOverscan?: number
}

/**
 * 排序方向
 */
export type SortDirection = 'asc' | 'desc' | null
