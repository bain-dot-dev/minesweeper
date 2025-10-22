/**
 * Advanced Mode Features
 * Memory Mode Phases, Multi-Round Management, and Special Mechanics
 */

import { CellState } from "@/types/game";

// ============================================================================
// MEMORY MODE
// ============================================================================

export type MemoryPhase = "reveal" | "memorize" | "play" | "complete";

export interface MemoryModeState {
  currentPhase: MemoryPhase;
  phaseStartTime: number;
  memorizeEndTime: number | null;
  revealedCellsSnapshot: Set<string>; // Cells that were shown during reveal
  correctRecalls: number;
  incorrectRecalls: number;
}

export class MemoryModeManager {
  private state: MemoryModeState;
  private revealDuration: number;

  constructor(revealDuration: number = 5000) {
    this.revealDuration = revealDuration;
    this.state = {
      currentPhase: "reveal",
      phaseStartTime: Date.now(),
      memorizeEndTime: null,
      revealedCellsSnapshot: new Set(),
      correctRecalls: 0,
      incorrectRecalls: 0,
    };
  }

  /**
   * Start the reveal phase
   */
  startRevealPhase(board: CellState[][]): CellState[][] {
    console.log("🧠 Memory Mode: Starting reveal phase");
    this.state.currentPhase = "reveal";
    this.state.phaseStartTime = Date.now();
    this.state.memorizeEndTime = Date.now() + this.revealDuration;

    // Temporarily reveal all safe cells
    const revealedBoard = board.map((row, y) =>
      row.map((cell, x) => {
        if (!cell.isMine) {
          this.state.revealedCellsSnapshot.add(`${x},${y}`);
          return { ...cell, isRevealed: true };
        }
        return { ...cell };
      })
    );

    return revealedBoard;
  }

  /**
   * Transition to memorize phase
   */
  startMemorizePhase(): void {
    console.log("🧠 Memory Mode: Starting memorize phase");
    this.state.currentPhase = "memorize";
    this.state.phaseStartTime = Date.now();
  }

  /**
   * Start the play phase (hide cells again)
   */
  startPlayPhase(board: CellState[][]): CellState[][] {
    console.log("🧠 Memory Mode: Starting play phase");
    this.state.currentPhase = "play";
    this.state.phaseStartTime = Date.now();

    // Hide all cells again
    const hiddenBoard = board.map((row) =>
      row.map((cell) => ({
        ...cell,
        isRevealed: false,
      }))
    );

    return hiddenBoard;
  }

  /**
   * Check if cell was shown during reveal phase
   */
  wasCellShownInReveal(x: number, y: number): boolean {
    return this.state.revealedCellsSnapshot.has(`${x},${y}`);
  }

  /**
   * Track cell recall attempt
   */
  recordRecall(x: number, y: number, isCorrect: boolean): void {
    if (isCorrect) {
      this.state.correctRecalls++;
    } else {
      this.state.incorrectRecalls++;
    }
  }

  /**
   * Calculate memory accuracy score
   */
  calculateAccuracy(): number {
    const total = this.state.correctRecalls + this.state.incorrectRecalls;
    if (total === 0) return 1.0;
    return this.state.correctRecalls / total;
  }

  /**
   * Get remaining time in current phase
   */
  getRemainingTime(): number {
    if (!this.state.memorizeEndTime) return 0;
    return Math.max(0, this.state.memorizeEndTime - Date.now());
  }

  /**
   * Check if should transition to next phase
   */
  shouldTransitionPhase(): boolean {
    if (this.state.currentPhase === "memorize") {
      return this.getRemainingTime() <= 0;
    }
    return false;
  }

  /**
   * Get current phase
   */
  getCurrentPhase(): MemoryPhase {
    return this.state.currentPhase;
  }

  /**
   * Complete memory mode
   */
  complete(): void {
    this.state.currentPhase = "complete";
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    correctRecalls: number;
    incorrectRecalls: number;
    accuracy: number;
    timeElapsed: number;
  } {
    return {
      correctRecalls: this.state.correctRecalls,
      incorrectRecalls: this.state.incorrectRecalls,
      accuracy: this.calculateAccuracy(),
      timeElapsed: Date.now() - this.state.phaseStartTime,
    };
  }
}

// ============================================================================
// MULTI-ROUND SYSTEM
// ============================================================================

