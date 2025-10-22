/**
 * Undo/Redo System
 * Manages game state history for Zen mode and training
 */

import { GameState } from "@/types/game";

export interface GameStateSnapshot {
  state: GameState;
  timestamp: number;
  action: string; // Description of the action taken
}

export class UndoRedoManager {
  private history: GameStateSnapshot[] = [];
  private currentIndex: number = -1;
  private maxHistorySize: number = 50; // Limit to prevent memory issues

  /**
   * Save current state to history
   */
  saveState(state: GameState, action: string): void {
    // Remove any future states if we're not at the end
    if (this.currentIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentIndex + 1);
    }

    // Add new state
    const snapshot: GameStateSnapshot = {
      state: this.deepCloneState(state),
      timestamp: Date.now(),
      action,
    };

    this.history.push(snapshot);
    this.currentIndex++;

    // Trim history if it exceeds max size
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
      this.currentIndex--;
    }
  }

  /**
   * Undo to previous state
   */
  undo(): GameState | null {
    if (!this.canUndo()) return null;

    this.currentIndex--;
    return this.deepCloneState(this.history[this.currentIndex].state);
  }

  /**
   * Redo to next state
   */
  redo(): GameState | null {
    if (!this.canRedo()) return null;

    this.currentIndex++;
    return this.deepCloneState(this.history[this.currentIndex].state);
  }

  /**
   * Check if undo is available
   */
  canUndo(): boolean {
    return this.currentIndex > 0;
  }

  /**
   * Check if redo is available
   */
  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1;
  }

  /**
   * Get current state
   */
  getCurrentState(): GameState | null {
    if (this.currentIndex < 0 || this.currentIndex >= this.history.length) {
      return null;
    }
    return this.deepCloneState(this.history[this.currentIndex].state);
  }

  /**
   * Get description of last action
   */
  getLastAction(): string | null {
    if (this.currentIndex < 0 || this.currentIndex >= this.history.length) {
      return null;
    }
    return this.history[this.currentIndex].action;
  }

  /**
   * Get description of action that would be undone
   */
  getUndoAction(): string | null {
    if (!this.canUndo()) return null;
    return this.history[this.currentIndex].action;
  }

  /**
   * Get description of action that would be redone
   */
  getRedoAction(): string | null {
    if (!this.canRedo()) return null;
    return this.history[this.currentIndex + 1].action;
  }

  /**
   * Clear all history
   */
  clear(): void {
    this.history = [];
    this.currentIndex = -1;
  }

  /**
   * Get history statistics
   */
  getStatistics(): {
    totalStates: number;
    currentIndex: number;
    undoAvailable: number;
    redoAvailable: number;
    memoryUsage: number; // Approximate in KB
  } {
    const memoryUsage = Math.round(
      (JSON.stringify(this.history).length / 1024) * 100
    ) / 100;

    return {
      totalStates: this.history.length,
      currentIndex: this.currentIndex,
      undoAvailable: this.currentIndex,
      redoAvailable: this.history.length - 1 - this.currentIndex,
      memoryUsage,
    };
  }

  /**
   * Get full history for replay
   */
  getHistory(): GameStateSnapshot[] {
    return this.history.map((snapshot) => ({
      state: this.deepCloneState(snapshot.state),
      timestamp: snapshot.timestamp,
      action: snapshot.action,
    }));
  }

  /**
   * Jump to specific state in history
   */
  jumpToState(index: number): GameState | null {
    if (index < 0 || index >= this.history.length) return null;

    this.currentIndex = index;
    return this.deepCloneState(this.history[this.currentIndex].state);
  }

  /**
   * Get timeline of actions
   */
  getTimeline(): Array<{ index: number; action: string; timestamp: number }> {
    return this.history.map((snapshot, index) => ({
      index,
      action: snapshot.action,
      timestamp: snapshot.timestamp,
    }));
  }

  /**
   * Deep clone game state to prevent mutations
   */
  private deepCloneState(state: GameState): GameState {
    return {
      ...state,
      board: state.board.map((row) =>
        row.map((cell) => ({
          ...cell,
        }))
      ),
      continueTimestamps: [...state.continueTimestamps],
    };
  }

  /**
   * Set max history size
   */
  setMaxHistorySize(size: number): void {
    this.maxHistorySize = Math.max(1, size);

    // Trim if current history exceeds new size
    if (this.history.length > this.maxHistorySize) {
      const trimAmount = this.history.length - this.maxHistorySize;
      this.history = this.history.slice(trimAmount);
      this.currentIndex = Math.max(0, this.currentIndex - trimAmount);
    }
  }

  /**
   * Export history to JSON for saving
   */
  exportHistory(): string {
    return JSON.stringify({
      history: this.history,
      currentIndex: this.currentIndex,
      maxHistorySize: this.maxHistorySize,
    });
  }

  /**
   * Import history from JSON
   */
  importHistory(json: string): boolean {
    try {
      const data = JSON.parse(json);
      this.history = data.history || [];
      this.currentIndex = data.currentIndex || -1;
      this.maxHistorySize = data.maxHistorySize || 50;
      return true;
    } catch (error) {
      console.error("Failed to import history:", error);
      return false;
    }
  }
}

/**
 * Hook for using undo/redo system
 */
export function createUndoRedoManager(): UndoRedoManager {
  return new UndoRedoManager();
}

/**
 * Action type constants for consistency
 */
export const ACTION_TYPES = {
  REVEAL_CELL: "Revealed cell",
  FLAG_CELL: "Placed flag",
  UNFLAG_CELL: "Removed flag",
  FIRST_CLICK: "Started game",
  RESET: "Reset game",
  CONTINUE: "Used continue",
  NEXT_LEVEL: "Advanced to next level",
  HINT_USED: "Used hint",
} as const;

/**
 * Create action description with position
 */
export function createActionDescription(
  actionType: keyof typeof ACTION_TYPES,
  position?: { x: number; y: number }
): string {
  const action = ACTION_TYPES[actionType];
  if (position) {
    return `${action} at (${position.x + 1}, ${position.y + 1})`;
  }
  return action;
}
