/**
 * Game Mode Manager
 * Handles mode-specific game logic and rules
 */

import { GameMode } from "@/types/gameMode";
import { GameState, DifficultyConfig } from "@/types/game";
import { CellState } from "@/types/game";

export class GameModeManager {
  private mode: GameMode;

  constructor(mode: GameMode) {
    this.mode = mode;
  }

  /**
   * Initialize game state for this mode
   */
  initializeGameState(baseState: Partial<GameState>): GameState {
    const config = this.getBoardConfig(1); // Start at level 1

    return {
      board: baseState.board || [],
      status: "idle",
      difficulty: "custom",
      config,
      flagCount: 0,
      revealedCount: 0,
      startTime: null,
      endTime: null,
      firstClick: true,
      gameMode: this.mode.id,
      score: 0,
      level: 1,
      moveCount: 0,
      timeRemaining: this.mode.config.timeLimit || null,
      continueCount: 0,
      continueTimestamps: [],
      roundNumber: 1,
      streak: baseState.streak || 0,
    };
  }

  /**
   * Get board configuration for current level
   */
  getBoardConfig(level: number): DifficultyConfig {
    const config = this.mode.config;

    // Handle dynamic board size
    if (config.boardSize === "dynamic" && config.difficultyProgression) {
      const progression = config.difficultyProgression.progression(level);
      return {
        width: progression.width || 16,
        height: progression.height || 16,
        mines: progression.mines || 40,
      };
    }

    // Static board size
    if (typeof config.boardSize !== "string") {
      const mineCount =
        config.mineCount === "dynamic" && config.difficultyProgression
          ? config.difficultyProgression.progression(level).mines || 40
          : (config.mineCount as number);

      return {
        width: config.boardSize.width,
        height: config.boardSize.height,
        mines: mineCount,
      };
    }

    // Fallback to default
    return { width: 16, height: 16, mines: 40 };
  }

  /**
   * Check if the player has won based on mode rules
   */
  checkWinCondition(gameState: GameState): boolean {
    // Custom win condition
    if (this.mode.rules.customWinCondition) {
      return this.mode.rules.customWinCondition({
        ...gameState,
        hitMine: false,
        gameOver: gameState.status === "won" || gameState.status === "lost",
        timeElapsed: gameState.startTime
          ? Date.now() - gameState.startTime
          : 0,
        config: gameState.config,
      });
    }

    // Default win condition: all non-mine cells revealed
    const totalCells = gameState.config.width * gameState.config.height;
    const nonMineCells = totalCells - gameState.config.mines;
    return gameState.revealedCount === nonMineCells;
  }

  /**
   * Check if the player has lost based on mode rules
   */
  checkLoseCondition(gameState: GameState, hitMine: boolean): boolean {
    // Custom lose condition
    if (this.mode.rules.customLoseCondition) {
      return this.mode.rules.customLoseCondition({
        ...gameState,
        hitMine,
        gameOver: false,
        timeElapsed: gameState.startTime
          ? Date.now() - gameState.startTime
          : 0,
        config: gameState.config,
      });
    }

    // Time limit check
    if (this.mode.config.timeLimit && gameState.timeRemaining !== null) {
      if (gameState.timeRemaining <= 0) return true;
    }

    // Move limit check
    if (this.mode.config.moveLimit) {
      if (gameState.moveCount >= this.mode.config.moveLimit) return true;
    }

    // Default: hitting a mine means loss (unless rules say otherwise)
    if (hitMine && this.mode.rules.revealOnMineClick) {
      return true;
    }

    return false;
  }

  /**
   * Handle cell reveal based on mode rules
   */
  shouldRevealCell(cell: CellState, gameState: GameState): boolean {
    // Can't reveal flagged cells
    if (cell.isFlagged) return false;

    // Already revealed
    if (cell.isRevealed) return false;

    // Blind mode: check visibility
    if (this.mode.rules.numberVisibility === "conditional") {
      return this.isCellVisible(cell, gameState);
    }

    return true;
  }