export interface RoundData {
  roundNumber: number;
  startTime: number;
  endTime: number | null;
  score: number;
  status: "won" | "lost" | "incomplete";
  timeElapsed: number;
  movesUsed: number;
}

export interface MultiRoundState {
  currentRound: number;
  totalRounds: number;
  rounds: RoundData[];
  totalScore: number;
  consecutiveWins: number;
  consecutiveLosses: number;
}

export class MultiRoundManager {
  private state: MultiRoundState;
  private timeLimit: number;

  constructor(totalRounds: number = 5, timeLimit: number = 60) {
    this.state = {
      currentRound: 1,
      totalRounds,
      rounds: [],
      totalScore: 0,
      consecutiveWins: 0,
      consecutiveLosses: 0,
    };
    this.timeLimit = timeLimit;
  }

  /**
   * Start a new round
   */
  startRound(): void {
    const round: RoundData = {
      roundNumber: this.state.currentRound,
      startTime: Date.now(),
      endTime: null,
      score: 0,
      status: "incomplete",
      timeElapsed: 0,
      movesUsed: 0,
    };

    this.state.rounds.push(round);
  }

  /**
   * Complete current round
   */
  completeRound(
    status: "won" | "lost",
    score: number,
    movesUsed: number
  ): void {
    const currentRound = this.state.rounds[this.state.currentRound - 1];
    if (!currentRound) return;

    currentRound.endTime = Date.now();
    currentRound.status = status;
    currentRound.score = score;
    currentRound.timeElapsed = currentRound.endTime - currentRound.startTime;
    currentRound.movesUsed = movesUsed;

    this.state.totalScore += score;

    if (status === "won") {
      this.state.consecutiveWins++;
      this.state.consecutiveLosses = 0;
    } else {
      this.state.consecutiveLosses++;
      this.state.consecutiveWins = 0;
    }
  }

  /**
   * Advance to next round
   */
  nextRound(): boolean {
    if (this.state.currentRound >= this.state.totalRounds) {
      return false; // No more rounds
    }

    this.state.currentRound++;
    return true;
  }

  /**
   * Check if all rounds are complete
   */
  isComplete(): boolean {
    return this.state.currentRound > this.state.totalRounds;
  }

  /**
   * Get current round number
   */
  getCurrentRound(): number {
    return this.state.currentRound;
  }

  /**
   * Get total rounds
   */
  getTotalRounds(): number {
    return this.state.totalRounds;
  }

  /**
   * Get total score
   */
  getTotalScore(): number {
    return this.state.totalScore;
  }

  /**
   * Get combo multiplier based on consecutive wins
   */
  getComboMultiplier(): number {
    return 1 + this.state.consecutiveWins * 0.25;
  }

  /**
   * Get round statistics
   */
  getRoundStatistics(): {
    completed: number;
    won: number;
    lost: number;
    averageTime: number;
    totalScore: number;
    winRate: number;
  } {
    const completed = this.state.rounds.filter(
      (r) => r.endTime !== null
    ).length;
    const won = this.state.rounds.filter((r) => r.status === "won").length;
    const lost = this.state.rounds.filter((r) => r.status === "lost").length;
    const totalTime = this.state.rounds.reduce(
      (sum, r) => sum + r.timeElapsed,
      0
    );

    return {
      completed,
      won,
      lost,
      averageTime: completed > 0 ? totalTime / completed : 0,
      totalScore: this.state.totalScore,
      winRate: completed > 0 ? won / completed : 0,
    };
  }

  /**
   * Get time limit
   */
  getTimeLimit(): number {
    return this.timeLimit;
  }

  /**
   * Get all rounds
   */
  getRounds(): RoundData[] {
    return [...this.state.rounds];
  }

  /**
   * Reset for new game
   */
  reset(): void {
    this.state = {
      currentRound: 1,
      totalRounds: this.state.totalRounds,
      rounds: [],
      totalScore: 0,
      consecutiveWins: 0,
      consecutiveLosses: 0,
    };
  }
}

// ============================================================================
// SPECIAL MECHANICS
// ============================================================================

/**
 * Zen Mode: No-game-over handler
 */
export class ZenModeHandler {
  private mistakeCount: number = 0;
  private mistakePositions: Set<string> = new Set();

  /**
   * Handle mine click in Zen mode (mark as mistake, don't end game)
   */
  handleMineClick(x: number, y: number): void {
    const key = `${x},${y}`;
    if (!this.mistakePositions.has(key)) {
      this.mistakeCount++;
      this.mistakePositions.add(key);
    }
  }

