/**
 * Game Mode Type Definitions
 * Comprehensive type system for multiple game modes with payment integration
 */

export type GameModeCategory =
  | "time-based"
  | "difficulty"
  | "relaxed"
  | "challenge"
  | "creative";

export type GameStatus = "idle" | "playing" | "won" | "lost" | "paused";

export type NumberVisibility = "always" | "conditional" | "hidden";

export interface GameModeConfig {
  boardSize: { width: number; height: number } | "dynamic";
  mineCount: number | "dynamic";
  timeLimit?: number; // in seconds
  moveLimit?: number;
  specialRules: string[];
  difficultyProgression?: DifficultyProgression;
}

export interface DifficultyProgression {
  startLevel: number;
  maxLevel: number | null;
  progression: (level: number) => ProgressionConfig;
}

export interface ProgressionConfig {
  width?: number;
  height?: number;
  mines?: number;
  timeLimit?: number;
  requiredAccuracy?: number;
}

export interface GameRules {
  allowFlags: boolean;
  revealOnMineClick: boolean;
  numberVisibility: NumberVisibility;
  firstClickSafe: boolean;
  cascadeReveal: boolean;
  customWinCondition?: (gameState: ExtendedGameState) => boolean;
  customLoseCondition?: (gameState: ExtendedGameState) => boolean;
  customGameFlow?: CustomGameFlow;
  customBoardGeneration?: (config: GameModeConfig) => void;
}

export interface CustomGameFlow {
  phases: string[];
  revealDuration?: number;
  fadeOutAnimation?: boolean;
}

export interface ScoringSystem {
  basePoints?: number;
  timeBonus?: (timeRemaining: number) => number;
  accuracyBonus?: (accuracy: number) => number;
  timeScore?: (completionTime: number) => number;
  roundBonus?: number;
  speedMultiplier?: (roundNumber: number) => number;
  comboMultiplier?: (streak: number) => number;
  levelMultiplier?: (level: number) => number;
  streakBonus?: (consecutiveWins: number) => number;
  survivalBonus?: (level: number, timeLeft: number) => number;
  practicePoints?: number;
  customFormula?: (params: Record<string, number>) => number;
  efficiencyBonus?: (movesRemaining: number) => number;
  perfectBonus?: number;
  hardcoreMultiplier?: number;
  flawlessBonus?: number;
  blindBonus?: number;
  deductionPoints?: (correctFlags: number) => number;
  memoryAccuracy?: (correctRecalls: number) => number;
  speedRecallBonus?: (timeToComplete: number) => number;
  patternRecognition?: (earlyFlagAccuracy: number) => number;
  symmetryBonus?: number;
}

export interface GameMode {
  id: string;
  name: string;
  category: GameModeCategory;
  description: string;
  icon: string;
  config: GameModeConfig;
  rules: GameRules;
  scoring: ScoringSystem;
  continueAllowed: boolean;
  continueCost: number; // in World Coin units (WLD)
  enabled?: boolean; // For feature flags
}

export interface ExtendedGameState {
  // Original game state
  status: GameStatus;
  difficulty: string;
  flagCount: number;
  revealedCount: number;
  firstClick: boolean;

  // Extended properties for game modes
  gameMode: string;
  level?: number;
  score: number;
  timeElapsed: number;
  timeRemaining?: number;
  timeLimit?: number;
  movesUsed?: number;
  movesRemaining?: number;
  moveLimit?: number;
  hitMine: boolean;
  gameOver: boolean;
  continueCount: number;
  continueTimestamps: number[];

  // Configuration
  config: {
    width: number;
    height: number;
    mines: number;
  };
}

export interface ContinueOption {
  gameMode: string;
  baseCost: number;
  dynamicPricing?: (gameState: ExtendedGameState) => number;
  description: string;
  benefits: string[];
}

export interface PaymentConfig {
  currency: "WLD"; // World Coin
  continueOptions: ContinueOption[];
  paymentMethods: string[];
  transactionTimeout: number;
  retryAttempts: number;
}

export interface PaymentRequest {
  userId: string;
  amount: number;
  currency: "WLD";
  description: string;
  metadata: Record<string, unknown>;
  callbackUrl: string;
}

export interface PaymentResponse {
  id: string;
  status: "pending" | "success" | "failed";
  amount: number;
  currency: string;
  description: string;
  metadata: Record<string, unknown>;
  transactionId?: string;
  error?: string;
}

export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  cost?: number;
  message?: string;
  transactionId?: string;
  error?: string;
}

export interface ModeAnalytics {
  modeId: string;
  userId: string;
  sessions: number;
  totalScore: number;
  highScore: number;
  averageTime: number;
  winRate: number;
  continuesUsed: number;
  revenueGenerated: number;
  lastPlayed: Date;
}

export interface GameSession {
  gameMode: string;
  userId: string;
  finalScore: number;
  duration: number;
  outcome: "won" | "lost";
  continueCount: number;
  continueCost: number;
  timestamp: number;
}
