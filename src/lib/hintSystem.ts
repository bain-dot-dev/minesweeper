/**
 * Hint System
 * Provides intelligent hints for learning modes and training
 */

import { GameState, CellState, Position } from "@/types/game";

export type HintType =
  | "safe_cell"         // Cell that's definitely safe
  | "mine_location"     // Cell that's definitely a mine
  | "number_deduction"  // Logical deduction from numbers
  | "pattern_hint"      // Pattern recognition hint
  | "next_best_move"    // Suggested optimal move
  | "flag_suggestion"   // Where to place flags
  | "danger_warning";   // High-risk area warning

export interface Hint {
  type: HintType;
  position: Position;
  confidence: number; // 0-1, how certain the hint is
  reasoning: string;
  priority: number; // 1-10, how important this hint is
}

export class HintSystem {
  private gameState: GameState;

  constructor(gameState: GameState) {
    this.gameState = gameState;
  }

  /**
   * Get the best available hint for the current game state
   */
  getBestHint(): Hint | null {
    const hints = this.getAllHints();
    if (hints.length === 0) return null;

    // Sort by priority (highest first) then confidence
    hints.sort((a, b) => {
      if (b.priority !== a.priority) {
        return b.priority - a.priority;
      }
      return b.confidence - a.confidence;
    });

    return hints[0];
  }

  /**
   * Get all available hints for the current game state
   */
  getAllHints(): Hint[] {
    const hints: Hint[] = [];

    // Find guaranteed safe cells
    hints.push(...this.findSafeCells());

    // Find guaranteed mines
    hints.push(...this.findGuaranteedMines());

    // Find cells deduced from numbers
    hints.push(...this.findNumberDeductions());

    // Suggest best next move
    const bestMove = this.findBestMove();
    if (bestMove) hints.push(bestMove);

    return hints;
  }

  /**
   * Find cells that are guaranteed to be safe
   */
  private findSafeCells(): Hint[] {
    const hints: Hint[] = [];
    const board = this.gameState.board;

    for (let y = 0; y < board.length; y++) {
      for (let x = 0; x < board[y].length; x++) {
        const cell = board[y][x];

        // Skip revealed or flagged cells
        if (cell.isRevealed || cell.isFlagged) continue;

        // Check if this cell is guaranteed safe based on adjacent revealed cells
        if (this.isCellGuaranteedSafe(x, y)) {
          hints.push({
            type: "safe_cell",
            position: { x, y },
            confidence: 1.0,
            reasoning: "This cell is guaranteed safe based on adjacent numbers",
            priority: 9,
          });
        }
      }
    }

    return hints;
  }

  /**
   * Find cells that are guaranteed to contain mines
   */
  private findGuaranteedMines(): Hint[] {
    const hints: Hint[] = [];
    const board = this.gameState.board;

    for (let y = 0; y < board.length; y++) {
      for (let x = 0; x < board[y].length; x++) {
        const cell = board[y][x];

        // Skip revealed or already flagged cells
        if (cell.isRevealed || cell.isFlagged) continue;

        // Check if this cell must be a mine
        if (this.isCellGuaranteedMine(x, y)) {
          hints.push({
            type: "mine_location",
            position: { x, y },
            confidence: 1.0,
            reasoning: "This cell must contain a mine based on adjacent numbers",
            priority: 10,
          });
        }
      }
    }

    return hints;
  }

  /**
   * Find cells using logical deduction from numbers
   */
  private findNumberDeductions(): Hint[] {
    const hints: Hint[] = [];
    const board = this.gameState.board;

    for (let y = 0; y < board.length; y++) {
      for (let x = 0; x < board[y].length; x++) {
        const cell = board[y][x];

        // Only look at revealed cells with numbers
        if (!cell.isRevealed || cell.adjacentMines === 0) continue;

        const adjacent = this.getAdjacentCells(x, y);
        const unrevealed = adjacent.filter((c) => !c.isRevealed && !c.isFlagged);
        const flagged = adjacent.filter((c) => c.isFlagged);

        // If all remaining unrevealed cells must be mines
        if (
          unrevealed.length > 0 &&
          unrevealed.length + flagged.length === cell.adjacentMines
        ) {
          unrevealed.forEach((c) => {
            hints.push({
              type: "number_deduction",
              position: { x: c.x, y: c.y },
              confidence: 1.0,
              reasoning: `Cell at (${x}, ${y}) has ${cell.adjacentMines} adjacent mines, and this is one of them`,
              priority: 9,
            });
          });
        }

        // If all mines are already flagged, remaining cells are safe
        if (unrevealed.length > 0 && flagged.length === cell.adjacentMines) {
          unrevealed.forEach((c) => {
            hints.push({
              type: "number_deduction",
              position: { x: c.x, y: c.y },
              confidence: 1.0,
              reasoning: `Cell at (${x}, ${y}) has all ${cell.adjacentMines} mines flagged, so this is safe`,
              priority: 9,
            });
          });
        }
      }
    }

    return hints;
  }

