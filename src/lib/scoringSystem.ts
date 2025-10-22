/**
 * Scoring System
 * Calculates scores based on game mode configurations
 */

import { GameMode, ScoringSystem } from "@/types/gameMode";
import { GameState } from "@/types/game";

export interface ScoreCalculationContext {
  gameState: GameState;
  gameMode: GameMode;
  timeElapsed: number; // in milliseconds
  accuracy: number; // 0-1
  perfectGame: boolean;
}

/**
 * Calculate the total score for a game session
 */
export function calculateScore(context: ScoreCalculationContext): number {
  const { gameState, gameMode, timeElapsed, accuracy } = context;
  const scoring = gameMode.scoring;
  let totalScore = 0;

  // Base points
  if (scoring.basePoints !== undefined) {
    totalScore += scoring.basePoints;
  }

  // Time bonus (for timed modes with remaining time)
  if (scoring.timeBonus && gameState.timeRemaining !== null) {
    totalScore += scoring.timeBonus(gameState.timeRemaining);
  }

  // Accuracy bonus
  if (scoring.accuracyBonus && accuracy > 0) {
    totalScore += scoring.accuracyBonus(accuracy);
  }

  // Time score (for speed-run modes)
  if (scoring.timeScore) {
    const timeInSeconds = Math.floor(timeElapsed / 1000);
    totalScore += scoring.timeScore(timeInSeconds);
  }

  // Round bonus (for multi-round modes)
  if (scoring.roundBonus && gameState.roundNumber > 0) {
    totalScore += scoring.roundBonus * gameState.roundNumber;
  }

  // Speed multiplier (for timed rounds)
  if (scoring.speedMultiplier && gameState.roundNumber > 0) {
    const multiplier = scoring.speedMultiplier(gameState.roundNumber);
    totalScore *= multiplier;
  }

  // Combo multiplier (for streaks)
  if (scoring.comboMultiplier && gameState.streak > 0) {
    const multiplier = scoring.comboMultiplier(gameState.streak);
    totalScore *= multiplier;
  }

  // Level multiplier (for progressive modes)
  if (scoring.levelMultiplier && gameState.level > 0) {
    totalScore += scoring.levelMultiplier(gameState.level);
  }

  // Streak bonus
  if (scoring.streakBonus && gameState.streak > 0) {
    totalScore += scoring.streakBonus(gameState.streak);
  }

  // Survival bonus
  if (scoring.survivalBonus && gameState.level > 0 && gameState.timeRemaining !== null) {
    totalScore += scoring.survivalBonus(gameState.level, gameState.timeRemaining);
  }

  // Efficiency bonus (for limited moves mode)
  if (scoring.efficiencyBonus && gameMode.config.moveLimit) {
    const movesRemaining = gameMode.config.moveLimit - gameState.moveCount;
    if (movesRemaining > 0) {
      totalScore += scoring.efficiencyBonus(movesRemaining);
    }
  }

  // Perfect bonus
  if (scoring.perfectBonus && context.perfectGame) {
    totalScore += scoring.perfectBonus;
  }

  // Hardcore multiplier
  if (scoring.hardcoreMultiplier) {
    totalScore *= scoring.hardcoreMultiplier;
  }

  // Flawless bonus
  if (scoring.flawlessBonus && gameState.continueCount === 0 && context.perfectGame) {
    totalScore += scoring.flawlessBonus;
  }

  // Blind mode bonus
  if (scoring.blindBonus) {
    totalScore += scoring.blindBonus;
  }

  // Deduction points (for correct flags in blind mode)
  if (scoring.deductionPoints) {
    const correctFlags = calculateCorrectFlags(gameState);
    totalScore += scoring.deductionPoints(correctFlags);
  }

  // Memory accuracy
  if (scoring.memoryAccuracy) {
    const correctRecalls = gameState.revealedCount; // Simplified
    totalScore += scoring.memoryAccuracy(correctRecalls);
  }

  // Speed recall bonus
  if (scoring.speedRecallBonus) {
    const timeToComplete = Math.floor(timeElapsed / 1000);
    totalScore += scoring.speedRecallBonus(timeToComplete);
  }

  // Pattern recognition
  if (scoring.patternRecognition) {
    const earlyFlagAccuracy = calculateEarlyFlagAccuracy(gameState);
    totalScore += scoring.patternRecognition(earlyFlagAccuracy);
  }

  // Symmetry bonus
  if (scoring.symmetryBonus) {
    totalScore += scoring.symmetryBonus;
  }

  // Custom formula
  if (scoring.customFormula) {
    const params = {
      level: gameState.level,
      score: totalScore,
      time: timeElapsed,
      accuracy: accuracy,
    };
    totalScore += scoring.customFormula(params);
  }

  return Math.floor(totalScore);
}

