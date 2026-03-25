import { describe, it, expect, vi, beforeEach } from 'vitest'
import { HistoryManager } from './HistoryManager'
import type { Operation } from '../types'

const createOperation = (type: Operation['type'] = 'cell-update'): Operation => ({
  type,
  payload: { test: 'data' },
  timestamp: Date.now(),
})

describe('HistoryManager', () => {
  let historyManager: HistoryManager
  let mockApplyUndo: ReturnType<typeof vi.fn>
  let mockApplyRedo: ReturnType<typeof vi.fn>

  beforeEach(() => {
    mockApplyUndo = vi.fn()
    mockApplyRedo = vi.fn()
    historyManager = new HistoryManager({ maxSize: 5 }, mockApplyUndo, mockApplyRedo)
  })

  describe('record', () => {
    it('should record operation', () => {
      historyManager.record(createOperation())
      expect(historyManager.canUndo()).toBe(true)
    })

    it('should respect max history size', () => {
      for (let i = 0; i < 10; i++) {
        historyManager.record(createOperation())
      }
      // With max size 5, after 10 operations, oldest are discarded
      // So we can undo 5 times
      let undoCount = 0
      while (historyManager.canUndo()) {
        historyManager.undo({ data: {} as any, operation: null as any })
        undoCount++
      }
      expect(undoCount).toBe(5)
    })

    it('should clear redo history on new operation', () => {
      historyManager.record(createOperation())
      historyManager.record(createOperation())
      historyManager.undo()
      expect(historyManager.canRedo()).toBe(true)

      historyManager.record(createOperation())
      expect(historyManager.canRedo()).toBe(false)
    })
  })

  describe('undo', () => {
    it('should call applyUndo', () => {
      const operation = createOperation()
      historyManager.record(operation)
      historyManager.undo({ data: {} as any, operation: null as any })

      expect(mockApplyUndo).toHaveBeenCalled()
    })

    it('should return null when no undo available', () => {
      expect(historyManager.undo({ data: {} as any, operation: null as any })).toBeNull()
    })

    it('should return operation on undo', () => {
      const operation = createOperation()
      historyManager.record(operation)
      const result = historyManager.undo({ data: {} as any, operation: null as any })
      expect(result).toEqual(operation)
    })
  })

  describe('redo', () => {
    it('should call applyRedo', () => {
      historyManager.record(createOperation())
      historyManager.undo({ data: {} as any, operation: null as any })
      historyManager.redo({ data: {} as any, operation: null as any })

      expect(mockApplyRedo).toHaveBeenCalled()
    })

    it('should return null when no redo available', () => {
      expect(historyManager.redo({ data: {} as any, operation: null as any })).toBeNull()
    })

    it('should return operation on redo', () => {
      const operation = createOperation()
      historyManager.record(operation)
      historyManager.undo({ data: {} as any, operation: null as any })
      const result = historyManager.redo({ data: {} as any, operation: null as any })
      expect(result).toEqual(operation)
    })
  })

  describe('canUndo/canRedo', () => {
    it('should track undo state correctly', () => {
      expect(historyManager.canUndo()).toBe(false)

      historyManager.record(createOperation())
      expect(historyManager.canUndo()).toBe(true)

      historyManager.undo({ data: {} as any, operation: null as any })
      expect(historyManager.canUndo()).toBe(false)
    })

    it('should track redo state correctly', () => {
      expect(historyManager.canRedo()).toBe(false)

      historyManager.record(createOperation())
      expect(historyManager.canRedo()).toBe(false)

      historyManager.undo({ data: {} as any, operation: null as any })
      expect(historyManager.canRedo()).toBe(true)

      historyManager.redo({ data: {} as any, operation: null as any })
      expect(historyManager.canRedo()).toBe(false)
    })
  })

  describe('clear', () => {
    it('should clear all history', () => {
      historyManager.record(createOperation())
      historyManager.record(createOperation())
      historyManager.clear()

      expect(historyManager.canUndo()).toBe(false)
      expect(historyManager.canRedo()).toBe(false)
    })
  })
})
