/**
 * Core game types for Minesweeper
 */

export interface CellState {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  adjacentMines: number;
  x: number;
  y: number;
}

export type GameStatus = 'idle' | 'playing' | 'won' | 'lost' | 'paused';

export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'custom';

export interface DifficultyConfig {
  width: number;
  height: number;
  mines: number;
}

export const DIFFICULTY_CONFIGS: Record<Exclude<DifficultyLevel, 'custom'>, DifficultyConfig> = {
  easy: { width: 8, height: 8, mines: 10 },
  medium: { width: 16, height: 16, mines: 40 },
  hard: { width: 30, height: 16, mines: 99 },
};

export interface GameState {
  board: CellState[][];
  status: GameStatus;
  difficulty: DifficultyLevel;
  config: DifficultyConfig;
  flagCount: number;
  revealedCount: number;
  startTime: number | null;
  endTime: number | null;
  firstClick: boolean;

  // Game Mode Extensions
  gameMode: string; // Mode ID
  score: number; // Current score
  level: number; // Current level (for progressive modes)
  moveCount: number; // Number of moves made
  timeRemaining: number | null; // Time remaining (for timed modes)
  continueCount: number; // Number of continues used
  continueTimestamps: number[]; // Timestamps of continues
  roundNumber: number; // Current round (for multi-round modes)
  streak: number; // Current win streak
}

export interface GameStats {
  gamesPlayed: number;
  gamesWon: number;
  winRate: number;
  bestTime: {
    easy: number | null;
    medium: number | null;
    hard: number | null;
  };
  currentStreak: number;
  longestStreak: number;
  totalMinesFound: number;
  averageTime: number;
}

export interface Position {
  x: number;
  y: number;
}

export interface LeaderboardEntry {
  walletAddress: string;
  username: string;
  profilePictureUrl: string;
  difficulty: DifficultyLevel;
  time: number;
  timestamp: number;
  verified: boolean;
}
