import { useState, useCallback, useRef, useEffect } from 'react'
import type { SelectionRange } from '@multi-table/shared'

export interface CellPosition {
  row: number
  col: number
}

export interface SelectionState {
  anchorCell: CellPosition | null
  activeCell: CellPosition | null
  selectionRange: SelectionRange | null
  isDragging: boolean
}

export interface UseSelectionOptions {
  rowCount: number
  colCount: number
  onSelect?: (selection: SelectionState) => void
}

export interface UseSelectionReturn {
  selection: SelectionState
  handleCellMouseDown: (row: number, col: number, shiftKey: boolean) => void
  handleCellMouseEnter: (row: number, col: number) => void
  handleMouseUp: () => void
  handleKeyDown: (e: React.KeyboardEvent) => void
  isSelected: (row: number, col: number) => boolean
  isActive: (row: number, col: number) => boolean
  clearSelection: () => void
}

function normalizeRange(start: CellPosition, end: CellPosition): SelectionRange {
  return {
    startRow: Math.min(start.row, end.row),
    startCol: Math.min(start.col, end.col),
    endRow: Math.max(start.row, end.row),
    endCol: Math.max(start.col, end.col),
  }
}

export function useSelection({
  rowCount,
  colCount,
  onSelect,
}: UseSelectionOptions): UseSelectionReturn {
  const [selection, setSelection] = useState<SelectionState>({
    anchorCell: null,
    activeCell: null,
    selectionRange: null,
    isDragging: false,
  })

  const selectionRef = useRef(selection)
  selectionRef.current = selection

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (selectionRef.current.isDragging) {
        setSelection((prev) => ({ ...prev, isDragging: false }))
      }
    }

    window.addEventListener('mouseup', handleGlobalMouseUp)
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp)
  }, [])

  const clearSelection = useCallback(() => {
    setSelection({
      anchorCell: null,
      activeCell: null,
      selectionRange: null,
      isDragging: false,
    })
  }, [])

  const updateSelection = useCallback(
    (newSelection: SelectionState) => {
      setSelection(newSelection)
      onSelect?.(newSelection)
    },
    [onSelect]
  )

  const handleCellMouseDown = useCallback(
    (row: number, col: number, shiftKey: boolean) => {
      const cell: CellPosition = { row, col }

      if (shiftKey && selectionRef.current.anchorCell) {
        // Shift+click: extend selection from anchor
        const range = normalizeRange(selectionRef.current.anchorCell, cell)
        updateSelection({
          anchorCell: selectionRef.current.anchorCell,
          activeCell: cell,
          selectionRange: range,
          isDragging: false,
        })
      } else {
        // Normal click: new selection
        updateSelection({
          anchorCell: cell,
          activeCell: cell,
          selectionRange: null,
          isDragging: true,
        })
      }
    },
    [updateSelection]
  )

  const handleCellMouseEnter = useCallback(
    (row: number, col: number) => {
      if (!selectionRef.current.isDragging || !selectionRef.current.anchorCell) {
        return
      }

      const cell: CellPosition = { row, col }
      const range = normalizeRange(selectionRef.current.anchorCell, cell)

      updateSelection({
        ...selectionRef.current,
        activeCell: cell,
        selectionRange: range,
      })
    },
    [updateSelection]
  )

  const handleMouseUp = useCallback(() => {
    if (selectionRef.current.isDragging) {
      setSelection((prev) => ({ ...prev, isDragging: false }))
    }
  }, [])

  const moveActiveCell = useCallback(
    (deltaRow: number, deltaCol: number) => {
      const current = selectionRef.current.activeCell
      if (!current) return

      const newRow = Math.max(0, Math.min(rowCount - 1, current.row + deltaRow))
      const newCol = Math.max(0, Math.min(colCount - 1, current.col + deltaCol))

      const newCell: CellPosition = { row: newRow, col: newCol }

      updateSelection({
        anchorCell: newCell,
        activeCell: newCell,
        selectionRange: null,
        isDragging: false,
      })
    },
    [rowCount, colCount, updateSelection]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const { activeCell } = selectionRef.current
      if (!activeCell) return

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault()
          moveActiveCell(-1, 0)
          break
        case 'ArrowDown':
          e.preventDefault()
          moveActiveCell(1, 0)
          break
        case 'ArrowLeft':
          e.preventDefault()
          moveActiveCell(0, -1)
          break
        case 'ArrowRight':
          e.preventDefault()
          moveActiveCell(0, 1)
          break
        case 'Tab':
          e.preventDefault()
          if (e.shiftKey) {
            moveActiveCell(0, -1)
          } else {
            moveActiveCell(0, 1)
          }
          break
        case 'Escape':
          e.preventDefault()
          clearSelection()
          break
      }
    },
    [moveActiveCell, clearSelection]
  )

  const isSelected = useCallback((row: number, col: number): boolean => {
    const { selectionRange, activeCell } = selectionRef.current

    // Check if in selection range
    if (selectionRange) {
      if (
        row >= selectionRange.startRow &&
        row <= selectionRange.endRow &&
        col >= selectionRange.startCol &&
        col <= selectionRange.endCol
      ) {
        return true
      }
    }

    // Check if active cell
    if (activeCell && activeCell.row === row && activeCell.col === col) {
      return true
    }

    return false
  }, [])

  const isActive = useCallback((row: number, col: number): boolean => {
    const { activeCell } = selectionRef.current
    return activeCell !== null && activeCell.row === row && activeCell.col === col
  }, [])

  return {
    selection,
    handleCellMouseDown,
    handleCellMouseEnter,
    handleMouseUp,
    handleKeyDown,
    isSelected,
    isActive,
    clearSelection,
  }
}