  /**
   * Check if cell is visible in blind mode
   */
  private isCellVisible(cell: CellState, gameState: GameState): boolean {
    // In blind mode, cells are only visible near flags
    const board = gameState.board;
    const { x, y } = cell;

    // Check adjacent cells for flags
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
        nx < gameState.config.width &&
        ny >= 0 &&
        ny < gameState.config.height
      ) {
        if (board[ny][nx].isFlagged) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Handle cascade reveal based on mode rules
   */
  shouldCascade(): boolean {
    return this.mode.rules.cascadeReveal;
  }

  /**
   * Check if first click should be safe
   */
  isFirstClickSafe(): boolean {
    return this.mode.rules.firstClickSafe;
  }

  /**
   * Check if flags are allowed
   */
  areFlagsAllowed(): boolean {
    return this.mode.rules.allowFlags;
  }

  /**
   * Get time limit for current level
   */
  getTimeLimit(level: number): number | null {
    if (this.mode.config.difficultyProgression) {
      const progression = this.mode.config.difficultyProgression.progression(level);
      return progression.timeLimit || this.mode.config.timeLimit || null;
    }
    return this.mode.config.timeLimit || null;
  }

  /**
   * Calculate next level configuration
   */
  getNextLevelConfig(currentLevel: number): {
    config: DifficultyConfig;
    timeLimit: number | null;
  } {
    const nextLevel = currentLevel + 1;

    // Check max level
    if (
      this.mode.config.difficultyProgression?.maxLevel &&
      nextLevel > this.mode.config.difficultyProgression.maxLevel
    ) {
      // Return current level config if max reached
      return {
        config: this.getBoardConfig(currentLevel),
        timeLimit: this.getTimeLimit(currentLevel),
      };
    }

    return {
      config: this.getBoardConfig(nextLevel),
      timeLimit: this.getTimeLimit(nextLevel),
    };
  }

  /**
   * Check if continue is allowed
   */
  canContinue(): boolean {
    return this.mode.continueAllowed;
  }

  /**
   * Get continue cost
   */
  getContinueCost(gameState: GameState): number {
    let baseCost = this.mode.continueCost;

    // Dynamic pricing based on game state
    if (gameState.continueCount > 0) {
      // Increase cost for multiple continues (1.5x per continue)
      baseCost *= Math.pow(1.5, gameState.continueCount);
    }

    // Level-based pricing for progression modes
    if (
      this.mode.category === "difficulty" &&
      this.mode.config.difficultyProgression
    ) {
      baseCost += gameState.level * 10;
    }

    // Time-based discount (early continues cost less)
    const timeElapsed = gameState.startTime
      ? Date.now() - gameState.startTime
      : 0;
    if (timeElapsed < 30000) {
      // Less than 30 seconds
      baseCost *= 0.8; // 20% discount
    }

    return Math.floor(baseCost);
  }

  /**
   * Apply continue benefits to game state
   */
  applyContinue(gameState: GameState): Partial<GameState> {
    const updates: Partial<GameState> = {
      continueCount: gameState.continueCount + 1,
      continueTimestamps: [...gameState.continueTimestamps, Date.now()],
      status: "playing",
    };

    // Mode-specific benefits
    switch (this.mode.id) {
      case "limited-moves":
        // Add bonus moves
        if (this.mode.config.moveLimit) {
          updates.moveCount = Math.max(0, gameState.moveCount - 10);
        }
        break;

      case "time-attack":
      case "survival":
        // Add extra time
        if (gameState.timeRemaining !== null) {
          updates.timeRemaining = gameState.timeRemaining + 60; // +60 seconds
        }
        break;

      case "timed-rounds":
        // Reset round timer
        updates.timeRemaining = this.mode.config.timeLimit || 60;
        break;

      default:
        // Generic continue: just reset status
        break;
    }

    return updates;
  }

  /**
   * Check if mode has special phases (like memory mode)
   */
  hasCustomGameFlow(): boolean {
    return !!this.mode.rules.customGameFlow;
  }

  /**
   * Get custom game flow phases
   */
  getGameFlowPhases(): string[] {
    return this.mode.rules.customGameFlow?.phases || [];
  }

  /**
   * Get mode name
   */
  getModeName(): string {
    return this.mode.name;
  }

  /**
   * Get mode ID
   */
  getModeId(): string {
    return this.mode.id;
  }

  /**
   * Get mode category
   */
  getModeCategory(): string {
    return this.mode.category;
  }

  /**
   * Check if this is an endless/progressive mode
   */
  isProgressiveMode(): boolean {
    return !!this.mode.config.difficultyProgression;
  }

  /**
   * Check if this is a timed mode
   */
  isTimedMode(): boolean {
    return !!this.mode.config.timeLimit;
  }

  /**
   * Check if this mode has move limits
   */
  hasMoveLimit(): boolean {
    return !!this.mode.config.moveLimit;
  }

  /**
   * Get special rules for display
   */
  getSpecialRules(): string[] {
    return this.mode.config.specialRules;
  }
}

/**
 * Create a game mode manager instance
 */
export function createGameModeManager(mode: GameMode): GameModeManager {
  return new GameModeManager(mode);
}