  /**
   * Find the best next move using heuristics
   */
  private findBestMove(): Hint | null {
    const board = this.gameState.board;
    let bestMove: Hint | null = null;
    let lowestRisk = 1.0;

    for (let y = 0; y < board.length; y++) {
      for (let x = 0; x < board[y].length; x++) {
        const cell = board[y][x];

        if (cell.isRevealed || cell.isFlagged) continue;

        const risk = this.calculateCellRisk(x, y);

        if (risk < lowestRisk) {
          lowestRisk = risk;
          bestMove = {
            type: "next_best_move",
            position: { x, y },
            confidence: 1 - risk,
            reasoning: `This cell has the lowest risk (${Math.round(risk * 100)}%) based on current board state`,
            priority: 7,
          };
        }
      }
    }

    return bestMove;
  }

  /**
   * Check if a cell is guaranteed to be safe
   */
  private isCellGuaranteedSafe(x: number, y: number): boolean {
    const adjacent = this.getAdjacentCells(x, y);

    for (const adjCell of adjacent) {
      if (!adjCell.isRevealed) continue;

      const adjAdjacent = this.getAdjacentCells(adjCell.x, adjCell.y);
      const flagged = adjAdjacent.filter((c) => c.isFlagged).length;

      // If all mines around this number are already flagged, the target cell is safe
      if (flagged === adjCell.adjacentMines) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if a cell is guaranteed to be a mine
   */
  private isCellGuaranteedMine(x: number, y: number): boolean {
    const adjacent = this.getAdjacentCells(x, y);

    for (const adjCell of adjacent) {
      if (!adjCell.isRevealed) continue;

      const adjAdjacent = this.getAdjacentCells(adjCell.x, adjCell.y);
      const unrevealed = adjAdjacent.filter(
        (c) => !c.isRevealed && !c.isFlagged
      );
      const flagged = adjAdjacent.filter((c) => c.isFlagged).length;

      // If the number of unrevealed + flagged equals the number, all unrevealed are mines
      if (unrevealed.length + flagged === adjCell.adjacentMines) {
        // Check if our target cell is in the unrevealed list
        if (unrevealed.some((c) => c.x === x && c.y === y)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Calculate risk probability for a cell (0 = safe, 1 = definitely mine)
   */
  private calculateCellRisk(x: number, y: number): number {
    const adjacent = this.getAdjacentCells(x, y);
    const revealed = adjacent.filter((c) => c.isRevealed);

    if (revealed.length === 0) {
      // No information, use global mine density
      const totalCells =
        this.gameState.config.width * this.gameState.config.height;
      const remainingCells = totalCells - this.gameState.revealedCount;
      const remainingMines = this.gameState.config.mines - this.gameState.flagCount;
      return remainingMines / remainingCells;
    }

    // Calculate average risk from adjacent revealed cells
    let totalRisk = 0;
    let riskCount = 0;

    for (const adjCell of revealed) {
      const adjAdjacent = this.getAdjacentCells(adjCell.x, adjCell.y);
      const unrevealed = adjAdjacent.filter(
        (c) => !c.isRevealed && !c.isFlagged
      ).length;
      const flagged = adjAdjacent.filter((c) => c.isFlagged).length;
      const remainingMines = adjCell.adjacentMines - flagged;

      if (unrevealed > 0) {
        totalRisk += remainingMines / unrevealed;
        riskCount++;
      }
    }

    return riskCount > 0 ? totalRisk / riskCount : 0.5;
  }

  /**
   * Get all adjacent cells to a position
   */
  private getAdjacentCells(x: number, y: number): CellState[] {
    const board = this.gameState.board;
    const adjacent: CellState[] = [];
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
        nx < this.gameState.config.width &&
        ny >= 0 &&
        ny < this.gameState.config.height
      ) {
        adjacent.push(board[ny][nx]);
      }
    }

    return adjacent;
  }

  /**
   * Get hint for specific cell
   */
  getHintForCell(x: number, y: number): Hint | null {
    const cell = this.gameState.board[y][x];

    if (cell.isRevealed) {
      return {
        type: "safe_cell",
        position: { x, y },
        confidence: 1.0,
        reasoning: "This cell is already revealed",
        priority: 1,
      };
    }

    if (this.isCellGuaranteedSafe(x, y)) {
      return {
        type: "safe_cell",
        position: { x, y },
        confidence: 1.0,
        reasoning: "This cell is guaranteed safe",
        priority: 9,
      };
    }

    if (this.isCellGuaranteedMine(x, y)) {
      return {
        type: "mine_location",
        position: { x, y },
        confidence: 1.0,
        reasoning: "This cell contains a mine",
        priority: 10,
      };
    }

    const risk = this.calculateCellRisk(x, y);
    return {
      type: "next_best_move",
      position: { x, y },
      confidence: 1 - risk,
      reasoning: `Risk level: ${Math.round(risk * 100)}%`,
      priority: 5,
    };
  }

  /**
   * Get hints for pattern recognition (for pattern mode)
   */
  getPatternHints(): Hint[] {
    const hints: Hint[] = [];
    // TODO: Implement pattern detection algorithm
    // This would look for symmetrical mine placements, geometric patterns, etc.
    return hints;
  }

  /**
   * Check if current state is solvable without guessing
   */
  isSolvable(): boolean {
    const safeCells = this.findSafeCells();
    const guaranteedMines = this.findGuaranteedMines();
    return safeCells.length > 0 || guaranteedMines.length > 0;
  }

  /**
   * Get danger zones (high-risk areas)
   */
  getDangerZones(): Hint[] {
    const hints: Hint[] = [];
    const board = this.gameState.board;

    for (let y = 0; y < board.length; y++) {
      for (let x = 0; x < board[y].length; x++) {
        const cell = board[y][x];
        if (cell.isRevealed || cell.isFlagged) continue;

        const risk = this.calculateCellRisk(x, y);

        if (risk > 0.7) {
          hints.push({
            type: "danger_warning",
            position: { x, y },
            confidence: risk,
            reasoning: `High risk area: ${Math.round(risk * 100)}% chance of mine`,
            priority: 6,
          });
        }
      }
    }

    return hints;
  }

  /**
   * Get statistics about current hints
   */
  getHintStatistics(): {
    totalHints: number;
    safeCells: number;
    guaranteedMines: number;
    isSolvable: boolean;
    averageRisk: number;
  } {
    const allHints = this.getAllHints();
    const safeCells = allHints.filter(
      (h) => h.type === "safe_cell" || h.type === "number_deduction"
    ).length;
    const guaranteedMines = allHints.filter((h) => h.type === "mine_location")
      .length;

    // Calculate average risk
    let totalRisk = 0;
    let cellCount = 0;
    const board = this.gameState.board;

    for (let y = 0; y < board.length; y++) {
      for (let x = 0; x < board[y].length; x++) {
        const cell = board[y][x];
        if (!cell.isRevealed && !cell.isFlagged) {
          totalRisk += this.calculateCellRisk(x, y);
          cellCount++;
        }
      }
    }

    return {
      totalHints: allHints.length,
      safeCells,
      guaranteedMines,
      isSolvable: this.isSolvable(),
      averageRisk: cellCount > 0 ? totalRisk / cellCount : 0,
    };
  }
}

/**
 * Create a hint system for the given game state
 */
export function createHintSystem(gameState: GameState): HintSystem {
  return new HintSystem(gameState);
}

/**
 * Get a hint message string
 */
export function getHintMessage(hint: Hint): string {
  const pos = `(${hint.position.x + 1}, ${hint.position.y + 1})`;

  switch (hint.type) {
    case "safe_cell":
      return `✅ Cell at ${pos} is safe to reveal. ${hint.reasoning}`;
    case "mine_location":
      return `💣 Cell at ${pos} contains a mine. ${hint.reasoning}`;
    case "number_deduction":
      return `🔍 Cell at ${pos} can be deduced. ${hint.reasoning}`;
    case "next_best_move":
      return `🎯 Best move: ${pos}. ${hint.reasoning}`;
    case "flag_suggestion":
      return `🚩 Suggest flagging ${pos}. ${hint.reasoning}`;
    case "danger_warning":
      return `⚠️ Danger zone at ${pos}. ${hint.reasoning}`;
    case "pattern_hint":
      return `🔷 Pattern detected at ${pos}. ${hint.reasoning}`;
    default:
      return hint.reasoning;
  }
}
