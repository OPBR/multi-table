import type { Operation } from '../types'
import type { OperationContext } from './operations'

export interface HistoryManagerOptions {
  maxSize?: number
}

export class HistoryManager {
  private history: Operation[] = []
  private historyIndex = -1
  private maxSize: number
  private applyUndoFn: (ctx: OperationContext) => void
  private applyRedoFn: (ctx: OperationContext) => void

  constructor(
    options: HistoryManagerOptions = {},
    applyUndo: (ctx: OperationContext) => void,
    applyRedo: (ctx: OperationContext) => void
  ) {
    this.maxSize = options.maxSize ?? 100
    this.applyUndoFn = applyUndo
    this.applyRedoFn = applyRedo
  }

  record(operation: Operation): void {
    if (this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1)
    }

    this.history.push(operation)

    if (this.history.length > this.maxSize) {
      this.history.shift()
    } else {
      this.historyIndex++
    }
  }

  undo(ctx: OperationContext): Operation | null {
    if (this.historyIndex < 0) return null

    const operation = this.history[this.historyIndex]
    this.applyUndoFn({ ...ctx, operation })
    this.historyIndex--

    return operation
  }

  redo(ctx: OperationContext): Operation | null {
    if (this.historyIndex >= this.history.length - 1) return null

    this.historyIndex++
    const operation = this.history[this.historyIndex]
    this.applyRedoFn({ ...ctx, operation })

    return operation
  }

  canUndo(): boolean {
    return this.historyIndex >= 0
  }

  canRedo(): boolean {
    return this.historyIndex < this.history.length - 1
  }

  clear(): void {
    this.history = []
    this.historyIndex = -1
  }
}
