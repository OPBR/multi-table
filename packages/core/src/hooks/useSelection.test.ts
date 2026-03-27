import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { useSelection } from './useSelection'

describe('useSelection', () => {
  const defaultOptions = {
    rowCount: 10,
    colCount: 5,
  }

  describe('initial state', () => {
    it('should have null selection initially', () => {
      const { result } = renderHook(() => useSelection(defaultOptions))

      expect(result.current.selection.activeCell).toBeNull()
      expect(result.current.selection.anchorCell).toBeNull()
      expect(result.current.selection.selectionRange).toBeNull()
      expect(result.current.selection.isDragging).toBe(false)
    })
  })

  describe('handleCellMouseDown', () => {
    it('should set active cell on click', () => {
      const { result } = renderHook(() => useSelection(defaultOptions))

      act(() => {
        result.current.handleCellMouseDown(2, 3, false)
      })

      expect(result.current.selection.activeCell).toEqual({ row: 2, col: 3 })
      expect(result.current.selection.anchorCell).toEqual({ row: 2, col: 3 })
      expect(result.current.selection.isDragging).toBe(true)
    })

    it('should create range selection with shift+click', () => {
      const { result } = renderHook(() => useSelection(defaultOptions))

      // First click sets anchor
      act(() => {
        result.current.handleCellMouseDown(1, 1, false)
      })

      // Shift+click extends selection
      act(() => {
        result.current.handleCellMouseDown(3, 3, true)
      })

      expect(result.current.selection.activeCell).toEqual({ row: 3, col: 3 })
      expect(result.current.selection.selectionRange).toEqual({
        startRow: 1,
        startCol: 1,
        endRow: 3,
        endCol: 3,
      })
    })

    it('should normalize range when selecting backwards', () => {
      const { result } = renderHook(() => useSelection(defaultOptions))

      act(() => {
        result.current.handleCellMouseDown(3, 3, false)
      })

      act(() => {
        result.current.handleCellMouseDown(1, 1, true)
      })

      expect(result.current.selection.selectionRange).toEqual({
        startRow: 1,
        startCol: 1,
        endRow: 3,
        endCol: 3,
      })
    })
  })

  describe('handleCellMouseEnter (drag)', () => {
    it('should extend selection during drag', () => {
      const { result } = renderHook(() => useSelection(defaultOptions))

      // Start drag
      act(() => {
        result.current.handleCellMouseDown(1, 1, false)
      })

      // Drag to another cell
      act(() => {
        result.current.handleCellMouseEnter(3, 3)
      })

      expect(result.current.selection.selectionRange).toEqual({
        startRow: 1,
        startCol: 1,
        endRow: 3,
        endCol: 3,
      })
    })

    it('should not extend selection if not dragging', () => {
      const { result } = renderHook(() => useSelection(defaultOptions))

      act(() => {
        result.current.handleCellMouseEnter(3, 3)
      })

      expect(result.current.selection.selectionRange).toBeNull()
    })
  })

  describe('handleMouseUp', () => {
    it('should stop dragging', () => {
      const { result } = renderHook(() => useSelection(defaultOptions))

      act(() => {
        result.current.handleCellMouseDown(1, 1, false)
      })
      expect(result.current.selection.isDragging).toBe(true)

      act(() => {
        result.current.handleMouseUp()
      })
      expect(result.current.selection.isDragging).toBe(false)
    })
  })

  describe('handleKeyDown', () => {
    it('should move active cell with arrow keys', () => {
      const { result } = renderHook(() => useSelection(defaultOptions))

      act(() => {
        result.current.handleCellMouseDown(2, 2, false)
      })

      act(() => {
        result.current.handleKeyDown({ key: 'ArrowUp', preventDefault: vi.fn() } as any)
      })
      expect(result.current.selection.activeCell).toEqual({ row: 1, col: 2 })

      act(() => {
        result.current.handleKeyDown({ key: 'ArrowDown', preventDefault: vi.fn() } as any)
      })
      expect(result.current.selection.activeCell).toEqual({ row: 2, col: 2 })

      act(() => {
        result.current.handleKeyDown({ key: 'ArrowLeft', preventDefault: vi.fn() } as any)
      })
      expect(result.current.selection.activeCell).toEqual({ row: 2, col: 1 })

      act(() => {
        result.current.handleKeyDown({ key: 'ArrowRight', preventDefault: vi.fn() } as any)
      })
      expect(result.current.selection.activeCell).toEqual({ row: 2, col: 2 })
    })

    it('should move active cell with Tab', () => {
      const { result } = renderHook(() => useSelection(defaultOptions))

      act(() => {
        result.current.handleCellMouseDown(2, 2, false)
      })

      act(() => {
        result.current.handleKeyDown({
          key: 'Tab',
          shiftKey: false,
          preventDefault: vi.fn(),
        } as any)
      })
      expect(result.current.selection.activeCell).toEqual({ row: 2, col: 3 })

      act(() => {
        result.current.handleKeyDown({ key: 'Tab', shiftKey: true, preventDefault: vi.fn() } as any)
      })
      expect(result.current.selection.activeCell).toEqual({ row: 2, col: 2 })
    })

    it('should not move beyond boundaries', () => {
      const { result } = renderHook(() => useSelection(defaultOptions))

      act(() => {
        result.current.handleCellMouseDown(0, 0, false)
      })

      act(() => {
        result.current.handleKeyDown({ key: 'ArrowUp', preventDefault: vi.fn() } as any)
      })
      expect(result.current.selection.activeCell).toEqual({ row: 0, col: 0 })

      act(() => {
        result.current.handleKeyDown({ key: 'ArrowLeft', preventDefault: vi.fn() } as any)
      })
      expect(result.current.selection.activeCell).toEqual({ row: 0, col: 0 })
    })

    it('should clear selection on Escape', () => {
      const { result } = renderHook(() => useSelection(defaultOptions))

      act(() => {
        result.current.handleCellMouseDown(2, 2, false)
      })
      expect(result.current.selection.activeCell).not.toBeNull()

      act(() => {
        result.current.handleKeyDown({ key: 'Escape', preventDefault: vi.fn() } as any)
      })
      expect(result.current.selection.activeCell).toBeNull()
    })
  })

  describe('isSelected', () => {
    it('should return true for active cell', () => {
      const { result } = renderHook(() => useSelection(defaultOptions))

      act(() => {
        result.current.handleCellMouseDown(2, 3, false)
      })

      expect(result.current.isSelected(2, 3)).toBe(true)
      expect(result.current.isSelected(2, 4)).toBe(false)
    })

    it('should return true for cells in selection range', () => {
      const { result } = renderHook(() => useSelection(defaultOptions))

      act(() => {
        result.current.handleCellMouseDown(1, 1, false)
      })
      act(() => {
        result.current.handleCellMouseDown(3, 3, true)
      })

      expect(result.current.isSelected(1, 1)).toBe(true)
      expect(result.current.isSelected(2, 2)).toBe(true)
      expect(result.current.isSelected(3, 3)).toBe(true)
      expect(result.current.isSelected(0, 0)).toBe(false)
      expect(result.current.isSelected(4, 4)).toBe(false)
    })
  })

  describe('isActive', () => {
    it('should return true only for active cell', () => {
      const { result } = renderHook(() => useSelection(defaultOptions))

      act(() => {
        result.current.handleCellMouseDown(2, 3, false)
      })

      expect(result.current.isActive(2, 3)).toBe(true)
      expect(result.current.isActive(2, 4)).toBe(false)
    })
  })

  describe('clearSelection', () => {
    it('should clear all selection state', () => {
      const { result } = renderHook(() => useSelection(defaultOptions))

      act(() => {
        result.current.handleCellMouseDown(2, 3, false)
      })
      expect(result.current.selection.activeCell).not.toBeNull()

      act(() => {
        result.current.clearSelection()
      })
      expect(result.current.selection.activeCell).toBeNull()
      expect(result.current.selection.anchorCell).toBeNull()
      expect(result.current.selection.selectionRange).toBeNull()
    })
  })

  describe('onSelect callback', () => {
    it('should call onSelect when selection changes', () => {
      const onSelect = vi.fn()
      const { result } = renderHook(() => useSelection({ ...defaultOptions, onSelect }))

      act(() => {
        result.current.handleCellMouseDown(2, 3, false)
      })

      expect(onSelect).toHaveBeenCalled()
      const lastCall = onSelect.mock.calls[onSelect.mock.calls.length - 1]
      expect(lastCall[0].activeCell).toEqual({ row: 2, col: 3 })
    })
  })
})