/**
 * Calculate accuracy based on correct vs incorrect flags
 */
export function calculateAccuracy(gameState: GameState): number {
  if (gameState.flagCount === 0) return 1.0;

  const correctFlags = calculateCorrectFlags(gameState);
  return correctFlags / gameState.flagCount;
}

/**
 * Count the number of correctly placed flags
 */
function calculateCorrectFlags(gameState: GameState): number {
  let correctFlags = 0;

  for (const row of gameState.board) {
    for (const cell of row) {
      if (cell.isFlagged && cell.isMine) {
        correctFlags++;
      }
    }
  }

  return correctFlags;
}

/**
 * Calculate if the game was perfect (no mistakes)
 */
export function isPerfectGame(gameState: GameState): boolean {
  // No continues used
  if (gameState.continueCount > 0) return false;

  // All flags are correct
  const correctFlags = calculateCorrectFlags(gameState);
  if (correctFlags !== gameState.flagCount) return false;

  // Game was won
  if (gameState.status !== "won") return false;

  return true;
}

/**
 * Calculate early flag accuracy (for pattern modes)
 */
function calculateEarlyFlagAccuracy(gameState: GameState): number {
  // Simplified: flags placed in first 30% of moves
  const earlyMoveThreshold = gameState.moveCount * 0.3;
  const correctFlags = calculateCorrectFlags(gameState);

  if (correctFlags === 0) return 0;

  // Assuming early flags were placed correctly (simplified logic)
  return correctFlags / gameState.flagCount;
}

/**
 * Calculate score increment for a single action
 */
export function calculateActionScore(
  action: "reveal" | "flag" | "unflag" | "combo",
  context: {
    cellsRevealed?: number;
    adjacentMines?: number;
    comboCount?: number;
  },
  scoring: ScoringSystem
): number {
  let score = 0;

  switch (action) {
    case "reveal":
      // Base reveal points
      score += 10;

      // Bonus for revealing multiple cells (cascade)
      if (context.cellsRevealed && context.cellsRevealed > 1) {
        score += context.cellsRevealed * 5;
      }

      // Danger bonus (revealing near mines)
      if (context.adjacentMines && context.adjacentMines > 0) {
        score += context.adjacentMines * 2;
      }
      break;

    case "flag":
      // Base flag points
      score += 15;
      break;

    case "unflag":
      // No points for unflagging
      score += 0;
      break;

    case "combo":
      // Combo points
      if (context.comboCount) {
        score += context.comboCount * 50;
      }
      break;
  }

  return score;
}

/**
 * Format score for display
 */
export function formatScore(score: number): string {
  if (score >= 1000000) {
    return `${(score / 1000000).toFixed(1)}M`;
  } else if (score >= 1000) {
    return `${(score / 1000).toFixed(1)}K`;
  }
  return score.toString();
}

/**
 * Get score ranking based on score value
 */
export function getScoreRank(score: number): {
  rank: string;
  color: string;
  icon: string;
} {
  if (score >= 100000) {
    return { rank: "LEGENDARY", color: "#FFD700", icon: "👑" };
  } else if (score >= 50000) {
    return { rank: "MASTER", color: "#E5E4E2", icon: "💎" };
  } else if (score >= 25000) {
    return { rank: "EXPERT", color: "#CD7F32", icon: "🏆" };
  } else if (score >= 10000) {
    return { rank: "ADVANCED", color: "#10f970", icon: "⭐" };
  } else if (score >= 5000) {
    return { rank: "INTERMEDIATE", color: "#00d4ff", icon: "🎯" };
  } else {
    return { rank: "NOVICE", color: "#808080", icon: "🎮" };
  }
}

/**
 * Calculate bonus for completing a level
 */
export function calculateLevelCompletionBonus(
  level: number,
  timeElapsed: number,
  perfectGame: boolean
): number {
  let bonus = level * 1000;

  // Time bonus (faster completion = higher bonus)
  const timeInSeconds = Math.floor(timeElapsed / 1000);
  if (timeInSeconds < 60) {
    bonus += 2000;
  } else if (timeInSeconds < 120) {
    bonus += 1000;
  }

  // Perfect game multiplier
  if (perfectGame) {
    bonus *= 2;
  }

  return bonus;
}