  /**
   * Check if cell was marked as mistake
   */
  isMistake(x: number, y: number): boolean {
    return this.mistakePositions.has(`${x},${y}`);
  }

  /**
   * Get mistake count
   */
  getMistakeCount(): number {
    return this.mistakeCount;
  }

  /**
   * Get all mistake positions
   */
  getMistakePositions(): Position[] {
    const positions: Position[] = [];
    this.mistakePositions.forEach((key) => {
      const [x, y] = key.split(",").map(Number);
      positions.push({ x, y });
    });
    return positions;
  }

  /**
   * Reset mistakes
   */
  reset(): void {
    this.mistakeCount = 0;
    this.mistakePositions.clear();
  }
}

/**
 * Blind Mode: Visibility manager
 */
export class BlindModeVisibilityManager {
  /**
   * Get visible cells based on flag positions
   */
  getVisibleCells(board: CellState[][]): Set<string> {
    const visible = new Set<string>();

    for (let y = 0; y < board.length; y++) {
      for (let x = 0; x < board[y].length; x++) {
        const cell = board[y][x];

        // Always show flagged cells
        if (cell.isFlagged) {
          visible.add(`${x},${y}`);
        }

        // Show cells adjacent to flags
        if (this.isAdjacentToFlag(x, y, board)) {
          visible.add(`${x},${y}`);
        }
      }
    }

    return visible;
  }

  /**
   * Check if cell is adjacent to any flag
   */
  private isAdjacentToFlag(
    x: number,
    y: number,
    board: CellState[][]
  ): boolean {
    const directions = [
      [-1, -1],
      [-1, 0],
      [-1, 1],
      [0, -1],
      [0, 1],
      [1, -1],
      [1, 0],
      [1, 1],
    ];

    for (const [dx, dy] of directions) {
      const nx = x + dx;
      const ny = y + dy;

      if (
        nx >= 0 &&
        nx < board[0].length &&
        ny >= 0 &&
        ny < board.length &&
        board[ny][nx].isFlagged
      ) {
        return true;
      }
    }

    return false;
  }

  /**
   * Should number be visible
   */
  shouldShowNumber(x: number, y: number, board: CellState[][]): boolean {
    const visible = this.getVisibleCells(board);
    return visible.has(`${x},${y}`);
  }
}

/**
 * Custom Board Builder for Custom Mode
 */
export class CustomBoardBuilder {
  private width: number;
  private height: number;
  private mines: number;

  constructor() {
    this.width = 16;
    this.height = 16;
    this.mines = 40;
  }

  /**
   * Set board dimensions
   */
  setDimensions(width: number, height: number): this {
    this.width = Math.max(5, Math.min(50, width));
    this.height = Math.max(5, Math.min(50, height));
    return this;
  }

  /**
   * Set mine count
   */
  setMineCount(mines: number): this {
    const maxMines = Math.floor(this.width * this.height * 0.8);
    this.mines = Math.max(1, Math.min(maxMines, mines));
    return this;
  }

  /**
   * Build configuration
   */
  build(): { width: number; height: number; mines: number } {
    return {
      width: this.width,
      height: this.height,
      mines: this.mines,
    };
  }

  /**
   * Get constraints
   */
  getConstraints(): {
    minWidth: number;
    maxWidth: number;
    minHeight: number;
    maxHeight: number;
    minMines: number;
    maxMines: number;
  } {
    return {
      minWidth: 5,
      maxWidth: 50,
      minHeight: 5,
      maxHeight: 50,
      minMines: 1,
      maxMines: Math.floor(this.width * this.height * 0.8),
    };
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

export function createMemoryModeManager(
  revealDuration: number = 5000
): MemoryModeManager {
  return new MemoryModeManager(revealDuration);
}

export function createMultiRoundManager(
  totalRounds: number = 5,
  timeLimit: number = 60
): MultiRoundManager {
  return new MultiRoundManager(totalRounds, timeLimit);
}

export function createZenModeHandler(): ZenModeHandler {
  return new ZenModeHandler();
}

export function createBlindModeVisibilityManager(): BlindModeVisibilityManager {
  return new BlindModeVisibilityManager();
}

export function createCustomBoardBuilder(): CustomBoardBuilder {
  return new CustomBoardBuilder();
}

// Import Position if not already defined
interface Position {
  x: number;
  y: number;
}
